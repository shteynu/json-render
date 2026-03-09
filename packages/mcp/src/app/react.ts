import { useState, useEffect, useCallback, useRef } from "react";
import type { Spec } from "@json-render/core";
import { App } from "@modelcontextprotocol/ext-apps";
import {
  parseSpecFromToolResult,
  type JsonRenderAppOptions,
  type ToolResultContent,
} from "./shared.js";

/**
 * Options for the `useJsonRenderApp` hook.
 */
export type UseJsonRenderAppOptions = JsonRenderAppOptions;

/**
 * Return value of `useJsonRenderApp`.
 */
export interface UseJsonRenderAppReturn {
  /** The current json-render spec (null until the first tool result). */
  spec: Spec | null;
  /** Whether the app is still connecting to the host. */
  connecting: boolean;
  /** Whether the app is connected to the host. */
  connected: boolean;
  /** Connection error, if any. */
  error: Error | null;
  /** Whether the spec is still being received / parsed. */
  loading: boolean;
  /** The underlying MCP App instance. */
  app: App | null;
  /**
   * Call a tool on the MCP server and update the spec from the result.
   * Useful for refresh / drill-down interactions.
   */
  callServerTool: (
    name: string,
    args?: Record<string, unknown>,
  ) => Promise<void>;
}

/**
 * React hook that connects to the MCP host, listens for tool results,
 * and maintains the current json-render spec.
 *
 * Follows the official MCP Apps pattern: create an `App` instance,
 * register the `ontoolresult` handler, then call `app.connect()`
 * which internally creates a PostMessageTransport to the host.
 */
export function useJsonRenderApp(
  options: UseJsonRenderAppOptions = {},
): UseJsonRenderAppReturn {
  const { name = "json-render", version = "1.0.0" } = options;

  const [spec, setSpec] = useState<Spec | null>(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const appRef = useRef<App | null>(null);

  useEffect(() => {
    const app = new App({ name, version });
    appRef.current = app;

    app.ontoolresult = (result: { content?: ToolResultContent[] }) => {
      const parsed = parseSpecFromToolResult(result);
      if (parsed) {
        setSpec(parsed);
        setLoading(false);
      }
    };

    app
      .connect()
      .then(() => {
        setConnected(true);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err : new Error(String(err)));
      });

    return () => {
      app.close().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const callServerTool = useCallback(
    async (toolName: string, args: Record<string, unknown> = {}) => {
      if (!appRef.current) return;
      setLoading(true);
      try {
        const result = await appRef.current.callServerTool({
          name: toolName,
          arguments: args,
        });
        const parsed = parseSpecFromToolResult(result);
        if (parsed) setSpec(parsed);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    spec,
    connecting: !connected && !error,
    connected,
    error,
    loading,
    app: appRef.current,
    callServerTool,
  };
}
