import type {
  ChallengeCard,
  GameConfigModel,
  ItemDefinition,
  MysteryEvent,
  ResolvedItem,
  SelectionModel,
} from "./model";

export const BASE_BUDGET = 40;
export const BASE_PARTICIPANTS = 25;
export const MAX_REPEATABLE_ITEMS_PER_CATEGORY = 6;
const TEACHER_BUDGET_ADJUSTMENT_LIMIT = 30;
const TEACHER_PARTICIPANT_ADJUSTMENT_LIMIT = 20;
export const TEACHER_BUDGET_RANGE = {
  min: BASE_BUDGET - TEACHER_BUDGET_ADJUSTMENT_LIMIT,
  max: BASE_BUDGET + TEACHER_BUDGET_ADJUSTMENT_LIMIT,
} as const;
export const TEACHER_PARTICIPANT_RANGE = {
  min: BASE_PARTICIPANTS - TEACHER_PARTICIPANT_ADJUSTMENT_LIMIT,
  max: BASE_PARTICIPANTS + TEACHER_PARTICIPANT_ADJUSTMENT_LIMIT,
} as const;
export const SHOPPING_CARD_DISCOUNT = 2;

export const ITEMS = [
  { id: "vandens-stotele", name: "Vandens stotelė", category: "gerimai", price: 1, portions: 8, drinkServing: "poured", art: "water-station" },
  { id: "arbatos-rinkinys", name: "Arbatos rinkinys", category: "gerimai", price: 2, portions: 6, drinkServing: "poured", art: "tea-set" },
  { id: "sulciu-pakeliai", name: "Sulčių pakeliai", category: "gerimai", price: 2, portions: 4, drinkServing: "individual", art: "juice-cartons" },
  { id: "namine-uogu-gaiva", name: "Uogų gaiva", category: "gerimai", price: 4, portions: 10, drinkServing: "poured", art: "berry-punch" },
  { id: "limonado-buteliukai", name: "Limonado buteliukai", category: "gerimai", price: 6, portions: 8, drinkServing: "individual", depositRefund: 2, tags: [{ label: "UŽSTATAS 2 €", tone: "standard" }], art: "deposit-bottles" },
  { id: "gerimu-maisymo-stotele", name: "Gėrimų laboratorija", category: "gerimai", price: 7, portions: 7, drinkServing: "poured", tags: [{ label: "SUSIKURK SKONĮ!", tone: "hype" }], hype: true, art: "drink-mixing-station" },

  { id: "darzoviu-lazdeles", name: "Daržovių lazdelės", category: "uzkandziai", price: 2, portions: 4, shelfLife: "spoiling", art: "vegetable-sticks" },
  { id: "krekeriu-pakeliai", name: "Krekerių pakeliai", category: "uzkandziai", price: 4, portions: 6, shelfLife: "long-lasting", tags: [{ label: "ILGAI IŠLIEKA", tone: "standard" }], art: "cracker-packets" },
  { id: "vaisiu-lekste", name: "Vaisių lėkštė", category: "uzkandziai", price: 4, portions: 7, shelfLife: "spoiling", art: "fruit-platter" },
  { id: "mini-sumustiniai", name: "Mini sumuštiniai", category: "uzkandziai", price: 5, portions: 9, shelfLife: "spoiling", art: "mini-sandwiches" },
  { id: "sausainiu-dezute", name: "Sausainių dėžutė", category: "uzkandziai", price: 5, portions: 6, shelfLife: "long-lasting", tags: [{ label: "ILGAI IŠLIEKA", tone: "standard" }], art: "cookie-box" },
  { id: "sventinis-tortas", name: "Šventinis tortas", category: "uzkandziai", price: 10, portions: 10, shelfLife: "spoiling", tags: [{ label: "SALDŽIAUSIA AKIMIRKA!", tone: "hype" }], hype: true, art: "celebration-cake" },

  { id: "viktorina", name: "Klasės viktorina", category: "veikla", price: 0, selfMade: true, tags: [{ label: "PATYS!", tone: "standard" }], art: "quiz" },
  { id: "popieriniu-lektuveliu-dirbtuves", name: "Lėktuvėlių dirbtuvės", category: "veikla", price: 3, art: "paper-airplane-challenge" },
  { id: "karoliuku-apyrankiu-dirbtuves", name: "Apyrankių dirbtuvės", category: "veikla", price: 5, tags: [{ label: "TAVO STILIUS!", tone: "hype" }], hype: true, art: "bracelet-workshop" },
  { id: "valdomu-automobiliuku-trasa", name: "Mašinėlių lenktynės", category: "veikla", price: 6, tags: [{ label: "NUOMA", tone: "standard" }], art: "rc-car-racing" },
  { id: "taiklumo-zaidimu-rinkinys", name: "Taiklumo žaidimai", category: "veikla", price: 8, tags: [{ label: "DAUGKARTINIS", tone: "standard" }], reusable: true, art: "target-games" },

  { id: "popieriniu-kutu-girlianda", name: "Kutų girlianda", category: "papildomai", price: 0, selfMade: true, tags: [{ label: "PATYS!", tone: "standard" }], art: "paper-tassel-garland" },
  { id: "staltiese", name: "Popierinė staltiesė", category: "papildomai", price: 3, art: "tablecloth" },
  { id: "veliaveles", name: "Medžiaginės vėliavėlės", category: "papildomai", price: 4, tags: [{ label: "DAUGKARTINĖS", tone: "standard" }], reusable: true, art: "fabric-bunting" },
  { id: "balionai", name: "Spalvoti balionai", category: "papildomai", price: 7, tags: [{ label: "ŠVENTĖ ORE!", tone: "hype" }], hype: true, art: "balloons" },
  { id: "sviesu-projektorius", name: "Šviesų projektorius", category: "papildomai", price: 10, tags: [{ label: "ĮJUNK SPINDESĮ!", tone: "hype" }, { label: "DAUGKARTINIS", tone: "standard" }], hype: true, reusable: true, art: "party-light-projector" },
] as const satisfies readonly ItemDefinition[];

