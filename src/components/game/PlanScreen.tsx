import { useState, type PointerEvent as ReactPointerEvent } from "react";
import { assert, type CategoryId, type GameItem, type GameMode, type GamePlan, type MysteryEvent, type MysteryEventId, type Selection } from "../../game";
import { GameCornerControls, GameToolbar } from "./GameToolbar";
import { ItemImage } from "./ItemImage";
import { MoneyTray } from "./MoneyTray";
import { PartyTable } from "./PartyTable";
import { SupplyShelf } from "./SupplyShelf";
import type { ActiveDrag, DragSource } from "./drag";

type PlanScreenProps = {
  mode: GameMode;
  plan: GamePlan;
  selection: Selection;
  category: CategoryId;
  problems: readonly string[];
  activeEvents: readonly MysteryEvent[];
  revealedEventIds: readonly MysteryEventId[];
  onCategory: (category: CategoryId) => void;
  onQuantity: (item: GameItem, change: -1 | 1) => void;
  onRemoveAt: (selectionIndex: number) => void;
  onReserve: (change: -1 | 1) => void;
  onOpenEvents: () => void;
  onOpenChallenges: () => void;
  onOpenParticipants: () => void;
  onDismissProblems: () => void;
  onCheck: () => void;
  onHome: () => void;
  onHelp: () => void;
  onFullscreen: () => void;
};

export function PlanScreen({ mode, plan, selection, category, problems, activeEvents, revealedEventIds, onCategory, onQuantity, onRemoveAt, onReserve, onOpenEvents, onOpenChallenges, onOpenParticipants, onDismissProblems, onCheck, onHome, onHelp, onFullscreen }: PlanScreenProps) {
  const [drag, setDrag] = useState<ActiveDrag | null>(null);

  function beginDrag(event: ReactPointerEvent<HTMLElement>, item: GameItem, source: DragSource, selectionIndex?: number) {
    if (event.button !== 0) return;
    assert((source === "table") === (selectionIndex !== undefined), "Tik ant stalo esantis daiktas gali turėti pasirinkimo vietą.");
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({
      item,
      source,
      selectionIndex,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      x: event.clientX,
      y: event.clientY,
    });
  }

  function moveDrag(event: ReactPointerEvent<HTMLElement>) {
    if (drag === null || event.pointerId !== drag.pointerId) return;
    setDrag((current) => current === null ? null : { ...current, x: event.clientX, y: event.clientY });
  }

  function finishDrag(event: ReactPointerEvent<HTMLElement>) {
    if (drag === null || event.pointerId !== drag.pointerId) return;

    const completedDrag = drag;
    const moved = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 10;
    const target = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
    const dropZone = target?.closest<HTMLElement>("[data-drop-category]");
    const droppedOnShelf = target?.closest<HTMLElement>("[data-drop-shelf]") !== null;
    setDrag(null);

    if (completedDrag.source === "shelf") {
      if (!moved || dropZone?.dataset.dropCategory === completedDrag.item.category) onQuantity(completedDrag.item, 1);
      return;
    }
    if (!moved || droppedOnShelf) {
      assert(completedDrag.selectionIndex !== undefined, "Nenurodyta nuo stalo nuimamo daikto vieta.");
      onRemoveAt(completedDrag.selectionIndex);
    }
  }

  function cancelDrag(event: ReactPointerEvent<HTMLElement>) {
    if (drag !== null && event.pointerId === drag.pointerId) setDrag(null);
  }

  return (
    <main
      className="relative grid h-dvh min-w-[900px] grid-rows-[minmax(0,1fr)_auto] gap-1 overflow-hidden px-[clamp(14px,2vw,38px)] pb-4 pt-3"
      onClickCapture={() => {
        if (problems.length > 0) onDismissProblems();
      }}
    >
      <GameCornerControls
        canOpenParticipants={plan.participants !== undefined}
        onHome={onHome}
        onOpenParticipants={onOpenParticipants}
        onHelp={onHelp}
        onFullscreen={onFullscreen}
      />

      <div className="grid min-h-0 grid-cols-[clamp(280px,22vw,350px)_minmax(0,1fr)] gap-3.5">
        <SupplyShelf
          mode={mode}
          plan={plan}
          selection={selection}
          category={category}
          activeEvents={activeEvents}
          revealedEventIds={revealedEventIds}
          onCategory={onCategory}
          onQuantity={onQuantity}
          onOpenChallenges={onOpenChallenges}
          onOpenEvents={onOpenEvents}
          onBeginDrag={beginDrag}
          onMoveDrag={moveDrag}
          onFinishDrag={finishDrag}
          onCancelDrag={cancelDrag}
          controls={(
            <GameToolbar
              plan={plan}
              onOpenParticipants={onOpenParticipants}
            />
          )}
        />
        <PartyTable
          items={mode.items}
          selection={selection}
          plan={plan}
          showProblems={problems.length > 0}
          onRemoveAt={onRemoveAt}
          onBeginDrag={beginDrag}
          onMoveDrag={moveDrag}
          onFinishDrag={finishDrag}
          onCancelDrag={cancelDrag}
        />
      </div>

      <MoneyTray plan={plan} problems={problems} attention={problems.length > 0 && plan.available < 0} onReserve={onReserve} onCheck={onCheck} />

      {drag !== null && Math.hypot(drag.x - drag.startX, drag.y - drag.startY) > 10 && (
        <div
          className="pointer-events-none fixed z-50 size-[clamp(75px,9vw,146px)] -translate-x-1/2 -translate-y-1/2"
          style={{ left: drag.x, top: drag.y }}
        >
          <ItemImage item={drag.item} className="size-full" />
        </div>
      )}
    </main>
  );
}
