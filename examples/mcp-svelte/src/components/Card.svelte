<script lang="ts">
  import type { Snippet } from "svelte";
  import type { BaseComponentProps } from "@json-render/svelte";

  interface Props extends BaseComponentProps<{
    title?: string;
    subtitle?: string;
  }> {
    children?: Snippet;
  }

  let { props, children }: Props = $props();
</script>

<div class="rounded-xl border border-border bg-card text-card-foreground p-5 shadow-sm">
  {#if props.title}
    <h2 class="text-base font-semibold text-card-foreground mb-1">
      {props.title}
    </h2>
  {/if}
  {#if props.subtitle}
    <p class="text-sm text-muted-foreground mb-3">
      {props.subtitle}
    </p>
  {/if}
  {#if children}
    {@render children()}
  {/if}
</div>
