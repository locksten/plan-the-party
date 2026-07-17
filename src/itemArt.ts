import itemsActivitiesBraceletWorkshopV2Source from "./assets/items/activities/bracelet-workshop-v2.webp";
import itemsActivitiesKaraokeStageSource from "./assets/items/activities/karaoke-stage.webp";
import itemsActivitiesPaperAirplaneChallengeSource from "./assets/items/activities/paper-airplane-challenge.webp";
import itemsActivitiesQuizSource from "./assets/items/activities/quiz.webp";
import itemsActivitiesRcCarRacingV5Source from "./assets/items/activities/rc-car-racing-v5.webp";
import itemsActivitiesTargetGamesV2Source from "./assets/items/activities/target-games-v2.webp";
import itemsDecorationsBalloonsSource from "./assets/items/decorations/balloons.webp";
import itemsDecorationsClassroomPlantSource from "./assets/items/decorations/classroom-plant.webp";
import itemsDecorationsFabricBuntingSource from "./assets/items/decorations/fabric-bunting.webp";
import itemsDecorationsPaperTasselGarlandSource from "./assets/items/decorations/paper-tassel-garland.webp";
import itemsDecorationsPartyLightProjectorSource from "./assets/items/decorations/party-light-projector.webp";
import itemsDecorationsTableclothSource from "./assets/items/decorations/tablecloth.webp";
import itemsDrinksBerryPunchSource from "./assets/items/drinks/berry-punch.webp";
import itemsDrinksDepositBottlesSource from "./assets/items/drinks/deposit-bottles.webp";
import itemsDrinksDrinkMixingStationSource from "./assets/items/drinks/drink-mixing-station.webp";
import itemsDrinksJuiceCartonsSource from "./assets/items/drinks/juice-cartons.webp";
import itemsDrinksTeaSetSource from "./assets/items/drinks/tea-set.webp";
import itemsDrinksWaterStationSource from "./assets/items/drinks/water-station.webp";
import itemsSnacksCelebrationCakeSource from "./assets/items/snacks/celebration-cake.webp";
import itemsSnacksCookieBoxSource from "./assets/items/snacks/cookie-box.webp";
import itemsSnacksCrackerPacketsSource from "./assets/items/snacks/cracker-packets.webp";
import itemsSnacksFruitPlatterSource from "./assets/items/snacks/fruit-platter.webp";
import itemsSnacksMiniSandwichesSource from "./assets/items/snacks/mini-sandwiches.webp";
import itemsSnacksVegetableSticksSource from "./assets/items/snacks/vegetable-sticks.webp";
import type { ItemArtId } from "./domain";

export const ITEM_ART_SOURCES = {
  "water-station": itemsDrinksWaterStationSource,
  "berry-punch": itemsDrinksBerryPunchSource,
  "juice-cartons": itemsDrinksJuiceCartonsSource,
  "tea-set": itemsDrinksTeaSetSource,
  "deposit-bottles": itemsDrinksDepositBottlesSource,
  "drink-mixing-station": itemsDrinksDrinkMixingStationSource,
  quiz: itemsActivitiesQuizSource,
  "paper-airplane-challenge": itemsActivitiesPaperAirplaneChallengeSource,
  "bracelet-workshop": itemsActivitiesBraceletWorkshopV2Source,
  "rc-car-racing": itemsActivitiesRcCarRacingV5Source,
  "target-games": itemsActivitiesTargetGamesV2Source,
  "paper-tassel-garland": itemsDecorationsPaperTasselGarlandSource,
  tablecloth: itemsDecorationsTableclothSource,
  "fabric-bunting": itemsDecorationsFabricBuntingSource,
  balloons: itemsDecorationsBalloonsSource,
  "party-light-projector": itemsDecorationsPartyLightProjectorSource,
  "karaoke-stage": itemsActivitiesKaraokeStageSource,
  plant: itemsDecorationsClassroomPlantSource,
  "vegetable-sticks": itemsSnacksVegetableSticksSource,
  "cracker-packets": itemsSnacksCrackerPacketsSource,
  "fruit-platter": itemsSnacksFruitPlatterSource,
  "cookie-box": itemsSnacksCookieBoxSource,
  "mini-sandwiches": itemsSnacksMiniSandwichesSource,
  "celebration-cake": itemsSnacksCelebrationCakeSource,
} as const satisfies Readonly<Record<ItemArtId, string>>;
