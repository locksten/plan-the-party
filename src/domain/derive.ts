import {
  BASE_BUDGET,
  BASE_PARTICIPANTS,
  CHALLENGES,
  EVENTS,
  ITEMS,
  FERTILIZER_COST,
  LARGE_CELEBRATION,
  MAX_REPEATABLE_ITEMS_PER_CATEGORY,
  PLANT_ITEM_UNLOCK_STAGE,
  PROGRESSION_ITEMS,
  PROJECTS,
  PROJECT_IDS,
  UPGRADES,
  SHOPPING_CARD_DISCOUNT,
  projectComplete,
  projectDefinition,
  upgradeDefinition,
  type Challenge,
  type ChallengeId,
  type EventCard,
  type EventId,
  type ItemId,
  type MoneyAllocation,
  type GameConfig,
  type GameItem,
  type Selection,
} from "./catalog";
import { assert } from "../assert";
import type {
  ChallengeCard,
  GamePlan,
  PlanProblem,
  RoundEffects,
  ValueBreakdown,
  ValueModifier,
} from "./model";
import type { GameSession } from "./session";

export type GameView = Readonly<{
  game: GameConfig;
  plan: GamePlan;
  problems: readonly PlanProblem[];
  completedChallengeIds: ReadonlySet<ChallengeId>;
  completedChallenges: readonly Challenge[];
  activeEvents: readonly EventCard[];
  placements: readonly ResolvedPlacement[];
  selectedItemIds: ReadonlySet<ItemId>;
  addableItemIds: ReadonlySet<ItemId>;
  metaStatus: MetaStatus;
}>;

export type ResolvedPlacement = Readonly<{
  placementId: number;
  selectionIndex: number;
  item: GameItem;
}>;

export type MetaStatus = Readonly<{
  wholeSchoolCelebration: boolean;
  compostBinOwned: boolean;
  shoppingCardOwned: boolean;
  plantGrowth: number;
}>;

const eventById = new Map<EventId, EventCard>(EVENTS.map((event) => [event.id, event]));

function getEvent(id: EventId): EventCard {
  const event = eventById.get(id);
  if (event === undefined) throw new Error(`Nežinomas įvykis „${id}“.`);
  return event;
}

export function summarizeEventEffects(activeEventIds: readonly EventId[]): RoundEffects {
  const budgetModifiers: ValueModifier[] = [];
  const participantModifiers: ValueModifier[] = [];
  const borrowedItemIds = new Set<string>();
  let hypeSurcharge = 0;
  let pouredDrinkSurcharge = 0;
  let drinkPortionsLost = 0;
  let snackPortionsAdded = 0;
  let minimumActivities = 1;
  let minimumDecorations = 0;

  for (const eventId of activeEventIds) {
    const event = getEvent(eventId);
    for (const [index, effect] of event.effects.entries()) {
      const modifierId = `event:${event.id}:${index}`;
      switch (effect.kind) {
        case "budgetBonus":
          budgetModifiers.push({ id: modifierId, label: event.title, amount: effect.amount, source: "event" });
          break;
        case "participants":
          participantModifiers.push({ id: modifierId, label: event.title, amount: effect.amount, source: "event" });
          break;
        case "drinkLoss":
          drinkPortionsLost += effect.amount;
          break;
        case "hypeSurcharge":
          hypeSurcharge += effect.amount;
          break;
        case "pouredDrinkSurcharge":
          pouredDrinkSurcharge += effect.amount;
          break;
        case "snackBonus":
          snackPortionsAdded += effect.amount;
          break;
        case "borrowedItem":
          borrowedItemIds.add(effect.itemId);
          break;
        case "minimumChoices":
          if (effect.category === "veikla") minimumActivities = Math.max(minimumActivities, effect.count);
          else minimumDecorations = Math.max(minimumDecorations, effect.count);
          break;
      }
    }
  }

  return {
    budgetModifiers,
    participantModifiers,
    hypeSurcharge,
    pouredDrinkSurcharge,
    drinkPortionsLost,
    snackPortionsAdded,
    borrowedItemIds,
    minimumActivities,
    minimumDecorations,
  };
}

function addSurcharge(item: GameItem, amount: number): GameItem {
  if (amount === 0 || item.price === 0) return item;
  return {
    ...item,
    originalPrice: item.originalPrice ?? item.price,
    price: item.price + amount,
  };
}

