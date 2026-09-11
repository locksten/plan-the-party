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
  const onDropRef = useRef(onDrop);
  onDropRef.current = onDrop;

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
    // Keep the active gesture outside React's delegated event tree. Pointer capture
    // can retarget events, and browsers may briefly lose capture while a pointer
    // is moved across transformed/overlapping table elements. Window capture still
    // receives the complete pointer sequence in both cases.
    const onPointerMove = (event: globalThis.PointerEvent) => {
      const gesture = gestureRef.current;
      if (gesture === null || gesture.pointerId !== event.pointerId) return;
      if (!gesture.dragging && Math.hypot(event.clientX - gesture.origin.x, event.clientY - gesture.origin.y) < DRAG_DISTANCE) return;

      previewPositionRef.current = { x: event.clientX, y: event.clientY };
      if (previewElementRef.current !== null) {
        positionPreview(previewElementRef.current, previewPositionRef.current);
      }
      if (gesture.dragging) return;

      // Pointer capture is useful when available, but it is not required: these
      // window listeners continue tracking the gesture if capture is rejected or
      // lost during the drag.
      try {
        gesture.element.setPointerCapture(event.pointerId);
      } catch {
        // Keep the gesture alive and let the window listeners finish it.
      }
      gesture.dragging = true;
      suppressClickRef.current = true;
      setPreview(gesture.source);
    };
    const onPointerUp = (event: globalThis.PointerEvent) => {
      const gesture = gestureRef.current;
      if (gesture === null || gesture.pointerId !== event.pointerId) return;
      const shouldDrop = gesture.dragging;
      const point = { x: event.clientX, y: event.clientY };
      cancel();
      if (shouldDrop) onDropRef.current(gesture.source, point);
    };
    const onPointerCancel = (event: globalThis.PointerEvent) => {
      if (gestureRef.current?.pointerId === event.pointerId) cancel();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("blur", cancel);
    window.addEventListener("pointermove", onPointerMove, true);
    window.addEventListener("pointerup", onPointerUp, true);
    window.addEventListener("pointercancel", onPointerCancel, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("blur", cancel);
      window.removeEventListener("pointermove", onPointerMove, true);
      window.removeEventListener("pointerup", onPointerUp, true);
      window.removeEventListener("pointercancel", onPointerCancel, true);
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
      onClickCapture: suppressDragClick,
    },
  };
}

function positionPreview(element: HTMLDivElement, point: Point) {
  element.style.transform = `translate3d(${point.x}px, ${point.y}px, 0)`;
}
