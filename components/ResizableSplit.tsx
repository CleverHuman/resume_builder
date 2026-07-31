"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  left: React.ReactNode;
  right: React.ReactNode;
  /** Initial left pane width in px. */
  defaultLeftWidth?: number;
  minLeftWidth?: number;
  minRightWidth?: number;
  /** Persist width in localStorage under this key. */
  storageKey?: string;
}

function loadStoredWidth(key: string | undefined, fallback: number): number {
  if (!key || typeof window === "undefined") return fallback;
  const raw = localStorage.getItem(key);
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export default function ResizableSplit({
  left,
  right,
  defaultLeftWidth = 460,
  minLeftWidth = 240,
  minRightWidth = 280,
  storageKey,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftWidth, setLeftWidth] = useState(() =>
    loadStoredWidth(storageKey, defaultLeftWidth)
  );
  const leftWidthRef = useRef(leftWidth);
  const dragging = useRef(false);

  useEffect(() => {
    leftWidthRef.current = leftWidth;
  }, [leftWidth]);

  useEffect(() => {
    function onPointerMove(e: PointerEvent) {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const maxLeft = rect.width - minRightWidth;
      const next = Math.min(maxLeft, Math.max(minLeftWidth, e.clientX - rect.left));
      leftWidthRef.current = next;
      setLeftWidth(next);
    }

    function onPointerUp() {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      if (storageKey) {
        localStorage.setItem(storageKey, String(Math.round(leftWidthRef.current)));
      }
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [minLeftWidth, minRightWidth, storageKey]);

  function startDrag(e: React.PointerEvent) {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }

  return (
    <div ref={containerRef} className="flex flex-1 min-h-0 min-w-0">
      <div className="flex shrink-0 flex-col min-h-0" style={{ width: leftWidth }}>
        {left}
      </div>

      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panels"
        tabIndex={0}
        onPointerDown={startDrag}
        onKeyDown={(e) => {
          const step = e.shiftKey ? 40 : 16;
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            setLeftWidth((w) => {
              const next = Math.max(minLeftWidth, w - step);
              if (storageKey) localStorage.setItem(storageKey, String(next));
              return next;
            });
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            const maxLeft = (containerRef.current?.getBoundingClientRect().width ?? 0) - minRightWidth;
            setLeftWidth((w) => {
              const next = Math.min(maxLeft > 0 ? maxLeft : w + step, w + step);
              if (storageKey) localStorage.setItem(storageKey, String(next));
              return next;
            });
          }
        }}
        className="group relative w-3 shrink-0 cursor-col-resize self-stretch"
      >
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[#3f3f5c] transition-colors group-hover:bg-[#7c8cff] group-focus-visible:bg-[#7c8cff]" />
        <div className="absolute left-1/2 top-1/2 h-8 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3f3f5c] opacity-70 transition-colors group-hover:bg-[#7c8cff] group-focus-visible:bg-[#7c8cff]" />
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">{right}</div>
    </div>
  );
}
