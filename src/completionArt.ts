import completionDiscardSource from "./assets/completion/discard.webp";
import completionEatSource from "./assets/completion/eat.webp";
import completionKeepFoodSource from "./assets/completion/keep-food.webp";
import completionLongLastingFoodGameEmptySource from "./assets/completion/long-lasting-food-game-empty.webp";
import completionLongLastingFoodGameV2Source from "./assets/completion/long-lasting-food-game-v2.webp";
import completionMoneySource from "./assets/completion/money.webp";
import completionPartyPopperSource from "./assets/completion/party-popper.webp";
import completionSpoilingLeftoversCrumbsSource from "./assets/completion/spoiling-leftovers-crumbs.webp";
import completionSpoilingLeftoversEmptySource from "./assets/completion/spoiling-leftovers-empty.webp";
import completionSpoilingLeftoversFoodSource from "./assets/completion/spoiling-leftovers-food.webp";
import itemsDrinksDepositBottlesEmptySource from "./assets/items/drinks/deposit-bottles-empty.webp";
export const LONG_LASTING_FOOD_SOURCE = completionLongLastingFoodGameV2Source;

export const COMPLETION_ART_SOURCES = {
  "spoiling-leftovers-empty": completionSpoilingLeftoversEmptySource,
  "spoiling-leftovers-crumbs": completionSpoilingLeftoversCrumbsSource,
  "spoiling-leftovers-food": completionSpoilingLeftoversFoodSource,
  "long-lasting-leftovers": LONG_LASTING_FOOD_SOURCE,
  "empty-long-lasting-food-box": completionLongLastingFoodGameEmptySource,
  money: completionMoneySource,
  "empty-deposit-bottles": itemsDrinksDepositBottlesEmptySource,
  eat: completionEatSource,
  discard: completionDiscardSource,
  "keep-food": completionKeepFoodSource,
  celebration: completionPartyPopperSource,
} as const;

export type CompletionArtId = keyof typeof COMPLETION_ART_SOURCES;