function addShoppingCardDiscount(item: GameItem): GameItem {
  assert(item.price > 0, "Pirkėjo kortelės nuolaida netaikoma nemokamai prekei.");
  const discount = Math.min(SHOPPING_CARD_DISCOUNT, item.price);
  return {
    ...item,
    price: item.price - discount,
    shoppingCardDiscount: discount,
    tags: [...(item.tags ?? []), { label: `KORTELĖ −${discount} €`, tone: "standard" }],
  };
}

function resolveItems(session: GameSession, effects: RoundEffects): readonly GameItem[] {
  const selectedSelfMadeItemIds = new Set<string>();
  for (const entry of session.round.selection) {
    const item = ITEMS.find((candidate) => candidate.id === entry.itemId);
    if (item !== undefined && "selfMade" in item && item.selfMade === true) selectedSelfMadeItemIds.add(item.id);
  }
  assert(selectedSelfMadeItemIds.size <= 1, "Vienai šventei galima pasirinkti tik vieną pačių ruošiamą dalyką.");
  const selectedSelfMadeItemId = selectedSelfMadeItemIds.values().next().value;
  const musicSystemOwned = projectComplete(session.campaign.projectProgress, "music-system");
  const plantItemUnlocked = session.campaign.plantGrowth + 1 >= PLANT_ITEM_UNLOCK_STAGE;
  const progressionItems: readonly GameItem[] = PROGRESSION_ITEMS.map((item) => {
    if (item.id === "karaokes-scena") {
      return {
        ...item,
        tags: musicSystemOwned ? [{ label: "TURIME", tone: "standard" as const }] : undefined,
        locked: !musicSystemOwned,
      };
    }
    return {
      ...item,
      tags: [{ label: plantItemUnlocked ? "KANTRYBĖ ATSIPIRKO!" : "KANTRYBĖS", tone: "standard" as const }],
      locked: !plantItemUnlocked,
    };
  });
  const ownedIds = new Set<string>(session.campaign.ownedReusableItemIds);
  const shoppingCardOwned = projectComplete(session.campaign.projectProgress, "shopping-card");
  const shoppingCardItemId = session.round.shoppingCardItemId;
  assert(shoppingCardOwned || shoppingCardItemId === null, "Neįsigyta pirkėjo kortelė negali būti priskirta prekei.");

  return [...ITEMS, ...progressionItems].map((definition): GameItem => {
    let item: GameItem = definition;
    if (item.selfMade === true && selectedSelfMadeItemId !== undefined && item.id !== selectedSelfMadeItemId) {
      item = { ...item, tags: [{ label: "NELIKO LAIKO", tone: "standard" }] };
    }
    if (ownedIds.has(item.id)) item = { ...item, price: 0, tags: [{ label: "TURIME", tone: "standard" }] };
    if (effects.borrowedItemIds.has(item.id) && item.price > 0) {
      const hypeTags = item.tags?.filter((tag) => tag.tone === "hype") ?? [];
      item = { ...item, price: 0, borrowed: true, tags: [{ label: "PASISKOLINOME", tone: "standard" }, ...hypeTags] };
    }
    if (item.hype === true) item = addSurcharge(item, effects.hypeSurcharge);
    if (item.drinkServing === "poured") item = addSurcharge(item, effects.pouredDrinkSurcharge);
    if (item.id === shoppingCardItemId) item = addShoppingCardDiscount(item);
    return item;
  });
}

function valueBreakdown(base: number, modifiers: readonly ValueModifier[]): ValueBreakdown {
  return { base, modifiers, total: modifiers.reduce((total, modifier) => total + modifier.amount, base) };
}

function balancedSnackLeftovers(spoiling: number, longLasting: number, needed: number) {
  const used = Math.min(needed, spoiling + longLasting);
  const smallerHalf = Math.floor(used / 2);
  const preferredSpoilingUse = spoiling > longLasting ? used - smallerHalf : smallerHalf;
  let spoilingUsed = Math.min(spoiling, preferredSpoilingUse);
  const longLastingUsed = Math.min(longLasting, used - spoilingUsed);
  spoilingUsed += Math.min(spoiling - spoilingUsed, used - spoilingUsed - longLastingUsed);
  return { spoiling: spoiling - spoilingUsed, longLasting: longLasting - longLastingUsed };
}

