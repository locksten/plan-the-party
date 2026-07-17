export type CategoryId = "gerimai" | "uzkandziai" | "veikla" | "papildomai";
export type ModeId = "paprasta" | "iprasta" | "issukis";
export type MysteryEventId = "puodeliai" | "sveciai" | "pristatymas" | "issiliejo" | "nukrito-padeklas" | "santaupos";
export type ChallengeId = "atsargesnis-planas" | "nemokama-pramoga" | "liko-rytojui" | "pasidaryk-pats" | "daugkartinis-pasirinkimas" | "reklama-neitikino";
export type ItemArtId =
  | "water-pitchers"
  | "fruit-water"
  | "apple-juice"
  | "cocoa-thermos"
  | "festive-lemonade"
  | "classroom-quiz"
  | "active-games"
  | "board-games"
  | "dance-hour"
  | "craft-workshop"
  | "paper-garlands"
  | "name-cards"
  | "fabric-bunting"
  | "balloons"
  | "photo-wall"
  | "fruit-platter"
  | "popcorn-bowl"
  | "cookie-plate"
  | "mini-sandwiches"
  | "celebration-cake";

export type GameItem = {
  id: string;
  name: string;
  category: CategoryId;
  price: number;
  portions?: number;
  note: string;
  pitch?: string;
  hype?: boolean;
  art?: ItemArtId;
};

export type EventEffect =
  | { kind: "expense"; amount: number }
  | { kind: "budgetBonus"; amount: number }
  | { kind: "participants"; amount: number }
  | { kind: "drinkLoss"; amount: number }
  | { kind: "snackLoss"; amount: number };

export type MysteryEvent = {
  id: MysteryEventId;
  title: string;
  description: string;
  effect: EventEffect;
};

export type GameMode = {
  id: ModeId;
  grades: string;
  title: string;
  budget: number;
  suggestedReserve: number;
  participants?: number;
  items: readonly GameItem[];
  mysteryEvents: readonly MysteryEvent[];
  reflection: readonly string[];
};

export type Selection = Readonly<Record<string, number>>;

export type GamePlan = {
  spent: number;
  eventExpenses: number;
  totalSpent: number;
  budgetBonus: number;
  totalFunds: number;
  reserve: number;
  available: number;
  participants?: number;
  drinkPortions: number;
  snackPortions: number;
  drinkPortionsLost: number;
  snackPortionsLost: number;
  hasDrink: boolean;
  hasSnack: boolean;
  hasActivity: boolean;
};

type ChallengeRule =
  | { kind: "reserveAboveSuggested"; amount: number }
  | { kind: "freeActivity" }
  | { kind: "minimumAvailable"; amount: number }
  | { kind: "selectedItem"; itemId: string }
  | { kind: "selectedAnyItem"; itemIds: readonly string[] }
  | { kind: "avoidHype" };

export type ChallengeCard = {
  id: ChallengeId;
  title: string;
  description: string;
  rule: ChallengeRule;
};

const MAX_ITEM_QUANTITY = 6;
export const PARTICIPANT_RANGE = { min: 6, max: 50 } as const;

