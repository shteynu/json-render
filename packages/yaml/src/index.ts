// Diff
export { diffToPatches } from "./diff";

// Merge
export { deepMergeSpec } from "./merge";

// Streaming YAML compiler
export type { YamlStreamCompiler } from "./parser";
export { createYamlStreamCompiler } from "./parser";

// AI SDK transform
export { createYamlTransform, pipeYamlRender } from "./transform";

// Prompt generation
export type { YamlPromptOptions } from "./prompt";
export { yamlPrompt } from "./prompt";
