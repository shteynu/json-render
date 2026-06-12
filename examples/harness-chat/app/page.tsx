"use client";

import { useCallback, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  SPEC_DATA_PART,
  SPEC_DATA_PART_TYPE,
  type SpecDataPart,
} from "@json-render/core";
import { useJsonRenderMessage } from "@json-render/react";
import { ArrowUp, ChevronRight, Loader2, TerminalSquare } from "lucide-react";
import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";

import { ReportRenderer } from "@/lib/render/renderer";

type AppDataParts = { [SPEC_DATA_PART]: SpecDataPart };
type AppMessage = UIMessage<unknown, AppDataParts>;

const transport = new DefaultChatTransport({ api: "/api/agent" });

const SUGGESTIONS = [
  {
    label: "Build and test a library",
    prompt:
      "Scaffold a tiny TypeScript semver-parsing library with vitest tests, run the tests, and report the results.",
  },
  {
    label: "Fix failing code",
    prompt:
      "Create a small JS module with a subtle off-by-one bug and a failing test, then diagnose and fix it like a real debugging session.",
  },
  {
    label: "Benchmark something",
    prompt:
      "Write and run a quick benchmark comparing JSON.parse vs a streaming JSON parser on a 5MB file, and report the numbers.",
  },
  {
    label: "Explore a repo",
    prompt:
      "Clone github.com/vercel-labs/json-render, explore the package structure, and report what each package does.",
  },
];

/** Readable labels for Claude Code builtin tools: [running, done] */
const TOOL_LABELS: Record<string, [string, string]> = {
  bash: ["Running command", "Ran command"],
  read: ["Reading file", "Read file"],
  write: ["Writing file", "Wrote file"],
  edit: ["Editing file", "Edited file"],
  grep: ["Searching code", "Searched code"],
  glob: ["Listing files", "Listed files"],
  webSearch: ["Searching the web", "Searched the web"],
  WebFetch: ["Fetching page", "Fetched page"],
  TodoWrite: ["Updating plan", "Updated plan"],
};

/** Pull a one-line human hint out of a tool input (command, path, query). */
function toolInputHint(input: unknown): string | null {
  if (input == null || typeof input !== "object") return null;
  const record = input as Record<string, unknown>;
  const hint =
    record.command ?? record.file_path ?? record.pattern ?? record.query;
  return typeof hint === "string" ? hint : null;
}