export const PROGRESSION_ITEMS = [
  { id: "karaokes-scena", name: "Karaokės scena", category: "veikla", price: 0, reusable: true, art: "karaoke-stage" },
  { id: "klases-augalas", name: "Klasės augalas", category: "papildomai", price: 0, reusable: true, art: "plant" },
] as const satisfies readonly ItemDefinition[];

export type ItemId = (typeof ITEMS)[number]["id"] | (typeof PROGRESSION_ITEMS)[number]["id"];
export type GameItem = ResolvedItem<ItemId>;
export type Selection = SelectionModel<ItemId>;
export type GameConfig = GameConfigModel<ItemId>;

export const EVENTS = [
  { id: "mokyklos-fotografas", title: "Atvyks mokyklos fotografas", description: "Kad nuotraukos būtų šventiškos, pasirinkite bent du papuošimus.", effects: [{ kind: "minimumChoices", category: "papildomai", count: 2 }] },
  { id: "pasiskolinome-masineles", title: "Pasiskolinome mašinėles", description: "Mašinėlių lenktynės šįkart kainuoja 0 €.", effects: [{ kind: "borrowedItem", itemId: "valdomu-automobiliuku-trasa" }] },
  { id: "pamirsome-puodelius", title: "Pamiršome puodelius", description: "Prie kiekvieno pilstomo gėrimo kainos prisideda 1 € už puodelius.", effects: [{ kind: "pouredDrinkSurcharge", amount: 1 }] },
  { id: "naminiai-uzkandziai", title: "Atnešė naminių užkandžių", description: "Klasė atsinešė 6 papildomas užkandžių porcijas.", effects: [{ kind: "snackBonus", amount: 6 }] },
  { id: "svente-uzsites", title: "Šventė užsitęs", description: "Kad veiklos nepritrūktų, pasirinkite bent dvi skirtingas veiklas.", effects: [{ kind: "minimumChoices", category: "veikla", count: 2 }] },
  { id: "reklama-pabrango", title: "Reklamuojamos prekės pabrango", description: "Daiktai su reklaminiu šūkiu kainuoja 2 € daugiau.", effects: [{ kind: "hypeSurcharge", amount: 2 }] },
  { id: "prisijungia-draugai", title: "Prisijungia draugai", description: "Prisijungia 6 mokiniai ir atsineša 6 €, bet vaišių dabar reikės ir jiems.", effects: [{ kind: "budgetBonus", amount: 6 }, { kind: "participants", amount: 6 }] },
  { id: "issiliejo", title: "Išsiliejo gėrimas", description: "Praradote 6 gėrimo porcijas.", effects: [{ kind: "drinkLoss", amount: 6 }] },
] as const satisfies readonly MysteryEvent[];

export type EventId = (typeof EVENTS)[number]["id"];
export type EventCard = (typeof EVENTS)[number];

