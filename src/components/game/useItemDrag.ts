import { useCallback, useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import type { GameItem } from "../../domain";

export type ItemDragSource =
  | { kind: "shelf"; item: GameItem }
  | { kind: "table"; item: GameItem; placementId: number }
  | { kind: "shopping-card" };

type Point = Readonly<{ x: number; y: number }>;
type Gesture = {
  source: ItemDragSource;
  pointerId: number;
  element: HTMLButtonElement;
  origin: Point;
  dragging: boolean;
};

const DRAG_DISTANCE = 8;

export function useItemDrag(onDrop: (source: ItemDragSource, point: Point) => void) {
  const gestureRef = useRef<Gesture | null>(null);
  const suppressClickRef = useRef(false);
  const [preview, setPreview] = useState<ItemDragSource | null>(null);
  const previewElementRef = useRef<HTMLDivElement | null>(null);
  const previewPositionRef = useRef<Point>({ x: 0, y: 0 });

  const previewRef = useCallback((element: HTMLDivElement | null) => {
    previewElementRef.current = element;
    if (element !== null) positionPreview(element, previewPositionRef.current);
  }, []);

  const cancel = useCallback(() => {
    const gesture = gestureRef.current;
    gestureRef.current = null;
    setPreview(null);
    if (gesture?.element.hasPointerCapture(gesture.pointerId)) {
      gesture.element.releasePointerCapture(gesture.pointerId);
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && gestureRef.current !== null) {
        event.preventDefault();
        cancel();
      }
    };
    // Releases outside the game can target <html> instead of the captured button.
    // In-game drops finish in React before this bubbling window listener runs.
    const onPointerEnd = (event: globalThis.PointerEvent) => {
      if (gestureRef.current?.pointerId === event.pointerId) cancel();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("blur", cancel);
    window.addEventListener("pointerup", onPointerEnd);
    window.addEventListener("pointercancel", onPointerEnd);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("blur", cancel);
      window.removeEventListener("pointerup", onPointerEnd);
      window.removeEventListener("pointercancel", onPointerEnd);
    };
  }, [cancel]);

  function start(event: PointerEvent<HTMLButtonElement>, source: ItemDragSource) {
    if (!event.isPrimary || event.button !== 0 || gestureRef.current !== null) return;
    gestureRef.current = {
      source,
      pointerId: event.pointerId,
      element: event.currentTarget,
      origin: { x: event.clientX, y: event.clientY },
      dragging: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function move(event: PointerEvent<HTMLElement>) {
    const gesture = gestureRef.current;
    if (gesture === null || gesture.pointerId !== event.pointerId) return;
    if (!gesture.dragging && Math.hypot(event.clientX - gesture.origin.x, event.clientY - gesture.origin.y) < DRAG_DISTANCE) return;
    // Pointer movement only updates the preview DOM; React handles drag start/end.
    previewPositionRef.current = { x: event.clientX, y: event.clientY };
    if (previewElementRef.current !== null) {
      positionPreview(previewElementRef.current, previewPositionRef.current);
    }
    if (!gesture.dragging) {
      gesture.dragging = true;
      suppressClickRef.current = true;
      setPreview(gesture.source);
    }
  }

  function finish(event: PointerEvent<HTMLElement>) {
    const gesture = gestureRef.current;
    if (gesture === null || gesture.pointerId !== event.pointerId) return;
    cancel();
    if (gesture.dragging) onDrop(gesture.source, { x: event.clientX, y: event.clientY });
  }

  function cancelPointer(event: PointerEvent<HTMLElement>) {
    if (gestureRef.current?.pointerId === event.pointerId) cancel();
  }

  function suppressDragClick(event: MouseEvent<HTMLElement>) {
    // Pointer drags can generate a click on release; keyboard activation still works.
    if (suppressClickRef.current && event.detail > 0) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  return {
    start,
    preview,
    previewRef,
    handlers: {
      onPointerDownCapture: (event: PointerEvent<HTMLElement>) => {
        if (event.isPrimary) suppressClickRef.current = false;
      },
      onPointerMove: move,
      onPointerUp: finish,
      onPointerCancel: cancelPointer,
      onLostPointerCapture: cancelPointer,
      onClickCapture: suppressDragClick,
    },
  };
}

function positionPreview(element: HTMLDivElement, point: Point) {
  element.style.transform = `translate3d(${point.x}px, ${point.y}px, 0)`;
}
