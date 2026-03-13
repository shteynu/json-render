"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { Spec, JsonPatch, EditMode } from "@json-render/core";
import {
  setByPath,
  getByPath,
  removeByPath,
  deepMergeSpec,
  diffToPatches,
} from "@json-render/core";
import { parse as yamlParse, stringify as yamlStringify } from "yaml";
import { applyPatch as applyUnifiedDiff } from "diff";
import { createYamlStreamCompiler } from "@json-render/yaml";

export type StreamFormat = "jsonl" | "yaml";

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cachedTokens: number;
  cacheWriteTokens: number;
}

export interface UsePlaygroundStreamOptions {
  api: string;
  format: StreamFormat;
  editModes?: EditMode[];
  onError?: (error: Error) => void;
  onComplete?: (spec: Spec) => void;
}

export interface UsePlaygroundStreamReturn {
  spec: Spec | null;
  isStreaming: boolean;
  error: Error | null;
  usage: TokenUsage | null;
  rawLines: string[];
  send: (prompt: string, context?: Record<string, unknown>) => Promise<void>;
  clear: () => void;
}

// ── JSONL helpers ──

type ParsedLine =
  | { type: "patch"; patch: JsonPatch }
  | { type: "usage"; usage: TokenUsage }
  | { type: "json-edit"; mergeObj: Record<string, unknown> }
  | null;

function parseLine(line: string): ParsedLine {
  try {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("//")) return null;
    const parsed = JSON.parse(trimmed);
    if (parsed.__meta === "usage") {
      return {
        type: "usage",
        usage: {
          promptTokens: parsed.promptTokens ?? 0,
          completionTokens: parsed.completionTokens ?? 0,
          totalTokens: parsed.totalTokens ?? 0,
          cachedTokens: parsed.cachedTokens ?? 0,
          cacheWriteTokens: parsed.cacheWriteTokens ?? 0,
        },
      };
    }
    if (parsed.__json_edit === true) {
      const { __json_edit: _, ...mergeObj } = parsed;
      return { type: "json-edit", mergeObj };
    }
    return { type: "patch", patch: parsed as JsonPatch };
  } catch {
    return null;
  }
}

// ── Spec patch helpers ──

function setSpecValue(newSpec: Spec, path: string, value: unknown): void {
  if (path === "/root") {
    newSpec.root = value as string;
    return;
  }
  if (path === "/state") {
    newSpec.state = value as Record<string, unknown>;
    return;
  }
  if (path.startsWith("/state/")) {
    if (!newSpec.state) newSpec.state = {};
    setByPath(
      newSpec.state as Record<string, unknown>,
      path.slice("/state".length),
      value,
    );
    return;
  }
  if (path.startsWith("/elements/")) {
    const pathParts = path.slice("/elements/".length).split("/");
    const elementKey = pathParts[0];
    if (!elementKey) return;
    if (pathParts.length === 1) {
      if (value == null || typeof value !== "object") return;
      const el = value as Record<string, unknown>;
      newSpec.elements[elementKey] = {
        ...el,
        type: typeof el.type === "string" ? el.type : "",
        props: el.props != null && typeof el.props === "object" ? el.props : {},
        children: Array.isArray(el.children) ? el.children : [],
      } as Spec["elements"][string];
    } else {
      const element = newSpec.elements[elementKey];
      if (element) {
        const newElement = { ...element };
        setByPath(
          newElement as unknown as Record<string, unknown>,
          "/" + pathParts.slice(1).join("/"),
          value,
        );
        newSpec.elements[elementKey] = newElement;
      }
    }
  }
}

function removeSpecValue(newSpec: Spec, path: string): void {
  if (path === "/state") {
    delete newSpec.state;
    return;
  }
  if (path.startsWith("/state/") && newSpec.state) {
    removeByPath(
      newSpec.state as Record<string, unknown>,
      path.slice("/state".length),
    );
    return;
  }
  if (path.startsWith("/elements/")) {
    const pathParts = path.slice("/elements/".length).split("/");
    const elementKey = pathParts[0];
    if (!elementKey) return;
    if (pathParts.length === 1) {
      const { [elementKey]: _, ...rest } = newSpec.elements;
      newSpec.elements = rest;
    } else {
      const element = newSpec.elements[elementKey];
      if (element) {
        const newElement = { ...element };
        removeByPath(
          newElement as unknown as Record<string, unknown>,
          "/" + pathParts.slice(1).join("/"),
        );
        newSpec.elements[elementKey] = newElement;
      }
    }
  }
}

