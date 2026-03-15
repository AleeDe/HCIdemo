import type { Modifier } from "@dnd-kit/core";

export type ColumnId = "todo" | "doing" | "done";

export interface StickyNoteItem {
  id: string;
  title: string;
  columnId: ColumnId;
  tilt: number;
}

export interface InteractionState {
  label:
    | "Idle"
    | "Drag Started"
    | "Drag Interaction Active"
    | "Rubberbanding Active"
    | "Boundary Rubberband Effect"
    | "Snap Animation Completed";
  userAction: "Idle" | "Pointer Down" | "Dragging" | "Released";
  rubberbanding: "Inactive" | "Active";
  targetColumn: ColumnId | "none";
  pointer: { x: number; y: number };
}

export const columns: { id: ColumnId; title: string; accent: string }[] = [
  { id: "todo", title: "To Do", accent: "from-sky-500/25 to-cyan-400/10" },
  { id: "doing", title: "Doing", accent: "from-amber-500/30 to-yellow-400/10" },
  { id: "done", title: "Done", accent: "from-emerald-500/30 to-lime-400/10" },
];

export const initialNotes: StickyNoteItem[] = [
  { id: "note-1", title: "Design Logo", columnId: "todo", tilt: -2 },
  { id: "note-2", title: "Write Report", columnId: "todo", tilt: 1.5 },
  { id: "note-3", title: "Fix Bug", columnId: "todo", tilt: -1 },
  { id: "note-4", title: "Prepare Slides", columnId: "doing", tilt: 2 },
  { id: "note-5", title: "UI Review", columnId: "done", tilt: -1.2 },
];

function applyResistance(overflow: number, factor = 0.38): number {
  if (overflow <= 0) {
    return 0;
  }
  return Math.pow(overflow, 0.9) * factor;
}

/**
 * Boundary rubberbanding: when the note is dragged beyond board bounds,
 * movement slows to mimic elastic physical resistance.
 */
export function createRubberbandModifier(
  boardRect: DOMRect | null,
  edgePadding = 12,
): Modifier {
  return ({ transform, activeNodeRect }) => {
    if (!boardRect || !activeNodeRect) {
      return transform;
    }

    const projectedLeft = activeNodeRect.left + transform.x;
    const projectedTop = activeNodeRect.top + transform.y;
    const projectedRight = projectedLeft + activeNodeRect.width;
    const projectedBottom = projectedTop + activeNodeRect.height;

    const minX = boardRect.left + edgePadding;
    const minY = boardRect.top + edgePadding;
    const maxX = boardRect.right - edgePadding;
    const maxY = boardRect.bottom - edgePadding;

    let adjustedX = transform.x;
    let adjustedY = transform.y;

    if (projectedLeft < minX) {
      const overflow = minX - projectedLeft;
      adjustedX += applyResistance(overflow);
    }

    if (projectedRight > maxX) {
      const overflow = projectedRight - maxX;
      adjustedX -= applyResistance(overflow);
    }

    if (projectedTop < minY) {
      const overflow = minY - projectedTop;
      adjustedY += applyResistance(overflow);
    }

    if (projectedBottom > maxY) {
      const overflow = projectedBottom - maxY;
      adjustedY -= applyResistance(overflow);
    }

    return {
      ...transform,
      x: adjustedX,
      y: adjustedY,
    };
  };
}

export function groupByColumn(notes: StickyNoteItem[]): Record<ColumnId, StickyNoteItem[]> {
  return {
    todo: notes.filter((note) => note.columnId === "todo"),
    doing: notes.filter((note) => note.columnId === "doing"),
    done: notes.filter((note) => note.columnId === "done"),
  };
}
