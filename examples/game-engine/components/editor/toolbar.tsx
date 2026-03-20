"use client";

import { useState } from "react";
import {
  Play,
  Square,
  Move,
  RotateCcw,
  Maximize,
  MousePointer,
  Undo2,
  Redo2,
  Eye,
  User,
  MoreHorizontal,
} from "lucide-react";
import { useEditorStore } from "@/lib/store";
import { useIsMobile } from "@/lib/use-mobile";
import { SceneDropdown } from "./scene-dropdown";

export function Toolbar() {
  const {
    transformMode,
    setTransformMode,
    isPlaying,
    setIsPlaying,
    canUndo,
    canRedo,
    undo,
    redo,
    viewMode,
    setViewMode,
  } = useEditorStore();

  const isMobile = useIsMobile();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div className="h-11 flex items-center justify-between px-2 sm:px-3 border-b border-[#1e1e1e] bg-[#0f0f0f] shrink-0 gap-1 sm:gap-2">
      {/* Left: Transform modes */}
      <div className="flex items-center gap-0.5 sm:gap-1">
        {!isPlaying && (
          <>
            {isMobile ? (
              <div className="relative">
                <ToolButton
                  icon={
                    transformMode === "select" ? (
                      <MousePointer size={16} />
                    ) : transformMode === "translate" ? (
                      <Move size={16} />
                    ) : transformMode === "rotate" ? (
                      <RotateCcw size={16} />
                    ) : (
                      <Maximize size={16} />
                    )
                  }
                  active
                  onClick={() => setMoreOpen(!moreOpen)}
                  title="Transform mode"
                  mobile
                />
                {moreOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setMoreOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl z-50 p-1 flex flex-col gap-0.5 min-w-[140px]">
                      {(
                        [
                          {
                            mode: "select" as const,
                            icon: MousePointer,
                            label: "Select",
                          },
                          {
                            mode: "translate" as const,
                            icon: Move,
                            label: "Move",
                          },
                          {
                            mode: "rotate" as const,
                            icon: RotateCcw,
                            label: "Rotate",
                          },
                          {
                            mode: "scale" as const,
                            icon: Maximize,
                            label: "Scale",
                          },
                        ] as const
                      ).map(({ mode, icon: Icon, label }) => (
                        <button
                          key={mode}
                          onClick={() => {
                            setTransformMode(mode);
                            setMoreOpen(false);
                          }}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded text-xs transition-colors ${
                            transformMode === mode
                              ? "bg-white/10 text-white"
                              : "text-[#888] active:bg-white/5"
                          }`}
                        >
                          <Icon size={14} />
                          {label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                <div className="w-px h-5 bg-[#2a2a2a] mx-0.5" />
                <ToolButton
                  icon={<Undo2 size={16} />}
                  onClick={undo}
                  disabled={!canUndo}
                  title="Undo"
                  mobile
                />
                <ToolButton
                  icon={<Redo2 size={16} />}
                  onClick={redo}
                  disabled={!canRedo}
                  title="Redo"
                  mobile
                />
              </div>
            ) : (
              <>
                <ToolButton
                  icon={<MousePointer size={14} />}
                  active={transformMode === "select"}
                  onClick={() => setTransformMode("select")}
                  title="Select (Q)"
                />
                <ToolButton
                  icon={<Move size={14} />}
                  active={transformMode === "translate"}
                  onClick={() => setTransformMode("translate")}
                  title="Translate (W)"
                />
                <ToolButton
                  icon={<RotateCcw size={14} />}
                  active={transformMode === "rotate"}
                  onClick={() => setTransformMode("rotate")}
                  title="Rotate (E)"
                />
                <ToolButton
                  icon={<Maximize size={14} />}
                  active={transformMode === "scale"}
                  onClick={() => setTransformMode("scale")}
                  title="Scale (R)"
                />
                <div className="w-px h-5 bg-[#2a2a2a] mx-1" />
                <ToolButton
                  icon={<Undo2 size={14} />}
                  onClick={undo}
                  disabled={!canUndo}
                  title="Undo (Ctrl+Z)"
                />
                <ToolButton
                  icon={<Redo2 size={14} />}
                  onClick={redo}
                  disabled={!canRedo}
                  title="Redo (Ctrl+Shift+Z)"
                />
              </>
            )}
          </>
        )}
      </div>

      {/* Center: Scene selector */}
      <div className="flex items-center">{!isPlaying && <SceneDropdown />}</div>

      {/* Right: Play/View controls */}
      <div className="flex items-center gap-0.5 sm:gap-1">
        {isPlaying && (
          <>
            <ToolButton
              icon={<Eye size={isMobile ? 16 : 14} />}
              active={viewMode === "first-person"}
              onClick={() => setViewMode("first-person")}
              title="First Person"
              mobile={isMobile}
            />
            <ToolButton
              icon={<User size={isMobile ? 16 : 14} />}
              active={viewMode === "third-person"}
              onClick={() => setViewMode("third-person")}
              title="Third Person"
              mobile={isMobile}
            />
            <div className="w-px h-5 bg-[#2a2a2a] mx-0.5 sm:mx-1" />
          </>
        )}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-1 rounded text-xs font-medium transition-colors bg-white/10 hover:bg-white/20 active:bg-white/20 text-white"
        >
          {isPlaying ? <Square size={12} /> : <Play size={12} />}
          {isPlaying ? "Stop" : "Play"}
        </button>
      </div>
    </div>
  );
}

function ToolButton({
  icon,
  active,
  onClick,
  disabled,
  title,
  mobile,
}: {
  icon: React.ReactNode;
  active?: boolean;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  mobile?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${mobile ? "p-2.5 min-w-[44px] min-h-[44px]" : "p-1.5"} rounded transition-colors flex items-center justify-center ${
        active
          ? "bg-white/10 text-white"
          : disabled
            ? "text-[#444] cursor-not-allowed"
            : "text-[#888] hover:text-white hover:bg-white/5 active:bg-white/10"
      }`}
    >
      {icon}
    </button>
  );
}
