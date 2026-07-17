import type { PointerEvent as ReactPointerEvent } from "react";
import type { GameItem } from "../../game";

export type DragSource = "shelf" | "table";

export type BeginDrag = (
  event: ReactPointerEvent<HTMLElement>,
  item: GameItem,
  source: DragSource,
) => void;

export type DragPointerHandler = (event: ReactPointerEvent<HTMLElement>) => void;

export type ActiveDrag = {
  item: GameItem;
  source: DragSource;
  pointerId: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
};
