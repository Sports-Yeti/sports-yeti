/**
 * HTML5 drag-and-drop helper for the admin calendars (Schedule + Bookings).
 *
 * The admin app is web-only, so we lean on the platform's native DnD
 * API instead of pulling in a cross-platform DnD lib. react-native-web
 * forwards unknown props on `View` to the underlying `<div>`, so we
 * pass `draggable` + `onDragStart` / `onDragOver` / `onDrop` directly.
 *
 * Usage:
 *   const drag = useCalendarDrag<{ id: string; ymd: string }>();
 *
 *   // Source tile:
 *   <View {...drag.sourceProps({ id: g.id, ymd })} />
 *
 *   // Drop target column (one per day):
 *   <View {...drag.targetProps(ymd, (item) => moveTo(item, ymd))} />
 */
import { useCallback, useState } from 'react';

export interface DragItem {
  id: string;
  ymd: string;
}

interface SourcePropsFor {
  draggable: true;
  onDragStart: (event: { dataTransfer?: DataTransfer }) => void;
  onDragEnd: () => void;
  // RN Web honors style callbacks on View — but only for Pressable. We
  // surface `isDragging` so callers can apply their own dimmed style.
}

interface TargetProps {
  onDragOver: (event: { preventDefault?: () => void }) => void;
  onDragEnter: () => void;
  onDragLeave: () => void;
  onDrop: (event: { preventDefault?: () => void }) => void;
}

interface DragApi<T extends DragItem> {
  draggingId: string | null;
  hoveredYmd: string | null;
  sourceProps: (item: T) => SourcePropsFor;
  targetProps: (
    targetYmd: string,
    onAccept: (item: T) => void,
  ) => TargetProps;
}

export function useCalendarDrag<T extends DragItem>(): DragApi<T> {
  const [draggingItem, setDraggingItem] = useState<T | null>(null);
  const [hoveredYmd, setHoveredYmd] = useState<string | null>(null);

  const sourceProps = useCallback(
    (item: T): SourcePropsFor => ({
      draggable: true,
      onDragStart: (event) => {
        setDraggingItem(item);
        // Some browsers refuse to start a drag without dataTransfer.
        if (event.dataTransfer) {
          event.dataTransfer.effectAllowed = 'move';
          event.dataTransfer.setData('text/plain', item.id);
        }
      },
      onDragEnd: () => {
        setDraggingItem(null);
        setHoveredYmd(null);
      },
    }),
    [],
  );

  const targetProps = useCallback(
    (targetYmd: string, onAccept: (item: T) => void): TargetProps => ({
      onDragOver: (event) => {
        event.preventDefault?.();
      },
      onDragEnter: () => setHoveredYmd(targetYmd),
      onDragLeave: () => setHoveredYmd((prev) => (prev === targetYmd ? null : prev)),
      onDrop: (event) => {
        event.preventDefault?.();
        if (draggingItem && draggingItem.ymd !== targetYmd) {
          onAccept(draggingItem);
        }
        setDraggingItem(null);
        setHoveredYmd(null);
      },
    }),
    [draggingItem],
  );

  return {
    draggingId: draggingItem?.id ?? null,
    hoveredYmd,
    sourceProps,
    targetProps,
  };
}

/**
 * Replace just the date portion (YYYY-MM-DD) of an ISO timestamp.
 * Preserves the time-of-day portion + timezone offset.
 */
export function moveDateInIso(iso: string, targetYmd: string): string {
  // Split off the trailing time component (everything from 'T' onward).
  const tIdx = iso.indexOf('T');
  if (tIdx === -1) return targetYmd;
  return `${targetYmd}${iso.slice(tIdx)}`;
}
