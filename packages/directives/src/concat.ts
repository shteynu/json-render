import { z } from "zod";
import { defineDirective, resolvePropValue } from "@json-render/core";

export const concatDirective = defineDirective({
  name: "$concat",
  schema: z.object({
    $concat: z.array(z.unknown()),
  }),
  resolve(raw, ctx) {
    return raw.$concat
      .map((part) => {
        const resolved = resolvePropValue(part, ctx);
        return resolved != null ? String(resolved) : "";
      })
      .join("");
  },
  prompt:
    'Use { "$concat": [<value>, " ", <value>] } to concatenate multiple dynamic values into a string. Each element is resolved, then joined.',
});
