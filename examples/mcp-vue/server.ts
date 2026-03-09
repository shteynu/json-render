import { createMcpApp } from "@json-render/mcp";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { catalog } from "./src/catalog.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadHtml(): string {
  const htmlPath = path.join(__dirname, "dist", "index.html");
  if (!fs.existsSync(htmlPath)) {
    throw new Error(
      `Built HTML not found at ${htmlPath}. Run 'pnpm build' first.`,
    );
  }
  return fs.readFileSync(htmlPath, "utf-8");
}

async function main() {
  const html = loadHtml();
  const server = await createMcpApp({
    name: "json-render Vue Example",
    version: "1.0.0",
    catalog,
    html,
  });
  await server.connect(new StdioServerTransport());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
