import { useRef, useState } from "react";
import { assert } from "../../assert";
import { META_ART_SOURCES } from "../../metaArt";
import type { CategoryId, ChallengeId, EventId, GameItem, GameConfig, GamePlan, ItemId, ResolvedPlacement } from "../../domain";
import { GameCornerControls } from "./GameControls";
import { MoneyTray } from "./MoneyTray";
import type { MetaStatus } from "../../domain";
import { PaperAirplaneFlyby } from "./PaperAirplaneFlyby";
import { PartyTable } from "./PartyTable";
import { SceneDecorations } from "./SceneDecorations";
import { ScreenDecorations } from "./ScreenDecorations";
import { SupplyShelf } from "./SupplyShelf";
import { ItemImage } from "./ItemImage";
import { useItemDrag } from "./useItemDrag";

export type PlanScreenView = Readonly<{
  game: GameConfig;
  plan: GamePlan;
  placements: readonly ResolvedPlacement[];
  selectedItemIds: ReadonlySet<ItemId>;
  addableItemIds: ReadonlySet<ItemId>;
  category: CategoryId;
  problems: readonly string[];
  completedChallengeIds: ReadonlySet<ChallengeId>;
  activeEventIds: readonly EventId[];
  revealedEventIds: readonly EventId[];
  eventCardsNeedAttention: boolean;
  metaStatus: MetaStatus;
}>;

export type PlanScreenActions = Readonly<{
  onCategory: (category: CategoryId) => void;
  onPlace: (item: GameItem) => void;
  onToggleShoppingCardDiscount: (item: GameItem) => void;
  onRemoveAt: (selectionIndex: number) => void;
  onOpenEvents: () => void;
  onOpenChallenges: () => void;
  onOpenDiscussions: () => void;
  onOpenSettings: () => void;
  onDismissProblems: () => void;
  onCheck: () => void;
  onHome: () => void;
  onHelp: () => void;
  onFullscreen: () => void;
}>;

