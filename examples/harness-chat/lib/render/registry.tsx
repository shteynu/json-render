"use client";

import { defineRegistry } from "@json-render/react";
import {
  AlertTriangle,
  Check,
  CircleDashed,
  FileMinus,
  FilePen,
  FilePlus,
  Info,
  Loader2,
  TriangleAlert,
  X,
} from "lucide-react";

import { agentReportCatalog } from "./catalog";

const toneStyles: Record<string, string> = {
  neutral: "bg-muted text-muted-foreground",
  success:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  error: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

const calloutStyles: Record<string, string> = {
  info: "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40",
  success:
    "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40",
  warning:
    "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40",
  error: "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40",
};

const calloutIcons = {
  info: Info,
  success: Check,
  warning: TriangleAlert,
  error: AlertTriangle,
} as const;

const stepIcons = {
  done: <Check className="h-3.5 w-3.5 text-emerald-600" />,
  active: <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />,
  pending: <CircleDashed className="h-3.5 w-3.5 text-muted-foreground" />,
  error: <X className="h-3.5 w-3.5 text-red-600" />,
} as const;

const fileChangeMeta = {
  created: { icon: FilePlus, label: "created", className: "text-emerald-600" },
  modified: { icon: FilePen, label: "modified", className: "text-blue-600" },
  deleted: { icon: FileMinus, label: "deleted", className: "text-red-600" },
} as const;

export const { registry } = defineRegistry(agentReportCatalog, {
  actions: {},
  components: {
    Stack: ({ props, children }) => (
      <div
        className={`flex ${
          props.direction === "horizontal"
            ? "flex-row flex-wrap items-start"
            : "flex-col"
        } ${{ sm: "gap-2", md: "gap-4", lg: "gap-6" }[props.gap ?? "md"]}`}
      >
        {children}
      </div>
    ),

    Grid: ({ props, children }) => (
      <div
        className={`grid gap-4 ${
          props.columns === "3" ? "sm:grid-cols-3" : "sm:grid-cols-2"
        }`}
      >
        {children}
      </div>
    ),

    Card: ({ props, children }) => (
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        {props.title && (
          <h3 className="text-sm font-semibold mb-1">{props.title}</h3>
        )}
        {props.description && (
          <p className="text-sm text-muted-foreground mb-3">
            {props.description}
          </p>
        )}
        <div className="flex flex-col gap-3">{children}</div>
      </div>
    ),

    Heading: ({ props }) => {
      const sizes = { "1": "text-xl", "2": "text-lg", "3": "text-base" };
      return (
        <div className={`font-semibold ${sizes[props.level ?? "2"]}`}>
          {props.text}
        </div>
      );
    },

    Text: ({ props }) => (
      <p
        className={`text-sm leading-relaxed ${
          props.muted ? "text-muted-foreground" : ""
        }`}
      >
        {props.content}
      </p>
    ),

    Badge: ({ props }) => (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
          toneStyles[props.tone ?? "neutral"]
        }`}
      >
        {props.label}
      </span>
    ),

    Callout: ({ props }) => {
      const tone = props.tone ?? "info";
      const Icon = calloutIcons[tone];
      return (
        <div className={`rounded-lg border px-3 py-2.5 ${calloutStyles[tone]}`}>
          <div className="flex gap-2">
            <Icon className="h-4 w-4 mt-0.5 shrink-0" />
            <div className="text-sm">
              {props.title && (
                <span className="font-medium">{props.title}: </span>
              )}
              {props.content}
            </div>
          </div>
        </div>
      );
    },

    Metric: ({ props }) => (
      <div className="rounded-lg border bg-card px-3 py-2.5">
        <div className="text-xs text-muted-foreground">{props.label}</div>
        <div className="text-xl font-semibold tabular-nums">{props.value}</div>
        {props.detail && (
          <div className="text-xs text-muted-foreground">{props.detail}</div>
        )}
      </div>
    ),

    Steps: ({ props }) => (
      <ol className="flex flex-col gap-2">
        {props.items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border bg-card">
              {stepIcons[item.status]}
            </span>
            <span>
              <span
                className={
                  item.status === "pending" ? "text-muted-foreground" : ""
                }
              >
                {item.title}
              </span>
              {item.detail && (
                <span className="block text-xs text-muted-foreground">
                  {item.detail}
                </span>
              )}
            </span>
          </li>
        ))}
      </ol>
    ),

    FileChange: ({ props }) => {
      const meta = fileChangeMeta[props.kind];
      const Icon = meta.icon;
      return (
        <div className="flex items-start gap-2.5 rounded-lg border bg-card px-3 py-2">
          <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${meta.className}`} />
          <div className="min-w-0 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <code className="font-mono text-xs">{props.path}</code>
              <span className={`text-xs ${meta.className}`}>{meta.label}</span>
              {(props.additions != null || props.deletions != null) && (
                <span className="text-xs tabular-nums">
                  {props.additions != null && (
                    <span className="text-emerald-600">
                      +{props.additions}{" "}
                    </span>
                  )}
                  {props.deletions != null && (
                    <span className="text-red-600">-{props.deletions}</span>
                  )}
                </span>
              )}
            </div>
            {props.summary && (
              <div className="text-xs text-muted-foreground">
                {props.summary}
              </div>
            )}
          </div>
        </div>
      );
    },

    CodeBlock: ({ props }) => (
      <div className="overflow-hidden rounded-lg border">
        {props.title && (
          <div className="border-b bg-muted/50 px-3 py-1.5 font-mono text-xs text-muted-foreground">
            {props.title}
          </div>
        )}
        <pre className="overflow-x-auto bg-card p-3 text-xs leading-relaxed">
          <code>{props.code}</code>
        </pre>
      </div>
    ),

    Terminal: ({ props }) => (
      <div className="overflow-hidden rounded-lg bg-zinc-950 text-zinc-100">
        <div className="flex items-center justify-between gap-2 border-b border-zinc-800 px-3 py-1.5">
          <code className="font-mono text-xs text-zinc-300">
            $ {props.command}
          </code>
          {props.exitCode != null && (
            <span
              className={`text-xs tabular-nums ${
                props.exitCode === 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              exit {props.exitCode}
            </span>
          )}
        </div>
        {props.output && (
          <pre className="max-h-64 overflow-auto p-3 font-mono text-xs leading-relaxed text-zinc-300 whitespace-pre-wrap">
            {props.output}
          </pre>
        )}
      </div>
    ),

    TestResults: ({ props }) => (
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <span
            className={`rounded-md px-2 py-1 text-xs ${toneStyles.success}`}
          >
            {props.passed} passed
          </span>
          <span
            className={`rounded-md px-2 py-1 text-xs ${
              props.failed > 0 ? toneStyles.error : toneStyles.neutral
            }`}
          >
            {props.failed} failed
          </span>
          {props.skipped != null && props.skipped > 0 && (
            <span
              className={`rounded-md px-2 py-1 text-xs ${toneStyles.warning}`}
            >
              {props.skipped} skipped
            </span>
          )}
        </div>
        {props.failures && props.failures.length > 0 && (
          <ul className="flex flex-col gap-1.5">
            {props.failures.map((f, i) => (
              <li
                key={i}
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs dark:border-red-900 dark:bg-red-950/40"
              >
                <div className="font-mono font-medium">{f.name}</div>
                <div className="text-muted-foreground">{f.message}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    ),
  },
});

export function Fallback({ type }: { type: string }) {
  return (
    <div className="rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">
      Unknown component: {type}
    </div>
  );
}