function getSpecValue(spec: Spec, path: string): unknown {
  if (path === "/root") return spec.root;
  if (path === "/state") return spec.state;
  if (path.startsWith("/state/") && spec.state) {
    return getByPath(
      spec.state as Record<string, unknown>,
      path.slice("/state".length),
    );
  }
  return getByPath(spec as unknown as Record<string, unknown>, path);
}

function normalizeSpec(spec: Spec): void {
  // state: null → undefined (YAML parses "state:" with no value as null)
  if (
    spec.state === null ||
    (spec.state !== undefined && typeof spec.state !== "object")
  ) {
    spec.state = undefined;
  }

  for (const key of Object.keys(spec.elements)) {
    const el = spec.elements[key];
    if (!el || typeof el !== "object") {
      delete spec.elements[key];
      continue;
    }
    if (el.props == null || typeof el.props !== "object") {
      spec.elements[key] = { ...el, props: {} } as Spec["elements"][string];
    }
    if (!Array.isArray(spec.elements[key]!.children)) {
      spec.elements[key] = {
        ...spec.elements[key]!,
        children: [],
      } as Spec["elements"][string];
    }
  }
}

function applyPatch(spec: Spec, patch: JsonPatch): Spec {
  const newSpec = {
    ...spec,
    elements: { ...spec.elements },
    ...(spec.state ? { state: { ...spec.state } } : {}),
  };
  switch (patch.op) {
    case "add":
    case "replace":
      setSpecValue(newSpec, patch.path, patch.value);
      break;
    case "remove":
      removeSpecValue(newSpec, patch.path);
      break;
    case "move":
      if (patch.from) {
        const moveValue = getSpecValue(newSpec, patch.from);
        removeSpecValue(newSpec, patch.from);
        setSpecValue(newSpec, patch.path, moveValue);
      }
      break;
    case "copy":
      if (patch.from) {
        setSpecValue(newSpec, patch.path, getSpecValue(newSpec, patch.from));
      }
      break;
    case "test":
      break;
  }
  normalizeSpec(newSpec);
  return newSpec;
}

// ── YAML fence parsing state machine ──

const YAML_SPEC_FENCE = "```yaml-spec";
const YAML_EDIT_FENCE = "```yaml-edit";
const YAML_PATCH_FENCE = "```yaml-patch";
const DIFF_FENCE = "```diff";
const FENCE_CLOSE = "```";

type FenceState = "outside" | "yaml-spec" | "yaml-edit" | "yaml-patch" | "diff";

// ── Hook ──