const SIMPLE_ITEMS = [
  { id: "vanduo", name: "Vanduo", category: "gerimai", price: 2, note: "Visai klasei", pitch: "GERIAUSIA KAINA", art: "water-pitchers" },
  { id: "vaisiu-vanduo", name: "Vaisių vanduo", category: "gerimai", price: 4, note: "Visai klasei", pitch: "GAIVU!", art: "fruit-water" },
  { id: "obuoliu-sultys", name: "Obuolių sultys", category: "gerimai", price: 6, note: "Visai klasei", pitch: "VAIKŲ MĖGSTAMA", art: "apple-juice" },
  { id: "silta-kakava", name: "Šilta kakava", category: "gerimai", price: 8, note: "Visai klasei", pitch: "JAUKU!", art: "cocoa-thermos" },
  { id: "sventinis-limonadas", name: "Šventinis limonadas", category: "gerimai", price: 11, note: "Visai klasei", pitch: "YPAČ MADINGA", hype: true, art: "festive-lemonade" },

  { id: "vaisiu-lekste", name: "Vaisių lėkštė", category: "uzkandziai", price: 4, note: "Visai klasei", pitch: "SVEIKA!", art: "fruit-platter" },
  { id: "spragesiai", name: "Spragėsių dubuo", category: "uzkandziai", price: 5, note: "Visai klasei", pitch: "DAUG!", art: "popcorn-bowl" },
  { id: "sausainiai", name: "Sausainių lėkštė", category: "uzkandziai", price: 7, note: "Visai klasei", pitch: "TRAŠKU!", art: "cookie-plate" },
  { id: "sumustiniai", name: "Mini sumuštiniai", category: "uzkandziai", price: 10, note: "Visai klasei", pitch: "SOTU!", art: "mini-sandwiches" },
  { id: "tortas", name: "Šventinis tortas", category: "uzkandziai", price: 13, note: "Visai klasei", pitch: "LABAI SKANU!", hype: true, art: "celebration-cake" },

  { id: "viktorina", name: "Klasės viktorina", category: "veikla", price: 0, note: "Paruošia mokiniai", pitch: "NEMOKAMA!", art: "classroom-quiz" },
  { id: "judrieji-zaidimai", name: "Judrieji žaidimai", category: "veikla", price: 2, note: "Reikia tik laisvos vietos", pitch: "JUDAM!", art: "active-games" },
  { id: "stalo-zaidimai", name: "Stalo žaidimų kampelis", category: "veikla", price: 4, note: "Tiks ir kitą kartą", pitch: "DAUGKARTINIAI", art: "board-games" },
  { id: "sokiu-valanda", name: "Šokių valanda", category: "veikla", price: 6, note: "Reikia kolonėlės", pitch: "ŠVENTĖS HITAS", art: "dance-hour" },
  { id: "kurybos-dirbtuves", name: "Kūrybos dirbtuvės", category: "veikla", price: 9, note: "Priemonės visai klasei", pitch: "KURIAME!", art: "craft-workshop" },

  { id: "popierines-girliandos", name: "Popierinės girliandos", category: "papildomai", price: 0, note: "Pasigaminame klasėje", pitch: "PATYS!", art: "paper-garlands" },
  { id: "vardu-korteles", name: "Vardų kortelės", category: "papildomai", price: 2, note: "Kiekvienam mokiniui", art: "name-cards" },
  { id: "veliaveles", name: "Medžiaginės vėliavėlės", category: "papildomai", price: 4, note: "Tiks ir kitai šventei", pitch: "DAUGKARTINĖS", art: "fabric-bunting" },
  { id: "balionai", name: "Spalvoti balionai", category: "papildomai", price: 6, note: "Gražu tik vieną kartą", pitch: "ŠVENTIŠKA!", art: "balloons" },
  { id: "foto-siena", name: "Šventinė foto siena", category: "papildomai", price: 9, note: "Ryškus klasės kampas", pitch: "WOW!", hype: true, art: "photo-wall" },
] as const satisfies readonly GameItem[];

