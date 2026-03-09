<script lang="ts">
  import type { BaseComponentProps } from "@json-render/svelte";

  interface Props extends BaseComponentProps<{
    content: string;
    size?: "sm" | "md" | "lg" | "xl";
    weight?: "normal" | "medium" | "bold";
    color?: string;
  }> {}

  let { props }: Props = $props();

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
</script>

<span
  class="{sizeClasses[props.size ?? 'md'] ?? 'text-sm'} {weightClasses[props.weight ?? 'normal'] ?? 'font-normal'} text-foreground"
  style:color={props.color ?? undefined}>
  {String(props.content ?? "")}
</span>
