import { z } from "zod";
import { defineDirective, resolvePropValue } from "@json-render/core";

export const pluralizeDirective = defineDirective({
  name: "$pluralize",
  schema: z.object({
    $pluralize: z.unknown(),
    zero: z.string().optional(),
    one: z.string(),
    other: z.string(),
  }),
  resolve(raw, ctx) {
    const directive = raw as {
      $pluralize: unknown;
      zero?: string;
      one: string;
      other: string;
    };
    const resolved = resolvePropValue(directive.$pluralize, ctx);
    const count = typeof resolved === "number" ? resolved : 0;

    if (count === 0 && directive.zero != null) return directive.zero;
    if (count === 1) return `${count} ${directive.one}`;
    return `${count} ${directive.other}`;
  },
  prompt:
    'Use { "$pluralize": <count>, "one": "item", "other": "items", "zero": "no items" } to select singular/plural text. Output: "3 items", "1 item", or "no items".',
});
