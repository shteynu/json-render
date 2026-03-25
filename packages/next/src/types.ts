import type { Spec } from "@json-render/core";

/**
 * Metadata for Next.js pages and layouts.
 * Maps to Next.js's Metadata type.
 */
export interface NextMetadata {
  /** Page title — string or template config */
  title?:
    | string
    | {
        /** Default title when no child overrides */
        default: string;
        /** Template string, use %s for the page title (e.g. "%s | My App") */
        template?: string;
        /** Absolute title that ignores parent templates */
        absolute?: string;
      };
  /** Meta description */
  description?: string;
  /** Keywords for SEO */
  keywords?: string[];
  /** Open Graph metadata */
  openGraph?: {
    title?: string;
    description?: string;
    images?: string | string[];
    type?: string;
    url?: string;
    siteName?: string;
    locale?: string;
  };
  /** Twitter card metadata */
  twitter?: {
    card?: "summary" | "summary_large_image" | "app" | "player";
    title?: string;
    description?: string;
    images?: string | string[];
    creator?: string;
    site?: string;
  };
  /** Robots directives */
  robots?: string | { index?: boolean; follow?: boolean };
  /** Canonical URL */
  alternates?: {
    canonical?: string;
  };
  /** Favicon and icons */
  icons?: string | { icon?: string; apple?: string; shortcut?: string };
}

/**
 * A route definition within a NextAppSpec.
 */
export interface NextRouteSpec {
  /** Page content — standard json-render element tree */
  page: Spec;
  /** Per-route metadata for SEO */
  metadata?: NextMetadata;
  /** Layout key referencing an entry in NextAppSpec.layouts */
  layout?: string;
  /** Loading state element tree (rendered during Suspense) */
  loading?: Spec;
  /** Error state element tree */
  error?: Spec;
  /** Not-found element tree (for dynamic routes that don't match data) */
  notFound?: Spec;
  /** Server-side data loader name (references loaders in createNextApp) */
  loader?: string;
  /** Static params for generateStaticParams */
  staticParams?: Record<string, string>[];
}

/**
 * The full application spec for @json-render/next.
 *
 * Describes an entire Next.js application: routes, pages, layouts,
 * metadata, and server-side data loading.
 *
 * Routes are keyed by URL patterns using Next.js conventions:
 * - `"/"` — exact match
 * - `"/blog/[slug]"` — dynamic segment
 * - `"/docs/[...path]"` — catch-all segment
 * - `"/settings/[[...path]]"` — optional catch-all segment
 */
export interface NextAppSpec {
  /** Root-level metadata applied to all routes (layouts can override) */
  metadata?: NextMetadata;
  /** Route definitions keyed by URL pattern */
  routes: Record<string, NextRouteSpec>;
  /**
   * Reusable layout element trees. Each layout spec must include a
   * `Slot` component type where page content will be injected.
   */
  layouts?: Record<string, Spec>;
  /** Global initial state shared across all routes */
  state?: Record<string, unknown>;
}

/**
 * Result of matching a pathname against the spec's routes.
 */
export interface MatchedRoute {
  /** The matched route spec */
  route: NextRouteSpec;
  /** The URL pattern that matched (e.g. "/blog/[slug]") */
  pattern: string;
  /** Extracted route parameters (e.g. { slug: "hello-world" }) */
  params: Record<string, string | string[]>;
}

/**
 * Server-side data loader function signature.
 * Receives route params and returns data to merge into initial state.
 */
export type LoaderFn = (
  params: Record<string, string | string[]>,
) => Promise<Record<string, unknown>> | Record<string, unknown>;

/**
 * Options for createNextApp.
 */
export interface CreateNextAppOptions {
  /** The application spec */
  spec: NextAppSpec | (() => NextAppSpec | Promise<NextAppSpec>);
  /** Server-side data loaders keyed by name */
  loaders?: Record<string, LoaderFn>;
}

/**
 * The result of createNextApp — exports for Next.js route files.
 */
export interface NextAppExports {
  /** Async Server Component for page.tsx */
  Page: (props: {
    params: Promise<{ slug?: string[] }>;
  }) => Promise<React.ReactElement | null>;
  /** generateMetadata function for page.tsx */
  generateMetadata: (props: {
    params: Promise<{ slug?: string[] }>;
  }) => Promise<Record<string, unknown>>;
  /** generateStaticParams function for page.tsx */
  generateStaticParams: () => Promise<{ slug: string[] }[]>;
}