const ADVANCED_ITEMS = [
  { id: "vandens-asociai", name: "Vandens ąsočiai", category: "gerimai", price: 2, portions: 24, note: "24 porcijos", pitch: "GERIAUSIA KAINA", art: "water-pitchers" },
  { id: "vaisiu-vanduo", name: "Vaisių vanduo", category: "gerimai", price: 3, portions: 12, note: "12 porcijų", pitch: "GAIVU!", art: "fruit-water" },
  { id: "obuoliu-sultys", name: "Obuolių sultys", category: "gerimai", price: 4, portions: 8, note: "8 porcijos", pitch: "SKANU!", art: "apple-juice" },
  { id: "kakavos-termosas", name: "Kakavos termosas", category: "gerimai", price: 6, portions: 12, note: "12 porcijų", pitch: "JAUKU!", art: "cocoa-thermos" },
  { id: "sventinis-limonadas", name: "Šventinis limonadas", category: "gerimai", price: 5, portions: 6, note: "6 porcijos", pitch: "YPAČ MADINGA", hype: true, art: "festive-lemonade" },

  { id: "spragesiu-dubuo", name: "Spragėsių dubuo", category: "uzkandziai", price: 3, portions: 12, note: "12 porcijų", pitch: "DAUG PORCIJŲ", art: "popcorn-bowl" },
  { id: "vaisiu-lekste", name: "Vaisių lėkštė", category: "uzkandziai", price: 5, portions: 12, note: "12 porcijų", pitch: "SVEIKA!", art: "fruit-platter" },
  { id: "sausainiu-lekste", name: "Sausainių lėkštė", category: "uzkandziai", price: 5, portions: 8, note: "8 porcijos", pitch: "TRAŠKU!", art: "cookie-plate" },
  { id: "mini-sumustiniai", name: "Mini sumuštiniai", category: "uzkandziai", price: 7, portions: 8, note: "8 porcijos", pitch: "SOTU!", art: "mini-sandwiches" },
  { id: "sventinis-tortas", name: "Šventinis tortas", category: "uzkandziai", price: 11, portions: 6, note: "6 porcijos", pitch: "LABAI SKANU!", hype: true, art: "celebration-cake" },

  { id: "viktorina", name: "Klasės viktorina", category: "veikla", price: 0, note: "Paruošia mokiniai", pitch: "NEMOKAMA!", art: "classroom-quiz" },
  { id: "judrieji-zaidimai", name: "Judrieji žaidimai", category: "veikla", price: 2, note: "Reikia tik laisvos vietos", pitch: "JUDAM!", art: "active-games" },
  { id: "stalo-zaidimai", name: "Stalo žaidimų kampelis", category: "veikla", price: 5, note: "Tiks ir kitą kartą", pitch: "DAUGKARTINIAI", art: "board-games" },
  { id: "sokiu-valanda", name: "Šokių valanda", category: "veikla", price: 7, note: "Reikia kolonėlės", pitch: "ŠVENTĖS HITAS", art: "dance-hour" },
  { id: "kurybos-dirbtuves", name: "Kūrybos dirbtuvės", category: "veikla", price: 10, note: "Priemonės visai klasei", pitch: "KURIAME!", art: "craft-workshop" },

  { id: "popierines-girliandos", name: "Popierinės girliandos", category: "papildomai", price: 0, note: "Pasigaminame klasėje", pitch: "PATYS!", art: "paper-garlands" },
  { id: "vardu-korteles", name: "Vardų kortelės", category: "papildomai", price: 2, note: "Kiekvienam mokiniui", art: "name-cards" },
  { id: "veliaveles", name: "Medžiaginės vėliavėlės", category: "papildomai", price: 4, note: "Tiks ir kitai šventei", pitch: "DAUGKARTINĖS", art: "fabric-bunting" },
  { id: "balionai", name: "Spalvoti balionai", category: "papildomai", price: 6, note: "Gražu tik vieną kartą", pitch: "ŠVENTIŠKA!", art: "balloons" },
  { id: "foto-siena", name: "Šventinė foto siena", category: "papildomai", price: 10, note: "Ryškus klasės kampas", pitch: "WOW!", hype: true, art: "photo-wall" },
] as const satisfies readonly GameItem[];

const SIMPLE_MYSTERY_EVENTS = [
  { id: "puodeliai", title: "Pamiršome puodelius", description: "Puodeliams reikia papildomai skirti 2 €.", effect: { kind: "expense", amount: 2 } },
  { id: "sveciai", title: "Atėjo du svečiai", description: "Papildomoms vaišėms reikia skirti 2 €.", effect: { kind: "expense", amount: 2 } },
  { id: "pristatymas", title: "Pabrango pristatymas", description: "Prie bendrų išlaidų prisideda 3 €.", effect: { kind: "expense", amount: 3 } },
  { id: "issiliejo", title: "Išsiliejo gėrimas", description: "Pakaitiniam gėrimui reikia skirti 3 €.", effect: { kind: "expense", amount: 3 } },
  { id: "nukrito-padeklas", title: "Nukrito užkandžių padėklas", description: "Pakaitiniams užkandžiams reikia skirti 3 €.", effect: { kind: "expense", amount: 3 } },
  { id: "santaupos", title: "Pravertė santaupos", description: "Klasės taupyklėje buvo likę 4 €. Pridėkite juos prie biudžeto.", effect: { kind: "budgetBonus", amount: 4 } },
] as const satisfies readonly MysteryEvent[];

const PORTION_MYSTERY_EVENTS = [
  { id: "puodeliai", title: "Pamiršome puodelius", description: "Puodeliams reikia papildomai skirti 2 €.", effect: { kind: "expense", amount: 2 } },
  { id: "sveciai", title: "Atėjo du svečiai", description: "Gėrimų ir užkandžių turi užtekti dar 2 mokiniams.", effect: { kind: "participants", amount: 2 } },
  { id: "pristatymas", title: "Pabrango pristatymas", description: "Prie bendrų išlaidų prisideda 3 €.", effect: { kind: "expense", amount: 3 } },
  { id: "issiliejo", title: "Išsiliejo gėrimas", description: "Praradote 6 gėrimo porcijas.", effect: { kind: "drinkLoss", amount: 6 } },
  { id: "nukrito-padeklas", title: "Nukrito užkandžių padėklas", description: "Praradote 6 užkandžių porcijas.", effect: { kind: "snackLoss", amount: 6 } },
  { id: "santaupos", title: "Pravertė santaupos", description: "Klasės taupyklėje buvo likę 4 €. Pridėkite juos prie biudžeto.", effect: { kind: "budgetBonus", amount: 4 } },
] as const satisfies readonly MysteryEvent[];