export function PlanScreen({ view, actions }: { view: PlanScreenView; actions: PlanScreenActions }) {
  const [shoppingCardSelected, setShoppingCardSelected] = useState(false);
  const { game, plan, placements, selectedItemIds, addableItemIds, category, problems, completedChallengeIds, activeEventIds, revealedEventIds, eventCardsNeedAttention, metaStatus } = view;
  const screenRef = useRef<HTMLElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const drag = useItemDrag((source, point) => {
    assert(screenRef.current !== null && tableRef.current !== null, "Drag targets must be mounted before dropping an item.");
    const target = document.elementFromPoint(point.x, point.y);
    if (target === null || !screenRef.current.contains(target)) return;
    if (source.kind === "shopping-card") {
      const itemId = target.closest("button[data-shopping-card-item]")?.getAttribute("data-shopping-card-item");
      if (itemId === undefined) return;
      assert(metaStatus.shoppingCardOwned, "A dragged discount card must be unlocked.");
      const item = game.items.find((candidate) => candidate.id === itemId);
      assert(item !== undefined, "A discount-card drop target must exist in the current game.");
      assert(item.price + (item.shoppingCardDiscount ?? 0) > 0, "A discount-card drop target must be a paid item.");
      // Dropping onto the current target keeps its discount; tapping still toggles it.
      if ((item.shoppingCardDiscount ?? 0) === 0) actions.onToggleShoppingCardDiscount(item);
      setShoppingCardSelected(false);
      actions.onDismissProblems();
      return;
    }
    const onTable = tableRef.current.contains(target);
    if (source.kind === "shelf" && onTable && addableItemIds.has(source.item.id)) {
      const item = game.items.find((candidate) => candidate.id === source.item.id);
      assert(item !== undefined, "A dragged shelf item must exist in the current game.");
      actions.onPlace(item);
      actions.onDismissProblems();
    } else if (source.kind === "table" && !onTable) {
      const placement = placements.find((candidate) => candidate.placementId === source.placementId);
      assert(placement !== undefined, "A dragged table item must still have a placement.");
      actions.onRemoveAt(placement.selectionIndex);
      actions.onDismissProblems();
    }
  });

  function toggleShoppingCardDiscount(item: GameItem) {
    actions.onToggleShoppingCardDiscount(item);
    setShoppingCardSelected(false);
  }

  return (
    <main
      ref={screenRef}
      {...drag.handlers}
      className="relative isolate grid h-dvh min-w-[56.25rem] grid-rows-[minmax(0,1fr)_auto] gap-1 overflow-hidden px-[clamp(0.875rem,2vw,2.375rem)] pb-4 pt-3"
      onClickCapture={(event) => {
        drag.handlers.onClickCapture(event);
        if (event.isPropagationStopped()) return;
        if (problems.length > 0) actions.onDismissProblems();
      }}
    >
      <GameCornerControls
        onHome={actions.onHome}
        onOpenSettings={actions.onOpenSettings}
        onHelp={actions.onHelp}
        onFullscreen={actions.onFullscreen}
      />
      <ScreenDecorations selectedItemIds={selectedItemIds} />
      {selectedItemIds.has("paper-airplane-challenge") && <PaperAirplaneFlyby />}

      <div className="grid min-h-0 grid-cols-[clamp(20.625rem,26vw,24.375rem)_minmax(0,1fr)] gap-3.5">
        <SupplyShelf
          game={game}
          addableItemIds={addableItemIds}
          category={category}
          completedChallengeIds={completedChallengeIds}
          activeEventIds={activeEventIds}
          revealedEventIds={revealedEventIds}
          eventCardsNeedAttention={eventCardsNeedAttention}
          shoppingCardOwned={metaStatus.shoppingCardOwned}
          shoppingCardSelected={shoppingCardSelected || drag.preview?.kind === "shopping-card"}
          onCategory={actions.onCategory}
          onPlace={actions.onPlace}
          onItemPointerDown={(event, item) => drag.start(event, { kind: "shelf", item })}
          onToggleShoppingCardDiscount={toggleShoppingCardDiscount}
          onOpenChallenges={actions.onOpenChallenges}
          onOpenEvents={actions.onOpenEvents}
        />
        <div ref={tableRef} className="relative min-h-0 min-w-0">
          <PartyTable
            placements={placements}
            selectedItemIds={selectedItemIds}
            plan={plan}
            shoppingCardOwned={metaStatus.shoppingCardOwned}
            shoppingCardSelected={shoppingCardSelected}
            showProblems={problems.length > 0}
            onShoppingCardSelectedChange={setShoppingCardSelected}
            onShoppingCardPointerDown={(event) => drag.start(event, { kind: "shopping-card" })}
            onRemoveAt={actions.onRemoveAt}
            onItemPointerDown={(event, placement) => drag.start(event, { kind: "table", item: placement.item, placementId: placement.placementId })}
          />
          <SceneDecorations
            selectedItemIds={selectedItemIds}
            plantGrowth={metaStatus.plantGrowth}
            compostBinOwned={metaStatus.compostBinOwned}
          />
        </div>
      </div>

      <MoneyTray
        plan={plan}
        problems={problems}
        attention={problems.length > 0 && plan.available < 0}
        onOpenDiscussions={actions.onOpenDiscussions}
        onCheck={actions.onCheck}
      />
      {drag.preview !== null && (
        <div
          ref={drag.previewRef}
          className="pointer-events-none fixed left-0 top-0 z-[100] size-24 -translate-x-1/2 -translate-y-1/2 opacity-85"
          aria-hidden="true"
        >
          {drag.preview.kind === "shopping-card"
            ? <img className="size-full object-contain" src={META_ART_SOURCES["shopping-card"]} alt="" draggable={false} />
            : <ItemImage item={drag.preview.item} className="size-full" />}
        </div>
      )}
    </main>
  );
}
