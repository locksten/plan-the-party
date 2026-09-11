import { assert } from "./assert";
import { createMissionState, type MissionState } from "./mission";

const STORAGE_VERSION = 17;
const SAVE_KEY = "plan-the-party:saves";

type StorageAdapter = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type SavedMissionSummary = Readonly<{
  id: string;
  planNumber: number;
}>;

export type MissionDraft = Readonly<{
  id: string;
  state: MissionState;
}>;

export type SavedMission = MissionDraft & SavedMissionSummary;
export type ActiveMission = MissionDraft | SavedMission;

type SaveFile = Readonly<{
  version: typeof STORAGE_VERSION;
  nextPlanNumber: number;
  missions: readonly SavedMission[];
}>;

function emptySaveFile(): SaveFile {
  return { version: STORAGE_VERSION, nextPlanNumber: 1, missions: [] };
}

function loadSaveFile(storage: StorageAdapter): SaveFile {
  const raw = storage.getItem(SAVE_KEY);
  if (raw === null) return emptySaveFile();

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    throw new Error("Failed to parse saved missions.");
  }
  assert(
    typeof parsed === "object"
      && parsed !== null
      && "version" in parsed,
    "The saved-mission file has an unsupported shape.",
  );
  if (parsed.version !== STORAGE_VERSION) {
    storage.removeItem(SAVE_KEY);
    return emptySaveFile();
  }
  return parsed as SaveFile;
}

function writeSaveFile(storage: StorageAdapter, saveFile: SaveFile) {
  storage.setItem(SAVE_KEY, JSON.stringify(saveFile));
}

export function loadMissionSummaries(storage: StorageAdapter = localStorage): readonly SavedMissionSummary[] {
  return [...loadSaveFile(storage).missions]
    .reverse()
    .map(({ id, planNumber }) => ({ id, planNumber }));
}

export function createMissionDraft(id: string = crypto.randomUUID()): MissionDraft {
  return { id, state: createMissionState() };
}

export function saveMission(id: string, state: MissionState, storage: StorageAdapter = localStorage): SavedMission {
  const saveFile = loadSaveFile(storage);
  const existing = saveFile.missions.find((mission) => mission.id === id);
  const mission: SavedMission = existing === undefined
    ? { id, planNumber: saveFile.nextPlanNumber, state }
    : { ...existing, state };

  writeSaveFile(storage, {
    version: STORAGE_VERSION,
    nextPlanNumber: existing === undefined ? saveFile.nextPlanNumber + 1 : saveFile.nextPlanNumber,
    missions: existing === undefined
      ? [...saveFile.missions, mission]
      : saveFile.missions.map((candidate) => candidate.id === id ? mission : candidate),
  });
  return mission;
}

export function loadSavedMission(id: string, storage: StorageAdapter = localStorage): SavedMission {
  const mission = loadSaveFile(storage).missions.find((candidate) => candidate.id === id);
  assert(mission !== undefined, `Saved mission "${id}" was not found.`);
  return mission;
}

export function deleteSavedMission(id: string, storage: StorageAdapter = localStorage) {
  const saveFile = loadSaveFile(storage);
  assert(saveFile.missions.some((mission) => mission.id === id), `Cannot delete unknown mission "${id}".`);
  writeSaveFile(storage, {
    ...saveFile,
    missions: saveFile.missions.filter((mission) => mission.id !== id),
  });
}