export const CHALLENGES = [
  {
    id: "atsargesnis-planas",
    title: "Atsargesnis planas",
    description: "Palikite 2 € daugiau nei pradinis rezervas.",
    rule: { kind: "reserveAboveSuggested", amount: 2 },
  },
  {
    id: "nemokama-pramoga",
    title: "Nemokama pramoga",
    description: "Pasirinkite bent vieną 0 € kainuojančią bendrą veiklą.",
    rule: { kind: "freeActivity" },
  },
  {
    id: "liko-rytojui",
    title: "Liko rytojui",
    description: "Užbaigę planą turėkite bent 3 € laisvų pinigų, neskaitant rezervo.",
    rule: { kind: "minimumAvailable", amount: 3 },
  },
  {
    id: "pasidaryk-pats",
    title: "Pasidaryk pats",
    description: "Šventę papuoškite klasėje pagamintomis popierinėmis girliandomis.",
    rule: { kind: "selectedItem", itemId: "popierines-girliandos" },
  },
  {
    id: "daugkartinis-pasirinkimas",
    title: "Daugkartinis pasirinkimas",
    description: "Pasirinkite medžiagines vėliavėles arba stalo žaidimų kampelį.",
    rule: { kind: "selectedAnyItem", itemIds: ["veliaveles", "stalo-zaidimai"] },
  },
  {
    id: "reklama-neitikino",
    title: "Reklama mūsų neįtikino",
    description: "Užbaikite planą be labiausiai reklamuojamų pasirinkimų.",
    rule: { kind: "avoidHype" },
  },
] as const satisfies readonly ChallengeCard[];

export const MODES = [
  {
    id: "paprasta",
    grades: "1–2 klasėms",
    title: "Pirmas planas",
    budget: 24,
    suggestedReserve: 2,
    items: SIMPLE_ITEMS,
    mysteryEvents: SIMPLE_MYSTERY_EVENTS,
    reflection: ["Ko šventei reikėjo, o ko tik norėjome?", "Kodėl negalėjome pasirinkti visko?", "Kam galėtų prireikti paliktų pinigų?"],
  },
  {
    id: "iprasta",
    grades: "3 klasei",
    title: "Užteks visiems?",
    budget: 38,
    suggestedReserve: 4,
    participants: 24,
    items: ADVANCED_ITEMS,
    mysteryEvents: PORTION_MYSTERY_EVENTS,
    reflection: ["Kuris pasirinkimas davė daugiausia porcijų už savo kainą?", "Ko atsisakėme, kad planas tilptų į biudžetą?", "Ar pigiausias planas visada yra geriausias? Kodėl?"],
  },
  {
    id: "issukis",
    grades: "4–5 klasėms",
    title: "Planas su staigmena",
    budget: 42,
    suggestedReserve: 8,
    participants: 24,
    items: ADVANCED_ITEMS,
    mysteryEvents: PORTION_MYSTERY_EVENTS,
    reflection: ["Kaip rezervas padėjo pasikeitus planui?", "Kokia buvo jūsų pasirinkimo kaina – ko teko atsisakyti?", "Ką kitą kartą suplanuotumėte kitaip?"],
  },
] as const satisfies readonly GameMode[];

export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const challengeIds = CHALLENGES.map((challenge) => challenge.id);
assert(CHALLENGES.length === 6, "Žaidime turi būti lygiai 6 iššūkiai.");
assert(new Set(challengeIds).size === challengeIds.length, "Iššūkių ID turi būti unikalūs.");

