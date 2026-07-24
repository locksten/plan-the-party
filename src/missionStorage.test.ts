import { describe, expect, it } from "vitest";
import { addItem, adjustBudget } from "./domain/session";
import {
  classLabelForNumber,
  createMissionDraft,
  deleteSavedMission,
  loadMissionSummaries,
  loadSavedMission,
  saveMission,
} from "./missionStorage";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    values,
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => {
      values.delete(key);
    },
  };
}

describe("mission storage", () => {
  it("assigns stable sequential class labels", () => {
    expect(classLabelForNumber(0)).toBe("A");
    expect(classLabelForNumber(25)).toBe("Z");
    expect(classLabelForNumber(26)).toBe("AA");
  });

  it("deletes saves with mismatched storage versions", () => {
    const storage = memoryStorage();
    storage.values.set("plan-the-party:saves", JSON.stringify({ version: 1, missions: [{ id: "old" }] }));

    expect(loadMissionSummaries(storage)).toEqual([]);
    expect(storage.values.has("plan-the-party:saves")).toBe(false);
    storage.values.set("plan-the-party:saves", JSON.stringify({ version: 15 }));

    expect(loadMissionSummaries(storage)).toEqual([]);
    expect(storage.values.has("plan-the-party:saves")).toBe(false);
  });

  it("creates, updates, loads and deletes independent missions in one save file", () => {
    const storage = memoryStorage();
    const firstDraft = createMissionDraft("first");
    const secondDraft = createMissionDraft("second");
    expect(firstDraft.state.eventCardsCue).toBe("waiting");
    expect(loadMissionSummaries(storage)).toEqual([]);

    const first = saveMission(firstDraft.id, firstDraft.state, storage);
    const second = saveMission(secondDraft.id, secondDraft.state, storage);
    expect(first.classLabel).toBe("A");
    expect(second.classLabel).toBe("B");
    expect(storage.values.size).toBe(1);
    expect(loadMissionSummaries(storage).map((mission) => mission.id)).toEqual(["second", "first"]);

    const changedSession = adjustBudget(addItem(first.state.session, "water-station"), 1);
    saveMission(first.id, {
      ...first.state,
      session: changedSession,
      revealedDiscussionIds: ["what-to-give-up"],
      eventCardsCue: "opened",
    }, storage);

    expect(loadSavedMission(first.id, storage).state).toMatchObject({
      session: {
        round: {
          selection: [{ itemId: "water-station" }],
          budgetAdjustment: 1,
        },
      },
      revealedDiscussionIds: ["what-to-give-up"],
      eventCardsCue: "opened",
    });
    expect(loadSavedMission(second.id, storage).state.session.round.selection).toEqual([]);

    deleteSavedMission(first.id, storage);
    expect(loadMissionSummaries(storage).map((mission) => mission.id)).toEqual(["second"]);
    expect(() => loadSavedMission(first.id, storage)).toThrow("was not found");

    const thirdDraft = createMissionDraft("third");
    expect(saveMission(thirdDraft.id, thirdDraft.state, storage).classLabel).toBe("C");
  });
});
