"use client";

import { memo, type FormEvent, type PointerEvent, useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { motion } from "framer-motion";
import { Check, GripVertical, Pencil, Trash2, X } from "lucide-react";
import { springConfig } from "@/lib/animationConfig";
import type { StickyNoteItem } from "@/lib/dragUtils";

interface StickyNoteProps {
  note: StickyNoteItem;
  onUpdate: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  lowMotion: boolean;
  performanceMode: boolean;
}

export const StickyNote = memo(function StickyNote({
  note,
  onUpdate,
  onDelete,
  lowMotion,
  performanceMode,
}: StickyNoteProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(note.title);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: note.id,
    data: {
      type: "note",
      note,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const stopDragBubble = (event: PointerEvent) => {
    event.stopPropagation();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = draftTitle.trim();
    if (!trimmed) {
      return;
    }
    onUpdate(note.id, trimmed);
    setIsEditing(false);
  };

  return (
    <motion.article
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      layout
      transition={lowMotion ? { duration: 0.1 } : springConfig}
      initial={lowMotion ? false : { opacity: 0, y: 12 }}
      animate={{
        // During drag start, lowering opacity on the original card emphasizes the lifted overlay.
        opacity: isDragging ? 0.35 : 1,
        y: lowMotion ? undefined : 0,
        rotate: note.tilt,
      }}
      // Hover lift previews direct manipulation and improves perceived affordance.
      whileHover={lowMotion ? undefined : { y: -4, rotate: note.tilt + 0.5, scale: 1.01 }}
      className={`group relative w-full select-none rounded-2xl border border-amber-200/70 bg-gradient-to-br from-yellow-100 via-amber-50 to-yellow-200 p-4 will-change-transform dark:border-amber-100/15 dark:from-yellow-200/90 dark:via-yellow-100/75 dark:to-yellow-300/90 ${
        performanceMode ? "shadow-[0_8px_16px_rgba(35,24,0,0.12)] backdrop-blur-none" : "shadow-note backdrop-blur-sm"
      } ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      <span
        aria-hidden
        className="absolute -right-2 -top-2 rounded-full border border-white/80 bg-white/90 p-1.5 text-slate-600 shadow-sm transition group-hover:scale-105 dark:border-white/15 dark:bg-slate-900/75 dark:text-slate-200"
      >
        <GripVertical size={14} />
      </span>

      <div className="flex items-start justify-between gap-2 pr-5">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="flex flex-1 items-center gap-1.5" onPointerDown={stopDragBubble}>
            <input
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              className="w-full rounded-lg border border-amber-300/85 bg-white/80 px-2 py-1 text-[13px] font-medium text-slate-800 outline-none ring-sky-300 transition focus:ring-2"
              aria-label="Edit note title"
            />
            <button
              type="submit"
              className="rounded-md bg-emerald-500/90 p-1 text-white shadow-sm"
              aria-label="Save title"
            >
              <Check size={12} />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setDraftTitle(note.title);
              }}
              className="rounded-md bg-slate-500/90 p-1 text-white shadow-sm"
              aria-label="Cancel edit"
            >
              <X size={12} />
            </button>
          </form>
        ) : (
          <p className="text-[15px] font-semibold leading-snug tracking-tight text-slate-800 dark:text-slate-900">
            {note.title}
          </p>
        )}

        {!isEditing && (
          <div className="flex items-center gap-1" onPointerDown={stopDragBubble}>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="rounded-md border border-white/65 bg-white/70 p-1 text-slate-600 transition hover:bg-white"
              aria-label={`Edit ${note.title}`}
            >
              <Pencil size={12} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(note.id)}
              className="rounded-md border border-rose-200/80 bg-rose-100/75 p-1 text-rose-700 transition hover:bg-rose-200/85"
              aria-label={`Delete ${note.title}`}
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>

      <div
        className={`pointer-events-none absolute inset-0 rounded-2xl ring-2 transition ${
          isOver ? "ring-sky-400/70" : "ring-transparent"
        }`}
      />
    </motion.article>
  );
});