for (const mode of MODES) {
  assert(mode.budget > mode.suggestedReserve, `Režimo „${mode.id}“ siūlomas rezervas turi būti mažesnis už biudžetą.`);

  const itemIds = mode.items.map((item) => item.id);
  const itemIdSet = new Set<string>(itemIds);
  assert(itemIdSet.size === itemIds.length, `Režimo „${mode.id}“ prekių ID turi būti unikalūs.`);

  const eventIds = mode.mysteryEvents.map((event) => event.id);
  assert(eventIds.length === 6, `Režime „${mode.id}“ turi būti lygiai 6 netikėti įvykiai.`);
  assert(new Set(eventIds).size === eventIds.length, `Režimo „${mode.id}“ įvykių ID turi būti unikalūs.`);

  for (const challenge of CHALLENGES) {
    if (challenge.rule.kind === "selectedItem") {
      assert(itemIdSet.has(challenge.rule.itemId), `Iššūkio „${challenge.id}“ pasirinkimo nėra režime „${mode.id}“.`);
    }
    if (challenge.rule.kind === "selectedAnyItem") {
      assert(challenge.rule.itemIds.every((itemId) => itemIdSet.has(itemId)), `Iššūkio „${challenge.id}“ pasirinkimų nėra režime „${mode.id}“.`);
    }
  }

  for (const category of ["gerimai", "uzkandziai", "veikla", "papildomai"] as const) {
    const itemCount = mode.items.filter((item) => item.category === category).length;
    assert(itemCount === 5, `Režimo „${mode.id}“ kategorijoje „${category}“ turi būti lygiai 5 pasirinkimai.`);
  }
  for (const event of mode.mysteryEvents) {
    assert(Number.isInteger(event.effect.amount) && event.effect.amount > 0, `Įvykio „${event.id}“ poveikis turi būti teigiamas sveikasis skaičius.`);
    if (!("participants" in mode)) {
      assert(event.effect.kind === "expense" || event.effect.kind === "budgetBonus", `Paprastame režime įvykis „${event.id}“ negali keisti porcijų ar dalyvių.`);
    }
  }
}

export function getMode(modeId: ModeId): GameMode {
  const mode = MODES.find((candidate) => candidate.id === modeId);
  assert(mode !== undefined, `Nežinomas žaidimo režimas: ${modeId}`);
  return mode;
}

export function changeSelection(mode: GameMode, selection: Selection, item: GameItem, change: -1 | 1): Selection {
  assert(mode.items.some((candidate) => candidate.id === item.id), `Prekė „${item.id}“ nepriklauso režimui „${mode.id}“.`);

  const currentQuantity = selection[item.id] ?? 0;
  const canHaveMultiple = mode.participants !== undefined && (item.category === "gerimai" || item.category === "uzkandziai");
  const maxQuantity = canHaveMultiple ? MAX_ITEM_QUANTITY : 1;
  const nextQuantity = Math.max(0, Math.min(maxQuantity, currentQuantity + change));
  if (nextQuantity === currentQuantity) return selection;

  const next = { ...selection };
  if (nextQuantity === 0) delete next[item.id];
  else next[item.id] = nextQuantity;
  return next;
}

