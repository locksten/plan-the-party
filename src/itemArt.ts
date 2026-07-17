import type { ItemArtId } from "./game";

export const ITEM_ART_SOURCES = {
  "water-pitchers": "/assets/items/drinks/water-pitchers.webp",
  "fruit-water": "/assets/items/drinks/fruit-water.webp",
  "apple-juice": "/assets/items/drinks/apple-juice.webp",
  "cocoa-thermos": "/assets/items/drinks/cocoa-thermos.webp",
  "festive-lemonade": "/assets/items/drinks/festive-lemonade.webp",
  "classroom-quiz": "/assets/items/activities/classroom-quiz.webp",
  "active-games": "/assets/items/activities/active-games.webp",
  "board-games": "/assets/items/activities/board-games.webp",
  "dance-hour": "/assets/items/activities/dance-hour.webp",
  "craft-workshop": "/assets/items/activities/craft-workshop.webp",
  "paper-garlands": "/assets/items/decorations/paper-garlands.webp",
  "name-cards": "/assets/items/decorations/name-cards.webp",
  "fabric-bunting": "/assets/items/decorations/fabric-bunting.webp",
  balloons: "/assets/items/decorations/balloons.webp",
  "photo-wall": "/assets/items/decorations/photo-wall.webp",
  "fruit-platter": "/assets/items/snacks/fruit-platter.webp",
  "popcorn-bowl": "/assets/items/snacks/popcorn-bowl.webp",
  "cookie-plate": "/assets/items/snacks/cookie-plate.webp",
  "mini-sandwiches": "/assets/items/snacks/mini-sandwiches.webp",
  "celebration-cake": "/assets/items/snacks/celebration-cake.webp",
} as const satisfies Readonly<Record<ItemArtId, string>>;
