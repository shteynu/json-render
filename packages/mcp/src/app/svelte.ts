import { writable, derived, type Readable, type Writable } from "svelte/store";
import type { Spec } from "@json-render/core";
import { App } from "@modelcontextprotocol/ext-apps";
import {
  parseSpecFromToolResult,
  type JsonRenderAppOptions,
  type ToolResultContent,
} from "./shared.js";

/**
 * Options for `createJsonRenderApp`.
 */
export type CreateJsonRenderAppOptions = JsonRenderAppOptions;

/**
 * Return value of `createJsonRenderApp`.
 */
export interface CreateJsonRenderAppReturn {
  /** The current json-render spec (null until the first tool result). */
  spec: Readable<Spec | null>;
  /** Whether the app is still connecting to the host. */
  connecting: Readable<boolean>;
  /** Whether the app is connected to the host. */
  connected: Readable<boolean>;
  /** Connection error, if any. */
  error: Readable<Error | null>;
  /** Whether the spec is still being received / parsed. */
  loading: Readable<boolean>;
  /** The underlying MCP App instance. */
  app: Readable<App | null>;
  /**
   * Call a tool on the MCP server and update the spec from the result.
   * Useful for refresh / drill-down interactions.
   */
  callServerTool: (
    name: string,
    args?: Record<string, unknown>,
  ) => Promise<void>;
  /** Clean up the MCP App connection. Call in `onDestroy`. */
  destroy: () => void;
}

/**
 * Create a json-render MCP App client using Svelte stores.
 *
 * Connects to the MCP host, listens for tool results, and maintains
 * the current json-render spec as a readable store.
 *
 * Call `destroy()` in your component's `onDestroy` to clean up.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createJsonRenderApp } from "@json-render/mcp/app/svelte";
 *   import { onDestroy } from "svelte";
 *
 *   const { spec, loading, destroy } = createJsonRenderApp();
 *   onDestroy(destroy);
 * </script>
 * ```
 */
export function createJsonRenderApp(
  options: CreateJsonRenderAppOptions = {},
): CreateJsonRenderAppReturn {
  const { name = "json-render", version = "1.0.0" } = options;

  const spec: Writable<Spec | null> = writable(null);
  const loading: Writable<boolean> = writable(true);
  const connected: Writable<boolean> = writable(false);
  const error: Writable<Error | null> = writable(null);
  const appStore: Writable<App | null> = writable(null);

  const connecting: Readable<boolean> = derived(
    [connected, error],
    ([$connected, $error]) => !$connected && !$error,
  );

  const app = new App({ name, version });
  appStore.set(app);

  app.ontoolresult = (result: { content?: ToolResultContent[] }) => {
    const parsed = parseSpecFromToolResult(result);
    if (parsed) {
      spec.set(parsed);
      loading.set(false);
    }
  };

  app
    .connect()
    .then(() => {
      connected.set(true);
    })
    .catch((err: unknown) => {
      error.set(err instanceof Error ? err : new Error(String(err)));
    });

  async function callServerTool(
    toolName: string,
    args: Record<string, unknown> = {},
  ): Promise<void> {
    loading.set(true);
    try {
      const result = await app.callServerTool({
        name: toolName,
        arguments: args,
      });
      const parsed = parseSpecFromToolResult(result);
      if (parsed) spec.set(parsed);
    } finally {
      loading.set(false);
    }
  }

  function destroy(): void {
    app.close().catch(() => {});
  }

  return {
    spec,
    connecting,
    connected,
    error,
    loading,
    app: appStore,
    callServerTool,
    destroy,
  };
}
