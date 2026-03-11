---
"@json-render/core": patch
"@json-render/mcp": patch
---

Rename generation modes and fix MCP React duplicate module error.

### Changed:

- **`@json-render/core`** — Renamed generation modes from `"generate"` / `"chat"` to `"standalone"` / `"inline"`. The old names still work but emit a deprecation warning.

### Fixed:

- **`@json-render/mcp`** — Resolved React duplicate module error (`useRef` returning null) by adding `resolve.dedupe` Vite configuration. Added `./build-app-html` export entry point.

### Other:

- Updated `homepage` URLs across all packages to point to `https://json-render.dev`.
- Reorganized skills directory structure for cleaner naming.
- Added skills documentation page to the web app.
