"use client";

import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CirclePlus, MousePointer2, RotateCcw } from "lucide-react";
import { Column } from "@/components/Column";
import { StickyDragOverlay } from "@/components/DragOverlay";
import { InteractionMonitor } from "@/components/InteractionMonitor";
import { springConfig } from "@/lib/animationConfig";
import {
  columns,
  createRubberbandModifier,
  groupByColumn,
  initialNotes,
  type ColumnId,
  type InteractionState,
  type StickyNoteItem,
} from "@/lib/dragUtils";

const idleState: InteractionState = {
  label: "Idle",
  userAction: "Idle",
  rubberbanding: "Inactive",
  targetColumn: "none",
  pointer: { x: 0, y: 0 },
};

interface BoardProps {
  performanceMode?: boolean;
}

export function Board({ performanceMode = false }: BoardProps) {
  const [notes, setNotes] = useState<StickyNoteItem[]>(initialNotes);
  const [newTitle, setNewTitle] = useState("");
  const [newColumn, setNewColumn] = useState<ColumnId>("todo");
  const [deletedNote, setDeletedNote] = useState<StickyNoteItem | null>(null);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [targetColumn, setTargetColumn] = useState<ColumnId | "none">("none");
  const [interaction, setInteraction] = useState<InteractionState>(idleState);
  const [boardRect, setBoardRect] = useState<DOMRect | null>(null);
  const [boundaryActive, setBoundaryActive] = useState(false);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const lowMotion = performanceMode || !!prefersReducedMotion;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 120,
        tolerance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }
    };
  }, []);

  const notesByColumn = useMemo(() => groupByColumn(notes), [notes]);
  const activeNote = useMemo(
    () => notes.find((note) => note.id === activeNoteId) ?? null,
    [notes, activeNoteId],
  );

  const findColumnForId = (id: string): ColumnId | null => {
    const note = notes.find((item) => item.id === id);
    return note?.columnId ?? null;
  };

  // CRUD: Create operation for adding a new sticky note.
  const handleCreateNote = useCallback((event: FormEvent) => {
    event.preventDefault();
    const trimmed = newTitle.trim();
    if (!trimmed) {
      return;
    }

    setNotes((prev) => [
      ...prev,
      {
        id: `note-${Date.now()}`,
        title: trimmed,
        columnId: newColumn,
        tilt: Math.random() * 4 - 2,
      },
    ]);
    setNewTitle("");
    setTargetColumn(newColumn);
  }, [newTitle, newColumn]);

  // CRUD: Update operation to edit sticky note text.
  const handleUpdateNote = useCallback((id: string, title: string) => {
    setNotes((prev) => prev.map((note) => (note.id === id ? { ...note, title } : note)));
  }, []);

  // CRUD: Delete operation removes selected sticky note from the board.
  const handleDeleteNote = useCallback((id: string) => {
    setNotes((prev) => {
      const noteToDelete = prev.find((note) => note.id === id);
      if (!noteToDelete) {
        return prev;
      }

      setDeletedNote(noteToDelete);

      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }

      undoTimerRef.current = setTimeout(() => {
        setDeletedNote(null);
        undoTimerRef.current = null;
      }, 5000);

      return prev.filter((note) => note.id !== id);
    });

    if (activeNoteId === id) {
      setActiveNoteId(null);
    }
  }, [activeNoteId]);

  const handleUndoDelete = useCallback(() => {
    if (!deletedNote) {
      return;
    }

    setNotes((prev) => [...prev, deletedNote]);
    setTargetColumn(deletedNote.columnId);
    setDeletedNote(null);

    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
  }, [deletedNote]);

  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    setActiveNoteId(id);
    setBoardRect(document.getElementById("board-region")?.getBoundingClientRect() ?? null);

    setInteraction((prev) => ({
      ...prev,
      label: "Drag Started",
      userAction: "Pointer Down",
      rubberbanding: "Inactive",
      targetColumn: findColumnForId(id) ?? "none",
    }));
  };

  const handleDragMove = (event: DragMoveEvent) => {
    const overId = event.over?.id ? String(event.over.id) : null;
    const translatedRect = event.active.rect.current.translated;
    const pointerX = translatedRect
      ? translatedRect.left + translatedRect.width / 2
      : interaction.pointer.x;
    const pointerY = translatedRect
      ? translatedRect.top + translatedRect.height / 2
      : interaction.pointer.y;

    const edgeBuffer = 34;
    const nearBoundary =
      !!boardRect &&
      (pointerX < boardRect.left + edgeBuffer ||
        pointerX > boardRect.right - edgeBuffer ||
        pointerY < boardRect.top + edgeBuffer ||
        pointerY > boardRect.bottom - edgeBuffer);

    setBoundaryActive((prev) => (prev === nearBoundary ? prev : nearBoundary));

    if (!overId) {
      setInteraction((prev) => {
        const nextLabel = nearBoundary ? "Boundary Rubberband Effect" : "Drag Interaction Active";
        const nextRubberbanding = nearBoundary ? "Active" : "Inactive";

        if (
          prev.pointer.x === pointerX &&
          prev.pointer.y === pointerY &&
          prev.label === nextLabel &&
          prev.rubberbanding === nextRubberbanding &&
          prev.userAction === "Dragging"
        ) {
          return prev;
        }

        return {
          ...prev,
          userAction: "Dragging",
          label: nextLabel,
          rubberbanding: nextRubberbanding,
          pointer: { x: pointerX, y: pointerY },
        };
      });
      return;
    }

    const isColumn = columns.some((column) => column.id === overId);
    const derivedColumn = isColumn ? (overId as ColumnId) : findColumnForId(overId);

    if (derivedColumn) {
      setTargetColumn((prev) => (prev === derivedColumn ? prev : derivedColumn));
    }

    setInteraction((prev) => {
      const nextLabel = nearBoundary
        ? "Boundary Rubberband Effect"
        : overId !== activeNoteId
          ? "Rubberbanding Active"
          : "Drag Interaction Active";
      const nextRubberbanding = overId !== activeNoteId || nearBoundary ? "Active" : "Inactive";
      const nextTarget = derivedColumn ?? prev.targetColumn;

      if (
        prev.userAction === "Dragging" &&
        prev.targetColumn === nextTarget &&
        prev.label === nextLabel &&
        prev.rubberbanding === nextRubberbanding &&
        prev.pointer.x === pointerX &&
        prev.pointer.y === pointerY
      ) {
        return prev;
      }

      return {
        ...prev,
        userAction: "Dragging",
        targetColumn: nextTarget,
        label: nextLabel,
        // Rubberbanding is active when list items separate or when boundary resistance appears.
        rubberbanding: nextRubberbanding,
        pointer: { x: pointerX, y: pointerY },
      };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveNoteId(null);
      setInteraction({
        ...idleState,
        label: "Snap Animation Completed",
        userAction: "Released",
        pointer: interaction.pointer,
      });
      setTimeout(() => setInteraction(idleState), 1200);
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeColumn = findColumnForId(activeId);
    const overColumn = columns.some((column) => column.id === overId)
      ? (overId as ColumnId)
      : findColumnForId(overId);

    if (!activeColumn || !overColumn) {
      setActiveNoteId(null);
      return;
    }

    setNotes((prevNotes) => {
      const nextNotes = [...prevNotes];
      const activeIndex = nextNotes.findIndex((item) => item.id === activeId);
      const overIndex = nextNotes.findIndex((item) => item.id === overId);

      if (activeIndex === -1) {
        return prevNotes;
      }

      if (activeColumn === overColumn && overIndex !== -1) {
        const sameColumnIndices = nextNotes
          .map((note, index) => ({ note, index }))
          .filter(({ note }) => note.columnId === activeColumn)
          .map(({ index }) => index);

        const from = sameColumnIndices.indexOf(activeIndex);
        const to = sameColumnIndices.indexOf(overIndex);

        if (from !== -1 && to !== -1) {
          const columnNotes = sameColumnIndices.map((index) => nextNotes[index]);
          const reordered = arrayMove(columnNotes, from, to);

          reordered.forEach((note, idx) => {
            nextNotes[sameColumnIndices[idx]] = note;
          });
        }

        return nextNotes;
      }

      const [moving] = nextNotes.splice(activeIndex, 1);
      const movingWithColumn = {
        ...moving,
        columnId: overColumn,
      };

      if (columns.some((column) => column.id === overId)) {
        const lastInTarget = nextNotes
          .map((item, index) => ({ item, index }))
          .filter(({ item }) => item.columnId === overColumn)
          .at(-1);

        if (lastInTarget) {
          nextNotes.splice(lastInTarget.index + 1, 0, movingWithColumn);
        } else {
          nextNotes.push(movingWithColumn);
        }
      } else {
        const insertIndex = nextNotes.findIndex((item) => item.id === overId);
        nextNotes.splice(insertIndex === -1 ? nextNotes.length : insertIndex, 0, movingWithColumn);
      }

      return nextNotes;
    });

    setActiveNoteId(null);
    setBoundaryActive(false);
    setInteraction((prev) => ({
      ...prev,
      userAction: "Released",
      targetColumn: overColumn,
      label: "Snap Animation Completed",
      rubberbanding: "Inactive",
    }));

    setTimeout(() => setInteraction(idleState), 1400);
  };

  const handleDragCancel = () => {
    setActiveNoteId(null);
    setBoundaryActive(false);
    setInteraction(idleState);
  };

  // Keep dragged note visually attached to pointer, then apply boundary rubberband resistance.
  const modifiers = useMemo(
    () => [snapCenterToCursor, createRubberbandModifier(boardRect)],
    [boardRect],
  );

  return (
    <div className="relative">
      <motion.div
        id="board-region"
        className={`relative overflow-hidden rounded-[32px] border border-white/45 bg-white/25 p-4 dark:border-white/10 dark:bg-slate-900/35 ${
          performanceMode
            ? "shadow-[0_6px_18px_rgba(15,23,42,0.12)] backdrop-blur-none"
            : "shadow-glass backdrop-blur-sm md:backdrop-blur-xl"
        }`}
        initial={lowMotion ? false : { opacity: 0, y: 18 }}
        animate={lowMotion ? undefined : { opacity: 1, y: 0 }}
        transition={lowMotion ? { duration: 0.12 } : springConfig}
      >
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/40 bg-white/65 px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-900/55">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-100">
            <MousePointer2 size={16} className="text-sky-500" />
            <span className="font-medium">
              Pick note - Drag Interaction - Rubberbanding - Snap Animation
            </span>
          </div>
          <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold tracking-[0.12em] text-sky-800 dark:bg-sky-500/15 dark:text-sky-100">
            {interaction.label}
          </span>
        </div>

        <div className="flex flex-col">
          <form
            onSubmit={handleCreateNote}
            className="mb-4 flex flex-col gap-3 rounded-2xl border border-white/45 bg-white/65 p-4 dark:border-white/10 dark:bg-slate-900/55 md:flex-row md:items-center"
          >
            <div className="flex flex-1 items-center gap-2">
              <CirclePlus size={16} className="text-sky-500" />
              <input
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                placeholder="Create a new sticky note..."
                className="w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-sky-300 transition focus:ring-2 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100"
                aria-label="New sticky note title"
              />
            </div>

            <select
              value={newColumn}
              onChange={(event) => setNewColumn(event.target.value as ColumnId)}
              className="rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none ring-sky-300 transition focus:ring-2 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100"
              aria-label="Column for new sticky note"
            >
              {columns.map((column) => (
                <option key={column.id} value={column.id}>
                  {column.title}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="min-h-11 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500"
            >
              Create Note
            </button>
          </form>

          <div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragMove={handleDragMove}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
              modifiers={modifiers}
            >
              <div className="grid auto-cols-[88%] grid-flow-col gap-4 overflow-x-auto pb-2 snap-x snap-mandatory md:auto-cols-auto md:grid-flow-row md:grid-cols-3 md:overflow-visible">
                {columns.map((column) => (
                  <Column
                    key={column.id}
                    id={column.id}
                    title={column.title}
                    accent={column.accent}
                    notes={notesByColumn[column.id]}
                    isTarget={targetColumn === column.id}
                    rubberbandingActive={
                      activeNoteId !== null &&
                      (interaction.label === "Rubberbanding Active" || interaction.label === "Boundary Rubberband Effect")
                    }
                    onUpdateNote={handleUpdateNote}
                    onDeleteNote={handleDeleteNote}
                    lowMotion={lowMotion}
                    performanceMode={performanceMode}
                  />
                ))}
              </div>

              <AnimatePresence>
                  <StickyDragOverlay
                    activeNote={activeNote}
                    boundaryActive={boundaryActive}
                    lowMotion={lowMotion}
                    performanceMode={performanceMode}
                  />
              </AnimatePresence>
            </DndContext>
          </div>
        </div>

        <AnimatePresence>
          {deletedNote && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={springConfig}
              className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200/70 bg-amber-50/90 px-3 py-2 text-sm text-amber-900 dark:border-amber-300/20 dark:bg-amber-500/10 dark:text-amber-100"
            >
              <span>
                Note deleted: <strong>{deletedNote.title}</strong>
              </span>
              <button
                type="button"
                onClick={handleUndoDelete}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-400"
              >
                <RotateCcw size={13} /> Undo
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <InteractionMonitor state={interaction} performanceMode={performanceMode} lowMotion={lowMotion} />
    </div>
  );
}
