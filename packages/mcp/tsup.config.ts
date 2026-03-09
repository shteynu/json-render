import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/app.ts",
    "src/app/react.ts",
    "src/app/vue.ts",
    "src/app/svelte.ts",
  ],
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    "react",
    "react-dom",
    "vue",
    "svelte",
    "svelte/store",
    "@json-render/core",
    "@json-render/react",
    "@modelcontextprotocol/sdk",
    "@modelcontextprotocol/ext-apps",
  ],
});
