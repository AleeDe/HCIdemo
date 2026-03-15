# HCI Drag Interaction and Rubberbanding Demo

A polished Next.js classroom demo that teaches:

- Drag Interaction (direct manipulation of sticky notes)
- Rubberbanding (elastic spacing and boundary resistance)
- Elastic Snap Feedback on release

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Framer Motion
- @dnd-kit
- Lucide Icons

## Run

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Interaction Flow to Present

1. Pick up a sticky note -> `Drag Started`
2. Move the note -> `Drag Interaction Active`
3. Move between notes -> `Rubberbanding Active`
4. Release note -> `Snap Animation Completed`
5. Drag near board edge -> `Boundary Rubberband Effect`

## Project Structure

- `app/page.tsx`
- `components/Board.tsx`
- `components/Column.tsx`
- `components/StickyNote.tsx`
- `components/DragOverlay.tsx`
- `components/InteractionMonitor.tsx`
- `lib/animationConfig.ts`
- `lib/dragUtils.ts`
- `styles/globals.css`