function ToolCallDisplay({
  toolName,
  state,
  input,
  output,
}: {
  toolName: string;
  state: string;
  input: unknown;
  output: unknown;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLoading =
    state !== "output-available" &&
    state !== "output-error" &&
    state !== "output-denied";
  const labels = TOOL_LABELS[toolName];
  const label = labels ? (isLoading ? labels[0] : labels[1]) : toolName;
  const hint = toolInputHint(input);

  return (
    <div className="text-sm group">
      <button
        type="button"
        className="flex max-w-full items-center gap-1.5"
        onClick={() => setExpanded((e) => !e)}
      >
        <span
          className={`shrink-0 text-muted-foreground ${isLoading ? "animate-shimmer" : ""}`}
        >
          {label}
        </span>
        {hint && (
          <code className="truncate font-mono text-xs text-muted-foreground/70">
            {hint}
          </code>
        )}
        {!isLoading && (
          <ChevronRight
            className={`h-3 w-3 shrink-0 text-muted-foreground/0 group-hover:text-muted-foreground transition-all ${expanded ? "rotate-90" : ""}`}
          />
        )}
      </button>
      {expanded && !isLoading && output != null && (
        <pre className="mt-1 max-h-64 overflow-auto text-xs text-muted-foreground whitespace-pre-wrap break-all">
          {typeof output === "string"
            ? output
            : JSON.stringify(output, null, 2)}
        </pre>
      )}
    </div>
  );
}

function MessageBubble({
  message,
  isLast,
  isStreaming,
}: {
  message: AppMessage;
  isLast: boolean;
  isStreaming: boolean;
}) {
  const { spec, text, hasSpec } = useJsonRenderMessage(message.parts);

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-primary px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-primary-foreground">
          {text}
        </div>
      </div>
    );
  }

  // Ordered segments: adjacent text merged, adjacent tool calls grouped,
  // the spec rendered inline where the agent emitted it.
  const segments: Array<
    | { kind: "text"; text: string }
    | {
        kind: "tools";
        tools: Array<{
          toolCallId: string;
          toolName: string;
          state: string;
          input: unknown;
          output: unknown;
        }>;
      }
    | { kind: "spec" }
  > = [];
  let specInserted = false;

  for (const part of message.parts) {
    if (part.type === "text") {
      if (!part.text.trim()) continue;
      const last = segments[segments.length - 1];
      if (last?.kind === "text") last.text += part.text;
      else segments.push({ kind: "text", text: part.text });
    } else if (part.type.startsWith("tool-")) {
      const tp = part as {
        type: string;
        toolCallId: string;
        state: string;
        input?: unknown;
        output?: unknown;
      };
      const tool = {
        toolCallId: tp.toolCallId,
        toolName: tp.type.replace(/^tool-/, ""),
        state: tp.state,
        input: tp.input,
        output: tp.output,
      };
      const last = segments[segments.length - 1];
      if (last?.kind === "tools") last.tools.push(tool);
      else segments.push({ kind: "tools", tools: [tool] });
    } else if (part.type === SPEC_DATA_PART_TYPE && !specInserted) {
      segments.push({ kind: "spec" });
      specInserted = true;
    }
  }

  const showLoader = isLast && isStreaming && segments.length === 0 && !hasSpec;

  return (
    <div className="flex w-full flex-col gap-3">
      {segments.map((seg, i) => {
        if (seg.kind === "text") {
          return (
            <div key={`text-${i}`} className="text-sm leading-relaxed">
              <Streamdown
                plugins={{ code }}
                animated={isLast && isStreaming && i === segments.length - 1}
              >
                {seg.text}
              </Streamdown>
            </div>
          );
        }
        if (seg.kind === "spec") {
          if (!hasSpec) return null;
          return (
            <div key="spec" className="w-full">
              <ReportRenderer spec={spec} loading={isLast && isStreaming} />
            </div>
          );
        }
        return (
          <div key={`tools-${i}`} className="flex flex-col gap-1">
            {seg.tools.map((t) => (
              <ToolCallDisplay
                key={t.toolCallId}
                toolName={t.toolName}
                state={t.state}
                input={t.input}
                output={t.output}
              />
            ))}
          </div>
        );
      })}

      {showLoader && (
        <div className="text-sm text-muted-foreground animate-shimmer">
          Starting sandbox...
        </div>
      )}

      {hasSpec && !specInserted && (
        <div className="w-full">
          <ReportRenderer spec={spec} loading={isLast && isStreaming} />
        </div>
      )}
    </div>
  );
}

export default function HarnessChatPage() {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, setMessages, status, error, id } =
    useChat<AppMessage>({ transport });

  const isStreaming = status === "streaming" || status === "submitted";

  const handleSubmit = useCallback(
    async (text?: string) => {
      const message = text || input;
      if (!message.trim() || isStreaming) return;
      setInput("");
      await sendMessage({ text: message.trim() });
    },
    [input, isStreaming, sendMessage],
  );

  const handleClear = useCallback(() => {
    // Drop the server-side harness session (and its sandbox) for this chat.
    fetch(`/api/agent?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    }).catch(() => {});
    setMessages([]);
    setInput("");
    inputRef.current?.focus();
  }, [id, setMessages]);

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="flex shrink-0 items-center justify-between border-b px-6 py-3">
        <div className="flex items-center gap-2">
          <TerminalSquare className="h-5 w-5" />
          <h1 className="text-lg font-semibold">
            json-render Harness Agent Example
          </h1>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Start Over
          </button>
        )}
      </header>

      <main className="flex-1 overflow-auto">
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center px-6 py-12">
            <div className="w-full max-w-2xl space-y-8">
              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Give a coding agent a task
                </h2>
                <p className="text-muted-foreground">
                  Claude Code runs in a Vercel Sandbox and reports its work as
                  generative UI -- steps, file changes, terminal output, and
                  test results rendered from a json-render spec.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => handleSubmit(s.prompt)}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-6 px-6 py-6">
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isLast={index === messages.length - 1}
                isStreaming={isStreaming}
              />
            ))}
            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error.message}
              </div>
            )}
          </div>
        )}
      </main>

      <div className="shrink-0 bg-background px-6 pb-3">
        <div className="mx-auto max-w-3xl relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={
              isEmpty
                ? "e.g., Scaffold a TypeScript library and run its tests..."
                : "Ask a follow-up in the same sandbox..."
            }
            rows={2}
            className="w-full resize-none rounded-xl border border-input bg-card px-4 py-3 pr-12 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            autoFocus
          />
          <button
            onClick={() => handleSubmit()}
            disabled={!input.trim() || isStreaming}
            className="absolute right-3 bottom-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
