"use client";

import { useEffect, useState } from "react";
import { GaugeCircle, MoonStar, SunMedium } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Board } from "@/components/Board";
import { FPSIndicator } from "@/components/FPSIndicator";

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [performanceMode, setPerformanceMode] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <main className="relative min-h-screen overflow-x-hidden px-4 py-8 text-slate-900 transition-colors dark:text-slate-100 sm:px-6 lg:px-10">
      <div className="ambient-bg pointer-events-none" aria-hidden />

      <div className="relative mx-auto max-w-7xl">
        <header className="mb-6 rounded-3xl border border-white/45 bg-white/40 p-6 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/35">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700 dark:text-sky-300">
                Human-Computer Interaction Demo
              </p>
              <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                Sticky Notes Board: Drag Interaction and Rubberbanding
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                When a note is picked up and moved, the user performs direct manipulation (drag interaction).
                As surrounding notes move apart with elastic spacing, that is rubberbanding. Releasing the note
                triggers an elastic snap into place, reinforcing placement feedback.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setPerformanceMode((prev) => !prev)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  performanceMode
                    ? "border-emerald-300/70 bg-emerald-100 text-emerald-800"
                    : "border-slate-200/70 bg-white/80 text-slate-700 hover:bg-white dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100"
                }`}
                aria-label="Toggle performance mode"
              >
                <GaugeCircle size={16} />
                {performanceMode ? "Performance Mode On" : "Performance Mode"}
              </button>

              <button
                type="button"
                onClick={() => setDarkMode((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:scale-[1.02] hover:bg-white dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <SunMedium size={16} /> : <MoonStar size={16} />}
                {darkMode ? "Light Mode" : "Dark Mode"}
              </button>
            </div>
          </div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0.1 } : { type: "spring", stiffness: 260, damping: 24 }}
            className="mt-5 rounded-2xl border border-emerald-300/45 bg-emerald-100/70 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-300/15 dark:bg-emerald-500/10 dark:text-emerald-100"
          >
            Presentation script: "When I pick up and move the sticky note, I am performing a drag interaction.
            As the surrounding notes move apart smoothly to create space, that behavior is called rubberbanding.
            This elastic feedback helps users understand where the note will be placed."
          </motion.div>

          {(prefersReducedMotion || performanceMode) && (
            <div className="mt-3 rounded-xl border border-amber-300/50 bg-amber-100/80 px-3 py-2 text-xs font-semibold text-amber-900 dark:border-amber-300/20 dark:bg-amber-500/10 dark:text-amber-100">
              Motion optimized: reduced-intensity animations are active for smoother performance.
            </div>
          )}
        </header>

        <Board performanceMode={performanceMode} />
      </div>

      <FPSIndicator performanceMode={performanceMode} />
    </main>
  );
}
