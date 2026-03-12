---
"@json-render/core": minor
"@json-render/solid": minor
"@json-render/react-three-fiber": minor
---

Add SolidJS and React Three Fiber renderers, plus strict JSON Schema mode for LLM structured outputs.

### New:

- **`@json-render/solid`** -- SolidJS renderer. JSON becomes Solid components with reactive rendering, schema export, and full catalog support.
- **`@json-render/react-three-fiber`** -- React Three Fiber renderer. JSON becomes 3D scenes with 19 built-in components for meshes, lights, models, environments, text, cameras, and controls.

### Improved:

- **`@json-render/core`** -- `jsonSchema({ strict: true })` produces a JSON Schema subset compatible with LLM structured output APIs (OpenAI, Google Gemini, Anthropic). Ensures `additionalProperties: false` on every object and all properties listed in `required`.