function derivePlan(session: GameSession, game: GameConfig, effects: RoundEffects): GamePlan {
  const quantities = new Map<string, number>();
  for (const entry of session.round.selection) quantities.set(entry.itemId, (quantities.get(entry.itemId) ?? 0) + 1);

  let spent = 0;
  let drinkPortions = 0;
  let spoilingSnackPortions = effects.snackPortionsAdded;
  const carriedSnackPortions = session.campaign.carryoverResources.reduce((total, resource) => total + resource.amount, 0);
  let longLastingSnackPortions = carriedSnackPortions;
  let depositRefund = 0;
  let activityChoices = 0;
  let decorationChoices = 0;
  let drinkVariety = 0;
  let snackVariety = 0;

  for (const item of game.items) {
    const quantity = quantities.get(item.id) ?? 0;
    if (quantity === 0) continue;
    spent += item.price * quantity;
    depositRefund += (item.depositRefund ?? 0) * quantity;
    switch (item.category) {
      case "gerimai":
        drinkPortions += (item.portions ?? 0) * quantity;
        drinkVariety += 1;
        break;
      case "uzkandziai": {
        const portions = (item.portions ?? 0) * quantity;
        if (item.shelfLife === "spoiling") spoilingSnackPortions += portions;
        else longLastingSnackPortions += portions;
        snackVariety += 1;
        break;
      }
      case "veikla":
        activityChoices += 1;
        break;
      case "papildomai":
        decorationChoices += 1;
        break;
    }
  }

  const budgetModifiers = [...effects.budgetModifiers];
  const participantModifiers = [...effects.participantModifiers];
  let requiredActivityChoices = effects.minimumActivities;
  let requiredDecorationChoices = effects.minimumDecorations;
  let requiredDrinkVariety = 0;
  let requiredSnackVariety = 0;

  if (session.campaign.wholeSchoolCelebration) {
    budgetModifiers.unshift({ id: "scenario:whole-school:budget", label: "Visa mokykla prie vieno stalo", amount: LARGE_CELEBRATION.budgetBonus, source: "scenario" });
    participantModifiers.unshift({ id: "scenario:whole-school:participants", label: "Visa mokykla prie vieno stalo", amount: LARGE_CELEBRATION.participantBonus, source: "scenario" });
    requiredActivityChoices = Math.max(requiredActivityChoices, LARGE_CELEBRATION.minimumActivities);
    requiredDecorationChoices = Math.max(requiredDecorationChoices, LARGE_CELEBRATION.minimumDecorations);
    requiredDrinkVariety = LARGE_CELEBRATION.minimumDrinkVariety;
    requiredSnackVariety = LARGE_CELEBRATION.minimumSnackVariety;
  }

  budgetModifiers.push({ id: "teacher:budget", label: "Mokytojo pakeitimas", amount: session.round.budgetAdjustment, source: "teacher" });
  participantModifiers.push({ id: "teacher:participants", label: "Mokytojo pakeitimas", amount: session.round.participantAdjustment, source: "teacher" });
  const budget = valueBreakdown(BASE_BUDGET, budgetModifiers);
  const participants = valueBreakdown(BASE_PARTICIPANTS, participantModifiers);

  const snackPortions = spoilingSnackPortions + longLastingSnackPortions;
  const leftovers = balancedSnackLeftovers(spoilingSnackPortions, longLastingSnackPortions, participants.total);
  return {
    spent,
    budget,
    available: budget.total - spent,
    participants,
    drinkPortions: Math.max(0, drinkPortions - effects.drinkPortionsLost),
    snackPortions,
    carriedSnackPortions,
    eventSuppliedSnackPortions: effects.snackPortionsAdded,
    spoilingSnackPortions,
    longLastingSnackPortions,
    spoilingSnackLeftovers: leftovers.spoiling,
    longLastingSnackLeftovers: leftovers.longLasting,
    depositRefund,
    drinkPortionsLost: effects.drinkPortionsLost,
    activityChoices,
    decorationChoices,
    requiredActivityChoices,
    requiredDecorationChoices,
    drinkVariety,
    snackVariety,
    requiredDrinkVariety,
    requiredSnackVariety,
  };
}

