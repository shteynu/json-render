<script lang="ts">
  import type { BaseComponentProps } from "@json-render/svelte";

  interface Props extends BaseComponentProps<{
    label: string;
    color?: string;
  }> {}

  let { props }: Props = $props();
</script>

<span
  class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-secondary text-secondary-foreground border border-border"
  style:background-color={props.color ? `${props.color}20` : undefined}
  style:color={props.color ?? undefined}
  style:border-color={props.color ? `${props.color}40` : undefined}>
  {props.label}
</span>
