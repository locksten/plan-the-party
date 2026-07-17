export type CategoryId = "gerimai" | "uzkandziai" | "veikla" | "papildomai";

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

export type ItemTag = Readonly<{
  label: string;
  tone: "standard" | "hype";
}>;

export type ItemDefinition = Readonly<{
  id: string;
  name: string;
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
  | { kind: "minimumChoices"; category: "veikla" | "papildomai"; count: number };

export type MysteryEvent = Readonly<{
  id: string;
  title: string;
  description: string;
  effects: readonly EventEffect[];
}>;

type ChallengeRule =
  | { kind: "maximumSurplusPortions"; drinks: number; snacks: number }
  | { kind: "minimumVariety"; drinkChoices: number; snackChoices: number }
  | { kind: "equalRefreshmentPortions" }
  | { kind: "hypeWithRemainingMoney"; minimumRemaining: number }
  | { kind: "reusableWithLongLastingSnack" }
  | { kind: "exactlyOneAtOrAbovePrice"; price: number }
  | { kind: "refreshmentsWithinParticipantBudget" }
  | { kind: "oneHypeOrMultiplePlainDecorations" };

export type ChallengeCard = Readonly<{
  id: string;
  title: string;
  description: string;
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
  label: string;
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

export type FoodLeftoverChoice = "suvalgyti" | "ismesti" | "kompostuoti";
export type LongLastingFoodLeftoverChoice = "suvalgyti" | "ismesti" | "pasilikti-kitai-sventei";

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