function derivePlanProblems(plan: GamePlan): readonly PlanProblem[] {
  const problems: PlanProblem[] = [];
  if (plan.available < 0) problems.push({ kind: "overBudget", amount: -plan.available });
  if (plan.drinkPortions < plan.participants.total) problems.push({ kind: "missingDrinks", amount: plan.participants.total - plan.drinkPortions });
  if (plan.snackPortions < plan.participants.total) problems.push({ kind: "missingSnacks", amount: plan.participants.total - plan.snackPortions });
  if (plan.drinkVariety < plan.requiredDrinkVariety) problems.push({ kind: "missingDrinkVariety", amount: plan.requiredDrinkVariety });
  if (plan.snackVariety < plan.requiredSnackVariety) problems.push({ kind: "missingSnackVariety", amount: plan.requiredSnackVariety });
  if (plan.activityChoices < plan.requiredActivityChoices) problems.push({ kind: "missingActivities", amount: plan.requiredActivityChoices });
  if (plan.decorationChoices < plan.requiredDecorationChoices) problems.push({ kind: "missingDecorations", amount: plan.requiredDecorationChoices });
  return problems;
}

function challengeCompleted(challenge: ChallengeCard, game: GameConfig, selection: Selection, plan: GamePlan): boolean {
  if (derivePlanProblems(plan).length > 0) return false;
  const itemsById = new Map(game.items.map((item) => [item.id, item]));
  const selectedItems = selection.map((entry) => itemsById.get(entry.itemId)!);

  switch (challenge.rule.kind) {
    case "maximumSurplusPortions":
      return plan.drinkPortions - plan.participants.total <= challenge.rule.drinks
        && plan.snackPortions - plan.participants.total <= challenge.rule.snacks;
    case "minimumVariety":
      return plan.drinkVariety >= challenge.rule.drinkChoices && plan.snackVariety >= challenge.rule.snackChoices;
    case "equalRefreshmentPortions":
      return plan.drinkPortions === plan.snackPortions;
    case "hypeWithRemainingMoney":
      return plan.available >= challenge.rule.minimumRemaining && selectedItems.some((item) => item.hype === true);
    case "reusableWithLongLastingSnack":
      return selectedItems.some((item) => item.reusable === true)
        && selectedItems.some((item) => item.shelfLife === "long-lasting");
    case "exactlyOneAtOrAbovePrice": {
      const minimumPrice = challenge.rule.price;
      return selectedItems.filter((item) => item.price >= minimumPrice).length === 1;
    }
    case "refreshmentsWithinParticipantBudget": {
      const refreshmentSpend = selectedItems
        .filter((item) => item.category === "gerimai" || item.category === "uzkandziai")
        .reduce((sum, item) => sum + item.price, 0);
      return refreshmentSpend <= plan.participants.total;
    }
    case "oneHypeOrMultiplePlainDecorations": {
      const decorations = selectedItems.filter((item) => item.category === "papildomai");
      const oneHypedDecoration = decorations.length === 1 && decorations[0]?.hype === true;
      const multiplePlainDecorations = decorations.length >= 2 && decorations.every((item) => item.hype !== true);
      return oneHypedDecoration || multiplePlainDecorations;
    }
  }
}

export function deriveGameView(session: GameSession): GameView {
  const activeEvents = session.round.activeEventIds.map(getEvent);
  const effects = summarizeEventEffects(session.round.activeEventIds);
  const game = { items: resolveItems(session, effects), mysteryEvents: EVENTS };
  const plan = derivePlan(session, game, effects);
  const problems = derivePlanProblems(plan);
  const completedChallenges = CHALLENGES.filter((challenge) => challengeCompleted(challenge, game, session.round.selection, plan));
  const completedChallengeIds = new Set(completedChallenges.map((challenge) => challenge.id));
  const placements = resolvePlacements(game, session.round.selection);
  const selectedItemIds = new Set(placements.map((placement) => placement.item.id));
  const addableItemIds = new Set(game.items.filter((item) => canAddItem(game, session.round.selection, item)).map((item) => item.id));
  const metaStatus = {
    wholeSchoolCelebration: session.campaign.wholeSchoolCelebration,
    compostBinOwned: session.campaign.ownedUpgradeIds.includes("compost-bin"),
    shoppingCardOwned: projectComplete(session.campaign.projectProgress, "shopping-card"),
    plantGrowth: session.campaign.plantGrowth,
  };
  return { game, plan, problems, completedChallengeIds, completedChallenges, activeEvents, placements, selectedItemIds, addableItemIds, metaStatus };
}

