import { CHALLENGE_ART_SOURCES, EVENT_ART_SOURCES } from "../cardArt";
import { COMPLETION_ART_SOURCES } from "../completionArt";
import {
  CHALLENGES,
  type Challenge,
  type CompletionView,
  type CompletionDecisions,
  type EventCard,
  type GameItem,
  type GamePlan,
  type ItemId,
  type ProjectId,
  type ProjectProgress,
  type UpgradeId,
} from "../domain";
import { META_ART_SOURCES } from "../metaArt";
import { DiscussionButton } from "./DiscussionButton";
import { MoneyDecision } from "./completion/MoneyDecision";
import { ResourceDecision } from "./completion/ResourceDecision";
import { RaisedButton } from "./ui/RaisedButton";
import {
  COMPOST_FOOD_LEFTOVER_CHOICE,
  FOOD_LEFTOVER_CHOICES,
  LONG_LASTING_FOOD_LEFTOVER_CHOICES,
  type FoodLeftoverChoice,
  type LongLastingFoodLeftoverChoice,
} from "../ui";

export type CompletionScreenView = Readonly<{
  plan: GamePlan;
  activeEvents: readonly EventCard[];
  completedChallenges: readonly Challenge[];
  completion: CompletionView;
  projectProgress: ProjectProgress;
  selectedItemIds: ReadonlySet<ItemId>;
}>;

export type CompletionScreenActions = Readonly<{
  onSpoilingFoodChoice: (choice: FoodLeftoverChoice | null) => void;
  onLongLastingFoodChoice: (choice: LongLastingFoodLeftoverChoice | null) => void;
  onToggleReusablePurchase: (item: GameItem) => void;
  onToggleUpgradePurchase: (upgradeId: UpgradeId) => void;
  onToggleFertilizer: () => void;
  onToggleProjectFunding: (projectId: ProjectId) => void;
  onNewCelebration: () => void;
  onOpenChallenges: () => void;
  onOpenEvents: () => void;
  onOpenDiscussions: () => void;
  onContinue: () => void;
}>;

const foodActionArt = {
  suvalgyti: COMPLETION_ART_SOURCES.eat,
  ismesti: COMPLETION_ART_SOURCES.discard,
  kompostuoti: META_ART_SOURCES["compost-bin"],
} as const satisfies Readonly<Record<FoodLeftoverChoice, string>>;

const longLastingFoodActionArt = {
  suvalgyti: COMPLETION_ART_SOURCES.eat,
  ismesti: COMPLETION_ART_SOURCES.discard,
  "pasilikti-kitai-sventei": COMPLETION_ART_SOURCES["keep-food"],
} as const satisfies Readonly<Record<LongLastingFoodLeftoverChoice, string>>;

