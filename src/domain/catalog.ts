import type {
  ChallengeCard,
  GameConfigModel,
  ItemDefinition,
  MysteryEvent,
  ResolvedItem,
  SelectionModel,
} from "./model";
import type { ChallengeId, EventId, ItemId, ProjectId, UpgradeId } from "./ids";

export type { ChallengeId, EventId, ItemId, ProjectId, UpgradeId } from "./ids";

export const BASE_BUDGET = 40;
export const BASE_PARTICIPANTS = 25;
export const MAX_REPEATABLE_ITEMS_PER_CATEGORY = 6;
const TEACHER_BUDGET_ADJUSTMENT_LIMIT = 30;
const TEACHER_PARTICIPANT_ADJUSTMENT_LIMIT = 20;
export const TEACHER_BUDGET_RANGE = {
  min: BASE_BUDGET - TEACHER_BUDGET_ADJUSTMENT_LIMIT,
  max: BASE_BUDGET + TEACHER_BUDGET_ADJUSTMENT_LIMIT,
} as const;
export const TEACHER_PARTICIPANT_RANGE = {
  min: BASE_PARTICIPANTS - TEACHER_PARTICIPANT_ADJUSTMENT_LIMIT,
  max: BASE_PARTICIPANTS + TEACHER_PARTICIPANT_ADJUSTMENT_LIMIT,
} as const;
export const SHOPPING_CARD_DISCOUNT = 2;

export const ITEMS = [
  { id: "water-station", category: "drinks", price: 1, portions: 8, drinkServing: "poured", art: "water-station" },
  { id: "tea-set", category: "drinks", price: 2, portions: 6, drinkServing: "poured", art: "tea-set" },
  { id: "juice-cartons", category: "drinks", price: 2, portions: 4, drinkServing: "individual", art: "juice-cartons" },
  { id: "berry-punch", category: "drinks", price: 4, portions: 10, drinkServing: "poured", art: "berry-punch" },
  { id: "deposit-bottles", category: "drinks", price: 6, portions: 8, drinkServing: "individual", depositRefund: 2, tags: [{ kind: "deposit", amount: 2 }], art: "deposit-bottles" },
  { id: "drink-mixing-station", category: "drinks", price: 7, portions: 7, drinkServing: "poured", tags: [{ kind: "hype", id: "mix-your-flavor" }], hype: true, art: "drink-mixing-station" },

  { id: "vegetable-sticks", category: "snacks", price: 2, portions: 4, shelfLife: "spoiling", art: "vegetable-sticks" },
  { id: "cracker-packets", category: "snacks", price: 4, portions: 6, shelfLife: "long-lasting", tags: [{ kind: "long-lasting" }], art: "cracker-packets" },
  { id: "fruit-platter", category: "snacks", price: 4, portions: 7, shelfLife: "spoiling", art: "fruit-platter" },
  { id: "mini-sandwiches", category: "snacks", price: 5, portions: 9, shelfLife: "spoiling", art: "mini-sandwiches" },
  { id: "cookie-box", category: "snacks", price: 5, portions: 6, shelfLife: "long-lasting", tags: [{ kind: "long-lasting" }], art: "cookie-box" },
  { id: "celebration-cake", category: "snacks", price: 10, portions: 10, shelfLife: "spoiling", tags: [{ kind: "hype", id: "sweetest-moment" }], hype: true, art: "celebration-cake" },

  { id: "quiz", category: "activities", price: 0, selfMade: true, tags: [{ kind: "self-made" }], art: "quiz" },
  { id: "paper-airplane-challenge", category: "activities", price: 3, art: "paper-airplane-challenge" },
  { id: "bracelet-workshop", category: "activities", price: 5, tags: [{ kind: "hype", id: "your-style" }], hype: true, art: "bracelet-workshop" },
  { id: "rc-car-racing", category: "activities", price: 6, tags: [{ kind: "rental" }], art: "rc-car-racing" },
  { id: "target-games", category: "activities", price: 8, tags: [{ kind: "reusable" }], reusable: true, art: "target-games" },

  { id: "paper-tassel-garland", category: "decorations", price: 0, selfMade: true, tags: [{ kind: "self-made" }], art: "paper-tassel-garland" },
  { id: "tablecloth", category: "decorations", price: 3, art: "tablecloth" },
  { id: "fabric-bunting", category: "decorations", price: 4, tags: [{ kind: "reusable" }], reusable: true, art: "fabric-bunting" },
  { id: "balloons", category: "decorations", price: 7, tags: [{ kind: "hype", id: "party-in-the-air" }], hype: true, art: "balloons" },
  { id: "party-light-projector", category: "decorations", price: 10, tags: [{ kind: "hype", id: "turn-on-the-sparkle" }, { kind: "reusable" }], hype: true, reusable: true, art: "party-light-projector" },
] as const satisfies readonly (ItemDefinition & { id: ItemId })[];

