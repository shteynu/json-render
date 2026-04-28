import { z } from "zod";
import { defineDirective, resolvePropValue } from "@json-render/core";

export const formatDirective = defineDirective({
  name: "$format",
  schema: z.object({
    $format: z.enum(["date", "currency", "number", "percent"]),
    value: z.unknown(),
    locale: z.string().optional(),
    currency: z.string().optional(),
    notation: z.string().optional(),
    style: z.string().optional(),
    options: z.record(z.string(), z.unknown()).optional(),
    now: z.number().optional(),
  }),
  resolve(raw, ctx) {
    const value = resolvePropValue(raw.value, ctx);
    const locale = raw.locale ?? undefined;
    const extra = raw.options ?? {};

    switch (raw.$format) {
      case "date": {
        const date =
          value instanceof Date ? value : new Date(value as string | number);
        if (raw.style === "relative") {
          const now = raw.now ?? Date.now();
          const diff = now - date.getTime();
          const seconds = Math.floor(diff / 1000);
          const minutes = Math.floor(seconds / 60);
          const hours = Math.floor(minutes / 60);
          const days = Math.floor(hours / 24);
          if (days > 0) return `${days}d ago`;
          if (hours > 0) return `${hours}h ago`;
          if (minutes > 0) return `${minutes}m ago`;
          return `${seconds}s ago`;
        }
        return new Intl.DateTimeFormat(
          locale,
          extra as Intl.DateTimeFormatOptions,
        ).format(date);
      }
      case "currency":
        return new Intl.NumberFormat(locale, {
          style: "currency",
          currency: raw.currency ?? "USD",
          ...(extra as Intl.NumberFormatOptions),
        }).format(value as number);
      case "number":
        return new Intl.NumberFormat(locale, {
          ...(raw.notation
            ? {
                notation: raw.notation as Intl.NumberFormatOptions["notation"],
              }
            : {}),
          ...(extra as Intl.NumberFormatOptions),
        }).format(value as number);
      case "percent":
        return new Intl.NumberFormat(locale, {
          style: "percent",
          ...(extra as Intl.NumberFormatOptions),
        }).format(value as number);
      default:
        return value;
    }
  },
  prompt:
    'Use { "$format": "date|currency|number|percent", "value": <dynamic-value>, "locale": "en-US", "currency": "USD" } to format values for display. The "value" field accepts any dynamic expression ($state, other directives, etc.).',
});
