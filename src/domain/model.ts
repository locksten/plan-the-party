import type { CategoryId, EventId } from "./ids";

export type { CategoryId } from "./ids";

export type ItemArtId =
  | "water-station"
  | "berry-punch"
  | "juice-cartons"
  | "tea-set"
  | "deposit-bottles"
  | "drink-mixing-station"
  | "quiz"
  | "paper-airplane-challenge"
  | "bracelet-workshop"
  | "rc-car-racing"
  | "target-games"
  | "paper-tassel-garland"
  | "tablecloth"
  | "fabric-bunting"
  | "balloons"
  | "party-light-projector"
  | "karaoke-stage"
  | "plant"
  | "vegetable-sticks"
  | "cracker-packets"
  | "fruit-platter"
  | "cookie-box"
  | "mini-sandwiches"
  | "celebration-cake";

export type HypeTagId =
  | "mix-your-flavor"
  | "your-style"
  | "sweetest-moment"
  | "party-in-the-air"
  | "turn-on-the-sparkle";

export type ItemTag =
  | Readonly<{ kind: "deposit"; amount: number }>
  | Readonly<{ kind: "long-lasting" }>
  | Readonly<{ kind: "hype"; id: HypeTagId }>
  | Readonly<{ kind: "self-made" }>
  | Readonly<{ kind: "rental" }>
  | Readonly<{ kind: "reusable" }>
  | Readonly<{ kind: "owned" }>
  | Readonly<{ kind: "patience" }>
  | Readonly<{ kind: "patience-paid-off" }>
  | Readonly<{ kind: "no-time" }>
  | Readonly<{ kind: "borrowed" }>
  | Readonly<{ kind: "shopping-card-discount"; amount: number }>;

export type ItemDefinition = Readonly<{
  id: string;
  category: CategoryId;
  price: number;
  portions?: number;
  drinkServing?: "poured" | "individual";
  selfMade?: boolean;
  shelfLife?: "spoiling" | "long-lasting";
  tags?: readonly ItemTag[];
  hype?: boolean;
  depositRefund?: number;
  reusable?: boolean;
  art: ItemArtId;
}>;

export type ResolvedItem<Id extends string> = Omit<ItemDefinition, "id"> & Readonly<{
  id: Id;
  originalPrice?: number;
  shoppingCardDiscount?: number;
  borrowed?: boolean;
  locked?: boolean;
}>;

type EventEffect =
  | { kind: "budgetBonus"; amount: number }
  | { kind: "participants"; amount: number }
  | { kind: "drinkLoss"; amount: number }
  | { kind: "hypeSurcharge"; amount: number }
  | { kind: "pouredDrinkSurcharge"; amount: number }
  | { kind: "snackBonus"; amount: number }
  | { kind: "borrowedItem"; itemId: string }
  | { kind: "minimumChoices"; category: "activities" | "decorations"; count: number };

export type MysteryEvent = Readonly<{
  id: string;
  effects: readonly EventEffect[];
}>;

type ChallengeRule =
  | { kind: "maximumSurplusPortions"; drinks: number; snacks: number }
  | { kind: "minimumVariety"; drinkChoices: number; snackChoices: number }
  | { kind: "equalRefreshmentPortions" }
  | { kind: "hypeWithRemainingMoney"; minimumRemaining: number }
  | { kind: "reusableWithLongLastingSnack" }
  | { kind: "exactlyOneAtOrAbovePrice"; price: number }
  | { kind: "refreshmentsWithinParticipantBudget"; maximumPerParticipant: number }
  | { kind: "oneHypeOrMultiplePlainDecorations" };

export type ChallengeCard = Readonly<{
  id: string;
  rule: ChallengeRule;
}>;

type SelectionEntryModel<Id extends string> = Readonly<{
  placementId: number;
  itemId: Id;
}>;

/** Individual placements, in the order in which they were added to the table. */
export type SelectionModel<Id extends string> = readonly SelectionEntryModel<Id>[];

export type CarryoverResource = Readonly<{
  kind: "long-lasting-snack-portions";
  amount: number;
  sourceCelebration: number;
}>;

export type ValueModifier = Readonly<{
  id: string;
  label:
    | Readonly<{ kind: "event"; eventId: EventId }>
    | Readonly<{ kind: "whole-school-celebration" }>
    | Readonly<{ kind: "teacher-adjustment" }>;
  amount: number;
  source: "scenario" | "event" | "teacher";
}>;

export type ValueBreakdown = Readonly<{
  base: number;
  modifiers: readonly ValueModifier[];
  total: number;
}>;

export type GamePlan = Readonly<{
  spent: number;
  budget: ValueBreakdown;
  available: number;
  participants: ValueBreakdown;
  drinkPortions: number;
  snackPortions: number;
  carriedSnackPortions: number;
  eventSuppliedSnackPortions: number;
  spoilingSnackPortions: number;
  longLastingSnackPortions: number;
  spoilingSnackLeftovers: number;
  longLastingSnackLeftovers: number;
  depositRefund: number;
  drinkPortionsLost: number;
  activityChoices: number;
  decorationChoices: number;
  requiredActivityChoices: number;
  requiredDecorationChoices: number;
  drinkVariety: number;
  snackVariety: number;
  requiredDrinkVariety: number;
  requiredSnackVariety: number;
}>;

export type PlanProblem =
  | Readonly<{ kind: "overBudget"; amount: number }>
  | Readonly<{ kind: "missingDrinks"; amount: number }>
  | Readonly<{ kind: "missingSnacks"; amount: number }>
  | Readonly<{ kind: "missingDrinkVariety"; amount: number }>
  | Readonly<{ kind: "missingSnackVariety"; amount: number }>
  | Readonly<{ kind: "missingActivities"; amount: number }>
  | Readonly<{ kind: "missingDecorations"; amount: number }>;

export type FoodLeftoverChoice = "eat" | "discard" | "compost";
export type LongLastingFoodLeftoverChoice = "eat" | "discard" | "keep-for-next-party";

export type GameConfigModel<Id extends string> = Readonly<{
  items: readonly ResolvedItem<Id>[];
  mysteryEvents: readonly MysteryEvent[];
}>;

export type RoundEffects = Readonly<{
  budgetModifiers: readonly ValueModifier[];
  participantModifiers: readonly ValueModifier[];
  hypeSurcharge: number;
  pouredDrinkSurcharge: number;
  drinkPortionsLost: number;
  snackPortionsAdded: number;
  borrowedItemIds: ReadonlySet<string>;
  minimumActivities: number;
  minimumDecorations: number;
}>;