function resolvePlacements(game: GameConfig, selection: Selection): readonly ResolvedPlacement[] {
  const itemsById = new Map(game.items.map((item) => [item.id, item]));
  return selection.map((entry, selectionIndex) => {
    const item = itemsById.get(entry.itemId);
    if (item === undefined) throw new Error(`Pasirinkta nežinoma prekė „${entry.itemId}“.`);
    return { placementId: entry.placementId, selectionIndex, item };
  });
}

function selectionQuantity(selection: Selection, itemId: string): number {
  return selection.reduce((quantity, entry) => quantity + Number(entry.itemId === itemId), 0);
}

export function canAddItem(game: GameConfig, selection: Selection, item: GameItem): boolean {
  if (item.locked === true) return false;
  const itemsById = new Map(game.items.map((candidate) => [candidate.id, candidate]));
  if (item.selfMade === true && selection.some((entry) => itemsById.get(entry.itemId)?.selfMade === true)) return false;
  if (item.category !== "gerimai" && item.category !== "uzkandziai") return selectionQuantity(selection, item.id) === 0;
  const count = selection.reduce((total, entry) => total + Number(itemsById.get(entry.itemId)?.category === item.category), 0);
  return count < MAX_REPEATABLE_ITEMS_PER_CATEGORY;
}

export function completionFunds(plan: GamePlan): number {
  return plan.available + plan.depositRefund;
}

export function moneyAllocationTotal(game: GameConfig, allocation: MoneyAllocation): number {
  const itemsById = new Map(game.items.map((item) => [item.id, item]));
  const reusableCost = allocation.reusableItemIds.reduce((total, itemId) => {
    const item = itemsById.get(itemId);
    if (item?.reusable !== true) throw new Error(`Nežinomas daugkartinis daiktas „${itemId}“.`);
    return total + item.price;
  }, 0);
  const upgradeCost = allocation.upgradeIds.reduce((total, upgradeId) => total + upgradeDefinition(upgradeId).price, 0);
  const fertilizerCost = allocation.fertilizer ? FERTILIZER_COST : 0;
  return reusableCost + upgradeCost + fertilizerCost
    + PROJECT_IDS.reduce((total, projectId) => total + allocation.projectAmounts[projectId], 0);
}

export type CompletionView = Readonly<{
  remainingMoney: number;
  unallocatedMoney: number;
  availableReusableItems: readonly GameItem[];
  availableUpgrades: readonly (typeof UPGRADES)[number][];
  fundableProjects: readonly (typeof PROJECTS)[number][];
  startsWholeSchoolCelebration: boolean;
  canCompost: boolean;
}>;

export function deriveCompletionView(session: GameSession, view: GameView, allocation: MoneyAllocation): CompletionView {
  const remainingMoney = completionFunds(view.plan);
  const selectedIds = new Set(session.round.selection.map((entry) => entry.itemId));
  const availableReusableItems = view.game.items.filter((item) => item.reusable === true
    && item.price > 0
    && item.borrowed !== true
    && !session.campaign.ownedReusableItemIds.includes(item.id)
    && !selectedIds.has(item.id));
  const fundableProjects = PROJECTS.filter((project) => project.repeatable || !projectComplete(session.campaign.projectProgress, project.id));
  const availableUpgrades = UPGRADES.filter((upgrade) => !session.campaign.ownedUpgradeIds.includes(upgrade.id));
  return {
    remainingMoney,
    unallocatedMoney: remainingMoney - moneyAllocationTotal(view.game, allocation),
    availableReusableItems,
    availableUpgrades,
    fundableProjects,
    startsWholeSchoolCelebration: session.campaign.projectProgress["large-celebration"]
      + allocation.projectAmounts["large-celebration"] >= projectDefinition("large-celebration").target,
    canCompost: session.campaign.ownedUpgradeIds.includes("compost-bin"),
  };
}
