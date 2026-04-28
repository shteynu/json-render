import type { z } from "zod";
import type { PropResolutionContext } from "./props";

/**
 * Definition for a custom directive — a user-defined `$`-prefixed dynamic
 * value that extends the spec language.
 *
 * @example
 * ```ts
 * const formatDirective = defineDirective({
 *   name: '$format',
 *   schema: z.object({
 *     $format: z.enum(['date', 'currency', 'number']),
 *     value: z.unknown(),
 *   }),
 *   resolve(value, ctx) {
 *     const resolved = resolvePropValue(value.value, ctx);
 *     return new Intl.NumberFormat().format(resolved);
 *   },
 *   prompt: 'Use { "$format": "currency", "value": ... } to format values.',
 * });
 * ```
 */
export interface DirectiveDefinition<TSchema extends z.ZodType = z.ZodType> {
  /** The `$`-prefixed key that triggers this directive (e.g. `"$format"`). */
  name: string;
  /** Zod schema for validating the directive object. */
  schema: TSchema;
  /**
   * Resolver function. Receives the raw directive value and the current
   * {@link PropResolutionContext}. May call `resolvePropValue` on sub-values
   * to support composition with other dynamic expressions.
   */
  resolve: (value: z.infer<TSchema>, ctx: PropResolutionContext) => unknown;
  /**
   * Prompt text appended to the system prompt when this directive is
   * registered in a catalog. Describes usage for the AI model.
   */
  prompt?: string;
}

/**
 * A Map from directive name (e.g. `"$format"`) to its definition.
 * Passed through {@link PropResolutionContext} for runtime resolution.
 */
export type DirectiveRegistry = Map<string, DirectiveDefinition>;

/**
 * Define a custom directive.
 *
 * This is an identity function that provides type checking and serves as
 * a documentation convention.
 */
export function defineDirective<TSchema extends z.ZodType>(
  definition: DirectiveDefinition<TSchema>,
): DirectiveDefinition<TSchema> {
  if (!definition.name.startsWith("$")) {
    throw new Error(
      `Directive name must start with "$": got "${definition.name}"`,
    );
  }
  return definition;
}

/**
 * Convert an array of directive definitions into a {@link DirectiveRegistry}.
 */
export function createDirectiveRegistry(
  directives: DirectiveDefinition[],
): DirectiveRegistry {
  const registry: DirectiveRegistry = new Map();
  for (const d of directives) {
    registry.set(d.name, d);
  }
  return registry;
}

/**
 * Look up a custom directive for a plain-object value.
 *
 * Scans the object's keys for a `$`-prefixed key that matches a registered
 * directive. Returns `undefined` when no match is found or when no registry
 * is provided.
 */
export function findDirective(
  value: Record<string, unknown>,
  directives?: DirectiveRegistry,
): DirectiveDefinition | undefined {
  if (!directives || directives.size === 0) return undefined;
  for (const key of Object.keys(value)) {
    if (key.startsWith("$") && directives.has(key)) {
      return directives.get(key);
    }
  }
  return undefined;
}
