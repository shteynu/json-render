---
name: mcp
description: MCP Apps integration for json-render. Use when building MCP servers that render interactive UIs in Claude, ChatGPT, Cursor, or VS Code, or when integrating json-render with the Model Context Protocol.
---

# @json-render/mcp

MCP Apps integration that serves json-render UIs as interactive MCP Apps inside Claude, ChatGPT, Cursor, VS Code, and other MCP-capable clients.

## Quick Start

### Server (Node.js)

```typescript
import { createMcpApp } from "@json-render/mcp";
import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { shadcnComponentDefinitions } from "@json-render/shadcn/catalog";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import fs from "node:fs";

const catalog = defineCatalog(schema, {
  components: { ...shadcnComponentDefinitions },
  actions: {},
});

const server = createMcpApp({
  name: "My App",
  version: "1.0.0",
  catalog,
  html: fs.readFileSync("dist/index.html", "utf-8"),
});

await server.connect(new StdioServerTransport());
```

### Client (inside iframe)

Framework-specific adapters connect to the MCP host and maintain the current spec:

- `@json-render/mcp/app/react` -- `useJsonRenderApp()` React hook
- `@json-render/mcp/app/vue` -- `useJsonRenderApp()` Vue composable
- `@json-render/mcp/app/svelte` -- `createJsonRenderApp()` Svelte stores

#### React

```tsx
import { useJsonRenderApp } from "@json-render/mcp/app/react";
import { JSONUIProvider, Renderer } from "@json-render/react";

function McpAppView({ registry }) {
  const { spec, loading, error } = useJsonRenderApp();
  if (error) return <div>Error: {error.message}</div>;
  if (!spec) return <div>Waiting...</div>;
  return (
    <JSONUIProvider registry={registry} initialState={spec.state ?? {}}>
      <Renderer spec={spec} registry={registry} loading={loading} />
    </JSONUIProvider>
  );
}
```

#### Vue

```vue
<script setup>
import { useJsonRenderApp } from "@json-render/mcp/app/vue";
import { Renderer } from "@json-render/vue";

const { spec, loading, error } = useJsonRenderApp();
</script>

<template>
  <div v-if="error">Error: {{ error.message }}</div>
  <div v-else-if="!spec">Waiting...</div>
  <Renderer v-else :spec="spec" :registry="registry" :loading="loading" />
</template>
```

#### Svelte

```svelte
<script>
  import { createJsonRenderApp } from "@json-render/mcp/app/svelte";
  import { Renderer } from "@json-render/svelte";
  import { onDestroy } from "svelte";

  const { spec, loading, error, destroy } = createJsonRenderApp();
  onDestroy(destroy);
</script>

{#if $error}
  <div>Error: {$error.message}</div>
{:else if !$spec}
  <div>Waiting...</div>
{:else}
  <Renderer spec={$spec} {registry} loading={$loading} />
{/if}
```

## Architecture

1. `createMcpApp()` creates an `McpServer` that registers a `render-ui` tool and a `ui://` HTML resource
2. The tool description includes the catalog prompt so the LLM knows how to generate valid specs
3. The HTML resource is a Vite-bundled single-file app (React, Vue, or Svelte) with json-render renderers
4. Inside the iframe, the framework adapter connects to the host via `postMessage` and renders specs

## Server API

- `createMcpApp(options)` - main entry, creates a full MCP server
- `registerJsonRenderTool(server, options)` - register a json-render tool on an existing server
- `registerJsonRenderResource(server, options)` - register the UI resource

## Client API

- `buildAppHtml(options)` (`@json-render/mcp/app`) - generate HTML from bundled JS/CSS
- `useJsonRenderApp(options?)` (`@json-render/mcp/app/react`) - React hook
- `useJsonRenderApp(options?)` (`@json-render/mcp/app/vue`) - Vue composable
- `createJsonRenderApp(options?)` (`@json-render/mcp/app/svelte`) - Svelte stores + `destroy()`

All adapters return `{ spec, loading, connected, connecting, error, app, callServerTool }`.

## Building the iframe HTML

Bundle your app into a single self-contained HTML file using Vite + `vite-plugin-singlefile`. Add the appropriate framework plugin:

```typescript
// vite.config.ts (React example)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: { outDir: "dist" },
});
```

## Client Configuration

### Cursor (`.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "my-app": {
      "command": "npx",
      "args": ["tsx", "server.ts", "--stdio"]
    }
  }
}
```

### Claude Desktop

```json
{
  "mcpServers": {
    "my-app": {
      "command": "npx",
      "args": ["tsx", "/path/to/server.ts", "--stdio"]
    }
  }
}
```

## Dependencies

```bash
# Server
npm install @json-render/mcp @json-render/core @modelcontextprotocol/sdk

# Client (iframe) -- pick your framework
npm install @json-render/react react react-dom        # React
npm install @json-render/vue vue                      # Vue
npm install @json-render/svelte svelte                # Svelte

# Build tools
npm install -D vite vite-plugin-singlefile
```
