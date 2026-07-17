import {
  BASE_BUDGET,
  BASE_PARTICIPANTS,
  EVENTS,
  FERTILIZER_COST,
  MAX_PLANT_GROWTH,
  PROJECT_ALLOCATION_STEP,
  PROJECT_IDS,
  TEACHER_BUDGET_RANGE,
  TEACHER_PARTICIPANT_RANGE,
  emptyProjectProgress,
  projectComplete,
  projectDefinition,
  upgradeDefinition,
  type EventId,
  type ItemId,
  type MoneyAllocation,
  type ProjectId,
  type ProjectProgress,
  type Selection,
  type UpgradeId,
} from "./catalog";
import {
  canAddItem,
  completionFunds,
  deriveGameView,
  moneyAllocationTotal,
} from "./derive";
import type {
  CarryoverResource,
  FoodLeftoverChoice,
  LongLastingFoodLeftoverChoice,
} from "./model";

type CampaignState = Readonly<{
  celebrationNumber: number;
  carryoverResources: readonly CarryoverResource[];
  ownedReusableItemIds: readonly ItemId[];
  ownedUpgradeIds: readonly UpgradeId[];
  projectProgress: ProjectProgress;
  plantGrowth: number;
  wholeSchoolCelebration: boolean;
}>;

type RoundState = Readonly<{
  selection: Selection;
  nextPlacementId: number;
  shoppingCardItemId: ItemId | null;
  activeEventIds: readonly EventId[];
  revealedEventIds: readonly EventId[];
  budgetAdjustment: number;
  participantAdjustment: number;
}>;

export type GameSession = Readonly<{
  campaign: CampaignState;
  round: RoundState;
}>;

export type CompletionDecisions = Readonly<{
  spoilingFoodChoice: FoodLeftoverChoice | null;
  longLastingFoodChoice: LongLastingFoodLeftoverChoice | null;
  moneyAllocation: MoneyAllocation;
}>;

export function createGameSession(): GameSession {
  return {
    campaign: {
      celebrationNumber: 1,
      carryoverResources: [],
      ownedReusableItemIds: [],
      ownedUpgradeIds: [],
      projectProgress: emptyProjectProgress(),
      plantGrowth: 0,
      wholeSchoolCelebration: false,
    },
    round: {
      selection: [],
      nextPlacementId: 1,
      shoppingCardItemId: null,
      activeEventIds: [],
      revealedEventIds: [],
      budgetAdjustment: 0,
      participantAdjustment: 0,
    },
  };
}

export function addItem(session: GameSession, itemId: ItemId): GameSession {
  const { game } = deriveGameView(session);
  const item = game.items.find((candidate) => candidate.id === itemId);
  if (item === undefined) throw new Error(`Nežinoma prekė „${itemId}“.`);
  if (!canAddItem(game, session.round.selection, item)) return session;

  const placement = { placementId: session.round.nextPlacementId, itemId };
  return {
    ...session,
    round: {
      ...session.round,
      selection: [...session.round.selection, placement],
      nextPlacementId: session.round.nextPlacementId + 1,
    },
  };
}

export function removeItem(session: GameSession, placementId: number): GameSession {
  const selection = session.round.selection.filter((entry) => entry.placementId !== placementId);
  if (selection.length === session.round.selection.length) throw new Error(`Nežinoma pasirinkimo vieta „${placementId}“.`);
  return { ...session, round: { ...session.round, selection } };
}

export function toggleShoppingCardDiscount(session: GameSession, itemId: ItemId): GameSession {
  if (!projectComplete(session.campaign.projectProgress, "shopping-card")) {
    throw new Error("Pirkėjo kortelę galima naudoti tik ją įsigijus.");
  }
  const item = deriveGameView(session).game.items.find((candidate) => candidate.id === itemId);
  if (item === undefined) throw new Error(`Nežinoma prekė „${itemId}“.`);
  if (session.round.shoppingCardItemId === itemId) {
    return { ...session, round: { ...session.round, shoppingCardItemId: null } };
  }
  const priceBeforeDiscount = item.price + (item.shoppingCardDiscount ?? 0);
  if (priceBeforeDiscount === 0) {
    throw new Error("Pirkėjo kortelės nuolaida taikoma tik mokamai prekei.");
  }
  return { ...session, round: { ...session.round, shoppingCardItemId: itemId } };
}

