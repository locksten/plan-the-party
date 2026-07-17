import metaFertilizerSource from "./assets/meta/fertilizer.webp";
import metaLargeCelebrationVariant1Source from "./assets/meta/large-celebration-variant-1.webp";
import metaMusicSystemV5Source from "./assets/meta/music-system-v5.webp";
import metaShoppingCardSource from "./assets/meta/shopping-card.webp";
import sceneClassroomVineStage1Source from "./assets/scene/classroom-vine-stage-1.webp";
import sceneClassroomVineStage2Source from "./assets/scene/classroom-vine-stage-2.webp";
import sceneClassroomVineStage3Source from "./assets/scene/classroom-vine-stage-3.webp";
import sceneClassroomVineStage4Source from "./assets/scene/classroom-vine-stage-4.webp";
import sceneCompostBinSource from "./assets/scene/compost-bin.webp";
import type { ProjectId, UpgradeId } from "./domain";

export type MetaArtId = ProjectId | UpgradeId | "fertilizer";

export const COMPOST_BIN_SOURCE = sceneCompostBinSource;

export const META_ART_SOURCES = {
  "large-celebration": metaLargeCelebrationVariant1Source,
  "music-system": metaMusicSystemV5Source,
  "compost-bin": COMPOST_BIN_SOURCE,
  "shopping-card": metaShoppingCardSource,
  fertilizer: metaFertilizerSource,
} as const satisfies Readonly<Record<MetaArtId, string>>;

export const PLANT_STAGE_SOURCES = [
  sceneClassroomVineStage1Source,
  sceneClassroomVineStage2Source,
  sceneClassroomVineStage3Source,
  sceneClassroomVineStage4Source,
] as const;
