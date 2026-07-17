import { useEffect, useState } from "react";
import { CompletionScreen } from "./CompletionScreen";
import { DiscussionDialog, EventDialog } from "./dialogs/CardDialogs";
import { ChallengeDialog } from "./dialogs/ChallengeDialog";
import { HelpDialog } from "./dialogs/HelpDialog";
import { SettingsDialog } from "./dialogs/SettingsDialog";
import { PlanScreen } from "./game/PlanScreen";
import type { CategoryId } from "../domain";
import { saveMission, type ActiveMission } from "../missionStorage";
import { formatPlanProblem } from "../ui";
import { useGameSession } from "../useGameSession";

type Overlay =
  | "help"
  | "events"
  | "challenges"
  | "discussions"
  | "settings"
  | "completion"
  | "completion-events"
  | "completion-challenges"
  | "completion-discussions";

type MissionGameProps = Readonly<{
  mission: ActiveMission;
  onHome: () => void;
  onFullscreen: () => void;
}>;

export function MissionGame({ mission, onHome, onFullscreen }: MissionGameProps) {
  const [category, setCategory] = useState<CategoryId>("gerimai");
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const gameSession = useGameSession(mission.state);
  const {
    missionState,
    session,
    view,
    completion,
    completionDecisions,
    revealedDiscussionIds,
    actions,
    limits,
  } = gameSession;
  const problems = gameSession.visibleProblems.map(formatPlanProblem);

  useEffect(() => {
    if (missionState === mission.state) return;
    saveMission(mission.id, missionState);
  }, [mission, missionState]);

  useEffect(() => {
    if (overlay === null) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeOverlay();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [overlay]);

  function closeOverlay() {
    setOverlay((current) => current?.startsWith("completion-") ? "completion" : null);
  }

  function checkPlan() {
    if (actions.checkPlan()) setOverlay("completion");
  }

  function openEventCards(eventOverlay: "events" | "completion-events") {
    actions.markEventCardsOpened();
    setOverlay(eventOverlay);
  }

  function organizeNextCelebration() {
    actions.organizeNextCelebration();
    setCategory("gerimai");
    setOverlay(null);
  }

  return (
    <div className="min-h-dvh text-navy">
      <PlanScreen
        key={session.campaign.celebrationNumber}
        view={{
          game: view.game,
          plan: view.plan,
          placements: view.placements,
          selectedItemIds: view.selectedItemIds,
          addableItemIds: view.addableItemIds,
          category,
          problems,
          completedChallengeIds: view.completedChallengeIds,
          activeEventIds: session.round.activeEventIds,
          revealedEventIds: session.round.revealedEventIds,
          eventCardsNeedAttention: missionState.eventCardsCue === "bouncing",
          metaStatus: view.metaStatus,
        }}
        actions={{
          onCategory: setCategory,
          onPlace: actions.placeItem,
          onToggleShoppingCardDiscount: actions.toggleShoppingCardDiscount,
          onRemoveAt: actions.removeItemAt,
          onOpenEvents: () => openEventCards("events"),
          onOpenChallenges: () => setOverlay("challenges"),
          onOpenDiscussions: () => setOverlay("discussions"),
          onOpenSettings: () => setOverlay("settings"),
          onDismissProblems: actions.dismissProblems,
          onCheck: checkPlan,
          onHome,
          onHelp: () => setOverlay("help"),
          onFullscreen,
        }}
      />

      {overlay === "help" && <HelpDialog onClose={closeOverlay} />}
      {overlay === "events" && (
        <EventDialog
          activeEventIds={session.round.activeEventIds}
          revealedEventIds={session.round.revealedEventIds}
          onToggle={actions.toggleEvent}
          onFlipAll={actions.flipAllEvents}
          onClose={closeOverlay}
        />
      )}
      {overlay === "challenges" && (
        <ChallengeDialog completedChallengeIds={view.completedChallengeIds} onClose={closeOverlay} />
      )}
      {overlay === "settings" && (
        <SettingsDialog
          budget={view.plan.budget}
          participants={view.plan.participants}
          {...limits}
          onBudgetChange={actions.adjustBudget}
          onParticipantChange={actions.adjustParticipants}
          onClose={closeOverlay}
        />
      )}
      {(overlay === "completion" || overlay?.startsWith("completion-")) && (
        <CompletionScreen
          view={{
            plan: view.plan,
            activeEvents: view.activeEvents,
            completedChallenges: view.completedChallenges,
            completion,
            projectProgress: session.campaign.projectProgress,
            selectedItemIds: view.selectedItemIds,
          }}
          decisions={completionDecisions}
          actions={{
            onSpoilingFoodChoice: actions.setSpoilingFoodChoice,
            onLongLastingFoodChoice: actions.setLongLastingFoodChoice,
            onToggleReusablePurchase: actions.toggleReusablePurchase,
            onToggleUpgradePurchase: actions.toggleUpgradePurchase,
            onToggleFertilizer: actions.toggleFertilizer,
            onToggleProjectFunding: actions.toggleProjectFunding,
            onNewCelebration: organizeNextCelebration,
            onOpenChallenges: () => setOverlay("completion-challenges"),
            onOpenEvents: () => openEventCards("completion-events"),
            onOpenDiscussions: () => setOverlay("completion-discussions"),
            onContinue: () => setOverlay(null),
          }}
        />
      )}
      {overlay === "completion-events" && (
        <EventDialog
          readOnly
          activeEventIds={session.round.activeEventIds}
          revealedEventIds={session.round.revealedEventIds}
          onClose={closeOverlay}
        />
      )}
      {overlay === "completion-challenges" && (
        <ChallengeDialog completedChallengeIds={view.completedChallengeIds} onClose={closeOverlay} />
      )}
      {(overlay === "discussions" || overlay === "completion-discussions") && (
        <DiscussionDialog
          revealedDiscussionIds={revealedDiscussionIds}
          onReveal={actions.revealDiscussion}
          onFlipAll={actions.flipAllDiscussions}
          onClose={closeOverlay}
        />
      )}
    </div>
  );
}
