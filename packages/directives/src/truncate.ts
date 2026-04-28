import { z } from "zod";
import { defineDirective, resolvePropValue } from "@json-render/core";

export const truncateDirective = defineDirective({
  name: "$truncate",
  schema: z.object({
    $truncate: z.unknown(),
    length: z.number().optional(),
    suffix: z.string().optional(),
  }),
  resolve(raw, ctx) {
    const directive = raw as {
      $truncate: unknown;
      length?: number;
      suffix?: string;
    };
    const resolved = resolvePropValue(directive.$truncate, ctx);
    const text = resolved != null ? String(resolved) : "";
    const maxLength = directive.length ?? 100;
    const suffix = directive.suffix ?? "...";

    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + suffix;
  },
  prompt:
    'Use { "$truncate": <value>, "length": 140, "suffix": "..." } to truncate text. Default length is 100, default suffix is "...".',
});
