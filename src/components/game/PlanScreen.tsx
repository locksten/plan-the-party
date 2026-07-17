import { useState, type PointerEvent as ReactPointerEvent } from "react";
import type { CategoryId, GameItem, GameMode, GamePlan, Selection } from "../../game";
import { CATEGORY_ACCENT, classes, formatEuros } from "../../ui";
import { GameToolbar } from "./GameToolbar";
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
  activeEventCount: number;
  activeChallengeCount: number;
  onCategory: (category: CategoryId) => void;
  onQuantity: (item: GameItem, change: -1 | 1) => void;
  onReserve: (change: -1 | 1) => void;
  onOpenEvents: () => void;
  onOpenChallenges: () => void;
  onOpenParticipants: () => void;
  onCheck: () => void;
  onHome: () => void;
  onHelp: () => void;
  onFullscreen: () => void;
};

export function PlanScreen({ mode, plan, selection, category, problems, activeEventCount, activeChallengeCount, onCategory, onQuantity, onReserve, onOpenEvents, onOpenChallenges, onOpenParticipants, onCheck, onHome, onHelp, onFullscreen }: PlanScreenProps) {
  const [drag, setDrag] = useState<ActiveDrag | null>(null);

  function beginDrag(event: ReactPointerEvent<HTMLElement>, item: GameItem, source: DragSource) {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({
      item,
      source,
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
    if (!moved || droppedOnShelf) onQuantity(completedDrag.item, -1);
  }

  function cancelDrag(event: ReactPointerEvent<HTMLElement>) {
    if (drag !== null && event.pointerId === drag.pointerId) setDrag(null);
  }

  return (
    <main className="relative grid h-dvh min-w-[900px] grid-rows-[minmax(0,1fr)_auto_auto] gap-2.5 overflow-hidden px-[clamp(14px,2vw,38px)] pb-4 pt-3">
      {problems.length > 0 && (
        <div className="absolute left-1/2 top-5 z-10 flex min-h-11 -translate-x-[35%] items-center gap-3 rounded-xl border-[3px] border-navy bg-coral px-3 py-2 text-navy shadow-[0_4px_0_#17233f]" role="alert">
          <strong className="text-[15px]">{problems[0]}</strong>
          {problems.length > 1 && <span className="rounded-md border-2 border-navy bg-white px-1.5 py-0.5 text-[10px] font-black">Dar {problems.length - 1}</span>}
        </div>
      )}

      <div className="grid min-h-0 grid-cols-[clamp(250px,20vw,330px)_minmax(0,1fr)] gap-3.5">
        <SupplyShelf
          items={mode.items}
          selection={selection}
          category={category}
          onCategory={onCategory}
          onQuantity={onQuantity}
          onBeginDrag={beginDrag}
          onMoveDrag={moveDrag}
          onFinishDrag={finishDrag}
          onCancelDrag={cancelDrag}
        />
        <PartyTable
          items={mode.items}
          selection={selection}
          plan={plan}
          showProblems={problems.length > 0}
          onRemove={(item) => onQuantity(item, -1)}
          onBeginDrag={beginDrag}
          onMoveDrag={moveDrag}
          onFinishDrag={finishDrag}
          onCancelDrag={cancelDrag}
        />
      </div>

      <MoneyTray mode={mode} plan={plan} attention={problems.length > 0 && plan.available < 0} onReserve={onReserve} onCheck={onCheck} />
      <GameToolbar plan={plan} activeEventCount={activeEventCount} activeChallengeCount={activeChallengeCount} onHome={onHome} onHelp={onHelp} onFullscreen={onFullscreen} onOpenParticipants={onOpenParticipants} onOpenChallenges={onOpenChallenges} onOpenEvents={onOpenEvents} />

      {drag !== null && (
        <div
          className={classes(
            "pointer-events-none fixed z-50 flex min-h-16 w-[150px] -translate-x-1/2 -translate-y-1/2 -rotate-3 flex-col items-center justify-center rounded-xl border-[3px] border-navy p-2.5 text-center text-[13px] font-black shadow-[7px_7px_0_rgba(23,35,63,.7)]",
            CATEGORY_ACCENT[drag.item.category],
          )}
          style={{ left: drag.x, top: drag.y }}
        >
          {drag.item.name}
          <strong className="mt-1 rounded-md border-2 border-navy bg-yellow px-1 py-0.5">{formatEuros(drag.item.price)}</strong>
        </div>
      )}
    </main>
  );
}
