import { describe, expect, it } from "vitest";
import { addItem, adjustParticipants, createGameSession, toggleEvent, toggleShoppingCardDiscount, type GameSession } from "./session";
import { deriveGameView, summarizeEventEffects } from "./derive";
import type { EventId, ItemId } from "./catalog";

function addMany(session: GameSession, itemId: ItemId, count: number): GameSession {
  let current = session;
  for (let index = 0; index < count; index += 1) current = addItem(current, itemId);
  return current;
}

function viablePlan(): GameSession {
  let session = adjustParticipants(createGameSession(), -1);
  session = addMany(session, "vandens-stotele", 3);
  session = addMany(session, "mini-sumustiniai", 3);
  return addItem(session, "viktorina");
}

function economicalPlan(): GameSession {
  let session = createGameSession();
  session = addMany(session, "vandens-stotele", 4);
  session = addItem(session, "arbatos-rinkinys");
  session = addMany(session, "darzoviu-lazdeles", 3);
  session = addItem(session, "vaisiu-lekste");
  session = addItem(session, "sausainiu-dezute");
  return addItem(session, "viktorina");
}

describe("deriveGameView", () => {
  it("derives the empty round from the base values", () => {
    const view = deriveGameView(createGameSession());

    expect(view.plan.budget.total).toBe(40);
    expect(view.plan.participants.total).toBe(25);
    expect(view.plan.spent).toBe(0);
    expect(view.problems.map((problem) => problem.kind)).toEqual([
      "missingDrinks",
      "missingSnacks",
      "missingActivities",
    ]);
  });

  it("totals a viable selection without mutating the catalog", () => {
    const view = deriveGameView(viablePlan());

    expect(view.plan).toMatchObject({
      spent: 18,
      available: 22,
      drinkPortions: 24,
      snackPortions: 27,
      activityChoices: 1,
    });
    expect(view.problems).toEqual([]);
  });

  it("summarizes combined event effects once", () => {
    const effects = summarizeEventEffects(["prisijungia-draugai", "issiliejo", "reklama-pabrango"]);

    expect(effects.participantModifiers.map((modifier) => modifier.amount)).toEqual([6]);
    expect(effects.budgetModifiers.map((modifier) => modifier.amount)).toEqual([6]);
    expect(effects.drinkPortionsLost).toBe(6);
    expect(effects.hypeSurcharge).toBe(2);
  });

  it("applies event effects to the plan and resolved items", () => {
    let session = addItem(createGameSession(), "gerimu-maisymo-stotele");
    for (const eventId of ["prisijungia-draugai", "issiliejo", "reklama-pabrango"] as const satisfies readonly EventId[]) {
      session = toggleEvent(session, eventId);
    }
    const view = deriveGameView(session);
    const lemonade = view.game.items.find((item) => item.id === "gerimu-maisymo-stotele");

    expect(view.plan.budget.total).toBe(46);
    expect(view.plan.participants.total).toBe(31);
    expect(view.plan.drinkPortions).toBe(1);
    expect(lemonade).toMatchObject({ price: 9, originalPrice: 7 });
  });

  it("resolves a borrowed rental without changing its base definition", () => {
    const session = toggleEvent(createGameSession(), "pasiskolinome-masineles");
    const cars = deriveGameView(session).game.items.find((item) => item.id === "valdomu-automobiliuku-trasa");

    expect(cars).toMatchObject({ price: 0, borrowed: true });
    expect(cars?.tags?.map((tag) => tag.label)).toEqual(["PASISKOLINOME"]);
  });

  it("adds the forgotten-cup cost only to poured drinks", () => {
    const session = toggleEvent(createGameSession(), "pamirsome-puodelius");
    const items = deriveGameView(session).game.items;
    const water = items.find((item) => item.id === "vandens-stotele");
    const juiceBoxes = items.find((item) => item.id === "sulciu-pakeliai");

    expect(water).toMatchObject({ price: 2, originalPrice: 1, drinkServing: "poured" });
    expect(juiceBoxes).toMatchObject({ price: 2, drinkServing: "individual" });
    expect(juiceBoxes?.originalPrice).toBeUndefined();
  });

  it("applies the shopping-card discount to one choice", () => {
    let session = createGameSession();
    session = {
      ...session,
      campaign: {
        ...session.campaign,
        projectProgress: { ...session.campaign.projectProgress, "shopping-card": 10 },
      },
    };
    session = toggleShoppingCardDiscount(session, "vandens-stotele");
    session = addItem(session, "vandens-stotele");
    session = addItem(session, "krekeriu-pakeliai");

    const view = deriveGameView(session);
    expect(view.game.items.find((item) => item.id === "vandens-stotele")).toMatchObject({
      price: 0,
      shoppingCardDiscount: 1,
      tags: [{ label: "KORTELĖ −1 €" }],
    });
    expect(view.plan).toMatchObject({
      spent: 4,
      drinkPortions: 8,
      snackPortions: 6,
    });
  });

  it("applies the shopping-card discount after event surcharges", () => {
    let session = createGameSession();
    session = {
      ...session,
      campaign: {
        ...session.campaign,
        projectProgress: { ...session.campaign.projectProgress, "shopping-card": 10 },
      },
    };
    session = toggleEvent(session, "pamirsome-puodelius");
    session = toggleShoppingCardDiscount(session, "vandens-stotele");

    expect(deriveGameView(session).game.items.find((item) => item.id === "vandens-stotele")).toMatchObject({
      originalPrice: 1,
      price: 0,
      shoppingCardDiscount: 2,
    });
  });

  it("tracks snack portions supplied by an event", () => {
    const session = toggleEvent(createGameSession(), "naminiai-uzkandziai");

    expect(deriveGameView(session).plan).toMatchObject({
      snackPortions: 6,
      eventSuppliedSnackPortions: 6,
    });
  });

  it("consumes spoiling and durable portions as evenly as availability allows", () => {
    let session = createGameSession();
    session = {
      ...session,
      campaign: {
        ...session.campaign,
        carryoverResources: [{ kind: "long-lasting-snack-portions", amount: 8, sourceCelebration: 1 }],
      },
    };
    session = addMany(session, "darzoviu-lazdeles", 6);

    expect(deriveGameView(session).plan).toMatchObject({
      snackPortions: 32,
      spoilingSnackLeftovers: 7,
      longLastingSnackLeftovers: 0,
    });
  });

  it("includes bottle deposits in completion money", () => {
    let session = viablePlan();
    session = addItem(session, "limonado-buteliukai");
    const plan = deriveGameView(session).plan;

    expect(plan.depositRefund).toBe(2);
    expect(plan.available + plan.depositRefund).toBe(18);
  });

  it("derives whole-school requirements and modifiers", () => {
    const base = createGameSession();
    const session = { ...base, campaign: { ...base.campaign, wholeSchoolCelebration: true } };
    const plan = deriveGameView(session).plan;

    expect(plan.budget.total).toBe(60);
    expect(plan.participants.total).toBe(37);
    expect(plan).toMatchObject({
      requiredDrinkVariety: 3,
      requiredSnackVariety: 3,
      requiredActivityChoices: 2,
      requiredDecorationChoices: 2,
    });
  });

  it("completes the perfect-balance challenge for equal effective portion totals", () => {
    let session = createGameSession();
    session = addMany(session, "vandens-stotele", 4);
    session = addMany(session, "darzoviu-lazdeles", 3);
    session = addMany(session, "vaisiu-lekste", 2);
    session = addItem(session, "krekeriu-pakeliai");
    session = addItem(session, "viktorina");

    const view = deriveGameView(session);

    expect(view.plan).toMatchObject({ drinkPortions: 32, snackPortions: 32 });
    expect(view.completedChallengeIds.has("tobula-pusiausvyra")).toBe(true);
  });

  it("uses current refreshment prices for the per-participant challenge", () => {
    const regularView = deriveGameView(economicalPlan());
    const cupsView = deriveGameView(toggleEvent(economicalPlan(), "pamirsome-puodelius"));

    expect(regularView.plan).toMatchObject({ participants: { total: 25 }, spent: 21 });
    expect(regularView.completedChallengeIds.has("vaises-po-eura-kiekvienam")).toBe(true);
    expect(cupsView.plan.spent).toBe(26);
    expect(cupsView.completedChallengeIds.has("vaises-po-eura-kiekvienam")).toBe(false);
  });

  it("accepts either one hyped decoration or multiple plain decorations", () => {
    const oneHyped = deriveGameView(addItem(economicalPlan(), "balionai"));
    const mixed = deriveGameView(addItem(addItem(economicalPlan(), "balionai"), "staltiese"));
    const multiplePlain = deriveGameView(addItem(addItem(economicalPlan(), "staltiese"), "veliaveles"));

    expect(oneHyped.completedChallengeIds.has("vienas-ryskus-ar-keli-paprasti")).toBe(true);
    expect(mixed.completedChallengeIds.has("vienas-ryskus-ar-keli-paprasti")).toBe(false);
    expect(multiplePlain.completedChallengeIds.has("vienas-ryskus-ar-keli-paprasti")).toBe(true);
  });
});