export function usePlaygroundStream({
  api,
  format,
  editModes,
  onError,
  onComplete,
}: UsePlaygroundStreamOptions): UsePlaygroundStreamReturn {
  const [spec, setSpec] = useState<Spec | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [usage, setUsage] = useState<TokenUsage | null>(null);
  const [rawLines, setRawLines] = useState<string[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const formatRef = useRef(format);
  formatRef.current = format;
  const editModesRef = useRef(editModes);
  editModesRef.current = editModes;

  const clear = useCallback(() => {
    setSpec(null);
    setError(null);
  }, []);

  const send = useCallback(
    async (prompt: string, context?: Record<string, unknown>) => {
      abortControllerRef.current = new AbortController();

      setIsStreaming(true);
      setError(null);
      setUsage(null);
      setRawLines([]);

      const previousSpec = context?.previousSpec as Spec | undefined;
      let currentSpec: Spec =
        previousSpec && previousSpec.root
          ? { ...previousSpec, elements: { ...previousSpec.elements } }
          : { root: "", elements: {} };
      setSpec(currentSpec);

      try {
        const response = await fetch(api, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            context,
            format: formatRef.current,
            editModes: editModesRef.current,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          let errorMessage = `HTTP error: ${response.status}`;
          try {
            const errorData = await response.json();
            if (errorData.message) errorMessage = errorData.message;
            else if (errorData.error) errorMessage = errorData.error;
          } catch {
            // use default
          }
          throw new Error(errorMessage);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";

        if (formatRef.current === "yaml") {
          // ── YAML streaming ──
          let fenceState: FenceState = "outside";
          const compiler = createYamlStreamCompiler<Record<string, unknown>>();
          let yamlEditAccumulated = "";
          let yamlPatchAccumulated = "";
          let diffAccumulated = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              const trimmed = line.trim();

              // Check for usage metadata (appended after stream)
              if (trimmed.startsWith("{") && trimmed.includes('"__meta"')) {
                try {
                  const parsed = JSON.parse(trimmed);
                  if (parsed.__meta === "usage") {
                    setUsage({
                      promptTokens: parsed.promptTokens ?? 0,
                      completionTokens: parsed.completionTokens ?? 0,
                      totalTokens: parsed.totalTokens ?? 0,
                      cachedTokens: parsed.cachedTokens ?? 0,
                      cacheWriteTokens: parsed.cacheWriteTokens ?? 0,
                    });
                    continue;
                  }
                } catch {
                  // not JSON
                }
              }

              setRawLines((prev) => [...prev, line]);

              if (fenceState === "outside") {
                if (
                  trimmed === YAML_SPEC_FENCE ||
                  trimmed.startsWith(YAML_SPEC_FENCE + " ")
                ) {
                  fenceState = "yaml-spec";
                  compiler.reset();
                } else if (
                  trimmed === YAML_EDIT_FENCE ||
                  trimmed.startsWith(YAML_EDIT_FENCE + " ")
                ) {
                  fenceState = "yaml-edit";
                  yamlEditAccumulated = "";
                } else if (
                  trimmed === YAML_PATCH_FENCE ||
                  trimmed.startsWith(YAML_PATCH_FENCE + " ")
                ) {
                  fenceState = "yaml-patch";
                  yamlPatchAccumulated = "";
                } else if (
                  trimmed === DIFF_FENCE ||
                  trimmed.startsWith(DIFF_FENCE + " ")
                ) {
                  fenceState = "diff";
                  diffAccumulated = "";
                }
              } else if (trimmed === FENCE_CLOSE || trimmed === "````") {
                if (fenceState === "yaml-spec") {
                  const { result, newPatches } = compiler.flush();
                  if (result && typeof result === "object" && result.root) {
                    for (const patch of newPatches) {
                      currentSpec = applyPatch(currentSpec, patch);
                    }
                    setSpec({ ...currentSpec });
                  }
                } else if (fenceState === "yaml-edit") {
                  try {
                    const editObj = yamlParse(yamlEditAccumulated);
                    if (editObj && typeof editObj === "object") {
                      const merged = deepMergeSpec(
                        currentSpec as unknown as Record<string, unknown>,
                        editObj as Record<string, unknown>,
                      );
                      const patches = diffToPatches(
                        currentSpec as unknown as Record<string, unknown>,
                        merged,
                      );
                      for (const patch of patches) {
                        currentSpec = applyPatch(currentSpec, patch);
                      }
                      setSpec({ ...currentSpec });
                    }
                  } catch {
                    // Invalid YAML edit
                  }
                } else if (fenceState === "yaml-patch") {
                  for (const patchLine of yamlPatchAccumulated.split("\n")) {
                    const t = patchLine.trim();
                    if (!t) continue;
                    try {
                      const patch = JSON.parse(t) as JsonPatch;
                      if (patch.op) {
                        currentSpec = applyPatch(currentSpec, patch);
                      }
                    } catch {
                      // Skip invalid JSON lines
                    }
                  }
                  setSpec({ ...currentSpec });
                } else if (fenceState === "diff") {
                  try {
                    const specYaml = yamlStringify(currentSpec, { indent: 2 });
                    const patched = applyUnifiedDiff(specYaml, diffAccumulated);
                    if (typeof patched === "string") {
                      const parsed = yamlParse(patched);
                      if (parsed && typeof parsed === "object") {
                        const patches = diffToPatches(
                          currentSpec as unknown as Record<string, unknown>,
                          parsed as Record<string, unknown>,
                        );
                        for (const patch of patches) {
                          currentSpec = applyPatch(currentSpec, patch);
                        }
                        setSpec({ ...currentSpec });
                      }
                    }
                  } catch {
                    // Diff apply or reparse failed
                  }
                }
                fenceState = "outside";
              } else if (fenceState === "yaml-spec") {
                const { newPatches } = compiler.push(line + "\n");
                if (newPatches.length > 0) {
                  for (const patch of newPatches) {
                    currentSpec = applyPatch(currentSpec, patch);
                  }
                  setSpec({ ...currentSpec });
                }
              } else if (fenceState === "yaml-edit") {
                yamlEditAccumulated += line + "\n";
              } else if (fenceState === "yaml-patch") {
                yamlPatchAccumulated += line + "\n";
              } else if (fenceState === "diff") {
                diffAccumulated += line + "\n";
              }
            }
          }

          // Process remaining buffer
          if (buffer.trim()) {
            const trimmed = buffer.trim();
            if (trimmed.startsWith("{") && trimmed.includes('"__meta"')) {
              try {
                const parsed = JSON.parse(trimmed);
                if (parsed.__meta === "usage") {
                  setUsage({
                    promptTokens: parsed.promptTokens ?? 0,
                    completionTokens: parsed.completionTokens ?? 0,
                    totalTokens: parsed.totalTokens ?? 0,
                    cachedTokens: parsed.cachedTokens ?? 0,
                    cacheWriteTokens: parsed.cacheWriteTokens ?? 0,
                  });
                }
              } catch {
                // not JSON
              }
            } else if (fenceState === "yaml-spec") {
              compiler.push(buffer);
              const { result, newPatches } = compiler.flush();
              if (result && typeof result === "object" && result.root) {
                for (const patch of newPatches) {
                  currentSpec = applyPatch(currentSpec, patch);
                }
                setSpec({ ...currentSpec });
              }
            }
          }
        } else {
          // ── JSONL streaming ──
          let jsonlDiffState: "outside" | "diff" = "outside";
          let jsonlDiffAccumulated = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;

              // Diff fence detection within JSONL mode
              if (jsonlDiffState === "outside") {
                if (
                  trimmed === DIFF_FENCE ||
                  trimmed.startsWith(DIFF_FENCE + " ")
                ) {
                  jsonlDiffState = "diff";
                  jsonlDiffAccumulated = "";
                  continue;
                }
              } else if (
                jsonlDiffState === "diff" &&
                (trimmed === FENCE_CLOSE || trimmed === "````")
              ) {
                try {
                  const specJson = JSON.stringify(currentSpec, null, 2);
                  const patched = applyUnifiedDiff(
                    specJson,
                    jsonlDiffAccumulated,
                  );
                  if (typeof patched === "string") {
                    const parsed = JSON.parse(patched);
                    if (parsed && typeof parsed === "object") {
                      const patches = diffToPatches(
                        currentSpec as unknown as Record<string, unknown>,
                        parsed as Record<string, unknown>,
                      );
                      for (const patch of patches) {
                        currentSpec = applyPatch(currentSpec, patch);
                      }
                      setSpec({ ...currentSpec });
                    }
                  }
                } catch {
                  // Diff apply failed
                }
                jsonlDiffState = "outside";
                continue;
              }

              if (jsonlDiffState === "diff") {
                jsonlDiffAccumulated += line + "\n";
                setRawLines((prev) => [...prev, line]);
                continue;
              }

              // Standard JSONL line parsing
              const result = parseLine(trimmed);
              if (!result) continue;
              if (result.type === "usage") {
                setUsage(result.usage);
              } else if (result.type === "json-edit") {
                const merged = deepMergeSpec(
                  currentSpec as unknown as Record<string, unknown>,
                  result.mergeObj,
                );
                const patches = diffToPatches(
                  currentSpec as unknown as Record<string, unknown>,
                  merged,
                );
                for (const patch of patches) {
                  currentSpec = applyPatch(currentSpec, patch);
                }
                setRawLines((prev) => [...prev, trimmed]);
                setSpec({ ...currentSpec });
              } else {
                setRawLines((prev) => [...prev, trimmed]);
                currentSpec = applyPatch(currentSpec, result.patch);
                setSpec({ ...currentSpec });
              }
            }
          }

          if (buffer.trim()) {
            const trimmed = buffer.trim();
            const result = parseLine(trimmed);
            if (result) {
              if (result.type === "usage") {
                setUsage(result.usage);
              } else if (result.type === "json-edit") {
                const merged = deepMergeSpec(
                  currentSpec as unknown as Record<string, unknown>,
                  result.mergeObj,
                );
                const patches = diffToPatches(
                  currentSpec as unknown as Record<string, unknown>,
                  merged,
                );
                for (const patch of patches) {
                  currentSpec = applyPatch(currentSpec, patch);
                }
                setRawLines((prev) => [...prev, trimmed]);
                setSpec({ ...currentSpec });
              } else {
                setRawLines((prev) => [...prev, trimmed]);
                currentSpec = applyPatch(currentSpec, result.patch);
                setSpec({ ...currentSpec });
              }
            }
          }
        }

        onCompleteRef.current?.(currentSpec);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onErrorRef.current?.(error);
      } finally {
        setIsStreaming(false);
      }
    },
    [api],
  );

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return { spec, isStreaming, error, usage, rawLines, send, clear };
}