export const PROGRESSION_ITEMS = [
  { id: "karaoke-stage", category: "activities", price: 0, reusable: true, art: "karaoke-stage" },
  { id: "plant", category: "decorations", price: 0, reusable: true, art: "plant" },
] as const satisfies readonly (ItemDefinition & { id: ItemId })[];

export type GameItem = ResolvedItem<ItemId>;
export type Selection = SelectionModel<ItemId>;
export type GameConfig = GameConfigModel<ItemId>;

export const EVENTS = [
  { id: "school-photographer", effects: [{ kind: "minimumChoices", category: "decorations", count: 2 }] },
  { id: "borrowed-rc-cars", effects: [{ kind: "borrowedItem", itemId: "rc-car-racing" }] },
  { id: "forgot-cups", effects: [{ kind: "pouredDrinkSurcharge", amount: 1 }] },
  { id: "homemade-snacks", effects: [{ kind: "snackBonus", amount: 6 }] },
  { id: "party-runs-long", effects: [{ kind: "minimumChoices", category: "activities", count: 2 }] },
  { id: "advertised-items-cost-more", effects: [{ kind: "hypeSurcharge", amount: 2 }] },
  { id: "friends-join", effects: [{ kind: "budgetBonus", amount: 6 }, { kind: "participants", amount: 6 }] },
  { id: "spilled-drink", effects: [{ kind: "drinkLoss", amount: 6 }] },
] as const satisfies readonly (MysteryEvent & { id: EventId })[];

export type EventCard = (typeof EVENTS)[number];

export const CHALLENGES = [
  { id: "table-variety", rule: { kind: "minimumVariety", drinkChoices: 3, snackChoices: 3 } },
  { id: "perfect-balance", rule: { kind: "equalRefreshmentPortions" } },
  { id: "just-enough", rule: { kind: "maximumSurplusPortions", drinks: 1, snacks: 1 } },
  { id: "one-euro-refreshments", rule: { kind: "refreshmentsWithinParticipantBudget", maximumPerParticipant: 1 } },
  { id: "one-expensive-purchase", rule: { kind: "exactlyOneAtOrAbovePrice", price: 7 } },
  { id: "one-bold-or-several-simple", rule: { kind: "oneHypeOrMultiplePlainDecorations" } },
  { id: "useful-tomorrow", rule: { kind: "reusableWithLongLastingSnack" } },
  { id: "fun-and-frugal", rule: { kind: "hypeWithRemainingMoney", minimumRemaining: 7 } },
] as const satisfies readonly (ChallengeCard & { id: ChallengeId })[];

export type Challenge = (typeof CHALLENGES)[number];

export const PROJECTS = [
  { id: "large-celebration", target: 30, repeatable: true },
  { id: "music-system", target: 20, repeatable: false },
  { id: "shopping-card", target: 10, repeatable: false },
] as const satisfies readonly { id: ProjectId; target: number; repeatable: boolean }[];

export const UPGRADES = [
  { id: "compost-bin", price: 5 },
] as const satisfies readonly { id: UpgradeId; price: number }[];

export type ProjectDefinition = (typeof PROJECTS)[number];
export type UpgradeDefinition = (typeof UPGRADES)[number];
export type ProjectProgress = Readonly<Record<ProjectId, number>>;
export type MoneyAllocation = Readonly<{
  reusableItemIds: readonly ItemId[];
  upgradeIds: readonly UpgradeId[];
  projectAmounts: Readonly<Record<ProjectId, number>>;
  fertilizer: boolean;
}>;

export const PROJECT_IDS = PROJECTS.map((project) => project.id);
export const FERTILIZER_COST = 3;
export const PROJECT_ALLOCATION_STEP = 5;
export const MAX_PLANT_GROWTH = 3;
export const PLANT_ITEM_UNLOCK_STAGE = 3;

export const LARGE_CELEBRATION = {
  participantBonus: 12,
  budgetBonus: 20,
  minimumDrinkVariety: 3,
  minimumSnackVariety: 3,
  minimumActivities: 2,
  minimumDecorations: 2,
} as const;

export function emptyProjectProgress(): ProjectProgress {
  return { "large-celebration": 0, "music-system": 0, "shopping-card": 0 };
}

export function emptyMoneyAllocation(): MoneyAllocation {
  return { reusableItemIds: [], upgradeIds: [], projectAmounts: emptyProjectProgress(), fertilizer: false };
}

export function projectDefinition(id: ProjectId): ProjectDefinition {
  return PROJECTS.find((project) => project.id === id)!;
}

export function projectComplete(progress: ProjectProgress, id: ProjectId): boolean {
  return progress[id] >= projectDefinition(id).target;
}

export function upgradeDefinition(id: UpgradeId): UpgradeDefinition {
  return UPGRADES.find((upgrade) => upgrade.id === id)!;
}
