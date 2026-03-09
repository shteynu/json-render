# @json-render/mcp

MCP Apps integration for [json-render](https://github.com/vercel-labs/json-render). Serve json-render UIs as interactive MCP Apps inside Claude, ChatGPT, Cursor, VS Code, and other MCP-capable clients.

## What are MCP Apps?

[MCP Apps](https://modelcontextprotocol.io/docs/extensions/apps) is an extension to the Model Context Protocol that lets MCP servers return interactive HTML UIs rendered directly inside chat conversations. Instead of text-only tool responses, users get full interactive interfaces -- dashboards, forms, data visualizations -- embedded inline.

## Installation

```bash
npm install @json-render/mcp @json-render/core @modelcontextprotocol/sdk
```

## Quick Start

### 1. Define your catalog

```ts
import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { shadcnComponentDefinitions } from "@json-render/shadcn/catalog";

const catalog = defineCatalog(schema, {
  components: { ...shadcnComponentDefinitions },
  actions: {},
});
```

### 2. Create the MCP server

```ts
import { createMcpApp } from "@json-render/mcp";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import fs from "node:fs";

const server = createMcpApp({
  name: "My Dashboard",
  version: "1.0.0",
  catalog,
  html: fs.readFileSync("dist/index.html", "utf-8"),
});

await server.connect(new StdioServerTransport());
```

### 3. Build the UI (iframe)

Create an app that connects to the MCP host and renders specs. Framework-specific adapters are available for React, Vue, and Svelte.

#### React

```tsx
import { useJsonRenderApp } from "@json-render/mcp/app/react";
import { JSONUIProvider, Renderer } from "@json-render/react";

function McpAppView({ registry }) {
  const { spec, loading, connected, error } = useJsonRenderApp();

  if (error) return <div>Error: {error.message}</div>;
  if (!spec) return <div>Waiting for spec...</div>;

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
  <div v-else-if="!spec">Waiting for spec...</div>
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
  <div>Waiting for spec...</div>
{:else}
  <Renderer spec={$spec} {registry} loading={$loading} />
{/if}
```

Bundle with Vite + `vite-plugin-singlefile` into a single HTML file, then pass it to `createMcpApp` as the `html` option.

### 4. Connect to a client

Add to `.cursor/mcp.json` or Claude Desktop config:

```json
{
  "mcpServers": {
    "my-app": {
      "command": "node",
      "args": ["./server.js", "--stdio"]
    }
  }
}
```

## API Reference

### Server Side (main export)

#### `createMcpApp(options)`

Creates a fully-configured `McpServer` with a json-render tool and UI resource.

| Option | Type | Description |
|--------|------|-------------|
| `name` | `string` | Server name shown in client UIs |
| `version` | `string` | Server version |
| `catalog` | `Catalog` | json-render catalog defining available components |
| `html` | `string` | Bundled HTML for the iframe UI |
| `tool` | `McpToolOptions` | Optional tool name/title/description overrides |

#### `registerJsonRenderTool(server, options)`

Register a json-render tool on an existing `McpServer`.

#### `registerJsonRenderResource(server, options)`

Register a json-render UI resource on an existing `McpServer`.

### Client Side

#### `buildAppHtml(options)` — `@json-render/mcp/app`

Generate a self-contained HTML string from bundled JS/CSS for use as a UI resource.

#### `useJsonRenderApp(options?)` — `@json-render/mcp/app/react`

React hook for the iframe-side app. Connects to the MCP host, receives tool results, and maintains the current json-render spec.

Returns `{ spec, loading, connected, connecting, error, app, callServerTool }`.

#### `useJsonRenderApp(options?)` — `@json-render/mcp/app/vue`

Vue composable with the same API shape. Values are Vue refs/computed properties.

Returns `{ spec, loading, connected, connecting, error, app, callServerTool }`.

#### `createJsonRenderApp(options?)` — `@json-render/mcp/app/svelte`

Creates a json-render MCP App client using Svelte stores. Values are readable stores.

Returns `{ spec, loading, connected, connecting, error, app, callServerTool, destroy }`.

## Client Support

MCP Apps are supported by Claude, ChatGPT, VS Code (Copilot), Cursor, Goose, and Postman.