export function CompletionScreen({ view, decisions, actions }: {
  view: CompletionScreenView;
  decisions: CompletionDecisions;
  actions: CompletionScreenActions;
}) {
  const { plan, activeEvents, completedChallenges, completion, projectProgress, selectedItemIds } = view;
  const { spoilingFoodChoice, longLastingFoodChoice, moneyAllocation } = decisions;
  const hasSpoilingFood = plan.spoilingSnackPortions > 0;
  const hasSpoilingLeftovers = plan.spoilingSnackLeftovers > 0;
  const hasLongLastingFood = plan.longLastingSnackPortions > 0;
  const hasLongLastingLeftovers = plan.longLastingSnackLeftovers > 0;
  const spoilingFoodOptions = hasSpoilingFood
    ? [
        ...(hasSpoilingLeftovers ? FOOD_LEFTOVER_CHOICES : FOOD_LEFTOVER_CHOICES.filter((option) => option.id === "ismesti")),
        ...(completion.canCompost ? [COMPOST_FOOD_LEFTOVER_CHOICE] : []),
      ]
    : [];
  const longLastingFoodOptions = hasLongLastingLeftovers ? LONG_LASTING_FOOD_LEFTOVER_CHOICES : [];
  const spoilingFoodArt = !hasSpoilingFood
    ? "spoiling-leftovers-empty"
    : !hasSpoilingLeftovers ? "spoiling-leftovers-crumbs" : "spoiling-leftovers-food";
  return (
    <div className="layer-dialog fixed inset-0 grid place-items-center bg-[#0b1429]/80 p-16 text-navy" role="presentation" onMouseDown={actions.onContinue}>
      <div className="flex h-full w-full" onMouseDown={(event) => event.stopPropagation()}>
        <section
          className="flex h-full min-w-0 flex-1 flex-col overflow-hidden rounded-[1.875rem] border-[0.25rem] border-navy bg-paper shadow-[0.625rem_0.625rem_0_#080f20]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="completion-title"
        >
        <header className="relative grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-3 border-b-[0.125rem] border-navy/20 px-5 py-3">
          <button
            className="flex min-w-0 items-center gap-2 rounded-lg outline-none focus-visible:outline-[0.25rem] focus-visible:outline-yellow active:translate-y-0.5"
            type="button"
            onClick={actions.onOpenChallenges}
            aria-label={`Atverti iššūkius. Įvykdyta ${completedChallenges.length} iš ${CHALLENGES.length}.`}
          >
            {completedChallenges.length > 0 ? completedChallenges.map((challenge) => (
              <img
                key={challenge.id}
                className="size-[clamp(2.125rem,3.2vw,2.75rem)] object-contain drop-shadow-[0_0.125rem_0_#17233f]"
                src={CHALLENGE_ART_SOURCES[challenge.id]}
                alt={challenge.title}
                title={challenge.title}
                draggable={false}
              />
            )) : <strong className="text-sm">0 / {CHALLENGES.length}</strong>}
          </button>

          <div className="flex items-center justify-center gap-2 text-center">
            <img className="size-16 object-contain" src={COMPLETION_ART_SOURCES.celebration} alt="" draggable={false} />
            <h2 id="completion-title" className="m-0 text-[clamp(2.125rem,3.2vw,2.875rem)] leading-none tracking-[-0.05em]">Šventė pavyko!</h2>
            <img className="size-16 -scale-x-100 object-contain" src={COMPLETION_ART_SOURCES.celebration} alt="" draggable={false} />
          </div>

          <button
            className="flex min-w-0 min-h-11 items-center justify-end gap-2 rounded-lg outline-none focus-visible:outline-[0.25rem] focus-visible:outline-yellow active:translate-y-0.5"
            type="button"
            onClick={actions.onOpenEvents}
            aria-label={`Atverti netikėtus įvykius. Aktyvių įvykių: ${activeEvents.length}.`}
          >
            {activeEvents.map((event) => (
              <img
                key={event.id}
                className="size-[clamp(2.125rem,3.2vw,2.75rem)] object-contain drop-shadow-[0_0.125rem_0_#17233f]"
                src={EVENT_ART_SOURCES[event.id]}
                alt={event.title}
                title={event.title}
                draggable={false}
              />
            ))}
          </button>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid h-full min-h-[29rem] grid-cols-[minmax(0,1fr)_minmax(0,1fr)] divide-x-[0.125rem] divide-navy/20">
            <div className="grid min-w-0 grid-rows-2 divide-y-[0.125rem] divide-navy/20">
              <ResourceDecision
                title="Gendantis maistas"
                amount={!hasSpoilingFood ? "Nebuvo" : !hasSpoilingLeftovers ? "Tik trupiniai" : `${plan.spoilingSnackLeftovers} porc.`}
                art={spoilingFoodArt}
                options={spoilingFoodOptions}
                actionArt={foodActionArt}
                choice={spoilingFoodChoice}
                onChoice={actions.onSpoilingFoodChoice}
              />
              <ResourceDecision
                title="Išsilaikantis maistas"
                amount={!hasLongLastingFood ? "Nebuvo" : !hasLongLastingLeftovers ? "Neliko" : `${plan.longLastingSnackLeftovers} porc.`}
                art={hasLongLastingLeftovers ? "long-lasting-leftovers" : "empty-long-lasting-food-box"}
                options={longLastingFoodOptions}
                actionArt={longLastingFoodActionArt}
                choice={longLastingFoodChoice}
                onChoice={actions.onLongLastingFoodChoice}
              />
            </div>
            <MoneyDecision
              unallocated={completion.unallocatedMoney}
              hasDepositBottles={selectedItemIds.has("limonado-buteliukai")}
              reusableItems={completion.availableReusableItems}
              upgrades={completion.availableUpgrades}
              projects={completion.fundableProjects}
              projectProgress={projectProgress}
              allocation={moneyAllocation}
              onToggleFertilizer={actions.onToggleFertilizer}
              onToggleReusable={actions.onToggleReusablePurchase}
              onToggleUpgrade={actions.onToggleUpgradePurchase}
              onToggleProject={actions.onToggleProjectFunding}
            />
          </div>
        </main>

        <footer className="flex shrink-0 items-center justify-between gap-4 border-t-[0.125rem] border-navy/20 px-5 py-3">
          <RaisedButton className="justify-self-start px-5 py-3 text-lg" type="button" onClick={actions.onContinue}>
            ← Grįžti prie stalo
          </RaisedButton>

          <div className="flex items-stretch gap-3">
            <DiscussionButton className="min-h-[3.625rem] px-6 text-xl" onClick={actions.onOpenDiscussions} />
            <RaisedButton
              tone="yellow"
              className="min-h-[3.625rem] px-6 text-xl"
              type="button"
              onClick={actions.onNewCelebration}
            >
              {completion.startsWholeSchoolCelebration ? "Rengti didžiąją šventę →" : "Rengti kitą šventę →"}
            </RaisedButton>
          </div>
        </footer>
        </section>
      </div>
    </div>
  );
}
