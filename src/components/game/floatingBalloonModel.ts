import { assert } from "../../assert";
import { FLOATING_BALLOON_SOURCES } from "../../effectArt";

export const FLOATING_BALLOON_MIN_INTERVAL_MS = 700;
export const FLOATING_BALLOON_MAX_INTERVAL_MS = 2_000;
const FLOATING_BALLOON_MIN_DURATION_MS = 9_000;
const FLOATING_BALLOON_MAX_DURATION_MS = 15_000;

export type FloatingBalloonModel = Readonly<{
  source: (typeof FLOATING_BALLOON_SOURCES)[number];
  leftPercent: number;
  sizeRem: number;
  durationMs: number;
  horizontalDriftVw: number;
  swayDurationMs: number;
}>;

function nextRandom(random: () => number): number {
  const value = random();
  assert(Number.isFinite(value) && value >= 0 && value < 1, "Atsitiktinė reikšmė turi būti intervale [0, 1).");
  return value;
}

export function createFloatingBalloonDelay(random: () => number = Math.random): number {
  const range = FLOATING_BALLOON_MAX_INTERVAL_MS - FLOATING_BALLOON_MIN_INTERVAL_MS;
  return FLOATING_BALLOON_MIN_INTERVAL_MS + Math.round(nextRandom(random) * range);
}

export function createFloatingBalloon(random: () => number = Math.random): FloatingBalloonModel {
  const source = FLOATING_BALLOON_SOURCES[Math.floor(nextRandom(random) * FLOATING_BALLOON_SOURCES.length)];
  assert(source !== undefined, "Nerastas baliono paveikslėlis.");

  return {
    source,
    leftPercent: 3 + nextRandom(random) * 94,
    sizeRem: 2.75 + nextRandom(random) * 2.25,
    durationMs: FLOATING_BALLOON_MIN_DURATION_MS
      + Math.round(nextRandom(random) * (FLOATING_BALLOON_MAX_DURATION_MS - FLOATING_BALLOON_MIN_DURATION_MS)),
    horizontalDriftVw: -10 + nextRandom(random) * 20,
    swayDurationMs: 1_400 + Math.round(nextRandom(random) * 1_400),
  };
}
