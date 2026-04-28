import { z } from "zod";
import { defineDirective, resolvePropValue } from "@json-render/core";

export const mathDirective = defineDirective({
  name: "$math",
  schema: z.object({
    $math: z.enum([
      "add",
      "subtract",
      "multiply",
      "divide",
      "mod",
      "min",
      "max",
      "round",
      "floor",
      "ceil",
      "abs",
    ]),
    a: z.unknown().optional(),
    b: z.unknown().optional(),
  }),
  resolve(raw, ctx) {
    const directive = raw as {
      $math: string;
      a?: unknown;
      b?: unknown;
    };
    const a = resolvePropValue(directive.a, ctx) as number;
    const b = resolvePropValue(directive.b, ctx) as number;

    switch (directive.$math) {
      case "add":
        return a + b;
      case "subtract":
        return a - b;
      case "multiply":
        return a * b;
      case "divide":
        return b !== 0 ? a / b : 0;
      case "mod":
        return b !== 0 ? a % b : 0;
      case "min":
        return Math.min(a, b);
      case "max":
        return Math.max(a, b);
      case "round":
        return Math.round(a);
      case "floor":
        return Math.floor(a);
      case "ceil":
        return Math.ceil(a);
      case "abs":
        return Math.abs(a);
      default:
        return a;
    }
  },
  prompt:
    'Use { "$math": "add|subtract|multiply|divide|mod|min|max|round|floor|ceil|abs", "a": <value>, "b": <value> } for arithmetic. Values accept dynamic expressions. Unary ops (round, floor, ceil, abs) only use "a".',
});
