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
  <div class="p-4 text-destructive font-mono text-sm">
    {$error.message}
  </div>
{:else if !$spec}
  <div class="p-4 text-muted-foreground text-sm">
    {$connecting ? "Connecting to host..." : "Waiting for UI spec..."}
  </div>
{:else}
  <JsonUIProvider initialState={$spec.state ?? {}}>
    <Renderer spec={$spec} {registry} loading={$loading} />
  </JsonUIProvider>
{/if}
