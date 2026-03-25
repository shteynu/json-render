import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/server.ts"],
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    "react",
    "react-dom",
    "next",
    "next/link",
    "next/navigation",
    "@json-render/core",
    "@json-render/react",
  ],
});