export function toggleEvent(session: GameSession, eventId: EventId): GameSession {
  const active = session.round.activeEventIds.includes(eventId);
  const event = EVENTS.find((candidate) => candidate.id === eventId);
  if (event === undefined) throw new Error(`Nežinomas įvykis „${eventId}“.`);
  const discountTargetBecomesFree = !active && event.effects.some(
    (effect) => effect.kind === "borrowedItem" && effect.itemId === session.round.shoppingCardItemId,
  );
  return {
    ...session,
    round: {
      ...session.round,
      shoppingCardItemId: discountTargetBecomesFree ? null : session.round.shoppingCardItemId,
      revealedEventIds: session.round.revealedEventIds.includes(eventId)
        ? session.round.revealedEventIds
        : [...session.round.revealedEventIds, eventId],
      activeEventIds: active
        ? session.round.activeEventIds.filter((id) => id !== eventId)
        : [...session.round.activeEventIds, eventId],
    },
  };
}

export function flipAllEvents(session: GameSession, faceUp: boolean): GameSession {
  return {
    ...session,
    round: {
      ...session.round,
      revealedEventIds: faceUp ? EVENTS.map((event) => event.id) : [],
      activeEventIds: faceUp ? session.round.activeEventIds : [],
    },
  };
}

export function adjustBudget(session: GameSession, change: -1 | 1): GameSession {
  const next = BASE_BUDGET + session.round.budgetAdjustment + change;
  if (next < TEACHER_BUDGET_RANGE.min || next > TEACHER_BUDGET_RANGE.max) return session;
  return { ...session, round: { ...session.round, budgetAdjustment: session.round.budgetAdjustment + change } };
}

export function adjustParticipants(session: GameSession, change: -1 | 1): GameSession {
  const next = BASE_PARTICIPANTS + session.round.participantAdjustment + change;
  if (next < TEACHER_PARTICIPANT_RANGE.min || next > TEACHER_PARTICIPANT_RANGE.max) return session;
  return { ...session, round: { ...session.round, participantAdjustment: session.round.participantAdjustment + change } };
}

export function advanceCelebration(session: GameSession, decisions: CompletionDecisions): GameSession {
  const view = deriveGameView(session);
  if (view.problems.length > 0) throw new Error("Negalima pradėti naujos šventės, kol dabartinis planas nebaigtas.");

  const remainingMoney = completionFunds(view.plan);
  if (moneyAllocationTotal(view.game, decisions.moneyAllocation) > remainingMoney) {
    throw new Error("Paskirstyta daugiau pinigų, nei jų liko.");
  }
  if (decisions.spoilingFoodChoice === "kompostuoti" && !session.campaign.ownedUpgradeIds.includes("compost-bin")) {
    throw new Error("Kompostuoti galima tik turint komposto dėžę.");
  }
  if (decisions.spoilingFoodChoice === "kompostuoti" && view.plan.spoilingSnackPortions === 0) {
    throw new Error("Nėra gendančio maisto, kurį būtų galima kompostuoti.");
  }

  const nextProjectProgress = PROJECT_IDS.reduce<ProjectProgress>((progress, projectId) => {
    const allocatedAmount = decisions.moneyAllocation.projectAmounts[projectId];
    if (!Number.isInteger(allocatedAmount) || allocatedAmount < 0) {
      throw new Error(`Projektui „${projectId}“ skiriama suma turi būti neneigiama sveikoji suma.`);
    }
    const amount = session.campaign.projectProgress[projectId] + allocatedAmount;
    if (amount > projectDefinition(projectId).target) throw new Error(`Projektui „${projectId}“ paskirta per daug pinigų.`);
    return { ...progress, [projectId]: amount };
  }, emptyProjectProgress());
  const startsWholeSchoolCelebration = projectComplete(nextProjectProgress, "large-celebration");
  const storedProjectProgress = startsWholeSchoolCelebration
    ? { ...nextProjectProgress, "large-celebration": 0 }
    : nextProjectProgress;

  const carryoverResources: readonly CarryoverResource[] =
    decisions.longLastingFoodChoice === "pasilikti-kitai-sventei" && view.plan.longLastingSnackLeftovers > 0
      ? [{ kind: "long-lasting-snack-portions", amount: view.plan.longLastingSnackLeftovers, sourceCelebration: session.campaign.celebrationNumber }]
      : [];

  const selectedIds = new Set(session.round.selection.map((entry) => entry.itemId));
  const boughtDuringPlanning = view.game.items
    .filter((item) => item.reusable === true && item.price > 0 && selectedIds.has(item.id))
    .map((item) => item.id);

  return {
    campaign: {
      celebrationNumber: session.campaign.celebrationNumber + 1,
      carryoverResources,
      ownedReusableItemIds: [...new Set([
        ...session.campaign.ownedReusableItemIds,
        ...boughtDuringPlanning,
        ...decisions.moneyAllocation.reusableItemIds,
      ])],
      ownedUpgradeIds: [...new Set([
        ...session.campaign.ownedUpgradeIds,
        ...decisions.moneyAllocation.upgradeIds,
      ])],
      projectProgress: storedProjectProgress,
      plantGrowth: Math.min(
        MAX_PLANT_GROWTH,
        session.campaign.plantGrowth
          + Number(decisions.spoilingFoodChoice === "kompostuoti")
          + Number(decisions.moneyAllocation.fertilizer),
      ),
      wholeSchoolCelebration: startsWholeSchoolCelebration,
    },
    round: {
      selection: [],
      nextPlacementId: session.round.nextPlacementId,
      shoppingCardItemId: null,
      activeEventIds: [],
      revealedEventIds: [],
      budgetAdjustment: session.round.budgetAdjustment,
      participantAdjustment: session.round.participantAdjustment,
    },
  };
}

