import {
  shallowRef,
  ref,
  computed,
  onMounted,
  onUnmounted,
  type ShallowRef,
  type Ref,
  type ComputedRef,
} from "vue";
import type { Spec } from "@json-render/core";
import { App } from "@modelcontextprotocol/ext-apps";
import {
  parseSpecFromToolResult,
  type JsonRenderAppOptions,
  type ToolResultContent,
} from "./shared.js";

/**
 * Options for the `useJsonRenderApp` composable.
 */
export type UseJsonRenderAppOptions = JsonRenderAppOptions;

/**
 * Return value of `useJsonRenderApp`.
 */
export interface UseJsonRenderAppReturn {
  /** The current json-render spec (null until the first tool result). */
  spec: ShallowRef<Spec | null>;
  /** Whether the app is still connecting to the host. */
  connecting: ComputedRef<boolean>;
  /** Whether the app is connected to the host. */
  connected: Ref<boolean>;
  /** Connection error, if any. */
  error: Ref<Error | null>;
  /** Whether the spec is still being received / parsed. */
  loading: Ref<boolean>;
  /** The underlying MCP App instance. */
  app: ShallowRef<App | null>;
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
 * Vue composable that connects to the MCP host, listens for tool results,
 * and maintains the current json-render spec.
 *
 * Must be called inside a component's `setup` function or `<script setup>`.
 */
export function useJsonRenderApp(
  options: UseJsonRenderAppOptions = {},
): UseJsonRenderAppReturn {
  const { name = "json-render", version = "1.0.0" } = options;

  const spec = shallowRef<Spec | null>(null);
  const loading = ref(true);
  const connected = ref(false);
  const error = ref<Error | null>(null);
  const appRef = shallowRef<App | null>(null);
  const connecting = computed(() => !connected.value && !error.value);

  let appInstance: App | null = null;

  onMounted(() => {
    const app = new App({ name, version });
    appInstance = app;
    appRef.value = app;

    app.ontoolresult = (result: { content?: ToolResultContent[] }) => {
      const parsed = parseSpecFromToolResult(result);
      if (parsed) {
        spec.value = parsed;
        loading.value = false;
      }
    };

    app
      .connect()
      .then(() => {
        connected.value = true;
      })
      .catch((err: unknown) => {
        error.value = err instanceof Error ? err : new Error(String(err));
      });
  });

  onUnmounted(() => {
    appInstance?.close().catch(() => {});
  });

  async function callServerTool(
    toolName: string,
    args: Record<string, unknown> = {},
  ): Promise<void> {
    if (!appInstance) return;
    loading.value = true;
    try {
      const result = await appInstance.callServerTool({
        name: toolName,
        arguments: args,
      });
      const parsed = parseSpecFromToolResult(result);
      if (parsed) spec.value = parsed;
    } finally {
      loading.value = false;
    }
  }

  return {
    spec,
    connecting,
    connected,
    error,
    loading,
    app: appRef,
    callServerTool,
  };
}
