/**
 * Client-side (iframe) utilities for rendering json-render specs
 * inside an MCP App view.
 *
 * This module is intended to run **inside the sandboxed iframe** that
 * MCP hosts render. It connects to the host via the MCP Apps protocol,
 * receives tool results containing json-render specs, and provides
 * framework-specific hooks / helpers to render them.
 *
 * Framework-specific adapters are available at:
 * - `@json-render/mcp/app/react`  — React hook
 * - `@json-render/mcp/app/vue`    — Vue composable
 * - `@json-render/mcp/app/svelte` — Svelte stores
 *
 * The React hook is also re-exported here for backward compatibility.
 *
 * @example
 * ```tsx
 * import { useJsonRenderApp } from "@json-render/mcp/app/react";
 * import { Renderer } from "@json-render/react";
 *
 * function McpAppView({ registry }) {
 *   const { spec, loading } = useJsonRenderApp();
 *   return <Renderer spec={spec} registry={registry} loading={loading} />;
 * }
 * ```
 *
 * @packageDocumentation
 */

export { useJsonRenderApp } from "./app/react.js";
export type {
  UseJsonRenderAppOptions,
  UseJsonRenderAppReturn,
} from "./app/react.js";
export { buildAppHtml } from "./build-app-html.js";
export type { BuildAppHtmlOptions } from "./build-app-html.js";
export type { JsonRenderAppOptions, JsonRenderAppState } from "./app/shared.js";
