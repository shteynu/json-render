<script lang="ts">
  import type { BaseComponentProps } from "@json-render/svelte";

  interface Props extends BaseComponentProps<{
    label: string;
    variant?: "primary" | "secondary" | "danger";
    disabled?: boolean;
  }> {}

  let { props, emit }: Props = $props();

  const variantClasses: Record<string, string> = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    danger: "bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20",
  };

  let variant = $derived(props.variant ?? "primary");
</script>

<button
  disabled={props.disabled}
  onclick={() => emit("press")}
  class="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors {variantClasses[variant] ?? variantClasses.primary} {props.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}">
  {props.label}
</button>
