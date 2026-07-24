import { describe, expect, it } from "vitest";
import { detectLocale } from "./locale";

describe("locale detection", () => {
  it("prioritizes an explicitly stored locale", () => {
    expect(detectLocale("en", ["lt-LT"])).toBe("en");
    expect(detectLocale("lt", ["en-GB"])).toBe("lt");
  });

  it("uses the first supported browser language", () => {
    expect(detectLocale(null, ["pl-PL", "lt-LT", "en-US"])).toBe("lt");
    expect(detectLocale(null, ["pl-PL", "en-US", "lt-LT"])).toBe("en");
  });

  it("falls back to English when no browser language is supported", () => {
    expect(detectLocale(null, ["pl-PL", "de-DE"])).toBe("en");
    expect(detectLocale(null, [])).toBe("en");
  });

  it("fails loudly for an unsupported stored locale", () => {
    expect(() => detectLocale("de", ["en-GB"])).toThrowError('Unsupported stored locale "de".');
  });
});
