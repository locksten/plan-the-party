import type { DiscussionId } from "./discussions";
import { emptyMoneyAllocation } from "./domain/catalog";
import { createGameSession, type CompletionDecisions, type GameSession } from "./domain/session";

export type MissionState = Readonly<{
  session: GameSession;
  completionDecisions: CompletionDecisions;
  revealedDiscussionIds: readonly DiscussionId[];
  eventCardsCue: "waiting" | "bouncing" | "opened";
}>;

export function emptyCompletionDecisions(): CompletionDecisions {
  return {
    spoilingFoodChoice: null,
    longLastingFoodChoice: null,
    moneyAllocation: emptyMoneyAllocation(),
  };
}

export function createMissionState(): MissionState {
  return {
    session: createGameSession(),
    completionDecisions: emptyCompletionDecisions(),
    revealedDiscussionIds: [],
    eventCardsCue: "waiting",
  };
}
