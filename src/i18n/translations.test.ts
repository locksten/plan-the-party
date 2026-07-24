import { describe, expect, it } from "vitest";
import { CHALLENGES, EVENTS } from "../domain";
import { englishTranslations } from "./locales/en";
import { lithuanianTranslations } from "./locales/lt";

function challenge(id: (typeof CHALLENGES)[number]["id"]) {
  const definition = CHALLENGES.find((candidate) => candidate.id === id);
  expect(definition).toBeDefined();
  return definition!;
}

function event(id: (typeof EVENTS)[number]["id"]) {
  const definition = EVENTS.find((candidate) => candidate.id === id);
  expect(definition).toBeDefined();
  return definition!;
}

describe("translated quantities", () => {
  it("uses English singular and plural forms", () => {
    expect(englishTranslations.common.portionsShort(1)).toBe("1 portion");
    expect(englishTranslations.common.portionsShort(2)).toBe("2 portions");
    expect(englishTranslations.planProblem({ kind: "missingDrinks", amount: 1 }))
      .toBe("You need drinks for 1 more student.");
    expect(englishTranslations.planProblem({ kind: "missingDrinks", amount: 2 }))
      .toBe("You need drinks for 2 more students.");
    expect(englishTranslations.planProblem({ kind: "missingDecorations", amount: 1 }))
      .toBe("Choose at least 1 decoration.");
    expect(englishTranslations.planProblem({ kind: "missingDecorations", amount: 2 }))
      .toBe("Choose at least 2 decorations.");
  });

  it("uses Lithuanian one, few and other forms", () => {
    expect([
      lithuanianTranslations.common.portionsShort(1),
      lithuanianTranslations.common.portionsShort(2),
      lithuanianTranslations.common.portionsShort(10),
      lithuanianTranslations.common.portionsShort(11),
      lithuanianTranslations.common.portionsShort(21),
    ]).toEqual([
      "1 porcija",
      "2 porcijos",
      "10 porcijų",
      "11 porcijų",
      "21 porcija",
    ]);

    expect([
      lithuanianTranslations.planProblem({ kind: "missingDrinks", amount: 1 }),
      lithuanianTranslations.planProblem({ kind: "missingDrinks", amount: 2 }),
      lithuanianTranslations.planProblem({ kind: "missingDrinks", amount: 10 }),
      lithuanianTranslations.planProblem({ kind: "missingDrinks", amount: 21 }),
    ]).toEqual([
      "Gėrimų dar reikia 1 mokiniui.",
      "Gėrimų dar reikia 2 mokiniams.",
      "Gėrimų dar reikia 10 mokinių.",
      "Gėrimų dar reikia 21 mokiniui.",
    ]);

    expect([
      lithuanianTranslations.planProblem({ kind: "missingDecorations", amount: 1 }),
      lithuanianTranslations.planProblem({ kind: "missingDecorations", amount: 2 }),
      lithuanianTranslations.planProblem({ kind: "missingDecorations", amount: 10 }),
    ]).toEqual([
      "Pasirinkite bent 1 papuošimą.",
      "Pasirinkite bent 2 papuošimus.",
      "Pasirinkite bent 10 papuošimų.",
    ]);
  });

  it("describes the discount-card mechanic accurately", () => {
    expect(englishTranslations.projects["shopping-card"].description)
      .toBe("Takes up to €2 off one item.");
    expect(englishTranslations.table.shoppingCard("€2"))
      .toContain("take up to €2 off its price");
    expect(lithuanianTranslations.projects["shopping-card"].description)
      .toContain("iki 2\u00a0€ nuolaidą");
  });

  it("describes the combined refreshments budget enforced by the rule", () => {
    const definition = challenge("one-euro-refreshments");
    expect(englishTranslations.challengeCards[definition.id].description(definition))
      .toBe("Spend no more than €1 per student on drinks and snacks combined.");
    expect(lithuanianTranslations.challengeCards[definition.id].description(definition))
      .toBe("Gėrimams ir užkandžiams kartu skirkite ne daugiau kaip 1\u00a0€ vienam mokiniui.");
  });

  it("derives translated card amounts from their definitions", () => {
    const forgottenCups = event("forgot-cups");
    expect(englishTranslations.eventCards[forgottenCups.id].description(forgottenCups))
      .toContain("€1 more");
    expect(lithuanianTranslations.eventCards[forgottenCups.id].description(forgottenCups))
      .toContain("1\u00a0€ daugiau");

    const expensivePurchase = challenge("one-expensive-purchase");
    expect(englishTranslations.challengeCards[expensivePurchase.id].description(expensivePurchase))
      .toContain("€7 or more");
    expect(lithuanianTranslations.challengeCards[expensivePurchase.id].description(expensivePurchase))
      .toContain("7\u00a0€ ar brangesnį");
  });

  it("renders every configured event and challenge in both locales", () => {
    for (const translations of [englishTranslations, lithuanianTranslations]) {
      for (const definition of EVENTS) {
        const copy = translations.eventCards[definition.id];
        expect(copy.title.length).toBeGreaterThan(0);
        expect(copy.description(definition).length).toBeGreaterThan(0);
      }
      for (const definition of CHALLENGES) {
        const copy = translations.challengeCards[definition.id];
        expect(copy.title.length).toBeGreaterThan(0);
        expect(copy.description(definition).length).toBeGreaterThan(0);
      }
    }
  });
});
