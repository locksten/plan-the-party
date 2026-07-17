import { describe, expect, it } from "vitest";
import { FLOATING_BALLOON_SOURCES } from "../../effectArt";
import {
  createFloatingBalloon,
  createFloatingBalloonDelay,
  FLOATING_BALLOON_MAX_INTERVAL_MS,
  FLOATING_BALLOON_MIN_INTERVAL_MS,
} from "./floatingBalloonModel";

function repeatingRandom(value: number): () => number {
  return () => value;
}

describe("floating balloons", () => {
  it("randomizes spawn delays within the configured range", () => {
    expect(createFloatingBalloonDelay(repeatingRandom(0))).toBe(FLOATING_BALLOON_MIN_INTERVAL_MS);
    expect(createFloatingBalloonDelay(repeatingRandom(0.999))).toBeLessThanOrEqual(FLOATING_BALLOON_MAX_INTERVAL_MS);
  });

  it("keeps randomized balloons within the visual ranges", () => {
    for (const value of [0, 0.25, 0.5, 0.75, 0.999]) {
      const balloon = createFloatingBalloon(repeatingRandom(value));
      expect(FLOATING_BALLOON_SOURCES).toContain(balloon.source);
      expect(balloon.leftPercent).toBeGreaterThanOrEqual(3);
      expect(balloon.leftPercent).toBeLessThan(97);
      expect(balloon.sizeRem).toBeGreaterThanOrEqual(2.75);
      expect(balloon.sizeRem).toBeLessThan(5);
      expect(balloon.durationMs).toBeGreaterThanOrEqual(9_000);
      expect(balloon.durationMs).toBeLessThanOrEqual(15_000);
      expect(balloon.horizontalDriftVw).toBeGreaterThanOrEqual(-10);
      expect(balloon.horizontalDriftVw).toBeLessThan(10);
      expect(balloon.swayDurationMs).toBeGreaterThanOrEqual(1_400);
      expect(balloon.swayDurationMs).toBeLessThanOrEqual(2_800);
    }
  });

  it("fails loudly when the random source violates its contract", () => {
    expect(() => createFloatingBalloon(repeatingRandom(1))).toThrow();
  });
});
