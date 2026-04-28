import { z } from "zod";
import { defineDirective, resolvePropValue } from "@json-render/core";

export const joinDirective = defineDirective({
  name: "$join",
  schema: z.object({
    $join: z.unknown(),
    separator: z.string().optional(),
  }),
  resolve(raw, ctx) {
    const directive = raw as { $join: unknown; separator?: string };
    const resolved = resolvePropValue(directive.$join, ctx);
    const separator = directive.separator ?? ", ";

    if (Array.isArray(resolved)) {
      return resolved
        .map((item) => (item != null ? String(item) : ""))
        .join(separator);
    }
    return resolved != null ? String(resolved) : "";
  },
  prompt:
    'Use { "$join": <array>, "separator": ", " } to join array elements with a separator. Default separator is ", ".',
});