export function toggleReusableAllocation(
  session: GameSession,
  allocation: MoneyAllocation,
  itemId: ItemId,
): MoneyAllocation {
  const selected = allocation.reusableItemIds.includes(itemId);
  if (selected) return { ...allocation, reusableItemIds: allocation.reusableItemIds.filter((id) => id !== itemId) };

  const view = deriveGameView(session);
  const item = view.game.items.find((candidate) => candidate.id === itemId);
  if (item?.reusable !== true || item.price <= 0) throw new Error(`Daikto „${itemId}“ negalima pirkti po šventės.`);
  if (moneyAllocationTotal(view.game, allocation) + item.price > completionFunds(view.plan)) {
    throw new Error(`Daugkartiniam daiktui „${itemId}“ neužtenka nepaskirstytų pinigų.`);
  }
  return { ...allocation, reusableItemIds: [...allocation.reusableItemIds, itemId] };
}

export function toggleFertilizerAllocation(
  session: GameSession,
  allocation: MoneyAllocation,
): MoneyAllocation {
  if (allocation.fertilizer) return { ...allocation, fertilizer: false };
  const view = deriveGameView(session);
  if (moneyAllocationTotal(view.game, allocation) + FERTILIZER_COST > completionFunds(view.plan)) {
    throw new Error("Trąšoms neužtenka nepaskirstytų pinigų.");
  }
  return { ...allocation, fertilizer: true };
}

export function toggleUpgradeAllocation(
  session: GameSession,
  allocation: MoneyAllocation,
  upgradeId: UpgradeId,
): MoneyAllocation {
  if (session.campaign.ownedUpgradeIds.includes(upgradeId)) throw new Error(`Patobulinimas „${upgradeId}“ jau įsigytas.`);
  if (allocation.upgradeIds.includes(upgradeId)) {
    return { ...allocation, upgradeIds: allocation.upgradeIds.filter((id) => id !== upgradeId) };
  }

  const view = deriveGameView(session);
  const upgrade = upgradeDefinition(upgradeId);
  if (moneyAllocationTotal(view.game, allocation) + upgrade.price > completionFunds(view.plan)) {
    throw new Error(`Patobulinimui „${upgradeId}“ neužtenka nepaskirstytų pinigų.`);
  }
  return { ...allocation, upgradeIds: [...allocation.upgradeIds, upgradeId] };
}

export function toggleProjectAllocation(
  session: GameSession,
  allocation: MoneyAllocation,
  projectId: ProjectId,
): MoneyAllocation {
  const view = deriveGameView(session);
  const current = allocation.projectAmounts[projectId];
  const progress = session.campaign.projectProgress[projectId];
  const target = projectDefinition(projectId).target;
  if (![current, progress, target].every(Number.isInteger) || current < 0 || progress < 0 || target <= 0) {
    throw new Error(`Projekto „${projectId}“ eiga turi būti neneigiama sveikoji suma.`);
  }
  if (progress + current > target) throw new Error(`Projektui „${projectId}“ jau skirta per daug pinigų.`);

  const availableFunds = completionFunds(view.plan) - moneyAllocationTotal(view.game, allocation);
  if (availableFunds < 0) throw new Error("Paskirstyta daugiau pinigų, nei jų liko.");
  const increment = Math.min(PROJECT_ALLOCATION_STEP, target - progress - current, availableFunds);
  return changeProjectAllocation(allocation, projectId, increment > 0 ? current + increment : 0);
}

function changeProjectAllocation(
  allocation: MoneyAllocation,
  projectId: ProjectId,
  amount: number,
): MoneyAllocation {
  if (!Number.isInteger(amount) || amount < 0) throw new Error("Projektui skiriama suma turi būti neneigiama.");
  return { ...allocation, projectAmounts: { ...allocation.projectAmounts, [projectId]: amount } };
}
