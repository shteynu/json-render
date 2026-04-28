import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import type { Spec, DirectiveDefinition } from "@json-render/core";
import { defineDirective, resolvePropValue } from "@json-render/core";
import {
  JSONUIProvider,
  Renderer,
  type ComponentRenderProps,
} from "./renderer";

function Text({ element }: ComponentRenderProps<{ text: unknown }>) {
  const value = element.props.text;
  return <span data-testid="text">{value == null ? "" : String(value)}</span>;
}

const registry = { Text };

// Schema is only needed for validation — for resolution tests we can
// pass a minimal placeholder since resolve() doesn't use it.
const noopSchema = {} as DirectiveDefinition["schema"];

const doubleDirective = defineDirective({
  name: "$double",
  schema: noopSchema,
  resolve(value, ctx) {
    const resolved = resolvePropValue(
      (value as { $double: unknown }).$double,
      ctx,
    );
    return (resolved as number) * 2;
  },
  prompt: "Double a numeric value.",
});

const upperDirective = defineDirective({
  name: "$upper",
  schema: noopSchema,
  resolve(value, ctx) {
    const resolved = resolvePropValue(
      (value as { $upper: unknown }).$upper,
      ctx,
    );
    return String(resolved).toUpperCase();
  },
});

describe("directives in React renderer", () => {
  it("resolves a custom directive in rendered props", () => {
    const spec: Spec = {
      root: "main",
      elements: {
        main: {
          type: "Text",
          props: { text: { $upper: "hello" } },
          children: [],
        },
      },
    };

    render(
      <JSONUIProvider
        registry={registry}
        directives={[doubleDirective, upperDirective]}
      >
        <Renderer spec={spec} registry={registry} />
      </JSONUIProvider>,
    );

    expect(screen.getByTestId("text").textContent).toBe("HELLO");
  });

  it("resolves a directive that reads from state", () => {
    const spec: Spec = {
      root: "main",
      elements: {
        main: {
          type: "Text",
          props: { text: { $double: { $state: "/count" } } },
          children: [],
        },
      },
      state: { count: 7 },
    };

    render(
      <JSONUIProvider
        registry={registry}
        initialState={{ count: 7 }}
        directives={[doubleDirective, upperDirective]}
      >
        <Renderer spec={spec} registry={registry} />
      </JSONUIProvider>,
    );

    expect(screen.getByTestId("text").textContent).toBe("14");
  });

  it("renders without directives (backward compat)", () => {
    const spec: Spec = {
      root: "main",
      elements: {
        main: {
          type: "Text",
          props: { text: "plain" },
          children: [],
        },
      },
    };

    render(
      <JSONUIProvider registry={registry}>
        <Renderer spec={spec} registry={registry} />
      </JSONUIProvider>,
    );

    expect(screen.getByTestId("text").textContent).toBe("plain");
  });
});
