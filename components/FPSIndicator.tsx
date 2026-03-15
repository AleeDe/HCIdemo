"use client";

import { useEffect, useRef, useState } from "react";
import { Gauge } from "lucide-react";

interface FPSIndicatorProps {
  performanceMode: boolean;
}

export function FPSIndicator({ performanceMode }: FPSIndicatorProps) {
  const [fps, setFps] = useState(0);
  const frameCountRef = useRef(0);
  const lastMeasureRef = useRef(performance.now());

  useEffect(() => {
    let animationFrameId = 0;

    const loop = (time: number) => {
      frameCountRef.current += 1;
      const delta = time - lastMeasureRef.current;

      // Lightweight sampling: update UI every 500ms, not every frame.
      if (delta >= 500) {
        const nextFps = Math.round((frameCountRef.current * 1000) / delta);
        setFps(nextFps);
        frameCountRef.current = 0;
        lastMeasureRef.current = time;
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const statusColor = fps >= 56 ? "text-emerald-600" : fps >= 40 ? "text-amber-600" : "text-rose-600";

  return (
    <aside
      className={`fixed left-3 top-3 z-50 rounded-xl border border-white/45 bg-white/80 px-3 py-2 text-xs font-semibold shadow-sm dark:border-white/10 dark:bg-slate-900/80 ${
        performanceMode ? "backdrop-blur-none" : "backdrop-blur-sm"
      }`}
      aria-live="polite"
    >
      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-100">
        <Gauge size={14} className={statusColor} />
        <span>FPS: {fps || "--"}</span>
      </div>
    </aside>
  );
}
