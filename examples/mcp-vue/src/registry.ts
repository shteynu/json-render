import { h } from "vue";
import type { Components } from "@json-render/vue";
import type { AppCatalog } from "./catalog";

export const components: Components<AppCatalog> = {
  Stack: ({ props, children }) => {
    const horizontal = props.direction === "horizontal";
    return h(
      "div",
      {
        class: "flex",
        style: {
          flexDirection: horizontal ? "row" : "column",
          gap: props.gap ? `${props.gap}px` : undefined,
          padding: props.padding ? `${props.padding}px` : undefined,
          alignItems: props.align ?? (horizontal ? "center" : "stretch"),
        },
      },
      children,
    );
  },

  Card: ({ props, children }) =>
    h(
      "div",
      {
        class:
          "rounded-xl border border-border bg-card text-card-foreground p-5 shadow-sm",
      },
      [
        props.title &&
          h(
            "h2",
            {
              class: "text-base font-semibold text-card-foreground mb-1",
            },
            props.title,
          ),
        props.subtitle &&
          h(
            "p",
            {
              class: "text-sm text-muted-foreground mb-3",
            },
            props.subtitle,
          ),
        children,
      ],
    ),

  Text: ({ props }) => {
    const sizeClasses: Record<string, string> = {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
      xl: "text-2xl",
    };
    const weightClasses: Record<string, string> = {
      normal: "font-normal",
      medium: "font-medium",
      bold: "font-bold",
    };
    return h(
      "span",
      {
        class: [
          sizeClasses[props.size ?? "md"] ?? "text-sm",
          weightClasses[props.weight ?? "normal"] ?? "font-normal",
          "text-foreground",
        ].join(" "),
        style: props.color ? { color: props.color } : undefined,
      },
      String(props.content ?? ""),
    );
  },

  Button: ({ props, emit }) => {
    const variant = props.variant ?? "primary";
    const variantClasses: Record<string, string> = {
      primary: "bg-primary text-primary-foreground hover:bg-primary/90",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      danger:
        "bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20",
    };
    return h(
      "button",
      {
        disabled: props.disabled,
        onClick: () => emit("press"),
        class: [
          "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors",
          variantClasses[variant] ?? variantClasses.primary,
          props.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        ].join(" "),
      },
      props.label,
    );
  },

  Badge: ({ props }) =>
    h(
      "span",
      {
        class:
          "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-secondary text-secondary-foreground border border-border",
        style: props.color
          ? {
              backgroundColor: `${props.color}20`,
              color: props.color,
              borderColor: `${props.color}40`,
            }
          : undefined,
      },
      props.label,
    ),
};