export function calculatePlan(
  mode: GameMode,
  selection: Selection,
  reserve: number,
  baseParticipants: number | undefined,
  activeEvents: readonly MysteryEvent[],
): GamePlan {
  assert(Number.isInteger(reserve) && reserve >= 0 && reserve <= mode.budget, `Režimo „${mode.id}“ rezervas turi būti nuo 0 iki ${mode.budget} €.`);

  if (mode.participants === undefined) {
    assert(baseParticipants === undefined, `Režimas „${mode.id}“ nenaudoja dalyvių skaičiaus.`);
  } else {
    assert(baseParticipants !== undefined && Number.isInteger(baseParticipants), `Režimui „${mode.id}“ reikia nurodyti dalyvių skaičių.`);
    assert(baseParticipants >= PARTICIPANT_RANGE.min && baseParticipants <= PARTICIPANT_RANGE.max, `Dalyvių skaičius turi būti nuo ${PARTICIPANT_RANGE.min} iki ${PARTICIPANT_RANGE.max}.`);
  }

  const allowedItemIds = new Set(mode.items.map((item) => item.id));
  for (const itemId of Object.keys(selection)) {
    assert(allowedItemIds.has(itemId), `Prekė „${itemId}“ nepriklauso režimui „${mode.id}“.`);
  }

  const allowedEventIds = new Set(mode.mysteryEvents.map((event) => event.id));
  const activeEventIds = activeEvents.map((event) => event.id);
  assert(new Set(activeEventIds).size === activeEventIds.length, "Tas pats netikėtas įvykis negali būti įjungtas du kartus.");
  for (const eventId of activeEventIds) {
    assert(allowedEventIds.has(eventId), `Įvykis „${eventId}“ nepriklauso režimui „${mode.id}“.`);
  }

  let spent = 0;
  let drinkPortions = 0;
  let snackPortions = 0;
  let hasDrink = false;
  let hasSnack = false;
  let hasActivity = false;

  for (const item of mode.items) {
    const quantity = selection[item.id] ?? 0;
    assert(Number.isInteger(quantity) && quantity >= 0, `Netinkamas prekės „${item.id}“ kiekis.`);
    spent += item.price * quantity;
    if (quantity === 0) continue;
    if (item.category === "gerimai") {
      hasDrink = true;
      drinkPortions += (item.portions ?? 0) * quantity;
    }
    if (item.category === "uzkandziai") {
      hasSnack = true;
      snackPortions += (item.portions ?? 0) * quantity;
    }
    if (item.category === "veikla") hasActivity = true;
  }

  let eventExpenses = 0;
  let budgetBonus = 0;
  let additionalParticipants = 0;
  let drinkPortionsLost = 0;
  let snackPortionsLost = 0;

  for (const event of activeEvents) {
    switch (event.effect.kind) {
      case "expense":
        eventExpenses += event.effect.amount;
        break;
      case "budgetBonus":
        budgetBonus += event.effect.amount;
        break;
      case "participants":
        additionalParticipants += event.effect.amount;
        break;
      case "drinkLoss":
        drinkPortionsLost += event.effect.amount;
        break;
      case "snackLoss":
        snackPortionsLost += event.effect.amount;
        break;
    }
  }

  const totalSpent = spent + eventExpenses;
  const totalFunds = mode.budget + budgetBonus;

  return {
    spent,
    eventExpenses,
    totalSpent,
    budgetBonus,
    totalFunds,
    reserve,
    available: totalFunds - totalSpent - reserve,
    participants: baseParticipants === undefined ? undefined : baseParticipants + additionalParticipants,
    drinkPortions: Math.max(0, drinkPortions - drinkPortionsLost),
    snackPortions: Math.max(0, snackPortions - snackPortionsLost),
    drinkPortionsLost,
    snackPortionsLost,
    hasDrink,
    hasSnack,
    hasActivity,
  };
}

export function planProblems(mode: GameMode, plan: GamePlan): readonly string[] {
  const problems: string[] = [];
  if (plan.available < 0) problems.push(`Biudžetą viršijote ${-plan.available} €.`);

  if (plan.participants === undefined) {
    if (!plan.hasDrink) problems.push("Pasirinkite gėrimą.");
    if (!plan.hasSnack) problems.push("Pasirinkite užkandį.");
  } else {
    if (plan.drinkPortions < plan.participants) problems.push(`Gėrimų trūksta ${plan.participants - plan.drinkPortions} žmonėms.`);
    if (plan.snackPortions < plan.participants) problems.push(`Užkandžių trūksta ${plan.participants - plan.snackPortions} žmonėms.`);
  }

  if (!plan.hasActivity) problems.push("Pasirinkite bent vieną bendrą veiklą.");
  return problems;
}

export function challengeCompleted(challenge: ChallengeCard, mode: GameMode, selection: Selection, plan: GamePlan): boolean {
  assert(CHALLENGES.some((candidate) => candidate.id === challenge.id), `Nežinomas iššūkis: ${challenge.id}`);

  switch (challenge.rule.kind) {
    case "reserveAboveSuggested":
      return plan.reserve >= mode.suggestedReserve + challenge.rule.amount;
    case "freeActivity":
      return mode.items.some((item) => item.category === "veikla" && item.price === 0 && (selection[item.id] ?? 0) > 0);
    case "minimumAvailable":
      return plan.available >= challenge.rule.amount;
    case "selectedItem":
      return (selection[challenge.rule.itemId] ?? 0) > 0;
    case "selectedAnyItem":
      return challenge.rule.itemIds.some((itemId) => (selection[itemId] ?? 0) > 0);
    case "avoidHype":
      return !mode.items.some((item) => item.hype === true && (selection[item.id] ?? 0) > 0);
  }
}

export function challengeDescription(challenge: ChallengeCard, mode: GameMode): string {
  if (challenge.rule.kind !== "reserveAboveSuggested") return challenge.description;
  return `Palikite bent ${mode.suggestedReserve + challenge.rule.amount} € rezerve netikėtumams.`;
}
