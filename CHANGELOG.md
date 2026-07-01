# Changelog

## 0.19.1

<!-- release:start -->
### Bug Fixes

- **zod 4.4+ compatibility** — `@json-render/core` and `@json-render/shadcn-svelte` listed zod in both `dependencies` and `peerDependencies`, which could give the library its own zod copy distinct from your app's. zod 4 embeds a version literal in its types, so the duplicate copies surfaced as `Type '4' is not assignable to type '3'` errors on `_zod.version.minor` and blocked upgrading to zod 4.4+. zod is now a peer-only dependency, so your app's zod is always the single copy (#297, #303)
- **`visible` validation on zod 4.4+** — `catalog.validate()` accepted specs that omit an element's `visible` field on zod 4.3 but rejected them on zod 4.4+, where `z.any()` object keys became non-optional. `visible` is now explicitly optional so all zod 4.x versions agree (#287, #299)
- **Dangling children autofix** — `autoFixSpec` now prunes `children` references to elements that don't exist in the spec, the dominant remaining first-attempt validation failure for AI-generated specs. The renderer already skipped missing children at runtime, so pruning renders identically while letting the spec validate; each removal is reported in `fixes` (#300)
- **PDF and image render types** — Fixed `Buffer`/`Uint8Array` type errors in `@json-render/image`'s `renderToPng` and `@json-render/react-pdf`'s `renderToBuffer` under current `@types/node`, and corrected `renderToStream`'s declared return type to `NodeJS.ReadableStream`, which is what `@react-pdf/renderer` actually returns (#304)

### Improvements

- **Prompt rules for children** — The default prompt now states explicitly that every element must include a `children` array (`[]` for leaves), which models otherwise omitted on roughly a third of first attempts (#299)
- **Harness agent chat example** — New `examples/harness-chat` demo running a coding agent (Claude Code, Codex, or Pi) in a Vercel Sandbox via the AI SDK `HarnessAgent` API, rendering its work reports as json-render generative UI instead of markdown (#302)

### Contributors

- @ctate
<!-- release:end -->

## 0.19.0

### New Features

- **Custom directives API** — `@json-render/core` now supports custom directives via `defineDirective`, letting you declare new JSON shapes (like `$format`, `$math`) that resolve to computed values at render time. Directives compose naturally — nest `$format` over `$math` over `$state` and they resolve inside-out. All four renderers (React, Vue, Svelte, Solid) have built-in directive resolution (#279)
- **`@json-render/directives`** — New package shipping seven ready-made directives: `$format` (date, currency, number, percent via `Intl`), `$math` (add, subtract, multiply, divide, mod, min, max, round, floor, ceil, abs), `$concat`, `$count`, `$truncate`, `$pluralize`, and `$join`. Also exports `createI18nDirective` for `$t` translation keys with `{{param}}` interpolation, and `standardDirectives` for one-line registration (#279)

### Improvements

- **Example READMEs** — Added documentation to the chat, dashboard, game-engine, and no-ai examples (#277)

### Contributors

- @ctate

## 0.18.0

### New Features

- **Devtools** — Five new packages for inspecting json-render apps in the browser: `@json-render/devtools` (framework-agnostic core), plus `@json-render/devtools-react`, `@json-render/devtools-vue`, `@json-render/devtools-svelte`, and `@json-render/devtools-solid` adapters. Drop `<JsonRenderDevtools />` into your app to get a shadow-DOM-isolated panel with six tabs (Spec, State, Actions, Stream, Catalog, Pick), a DOM picker that maps clicked elements back to spec keys via `data-jr-key`, a capped event store, and server-side stream tap utilities. Floating toggle or `Cmd`/`Ctrl` + `Shift` + `J`, tree-shakes to `null` in production (#273)
- **Devtools example** — New `examples/devtools` Next.js demo showing the full devtools panel wired up to an AI chat endpoint and a component catalog (#273)
- **Action observer and devtools flag in core** — `@json-render/core` now exposes an action observer and a devtools enablement flag that adapters use to mirror actions and stream events into the panel (#273)

### Bug Fixes

- **Zod 4 schema formatting** — `formatZodType` now correctly handles `z.record()`, `z.default()`, and `z.literal()` types from Zod 4, which previously produced incorrect or empty output in generated prompts and schemas (#239)

### Improvements

- **Zod 4 test coverage** — Added unit tests for `formatZodType` covering record, default, and literal types to guard against regressions (#272)

### Contributors

- @ctate
- @mvanhorn

## 0.17.0

### New Features

- **Gaussian Splatting** — Added `GaussianSplat` component to `@json-render/react-three-fiber`, bringing the component count to 20. Composable with all existing R3F components (lights, controls, post-processing) via drei's Splat loader (#259)
- **Standalone gsplat example** — Experimental demo app showcasing Gaussian Splatting with gsplat.js (no Three.js dependency), featuring scene selector, live JSON spec viewer, and progress indicator (#259)
- **R3F gsplat example** — Demo app with five scenes: splat showroom, splat with primitives, multi-splat, post-processing effects, and animated floating splat (#259)

### Improved

- **AI output quality** — Improved prompt output and schema generation for more reliable AI-generated specs (#268)

### Contributors

- @ctate
- @willmanzoli

## 0.16.0

### Improved

- **Release process** — Switched from Changesets to a manual single-PR release workflow with changelog markers and automatic npm publish on version bump
