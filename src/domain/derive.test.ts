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
  session = addMany(session, "water-station", 3);
  session = addMany(session, "mini-sandwiches", 3);
  return addItem(session, "quiz");
}

function economicalPlan(): GameSession {
  let session = createGameSession();
  session = addMany(session, "water-station", 4);
  session = addItem(session, "tea-set");
  session = addMany(session, "vegetable-sticks", 3);
  session = addItem(session, "fruit-platter");
  session = addItem(session, "cookie-box");
  return addItem(session, "quiz");
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
    const effects = summarizeEventEffects(["friends-join", "spilled-drink", "advertised-items-cost-more"]);

    expect(effects.participantModifiers.map((modifier) => modifier.amount)).toEqual([6]);
    expect(effects.budgetModifiers.map((modifier) => modifier.amount)).toEqual([6]);
    expect(effects.drinkPortionsLost).toBe(6);
    expect(effects.hypeSurcharge).toBe(2);
  });

  it("applies event effects to the plan and resolved items", () => {
    let session = addItem(createGameSession(), "drink-mixing-station");
    for (const eventId of ["friends-join", "spilled-drink", "advertised-items-cost-more"] as const satisfies readonly EventId[]) {
      session = toggleEvent(session, eventId);
    }
    const view = deriveGameView(session);
    const lemonade = view.game.items.find((item) => item.id === "drink-mixing-station");

    expect(view.plan.budget.total).toBe(46);
    expect(view.plan.participants.total).toBe(31);
    expect(view.plan.drinkPortions).toBe(1);
    expect(lemonade).toMatchObject({ price: 9, originalPrice: 7 });
  });

  it("resolves a borrowed rental without changing its base definition", () => {
    const session = toggleEvent(createGameSession(), "borrowed-rc-cars");
    const cars = deriveGameView(session).game.items.find((item) => item.id === "rc-car-racing");

    expect(cars).toMatchObject({ price: 0, borrowed: true });
    expect(cars?.tags).toEqual([{ kind: "borrowed" }]);
  });

  it("adds the forgotten-cup cost only to poured drinks", () => {
    const session = toggleEvent(createGameSession(), "forgot-cups");
    const items = deriveGameView(session).game.items;
    const water = items.find((item) => item.id === "water-station");
    const juiceBoxes = items.find((item) => item.id === "juice-cartons");

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
    session = toggleShoppingCardDiscount(session, "water-station");
    session = addItem(session, "water-station");
    session = addItem(session, "cracker-packets");

    const view = deriveGameView(session);
    expect(view.game.items.find((item) => item.id === "water-station")).toMatchObject({
      price: 0,
      shoppingCardDiscount: 1,
      tags: [{ kind: "shopping-card-discount", amount: 1 }],
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
    session = toggleEvent(session, "forgot-cups");
    session = toggleShoppingCardDiscount(session, "water-station");

    expect(deriveGameView(session).game.items.find((item) => item.id === "water-station")).toMatchObject({
      originalPrice: 1,
      price: 0,
      shoppingCardDiscount: 2,
    });
  });

  it("tracks snack portions supplied by an event", () => {
    const session = toggleEvent(createGameSession(), "homemade-snacks");

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
    session = addMany(session, "vegetable-sticks", 6);

    expect(deriveGameView(session).plan).toMatchObject({
      snackPortions: 32,
      spoilingSnackLeftovers: 7,
      longLastingSnackLeftovers: 0,
    });
  });

  it("includes bottle deposits in completion money", () => {
    let session = viablePlan();
    session = addItem(session, "deposit-bottles");
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
    session = addMany(session, "water-station", 4);
    session = addMany(session, "vegetable-sticks", 3);
    session = addMany(session, "fruit-platter", 2);
    session = addItem(session, "cracker-packets");
    session = addItem(session, "quiz");

    const view = deriveGameView(session);

    expect(view.plan).toMatchObject({ drinkPortions: 32, snackPortions: 32 });
    expect(view.completedChallengeIds.has("perfect-balance")).toBe(true);
  });

  it("uses current refreshment prices for the per-participant challenge", () => {
    const regularView = deriveGameView(economicalPlan());
    const cupsView = deriveGameView(toggleEvent(economicalPlan(), "forgot-cups"));

    expect(regularView.plan).toMatchObject({ participants: { total: 25 }, spent: 21 });
    expect(regularView.completedChallengeIds.has("one-euro-refreshments")).toBe(true);
    expect(cupsView.plan.spent).toBe(26);
    expect(cupsView.completedChallengeIds.has("one-euro-refreshments")).toBe(false);
  });

  it("accepts either one hyped decoration or multiple plain decorations", () => {
    const oneHyped = deriveGameView(addItem(economicalPlan(), "balloons"));
    const mixed = deriveGameView(addItem(addItem(economicalPlan(), "balloons"), "tablecloth"));
    const multiplePlain = deriveGameView(addItem(addItem(economicalPlan(), "tablecloth"), "fabric-bunting"));

    expect(oneHyped.completedChallengeIds.has("one-bold-or-several-simple")).toBe(true);
    expect(mixed.completedChallengeIds.has("one-bold-or-several-simple")).toBe(false);
    expect(multiplePlain.completedChallengeIds.has("one-bold-or-several-simple")).toBe(true);
  });
});
