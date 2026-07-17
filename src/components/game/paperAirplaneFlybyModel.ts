import { assert } from "../../assert";
import { PAPER_AIRPLANE_FLYBY_SOURCES } from "../../effectArt";

export const PAPER_AIRPLANE_FLYBY_MIN_INTERVAL_MS = 60_000;
export const PAPER_AIRPLANE_FLYBY_MAX_INTERVAL_MS = 240_000;
const PAPER_AIRPLANE_FLYBY_MIN_TOP_PERCENT = -10;
const PAPER_AIRPLANE_FLYBY_MAX_TOP_PERCENT = 90;

type FlybyDirection = "left-to-right" | "right-to-left";

export type PaperAirplaneFlybyModel = Readonly<{
  source: (typeof PAPER_AIRPLANE_FLYBY_SOURCES)[number];
  direction: FlybyDirection;
  topPercent: number;
  durationMs: number;
  tiltDegrees: number;
  driftVh: number;
}>;

function nextRandom(random: () => number): number {
  const value = random();
  assert(Number.isFinite(value) && value >= 0 && value < 1, "Atsitiktinė reikšmė turi būti intervale [0, 1).");
  return value;
}

export function createPaperAirplaneFlybyDelay(random: () => number = Math.random): number {
  const range = PAPER_AIRPLANE_FLYBY_MAX_INTERVAL_MS - PAPER_AIRPLANE_FLYBY_MIN_INTERVAL_MS;
  return PAPER_AIRPLANE_FLYBY_MIN_INTERVAL_MS + Math.round(nextRandom(random) * range);
}

export function createPaperAirplaneFlyby(random: () => number = Math.random): PaperAirplaneFlybyModel {
  const sourceIndex = Math.floor(nextRandom(random) * PAPER_AIRPLANE_FLYBY_SOURCES.length);
  const source = PAPER_AIRPLANE_FLYBY_SOURCES[sourceIndex];
  assert(source !== undefined, "Nerastas popierinio lėktuvėlio paveikslėlis.");
  const direction: FlybyDirection = nextRandom(random) < 0.5 ? "left-to-right" : "right-to-left";
  const driftVh = -50 + nextRandom(random) * 100;
  const tiltDegrees = driftVh * (direction === "left-to-right" ? 0.35 : -0.35);
  const minimumTopPercent = Math.max(
    PAPER_AIRPLANE_FLYBY_MIN_TOP_PERCENT,
    PAPER_AIRPLANE_FLYBY_MIN_TOP_PERCENT - driftVh,
  );
  const maximumTopPercent = Math.min(
    PAPER_AIRPLANE_FLYBY_MAX_TOP_PERCENT,
    PAPER_AIRPLANE_FLYBY_MAX_TOP_PERCENT - driftVh,
  );
  assert(minimumTopPercent <= maximumTopPercent, "Lėktuvėlio skrydžio trajektorija netelpa ekrane.");

  return {
    source,
    direction,
    topPercent: minimumTopPercent + nextRandom(random) * (maximumTopPercent - minimumTopPercent),
    durationMs: 1_800 + Math.round(nextRandom(random) * 3_000),
    tiltDegrees,
    driftVh,
  };
}
