"use client";

import { memo } from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { StickyNote } from "@/components/StickyNote";
import { quickSpringConfig } from "@/lib/animationConfig";
import type { ColumnId, StickyNoteItem } from "@/lib/dragUtils";

interface ColumnProps {
  id: ColumnId;
  title: string;
  accent: string;
  notes: StickyNoteItem[];
  isTarget: boolean;
  rubberbandingActive: boolean;
  onUpdateNote: (id: string, title: string) => void;
  onDeleteNote: (id: string) => void;
  lowMotion: boolean;
  performanceMode: boolean;
}

export const Column = memo(function Column({
  id,
  title,
  accent,
  notes,
  isTarget,
  rubberbandingActive,
  onUpdateNote,
  onDeleteNote,
  lowMotion,
  performanceMode,
}: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: "column",
      columnId: id,
    },
  });

  return (
    <section
      className={`relative flex min-h-[420px] flex-col rounded-3xl border border-white/35 bg-white/35 p-4 dark:border-white/10 dark:bg-slate-900/40 ${
        performanceMode
          ? "shadow-[0_4px_14px_rgba(15,23,42,0.1)] backdrop-blur-none"
          : "shadow-glass backdrop-blur-sm md:backdrop-blur-xl"
      }`}
    >
      <header className="mb-4 flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-700 dark:text-slate-200">
          {title}
        </h2>
        <span className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800/70 dark:text-slate-200">
          {notes.length}
        </span>
      </header>

      <motion.div
        ref={setNodeRef}
        animate={{
          boxShadow: isOver || isTarget ? "inset 0 0 0 2px rgba(56, 189, 248, 0.55)" : "inset 0 0 0 1px rgba(255,255,255,0.1)",
          paddingTop: rubberbandingActive && (isOver || isTarget) ? "1rem" : "0.75rem",
          paddingBottom: rubberbandingActive && (isOver || isTarget) ? "1rem" : "0.75rem",
          gap: rubberbandingActive && (isOver || isTarget) ? "1rem" : "0.75rem",
        }}
        transition={lowMotion ? { duration: 0.12 } : quickSpringConfig}
        className={`relative flex min-h-[340px] flex-1 flex-col gap-3 rounded-2xl bg-gradient-to-b ${accent} p-3`}
      >
        <SortableContext items={notes.map((note) => note.id)} strategy={verticalListSortingStrategy}>
          {notes.map((note) => (
            <StickyNote
              key={note.id}
              note={note}
              onUpdate={onUpdateNote}
              onDelete={onDeleteNote}
              lowMotion={lowMotion}
              performanceMode={performanceMode}
            />
          ))}
        </SortableContext>

        {(isOver || isTarget) && (
          <motion.div
            layoutId={`drop-placeholder-${id}`}
            className="rounded-xl border border-dashed border-sky-400/80 bg-sky-300/20 py-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-sky-800 dark:text-sky-200"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={quickSpringConfig}
          >
            Drop zone
          </motion.div>
        )}

        {rubberbandingActive && (isOver || isTarget) && !performanceMode && (
          <motion.div
            className="pointer-events-none absolute inset-x-3 top-1/2 -translate-y-1/2 rounded-xl border border-cyan-300/75 bg-cyan-200/25 py-2 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-900 dark:border-cyan-200/30 dark:bg-cyan-400/10 dark:text-cyan-100"
            initial={lowMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={lowMotion ? { opacity: 1 } : { opacity: 1, scale: 1.02 }}
            exit={lowMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
            transition={lowMotion ? { duration: 0.1 } : quickSpringConfig}
          >
            Elastic spacing
          </motion.div>
        )}
      </motion.div>
    </section>
  );
});
