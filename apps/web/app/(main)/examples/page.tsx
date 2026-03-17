"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { examples, allTags, getGitHubUrl, type Example } from "@/lib/examples";
import { cn } from "@/lib/utils";

function ExampleCard({ example }: { example: Example }) {
  const url = getGitHubUrl(example);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-xl border border-border bg-card text-card-foreground overflow-hidden transition-colors hover:border-foreground/25"
    >
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold leading-none">{example.title}</h3>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
          >
            <path d="M15 3h6v6" />
            <path d="M10 14 21 3" />
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          </svg>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {example.description}
        </p>

        <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
          {example.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[11px]">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </a>
  );
}

export default function ExamplesPage() {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = activeTag
    ? examples.filter((e) => e.tags.includes(activeTag))
    : examples;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Examples
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Explore json-render across frameworks, renderers, and use cases.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTag(null)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            activeTag === null
              ? "border-foreground bg-foreground text-background"
              : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/50",
          )}
        >
          All
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              activeTag === tag
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/50",
            )}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((example) => (
          <ExampleCard key={example.slug} example={example} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">
          No examples match the selected filter.
        </p>
      )}
    </section>
  );
}
