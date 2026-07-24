import { useState } from "react";
import { DISCUSSION_CARDS, type DiscussionCard } from "./discussions";
import {
  BASE_BUDGET,
  BASE_PARTICIPANTS,
  TEACHER_BUDGET_RANGE,
  TEACHER_PARTICIPANT_RANGE,
  type EventId,
  type GameItem,
  type ProjectId,
  type UpgradeId,
} from "./domain/catalog";
import { deriveCompletionView, deriveGameView } from "./domain/derive";
import {
  addItem,
  adjustBudget,
  adjustParticipants,
  advanceCelebration,
  flipAllEvents,
  removeItem,
  toggleEvent,
  toggleFertilizerAllocation,
  toggleProjectAllocation,
  toggleReusableAllocation,
  toggleShoppingCardDiscount,
  toggleUpgradeAllocation,
  type GameSession,
} from "./domain/session";
import type { FoodLeftoverChoice, LongLastingFoodLeftoverChoice } from "./domain/model";
import { emptyCompletionDecisions, type MissionState } from "./mission";

export function useGameSession(initialState: MissionState) {
  const [missionState, setMissionState] = useState(initialState);
  const [finishAttempted, setFinishAttempted] = useState(false);
  const { session, completionDecisions, revealedDiscussionIds } = missionState;
  const view = deriveGameView(session);
  const completion = deriveCompletionView(session, view, completionDecisions.moneyAllocation);

  function changeRound(update: (current: GameSession) => GameSession) {
    setMissionState((current) => {
      const nextSession = update(current.session);
      return {
        ...current,
        session: nextSession,
        completionDecisions: emptyCompletionDecisions(),
        eventCardsCue: current.eventCardsCue === "waiting" && deriveGameView(nextSession).problems.length === 0
          ? "bouncing"
          : current.eventCardsCue,
      };
    });
    setFinishAttempted(false);
  }

  function placeItem(item: GameItem) {
    changeRound((current) => addItem(current, item.id));
  }

  function removeItemAt(selectionIndex: number) {
    changeRound((current) => {
      const placement = current.round.selection[selectionIndex];
      if (placement === undefined) throw new Error(`Unknown selection index "${selectionIndex}".`);
      return removeItem(current, placement.placementId);
    });
  }

  function setEvent(eventId: EventId) {
    changeRound((current) => toggleEvent(current, eventId));
  }

  function setAllEvents(faceUp: boolean) {
    changeRound((current) => flipAllEvents(current, faceUp));
  }

  function checkPlan(): boolean {
    setFinishAttempted(true);
    return view.problems.length === 0;
  }

  function organizeNextCelebration() {
    setMissionState((current) => ({
      ...current,
      session: advanceCelebration(current.session, current.completionDecisions),
      completionDecisions: emptyCompletionDecisions(),
      revealedDiscussionIds: [],
    }));
    setFinishAttempted(false);
  }

  function setSpoilingFoodChoice(choice: FoodLeftoverChoice | null) {
    setMissionState((current) => ({
      ...current,
      completionDecisions: { ...current.completionDecisions, spoilingFoodChoice: choice },
    }));
  }

  function setLongLastingFoodChoice(choice: LongLastingFoodLeftoverChoice | null) {
    setMissionState((current) => ({
      ...current,
      completionDecisions: { ...current.completionDecisions, longLastingFoodChoice: choice },
    }));
  }

  function revealDiscussion(card: DiscussionCard) {
    setMissionState((current) => current.revealedDiscussionIds.includes(card.id)
      ? current
      : { ...current, revealedDiscussionIds: [...current.revealedDiscussionIds, card.id] });
  }

  function flipAllDiscussions(faceUp: boolean) {
    setMissionState((current) => ({
      ...current,
      revealedDiscussionIds: faceUp ? DISCUSSION_CARDS.map((card) => card.id) : [],
    }));
  }

  function markEventCardsOpened() {
    setMissionState((current) => current.eventCardsCue === "opened"
      ? current
      : { ...current, eventCardsCue: "opened" });
  }

  return {
    missionState,
    session,
    view,
    completion,
    visibleProblems: finishAttempted ? view.problems : [],
    completionDecisions,
    revealedDiscussionIds,
    actions: {
      placeItem,
      toggleShoppingCardDiscount: (item: GameItem) => changeRound((current) => toggleShoppingCardDiscount(current, item.id)),
      removeItemAt,
      toggleEvent: setEvent,
      flipAllEvents: setAllEvents,
      adjustBudget: (change: -1 | 1) => changeRound((current) => adjustBudget(current, change)),
      adjustParticipants: (change: -1 | 1) => changeRound((current) => adjustParticipants(current, change)),
      dismissProblems: () => setFinishAttempted(false),
      checkPlan,
      setSpoilingFoodChoice,
      setLongLastingFoodChoice,
      toggleReusablePurchase: (item: GameItem) => setMissionState((current) => ({
        ...current,
        completionDecisions: {
          ...current.completionDecisions,
          moneyAllocation: toggleReusableAllocation(current.session, current.completionDecisions.moneyAllocation, item.id),
        },
      })),
      toggleUpgradePurchase: (upgradeId: UpgradeId) => setMissionState((current) => ({
        ...current,
        completionDecisions: {
          ...current.completionDecisions,
          moneyAllocation: toggleUpgradeAllocation(current.session, current.completionDecisions.moneyAllocation, upgradeId),
        },
      })),
      toggleFertilizer: () => setMissionState((current) => ({
        ...current,
        completionDecisions: {
          ...current.completionDecisions,
          moneyAllocation: toggleFertilizerAllocation(current.session, current.completionDecisions.moneyAllocation),
        },
      })),
      toggleProjectFunding: (projectId: ProjectId) => setMissionState((current) => ({
        ...current,
        completionDecisions: {
          ...current.completionDecisions,
          moneyAllocation: toggleProjectAllocation(current.session, current.completionDecisions.moneyAllocation, projectId),
        },
      })),
      revealDiscussion,
      flipAllDiscussions,
      markEventCardsOpened,
      organizeNextCelebration,
    },
    limits: {
      canDecreaseBudget: BASE_BUDGET + session.round.budgetAdjustment > TEACHER_BUDGET_RANGE.min,
      canIncreaseBudget: BASE_BUDGET + session.round.budgetAdjustment < TEACHER_BUDGET_RANGE.max,
      canDecreaseParticipants: BASE_PARTICIPANTS + session.round.participantAdjustment > TEACHER_PARTICIPANT_RANGE.min,
      canIncreaseParticipants: BASE_PARTICIPANTS + session.round.participantAdjustment < TEACHER_PARTICIPANT_RANGE.max,
    },
  };
}
