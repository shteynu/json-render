import { h } from "vue";
import type { Components } from "@json-render/vue";
import type { AppCatalog } from "./catalog";

export const components: Components<AppCatalog> = {
  Stack: ({ props, children }) => {
    const horizontal = props.direction === "horizontal";
    return h(
      "div",
      {
        style: {
          display: "flex",
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
        style: {
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          padding: "20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        },
      },
      [
        props.title &&
          h(
            "h2",
            {
              style: {
                fontSize: "16px",
                fontWeight: "600",
                margin: "0 0 4px 0",
              },
            },
            props.title,
          ),
        props.subtitle &&
          h(
            "p",
            {
              style: {
                fontSize: "13px",
                color: "#6b7280",
                margin: "0 0 12px 0",
              },
            },
            props.subtitle,
          ),
        children,
      ],
    ),

  Text: ({ props }) => {
    const sizeMap: Record<string, string> = {
      sm: "12px",
      md: "14px",
      lg: "16px",
      xl: "24px",
    };
    const weightMap: Record<string, string> = {
      normal: "400",
      medium: "500",
      bold: "700",
    };
    return h(
      "span",
      {
        style: {
          fontSize: sizeMap[props.size ?? "md"] ?? "14px",
          fontWeight: weightMap[props.weight ?? "normal"] ?? "400",
          color: props.color ?? "inherit",
        },
      },
      String(props.content ?? ""),
    );
  },

  Button: ({ props, emit }) =>
    h(
      "button",
      {
        disabled: props.disabled,
        onClick: () => emit("press"),
        style: {
          padding: "8px 16px",
          borderRadius: "8px",
          border: "none",
          cursor: props.disabled ? "not-allowed" : "pointer",
          fontWeight: "500",
          fontSize: "14px",
          opacity: props.disabled ? "0.5" : "1",
          backgroundColor:
            props.variant === "danger"
              ? "#fee2e2"
              : props.variant === "secondary"
                ? "#f3f4f6"
                : "#3b82f6",
          color:
            props.variant === "danger"
              ? "#dc2626"
              : props.variant === "secondary"
                ? "#374151"
                : "white",
        },
      },
      props.label,
    ),

  Badge: ({ props }) =>
    h(
      "span",
      {
        style: {
          display: "inline-block",
          padding: "4px 12px",
          borderRadius: "999px",
          fontSize: "13px",
          fontWeight: "500",
          backgroundColor: props.color ? `${props.color}20` : "#e0f2fe",
          color: props.color ?? "#0369a1",
          border: `1px solid ${props.color ? `${props.color}40` : "#bae6fd"}`,
        },
      },
      props.label,
    ),
};
