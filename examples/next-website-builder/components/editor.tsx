"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { JsonEditor, type JsonValue } from "@visual-json/react";
import type { NextAppSpec } from "@json-render/next";
import { NextAppProvider, PageRenderer } from "@json-render/next";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { RouteTabs } from "@/components/route-tabs";
import { registry } from "@/lib/registry";

export function Editor() {
  const [spec, setSpec] = useState<NextAppSpec | null>(null);
  const [activeRoute, setActiveRoute] = useState("/");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/spec")
      .then((r) => r.json())
      .then((data: NextAppSpec) => setSpec(data));
  }, []);

  const handleChange = useCallback((value: JsonValue) => {
    const updated = value as unknown as NextAppSpec;
    setSpec(updated);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetch("/api/spec", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    }, 500);
  }, []);

  const routes = useMemo(() => {
    if (!spec) return [];
    return Object.keys(spec.routes);
  }, [spec]);

  const currentRoute = useMemo(() => {
    if (!spec) return null;
    return spec.routes[activeRoute] ?? null;
  }, [spec, activeRoute]);

  const layoutSpec = useMemo(() => {
    if (!spec || !currentRoute?.layout || !spec.layouts) return null;
    return spec.layouts[currentRoute.layout] ?? null;
  }, [spec, currentRoute]);

  const initialState = useMemo(() => {
    if (!spec || !currentRoute) return undefined;
    const merged: Record<string, unknown> = {};
    if (spec.state) Object.assign(merged, spec.state);
    if (currentRoute.page.state) Object.assign(merged, currentRoute.page.state);
    return Object.keys(merged).length > 0 ? merged : undefined;
  }, [spec, currentRoute]);

  if (!spec) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center justify-between px-4 h-12 border-b border-border bg-background shrink-0">
        <span className="text-sm font-semibold">Next Website Builder</span>
        <a
          href="/website"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          View Website
        </a>
      </div>
      <ResizablePanelGroup orientation="horizontal" className="flex-1">
        <ResizablePanel defaultSize={45} minSize={25}>
          <div className="h-full flex flex-col">
            <div className="flex items-center px-3 h-10 border-b border-border bg-muted/30">
              <span className="text-xs font-mono text-muted-foreground">
                spec.json
              </span>
            </div>
            <div className="flex-1 overflow-auto">
              <JsonEditor
                value={spec as unknown as JsonValue}
                onChange={handleChange}
                sidebarOpen={false}
                height="100%"
                className="h-full"
                style={
                  {
                    "--vj-bg": "var(--background)",
                    "--vj-bg-panel": "var(--background)",
                    "--vj-bg-hover": "var(--muted)",
                    "--vj-bg-selected": "var(--primary)",
                    "--vj-bg-selected-muted": "var(--muted)",
                    "--vj-text": "var(--foreground)",
                    "--vj-text-selected": "var(--primary-foreground)",
                    "--vj-text-muted": "var(--muted-foreground)",
                    "--vj-text-dim": "var(--muted-foreground)",
                    "--vj-border": "var(--border)",
                    "--vj-border-subtle": "var(--border)",
                    "--vj-accent": "var(--primary)",
                    "--vj-accent-muted": "var(--muted)",
                    "--vj-input-bg": "var(--secondary)",
                    "--vj-input-border": "var(--border)",
                  } as React.CSSProperties
                }
              />
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={55} minSize={30}>
          <div className="h-full flex flex-col">
            <RouteTabs
              routes={routes}
              activeRoute={activeRoute}
              onRouteChange={setActiveRoute}
            />
            <div className="flex-1 overflow-auto bg-background">
              {currentRoute ? (
                <NextAppProvider registry={registry}>
                  <PageRenderer
                    spec={currentRoute.page}
                    initialState={initialState}
                    layoutSpec={layoutSpec}
                  />
                </NextAppProvider>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Route not found
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
