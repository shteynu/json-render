<script setup lang="ts">
import { useJsonRenderApp } from "@json-render/mcp/app/vue";
import { Renderer, defineRegistry, JSONUIProvider } from "@json-render/vue";
import { catalog } from "./catalog";
import { components } from "./registry";

const { registry } = defineRegistry(catalog, { components });

const { spec, loading, connecting, error } = useJsonRenderApp({
  name: "json-render-mcp-vue",
  version: "1.0.0",
});
</script>

<template>
  <div
    v-if="error"
    class="p-4 font-mono text-sm text-destructive"
  >
    {{ error.message }}
  </div>
  <div
    v-else-if="!spec"
    class="p-4 text-sm text-muted-foreground"
  >
    {{ connecting ? "Connecting to host..." : "Waiting for UI spec..." }}
  </div>
  <JSONUIProvider v-else :registry="registry" :initialState="spec.state ?? {}">
    <Renderer :spec="spec" :registry="registry" :loading="loading" />
  </JSONUIProvider>
</template>