export const CHALLENGES = [
  { id: "ivairove-ant-stalo", title: "Įvairovė ant stalo", description: "Pasirinkite bent po 3 skirtingus gėrimus ir užkandžius.", rule: { kind: "minimumVariety", drinkChoices: 3, snackChoices: 3 } },
  { id: "tobula-pusiausvyra", title: "Tobula pusiausvyra", description: "Paruoškite vienodą skaičių gėrimų ir užkandžių porcijų.", rule: { kind: "equalRefreshmentPortions" } },
  { id: "tiek-kiek-reikia", title: "Tiek, kiek reikia", description: "Suplanuokite taip, kad liktų ne daugiau kaip 1 gėrimo ir 1 užkandžio porcija.", rule: { kind: "maximumSurplusPortions", drinks: 1, snacks: 1 } },
  { id: "vaises-po-eura-kiekvienam", title: "Vaišės po eurą kiekvienam", description: "Gėrimams ir užkandžiams skirkite ne daugiau kaip po 1 € vienam mokiniui.", rule: { kind: "refreshmentsWithinParticipantBudget" } },
  { id: "vienas-brangesnis-pirkinys", title: "Vienas brangesnis pirkinys", description: "Pasirinkite tik vieną 7 € ar brangesnį daiktą.", rule: { kind: "exactlyOneAtOrAbovePrice", price: 7 } },
  { id: "vienas-ryskus-ar-keli-paprasti", title: "Vienas ryškus ar keli paprasti?", description: "Rinkitės arba vieną papuošimą su reklaminiu šūkiu, arba bent du be reklaminio šūkio.", rule: { kind: "oneHypeOrMultiplePlainDecorations" } },
  { id: "pravers-ir-rytoj", title: "Pravers ir rytoj", description: "Pasirinkite daugkartinį daiktą ir ilgai išsilaikantį užkandį.", rule: { kind: "reusableWithLongLastingSnack" } },
  { id: "ir-smagu-ir-taupu", title: "Ir smagu, ir taupu", description: "Pasirinkite bent vieną daiktą su reklaminiu šūkiu ir sutaupykite bent 7 €.", rule: { kind: "hypeWithRemainingMoney", minimumRemaining: 7 } },
] as const satisfies readonly ChallengeCard[];

export type ChallengeId = (typeof CHALLENGES)[number]["id"];
export type Challenge = (typeof CHALLENGES)[number];

export const PROJECTS = [
  { id: "large-celebration", title: "Didžiosios šventės fondas", description: "Atrakina šventę „Visa mokykla prie vieno stalo“.", target: 30, repeatable: true },
  { id: "music-system", title: "Klasės garso sistema", description: "Atrakina nemokamą daugkartinę karaokės sceną.", target: 20, repeatable: false },
  { id: "shopping-card", title: "Pirkėjo kortelė", description: `Vieną pasirinktą prekę atpigina iki ${SHOPPING_CARD_DISCOUNT} €.`, target: 10, repeatable: false },
] as const;

export const UPGRADES = [
  { id: "compost-bin", title: "Komposto dėžė", description: "Leidžia kompostuoti gendančio maisto likučius ir auginti klasės augalą.", price: 5 },
] as const;

export type ProjectId = (typeof PROJECTS)[number]["id"];
export type ProjectDefinition = (typeof PROJECTS)[number];
export type UpgradeId = (typeof UPGRADES)[number]["id"];
export type UpgradeDefinition = (typeof UPGRADES)[number];
export type ProjectProgress = Readonly<Record<ProjectId, number>>;
export type MoneyAllocation = Readonly<{
  reusableItemIds: readonly ItemId[];
  upgradeIds: readonly UpgradeId[];
  projectAmounts: Readonly<Record<ProjectId, number>>;
  fertilizer: boolean;
}>;

export const PROJECT_IDS = PROJECTS.map((project) => project.id);
export const FERTILIZER_COST = 3;
export const PROJECT_ALLOCATION_STEP = 5;
export const MAX_PLANT_GROWTH = 3;
export const PLANT_ITEM_UNLOCK_STAGE = 3;

export const LARGE_CELEBRATION = {
  participantBonus: 12,
  budgetBonus: 20,
  minimumDrinkVariety: 3,
  minimumSnackVariety: 3,
  minimumActivities: 2,
  minimumDecorations: 2,
} as const;

export function emptyProjectProgress(): ProjectProgress {
  return { "large-celebration": 0, "music-system": 0, "shopping-card": 0 };
}

export function emptyMoneyAllocation(): MoneyAllocation {
  return { reusableItemIds: [], upgradeIds: [], projectAmounts: emptyProjectProgress(), fertilizer: false };
}

export function projectDefinition(id: ProjectId): ProjectDefinition {
  return PROJECTS.find((project) => project.id === id)!;
}

export function projectComplete(progress: ProjectProgress, id: ProjectId): boolean {
  return progress[id] >= projectDefinition(id).target;
}

export function upgradeDefinition(id: UpgradeId): UpgradeDefinition {
  return UPGRADES.find((upgrade) => upgrade.id === id)!;
}
