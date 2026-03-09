<script lang="ts">
  import type { Snippet } from "svelte";
  import type { BaseComponentProps } from "@json-render/svelte";

  interface Props extends BaseComponentProps<{
    gap?: number;
    padding?: number;
    direction?: "vertical" | "horizontal";
    align?: "start" | "center" | "end";
  }> {
    children?: Snippet;
  }

  let { props, children }: Props = $props();
  let horizontal = $derived(props.direction === "horizontal");
</script>

<div
  class="flex"
  style:flex-direction={horizontal ? "row" : "column"}
  style:gap="{props.gap ?? 0}px"
  style:padding="{props.padding ?? 0}px"
  style:align-items={props.align === "start"
    ? "flex-start"
    : props.align === "end"
      ? "flex-end"
      : horizontal
        ? "center"
        : "stretch"}>
  {#if children}
    {@render children()}
  {/if}
</div>
