import { describe, expect, it } from "vitest";
import { PAPER_AIRPLANE_FLYBY_SOURCES } from "../../effectArt";
import {
  createPaperAirplaneFlyby,
  createPaperAirplaneFlybyDelay,
  PAPER_AIRPLANE_FLYBY_MAX_INTERVAL_MS,
  PAPER_AIRPLANE_FLYBY_MIN_INTERVAL_MS,
} from "./paperAirplaneFlybyModel";

function repeatingRandom(value: number): () => number {
  return () => value;
}

describe("paper airplane flyby", () => {
  it("randomizes each delay between one and four minutes", () => {
    expect(PAPER_AIRPLANE_FLYBY_MIN_INTERVAL_MS).toBe(60_000);
    expect(PAPER_AIRPLANE_FLYBY_MAX_INTERVAL_MS).toBe(240_000);
    expect(createPaperAirplaneFlybyDelay(repeatingRandom(0))).toBe(60_000);
    expect(createPaperAirplaneFlybyDelay(repeatingRandom(0.5))).toBe(150_000);
    expect(createPaperAirplaneFlybyDelay(repeatingRandom(0.999))).toBeGreaterThanOrEqual(239_000);
    expect(createPaperAirplaneFlybyDelay(repeatingRandom(0.999))).toBeLessThanOrEqual(240_000);
  });

  it("selects from all three airplane assets", () => {
    expect(createPaperAirplaneFlyby(repeatingRandom(0)).source).toBe(PAPER_AIRPLANE_FLYBY_SOURCES[0]);
    expect(createPaperAirplaneFlyby(repeatingRandom(0.4)).source).toBe(PAPER_AIRPLANE_FLYBY_SOURCES[1]);
    expect(createPaperAirplaneFlyby(repeatingRandom(0.8)).source).toBe(PAPER_AIRPLANE_FLYBY_SOURCES[2]);
  });

  it("keeps randomized motion within the screen-safe ranges", () => {
    for (const value of [0, 0.25, 0.5, 0.75, 0.999]) {
      const flyby = createPaperAirplaneFlyby(repeatingRandom(value));
      expect(flyby.topPercent).toBeGreaterThanOrEqual(-10);
      expect(flyby.topPercent).toBeLessThan(90);
      expect(flyby.durationMs).toBeGreaterThanOrEqual(1_800);
      expect(flyby.durationMs).toBeLessThanOrEqual(4_800);
      expect(flyby.tiltDegrees).toBeGreaterThanOrEqual(-17.5);
      expect(flyby.tiltDegrees).toBeLessThan(17.5);
      expect(flyby.driftVh).toBeGreaterThanOrEqual(-50);
      expect(flyby.driftVh).toBeLessThan(50);
      expect(flyby.topPercent + flyby.driftVh).toBeGreaterThanOrEqual(-10);
      expect(flyby.topPercent + flyby.driftVh).toBeLessThanOrEqual(90);
    }
  });

  it("tilts the airplane in the direction of its vertical drift", () => {
    const flyingRight = createPaperAirplaneFlyby(repeatingRandom(0.25));
    expect(flyingRight.direction).toBe("left-to-right");
    expect(Math.sign(flyingRight.tiltDegrees)).toBe(Math.sign(flyingRight.driftVh));

    const flyingLeft = createPaperAirplaneFlyby(repeatingRandom(0.75));
    expect(flyingLeft.direction).toBe("right-to-left");
    expect(Math.sign(flyingLeft.tiltDegrees)).toBe(-Math.sign(flyingLeft.driftVh));
  });

  it("fails loudly when the random source violates its contract", () => {
    expect(() => createPaperAirplaneFlyby(repeatingRandom(1))).toThrow();
  });
});
