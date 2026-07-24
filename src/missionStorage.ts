import { assert } from "./assert";
import { createMissionState, type MissionState } from "./mission";

const STORAGE_VERSION = 16;
const SAVE_KEY = "plan-the-party:saves";

type StorageAdapter = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type SavedMissionSummary = Readonly<{
  id: string;
  classLabel: string;
}>;

export type MissionDraft = Readonly<{
  id: string;
  state: MissionState;
}>;

export type SavedMission = SavedMissionSummary & Readonly<{ state: MissionState }>;
export type ActiveMission = MissionDraft | SavedMission;

type SaveFile = Readonly<{
  version: typeof STORAGE_VERSION;
  nextClassNumber: number;
  missions: readonly SavedMission[];
}>;

function emptySaveFile(): SaveFile {
  return { version: STORAGE_VERSION, nextClassNumber: 0, missions: [] };
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

export function classLabelForNumber(number: number): string {
  assert(Number.isInteger(number) && number >= 0, "The class number must be a non-negative integer.");
  let remaining = number;
  let label = "";
  do {
    label = String.fromCharCode(65 + (remaining % 26)) + label;
    remaining = Math.floor(remaining / 26) - 1;
  } while (remaining >= 0);
  return label;
}

export function loadMissionSummaries(storage: StorageAdapter = localStorage): readonly SavedMissionSummary[] {
  return [...loadSaveFile(storage).missions]
    .reverse()
    .map(({ id, classLabel }) => ({ id, classLabel }));
}

export function createMissionDraft(id: string = crypto.randomUUID()): MissionDraft {
  return { id, state: createMissionState() };
}

export function saveMission(id: string, state: MissionState, storage: StorageAdapter = localStorage): SavedMission {
  const saveFile = loadSaveFile(storage);
  const existing = saveFile.missions.find((mission) => mission.id === id);
  const mission: SavedMission = existing === undefined
    ? { id, classLabel: classLabelForNumber(saveFile.nextClassNumber), state }
    : { ...existing, state };

  writeSaveFile(storage, {
    version: STORAGE_VERSION,
    nextClassNumber: existing === undefined ? saveFile.nextClassNumber + 1 : saveFile.nextClassNumber,
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
