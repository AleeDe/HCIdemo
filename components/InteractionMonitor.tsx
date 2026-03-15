"use client";

import { Activity, Focus, Hand, LocateFixed, Radar } from "lucide-react";
import { motion } from "framer-motion";
import type { InteractionState } from "@/lib/dragUtils";

interface InteractionMonitorProps {
  state: InteractionState;
  performanceMode: boolean;
  lowMotion: boolean;
}

export function InteractionMonitor({ state, performanceMode, lowMotion }: InteractionMonitorProps) {
  return (
    <motion.aside
      initial={lowMotion ? false : { opacity: 0, y: 16 }}
      animate={lowMotion ? undefined : { opacity: 1, y: 0 }}
      transition={lowMotion ? { duration: 0.12 } : { type: "spring", stiffness: 220, damping: 22 }}
      className={`pointer-events-none fixed bottom-2 left-2 z-50 w-[238px] rounded-2xl border border-white/45 bg-white/75 p-2.5 md:bottom-4 md:left-auto md:right-4 md:w-[320px] md:p-4 dark:border-white/10 dark:bg-slate-900/65 ${
        performanceMode
          ? "shadow-[0_4px_12px_rgba(15,23,42,0.14)] backdrop-blur-none"
          : "shadow-glass backdrop-blur-sm md:backdrop-blur-xl"
      }`}
      aria-live="polite"
    >
      <div className="mb-3 flex items-center gap-2">
        <Radar size={16} className="text-sky-500" />
        <h3 className="text-xs font-semibold tracking-wide text-slate-800 md:text-sm dark:text-slate-100">Interaction Monitor</h3>
      </div>

      <div className="grid grid-cols-[auto,1fr] gap-x-2 gap-y-1.5 text-[11px] text-slate-700 md:gap-x-3 md:gap-y-2 md:text-sm dark:text-slate-200">
        <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <Hand size={14} /> User Action
        </span>
        <span className="font-medium">{state.userAction}</span>

        <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <Activity size={14} /> Rubberbanding
        </span>
        <span className="font-medium">{state.rubberbanding}</span>

        <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <Focus size={14} /> Target Column
        </span>
        <span className="font-medium uppercase tracking-wide">{state.targetColumn}</span>

        <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <LocateFixed size={14} /> Pointer
        </span>
        <span className="font-mono text-[11px] md:text-[13px]">
          ({Math.round(state.pointer.x)}, {Math.round(state.pointer.y)})
        </span>
      </div>

      <div className="mt-2 rounded-xl border border-sky-300/45 bg-sky-100/60 px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.1em] text-sky-800 md:mt-3 md:px-3 md:py-2 md:text-xs md:tracking-[0.11em] dark:border-sky-200/20 dark:bg-sky-500/10 dark:text-sky-100">
        {state.label}
      </div>
    </motion.aside>
  );
}
