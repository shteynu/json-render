import type { Spec } from "@json-render/core";
import type { App } from "@modelcontextprotocol/ext-apps";

/**
 * Options for creating a json-render MCP App client.
 */
export interface JsonRenderAppOptions {
  /** App name shown during initialization. Defaults to `"json-render"`. */
  name?: string;
  /** App version. Defaults to `"1.0.0"`. */
  version?: string;
}

/**
 * State returned by the json-render MCP App client across all frameworks.
 */
export interface JsonRenderAppState {
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

export interface ToolResultContent {
  type: string;
  text?: string;
}

export function parseSpecFromToolResult(result: {
  content?: ToolResultContent[];
}): Spec | null {
  const textContent = result.content?.find(
    (c: ToolResultContent) => c.type === "text",
  );
  if (!textContent?.text) return null;
  try {
    const parsed = JSON.parse(textContent.text);
    if (parsed && typeof parsed === "object" && "spec" in parsed) {
      return parsed.spec as Spec;
    }
    return parsed as Spec;
  } catch {
    return null;
  }
}
