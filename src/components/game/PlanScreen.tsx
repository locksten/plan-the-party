import { useState } from "react";
import type { CategoryId, ChallengeId, EventId, GameItem, GameConfig, GamePlan, ItemId, ResolvedPlacement } from "../../domain";
import { GameCornerControls } from "./GameControls";
import { MoneyTray } from "./MoneyTray";
import type { MetaStatus } from "../../domain";
import { PaperAirplaneFlyby } from "./PaperAirplaneFlyby";
import { PartyTable } from "./PartyTable";
import { SceneDecorations } from "./SceneDecorations";
import { ScreenDecorations } from "./ScreenDecorations";
import { SupplyShelf } from "./SupplyShelf";

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

  function toggleShoppingCardDiscount(item: GameItem) {
    actions.onToggleShoppingCardDiscount(item);
    setShoppingCardSelected(false);
  }

  return (
    <main
      className="relative isolate grid h-dvh min-w-[56.25rem] grid-rows-[minmax(0,1fr)_auto] gap-1 overflow-hidden px-[clamp(0.875rem,2vw,2.375rem)] pb-4 pt-3"
      onClickCapture={() => {
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
          shoppingCardSelected={shoppingCardSelected}
          onCategory={actions.onCategory}
          onPlace={actions.onPlace}
          onToggleShoppingCardDiscount={toggleShoppingCardDiscount}
          onOpenChallenges={actions.onOpenChallenges}
          onOpenEvents={actions.onOpenEvents}
        />
        <div className="relative min-h-0 min-w-0">
          <PartyTable
            placements={placements}
            selectedItemIds={selectedItemIds}
            plan={plan}
            shoppingCardOwned={metaStatus.shoppingCardOwned}
            shoppingCardSelected={shoppingCardSelected}
            showProblems={problems.length > 0}
            onShoppingCardSelectedChange={setShoppingCardSelected}
            onRemoveAt={actions.onRemoveAt}
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
    </main>
  );
}
