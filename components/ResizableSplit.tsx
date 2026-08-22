"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  left: React.ReactNode;
  right: React.ReactNode;
  /** horizontal = left|right (default); vertical = top|bottom (left=top, right=bottom). */
  orientation?: "horizontal" | "vertical";
  /** Initial primary pane size in px (width or height). */
  defaultLeftWidth?: number;
  minLeftWidth?: number;
  minRightWidth?: number;
  /** Persist size in localStorage under this key. */
  storageKey?: string;
}

function loadStoredSize(key: string | undefined, fallback: number): number {
  if (!key || typeof window === "undefined") return fallback;
  const raw = localStorage.getItem(key);
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export default function ResizableSplit({
  left,
  right,
  orientation = "horizontal",
  defaultLeftWidth = 460,
  minLeftWidth = 240,
  minRightWidth = 280,
  storageKey,
}: Props) {
  const vertical = orientation === "vertical";
  const containerRef = useRef<HTMLDivElement>(null);
  const [primarySize, setPrimarySize] = useState(() =>
    loadStoredSize(storageKey, defaultLeftWidth)
  );
  const primarySizeRef = useRef(primarySize);
  const dragging = useRef(false);

  useEffect(() => {
    primarySizeRef.current = primarySize;
  }, [primarySize]);

  useEffect(() => {
    function onPointerMove(e: PointerEvent) {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const span = vertical ? rect.height : rect.width;
      const offset = vertical ? e.clientY - rect.top : e.clientX - rect.left;
      const maxPrimary = span - minRightWidth;
      const next = Math.min(maxPrimary, Math.max(minLeftWidth, offset));
      primarySizeRef.current = next;
      setPrimarySize(next);
    }

    function onPointerUp() {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      if (storageKey) {
        localStorage.setItem(storageKey, String(Math.round(primarySizeRef.current)));
      }
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [minLeftWidth, minRightWidth, storageKey, vertical]);

  function startDrag(e: React.PointerEvent) {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = vertical ? "row-resize" : "col-resize";
    document.body.style.userSelect = "none";
  }

  function nudge(delta: number) {
    const span = vertical
      ? (containerRef.current?.getBoundingClientRect().height ?? 0)
      : (containerRef.current?.getBoundingClientRect().width ?? 0);
    const maxPrimary = span > 0 ? span - minRightWidth : Number.POSITIVE_INFINITY;
    setPrimarySize((size) => {
      const next = Math.min(maxPrimary, Math.max(minLeftWidth, size + delta));
      if (storageKey) localStorage.setItem(storageKey, String(Math.round(next)));
      return next;
    });
  }

  return (
    <div
      ref={containerRef}
      className={`flex flex-1 min-h-0 min-w-0 ${vertical ? "flex-col" : "flex-row"}`}
    >
      <div
        className={`flex min-h-0 min-w-0 shrink-0 flex-col ${vertical ? "w-full" : ""}`}
        style={vertical ? { height: primarySize } : { width: primarySize }}
      >
        {left}
      </div>

      <div
        role="separator"
        aria-orientation={vertical ? "horizontal" : "vertical"}
        aria-label="Resize panels"
        tabIndex={0}
        onPointerDown={startDrag}
        onKeyDown={(e) => {
          const step = e.shiftKey ? 40 : 16;
          if (vertical) {
            if (e.key === "ArrowUp") {
              e.preventDefault();
              nudge(-step);
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              nudge(step);
            }
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            nudge(-step);
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            nudge(step);
          }
        }}
        className={`group relative shrink-0 ${
          vertical
            ? "h-3 w-full cursor-row-resize"
            : "w-3 cursor-col-resize self-stretch"
        }`}
      >
        {vertical ? (
          <>
            <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[#3f3f5c] transition-colors group-hover:bg-[#7c8cff] group-focus-visible:bg-[#7c8cff]" />
            <div className="absolute left-1/2 top-1/2 h-1 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3f3f5c] opacity-70 transition-colors group-hover:bg-[#7c8cff] group-focus-visible:bg-[#7c8cff]" />
          </>
        ) : (
          <>
            <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[#3f3f5c] transition-colors group-hover:bg-[#7c8cff] group-focus-visible:bg-[#7c8cff]" />
            <div className="absolute left-1/2 top-1/2 h-8 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3f3f5c] opacity-70 transition-colors group-hover:bg-[#7c8cff] group-focus-visible:bg-[#7c8cff]" />
          </>
        )}
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">{right}</div>
    </div>
  );
}
