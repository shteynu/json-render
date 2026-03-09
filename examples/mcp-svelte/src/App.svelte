<script lang="ts">
  import { createJsonRenderApp } from "@json-render/mcp/app/svelte";
  import { JsonUIProvider, Renderer } from "@json-render/svelte";
  import { onDestroy } from "svelte";
  import { registry } from "./registry";

  const { spec, loading, connecting, error, destroy } = createJsonRenderApp({
    name: "json-render-mcp-svelte",
    version: "1.0.0",
  });
  onDestroy(destroy);
</script>

{#if $error}
  <div style="padding: 16px; color: #dc2626; font-family: monospace; font-size: 13px">
    {$error.message}
  </div>
{:else if !$spec}
  <div style="padding: 16px; color: #6b7280; font-family: sans-serif; font-size: 14px">
    {$connecting ? "Connecting to host..." : "Waiting for UI spec..."}
  </div>
{:else}
  <JsonUIProvider initialState={$spec.state ?? {}}>
    <Renderer spec={$spec} {registry} loading={$loading} />
  </JsonUIProvider>
{/if}
