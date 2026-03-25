"use client";

import { cn } from "@/lib/utils";

interface RouteTabsProps {
  routes: string[];
  activeRoute: string;
  onRouteChange: (route: string) => void;
}

export function RouteTabs({
  routes,
  activeRoute,
  onRouteChange,
}: RouteTabsProps) {
  return (
    <div className="flex items-center gap-1 px-3 h-10 border-b border-border bg-muted/30">
      {routes.map((route) => (
        <button
          key={route}
          onClick={() => onRouteChange(route)}
          className={cn(
            "px-3 py-1.5 text-xs font-mono rounded-md transition-colors",
            activeRoute === route
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50",
          )}
        >
          {route}
        </button>
      ))}
    </div>
  );
}
