"use client";

import { DragOverlay } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { GripVertical } from "lucide-react";
import { overlayDropAnimation, springConfig } from "@/lib/animationConfig";
import type { StickyNoteItem } from "@/lib/dragUtils";

interface StickyDragOverlayProps {
  activeNote: StickyNoteItem | null;
  boundaryActive: boolean;
  lowMotion: boolean;
  performanceMode: boolean;
}

export function StickyDragOverlay({
  activeNote,
  boundaryActive,
  lowMotion,
  performanceMode,
}: StickyDragOverlayProps) {
  return (
    <DragOverlay dropAnimation={overlayDropAnimation}>
      {activeNote ? (
        <motion.article
          layout
          transition={lowMotion ? { duration: 0.1 } : springConfig}
          initial={lowMotion ? false : { scale: 1.02, rotate: activeNote.tilt, opacity: 0.95 }}
          animate={{
            scale: lowMotion ? 1.02 : boundaryActive ? 1.08 : 1.05,
            rotate: lowMotion ? activeNote.tilt : boundaryActive ? activeNote.tilt + 2 : activeNote.tilt,
            opacity: 1,
          }}
          className={`relative w-[260px] cursor-grabbing select-none rounded-2xl border border-amber-200/80 bg-gradient-to-br from-yellow-100 via-amber-50 to-yellow-200 p-4 ${
            performanceMode ? "shadow-[0_10px_20px_rgba(35,24,0,0.18)]" : "shadow-[0_28px_60px_rgba(35,24,0,0.35)]"
          }`}
        >
          <span className="absolute -right-2 -top-2 rounded-full border border-white/80 bg-white/90 p-1.5 text-slate-700 shadow-sm">
            <GripVertical size={14} />
          </span>
          <p className="pr-5 text-[15px] font-semibold tracking-tight text-slate-800">{activeNote.title}</p>
        </motion.article>
      ) : null}
    </DragOverlay>
  );
}
