import { describe, expect, it } from "vitest";
import { EVENTS, emptyMoneyAllocation } from "./catalog";
import { deriveGameView, moneyAllocationTotal } from "./derive";
import {
  addItem,
  adjustBudget,
  adjustParticipants,
  advanceCelebration,
  createGameSession,
  flipAllEvents,
  toggleEvent,
  toggleShoppingCardDiscount,
  toggleFertilizerAllocation,
  toggleProjectAllocation,
  toggleUpgradeAllocation,
  type GameSession,
} from "./session";
import type { ItemId } from "./catalog";

function addMany(session: GameSession, itemId: ItemId, count: number): GameSession {
  let current = session;
  for (let index = 0; index < count; index += 1) current = addItem(current, itemId);
  return current;
}

function create24ParticipantSession(): GameSession {
  return adjustParticipants(createGameSession(), -1);
}

describe("session transitions", () => {
  it("limits teacher adjustments to ±30 euros and ±20 students", () => {
    const repeat = (count: number, transition: (session: GameSession) => GameSession) => {
      let session = createGameSession();
      for (let index = 0; index < count; index += 1) session = transition(session);
      return session;
    };

    const maximumBudget = repeat(30, (session) => adjustBudget(session, 1));
    const minimumBudget = repeat(30, (session) => adjustBudget(session, -1));
    expect(maximumBudget.round.budgetAdjustment).toBe(30);
    expect(minimumBudget.round.budgetAdjustment).toBe(-30);
    expect(adjustBudget(maximumBudget, 1)).toBe(maximumBudget);
    expect(adjustBudget(minimumBudget, -1)).toBe(minimumBudget);

    const maximumParticipants = repeat(20, (session) => adjustParticipants(session, 1));
    const minimumParticipants = repeat(20, (session) => adjustParticipants(session, -1));
    expect(maximumParticipants.round.participantAdjustment).toBe(20);
    expect(minimumParticipants.round.participantAdjustment).toBe(-20);
    expect(adjustParticipants(maximumParticipants, 1)).toBe(maximumParticipants);
    expect(adjustParticipants(minimumParticipants, -1)).toBe(minimumParticipants);
  });

  it("reveals every event without activating them all", () => {
    const initiallyActiveId = EVENTS[0].id;
    const session = toggleEvent(createGameSession(), initiallyActiveId);
    const revealed = flipAllEvents(session, true);

    expect(revealed.round.revealedEventIds).toEqual(EVENTS.map((event) => event.id));
    expect(revealed.round.activeEventIds).toEqual([initiallyActiveId]);

    const hidden = flipAllEvents(revealed, false);
    expect(hidden.round.revealedEventIds).toEqual([]);
    expect(hidden.round.activeEventIds).toEqual([]);
  });

  it("limits food and drinks to six placements per category", () => {
    const session = addMany(createGameSession(), "vandens-stotele", 8);

    expect(session.round.selection).toHaveLength(6);
    expect(session.round.nextPlacementId).toBe(7);
  });

  it("allows activities and decorations only once", () => {
    let session = addMany(createGameSession(), "viktorina", 3);
    session = addMany(session, "staltiese", 3);

    expect(session.round.selection.map((entry) => entry.itemId)).toEqual(["viktorina", "staltiese"]);
  });

  it("assigns an owned shopping card to paid items in every category", () => {
    const withoutCard = createGameSession();
    expect(() => toggleShoppingCardDiscount(withoutCard, "vandens-stotele")).toThrow("įsigijus");

    const withCard = {
      ...withoutCard,
      campaign: {
        ...withoutCard.campaign,
        projectProgress: { ...withoutCard.campaign.projectProgress, "shopping-card": 10 },
      },
    };
    for (const itemId of ["arbatos-rinkinys", "darzoviu-lazdeles", "popieriniu-lektuveliu-dirbtuves", "staltiese"] as const) {
      const discounted = toggleShoppingCardDiscount(withCard, itemId);
      expect(discounted.round.shoppingCardItemId).toBe(itemId);
      expect(deriveGameView(discounted).game.items.find((item) => item.id === itemId)).toMatchObject({
        id: itemId,
        shoppingCardDiscount: 2,
      });
    }
    expect(() => toggleShoppingCardDiscount(withCard, "viktorina")).toThrow("mokamai prekei");

    const discountedWater = toggleShoppingCardDiscount(withCard, "vandens-stotele");
    expect(deriveGameView(discountedWater).game.items.find((item) => item.id === "vandens-stotele")).toMatchObject({
      price: 0,
      shoppingCardDiscount: 1,
    });

    const discounted = toggleShoppingCardDiscount(withCard, "arbatos-rinkinys");
    const restored = toggleShoppingCardDiscount(discounted, "arbatos-rinkinys");
    expect(restored.round.shoppingCardItemId).toBeNull();
    expect(deriveGameView(restored).game.items.find((item) => item.id === "arbatos-rinkinys")).not.toHaveProperty("shoppingCardDiscount");
  });

  it("returns the shopping card when an event makes its target free", () => {
    const base = createGameSession();
    const withCard = {
      ...base,
      campaign: {
        ...base.campaign,
        projectProgress: { ...base.campaign.projectProgress, "shopping-card": 10 },
      },
    };
    const assigned = toggleShoppingCardDiscount(withCard, "valdomu-automobiliuku-trasa");
    const borrowed = toggleEvent(assigned, "pasiskolinome-masineles");

    expect(borrowed.round.shoppingCardItemId).toBeNull();
    expect(deriveGameView(borrowed).game.items.find((item) => item.id === "valdomu-automobiliuku-trasa")).toMatchObject({ price: 0 });
  });

  it("allows only one self-made choice", () => {
    for (const [first, blocked] of [
      ["viktorina", "popieriniu-kutu-girlianda"],
      ["popieriniu-kutu-girlianda", "viktorina"],
    ] as const) {
      const session = addItem(addItem(createGameSession(), first), blocked);
      const view = deriveGameView(session);
      const blockedItem = view.game.items.find((item) => item.id === blocked);

      expect(session.round.selection.map((entry) => entry.itemId)).toEqual([first]);
      expect(view.addableItemIds.has(blocked)).toBe(false);
      expect(blockedItem?.tags?.map((tag) => tag.label)).toEqual(["NELIKO LAIKO"]);
    }
  });

  it("carries durable food, ownership and project progress into the next celebration", () => {
    let session = create24ParticipantSession();
    session = addMany(session, "vandens-stotele", 3);
    session = addMany(session, "krekeriu-pakeliai", 5);
    session = addItem(session, "viktorina");
    session = addItem(session, "veliaveles");
    const allocation = {
      ...emptyMoneyAllocation(),
      projectAmounts: { ...emptyMoneyAllocation().projectAmounts, "large-celebration": 5 },
    };

    expect(deriveGameView(session).problems).toEqual([]);
    const next = advanceCelebration(session, {
      spoilingFoodChoice: null,
      longLastingFoodChoice: "pasilikti-kitai-sventei",
      moneyAllocation: allocation,
    });

    expect(next.campaign.celebrationNumber).toBe(2);
    expect(next.campaign.carryoverResources).toEqual([
      { kind: "long-lasting-snack-portions", amount: 6, sourceCelebration: 1 },
    ]);
    expect(next.campaign.ownedReusableItemIds).toContain("veliaveles");
    expect(next.campaign.projectProgress["large-celebration"]).toBe(5);
    expect(next.round.selection).toEqual([]);
    expect(next.round.shoppingCardItemId).toBeNull();
  });

  it("cycles progressive project funding in five-euro steps before wrapping to zero", () => {
    const session = createGameSession();
    let allocation = emptyMoneyAllocation();

    allocation = toggleProjectAllocation(session, allocation, "music-system");
    expect(allocation.projectAmounts["music-system"]).toBe(5);
    allocation = toggleProjectAllocation(session, allocation, "music-system");
    expect(allocation.projectAmounts["music-system"]).toBe(10);
    allocation = toggleProjectAllocation(session, allocation, "music-system");
    expect(allocation.projectAmounts["music-system"]).toBe(15);
    allocation = toggleProjectAllocation(session, allocation, "music-system");
    expect(allocation.projectAmounts["music-system"]).toBe(20);
    allocation = toggleProjectAllocation(session, allocation, "music-system");
    expect(allocation.projectAmounts["music-system"]).toBe(0);
  });

  it("buys the compost bin directly for five euros or deselects it", () => {
    const session = createGameSession();
    let allocation = toggleUpgradeAllocation(session, emptyMoneyAllocation(), "compost-bin");

    expect(allocation.upgradeIds).toEqual(["compost-bin"]);
    allocation = toggleUpgradeAllocation(session, allocation, "compost-bin");
    expect(allocation.upgradeIds).toEqual([]);
  });

  it("turns a completed large-celebration fund into the next scenario", () => {
    let session = create24ParticipantSession();
    session = addMany(session, "vandens-stotele", 3);
    session = addMany(session, "mini-sumustiniai", 3);
    session = addItem(session, "viktorina");
    session = {
      ...session,
      campaign: {
        ...session.campaign,
        projectProgress: { ...session.campaign.projectProgress, "large-celebration": 25 },
      },
    };
    const allocation = toggleProjectAllocation(session, emptyMoneyAllocation(), "large-celebration");

    const next = advanceCelebration(session, {
      spoilingFoodChoice: null,
      longLastingFoodChoice: null,
      moneyAllocation: allocation,
    });

    expect(next.campaign.wholeSchoolCelebration).toBe(true);
    expect(next.campaign.projectProgress["large-celebration"]).toBe(0);
    expect(deriveGameView(next).plan).toMatchObject({ budget: { total: 60 }, participants: { total: 36 } });
  });

  it("grows the plant twice when crumbs are composted and fertilizer is bought", () => {
    let session = create24ParticipantSession();
    session = addMany(session, "vandens-stotele", 3);
    session = addMany(session, "darzoviu-lazdeles", 6);
    session = addItem(session, "viktorina");
    session = {
      ...session,
      campaign: {
        ...session.campaign,
        ownedUpgradeIds: ["compost-bin"],
      },
    };

    const view = deriveGameView(session);
    expect(view.problems).toEqual([]);
    expect(view.plan).toMatchObject({
      spoilingSnackPortions: 24,
      spoilingSnackLeftovers: 0,
    });

    const allocation = toggleFertilizerAllocation(session, emptyMoneyAllocation());
    expect(allocation.fertilizer).toBe(true);
    expect(moneyAllocationTotal(view.game, allocation)).toBe(3);

    const next = advanceCelebration(session, {
      spoilingFoodChoice: "kompostuoti",
      longLastingFoodChoice: null,
      moneyAllocation: allocation,
    });

    expect(next.campaign.plantGrowth).toBe(2);
  });

  it("does not allow composting when the celebration had no spoiling food", () => {
    let session = create24ParticipantSession();
    session = addMany(session, "vandens-stotele", 3);
    session = addMany(session, "krekeriu-pakeliai", 5);
    session = addItem(session, "viktorina");
    session = {
      ...session,
      campaign: {
        ...session.campaign,
        ownedUpgradeIds: ["compost-bin"],
      },
    };

    expect(() => advanceCelebration(session, {
      spoilingFoodChoice: "kompostuoti",
      longLastingFoodChoice: null,
      moneyAllocation: emptyMoneyAllocation(),
    })).toThrow("Nėra gendančio maisto");
  });

  it("allows compost and fertilizer after the plant is fully grown", () => {
    let session = create24ParticipantSession();
    session = addMany(session, "vandens-stotele", 3);
    session = addMany(session, "darzoviu-lazdeles", 6);
    session = addItem(session, "viktorina");
    session = {
      ...session,
      campaign: {
        ...session.campaign,
        plantGrowth: 3,
        ownedUpgradeIds: ["compost-bin"],
      },
    };

    const allocation = toggleFertilizerAllocation(session, emptyMoneyAllocation());
    const next = advanceCelebration(session, {
      spoilingFoodChoice: "kompostuoti",
      longLastingFoodChoice: null,
      moneyAllocation: allocation,
    });

    expect(allocation.fertilizer).toBe(true);
    expect(next.campaign.plantGrowth).toBe(3);
  });

  it("unlocks the plant decoration at its third visual stage", () => {
    const session = createGameSession();
    const atSecondStage = deriveGameView({
      ...session,
      campaign: { ...session.campaign, plantGrowth: 1 },
    });
    const atThirdStage = deriveGameView({
      ...session,
      campaign: { ...session.campaign, plantGrowth: 2 },
    });

    expect(atSecondStage.game.items.find((item) => item.id === "klases-augalas")).toMatchObject({
      locked: true,
      tags: [{ label: "KANTRYBĖS" }],
    });
    expect(atThirdStage.game.items.find((item) => item.id === "klases-augalas")).toMatchObject({
      locked: false,
      tags: [{ label: "KANTRYBĖ ATSIPIRKO!" }],
    });
  });
});
