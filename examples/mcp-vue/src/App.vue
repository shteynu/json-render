<script setup lang="ts">
import { useJsonRenderApp } from "@json-render/mcp/app/vue";
import { Renderer, defineRegistry, JSONUIProvider } from "@json-render/vue";
import { catalog } from "./catalog";
import { components } from "./registry";

const { registry } = defineRegistry(catalog, { components });

const { spec, loading, connected, connecting, error } = useJsonRenderApp({
  name: "json-render-mcp-vue",
  version: "1.0.0",
});
</script>

<template>
  <div v-if="error" style="padding: 16px; color: #dc2626; font-family: monospace; font-size: 13px">
    {{ error.message }}
  </div>
  <div v-else-if="!spec" style="padding: 16px; color: #6b7280; font-family: sans-serif; font-size: 14px">
    {{ connecting ? "Connecting to host..." : "Waiting for UI spec..." }}
  </div>
  <JSONUIProvider v-else :registry="registry" :initialState="spec.state ?? {}">
    <Renderer :spec="spec" :registry="registry" :loading="loading" />
  </JSONUIProvider>
</template>
