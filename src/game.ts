export type CategoryId = "gerimai" | "uzkandziai" | "veikla" | "papildomai";
export type ModeId = "paprasta" | "iprasta" | "issukis";

export type GameItem = {
  id: string;
  name: string;
  category: CategoryId;
  price: number;
  portions?: number;
  note: string;
};

export type GameMode = {
  id: ModeId;
  grades: string;
  title: string;
  summary: string;
  duration: string;
  budget: number;
  reserve: number;
  participants?: number;
  surpriseGuests?: number;
  items: readonly GameItem[];
  reflection: readonly string[];
};

export type Selection = Readonly<Record<string, number>>;
export type PlanTotals = {
  spent: number;
  remaining: number;
  drinkPortions: number;
  snackPortions: number;
  hasDrink: boolean;
  hasSnack: boolean;
  hasActivity: boolean;
};
export type PlanSnapshot = { spent: number; remaining: number; itemNames: readonly string[] };

const SIMPLE_ITEMS = [
  { id: "vanduo", name: "Vanduo", category: "gerimai", price: 3, note: "Visai klasei" },
  { id: "sultys", name: "Sultys", category: "gerimai", price: 6, note: "Visai klasei" },
  { id: "vaisiu-vanduo", name: "Vaisių vanduo", category: "gerimai", price: 5, note: "Visai klasei" },
  { id: "vaisiai", name: "Vaisių lėkštė", category: "uzkandziai", price: 5, note: "Visai klasei" },
  { id: "sumustiniai", name: "Sumuštiniai", category: "uzkandziai", price: 9, note: "Visai klasei" },
  { id: "sausainiai", name: "Sausainiai", category: "uzkandziai", price: 7, note: "Visai klasei" },
  { id: "viktorina", name: "Klasės viktorina", category: "veikla", price: 0, note: "Paruošia mokiniai" },
  { id: "zaidimai", name: "Stalo žaidimai", category: "veikla", price: 4, note: "Pasiskoliname" },
  { id: "kuryba", name: "Kūrybos rinkinys", category: "veikla", price: 8, note: "Priemonės klasei" },
  { id: "dekoracijos", name: "Dekoracijos", category: "papildomai", price: 5, note: "Gražu, bet nebūtina" },
  { id: "kvietimai", name: "Kvietimų kortelės", category: "papildomai", price: 2, note: "Galime pasigaminti" },
  { id: "muzika", name: "Muzikos grojaraštis", category: "papildomai", price: 0, note: "Sukuriame patys" },
] as const satisfies readonly GameItem[];

const ADVANCED_ITEMS = [
  { id: "vandens-asotis", name: "Vandens ąsočiai", category: "gerimai", price: 4, portions: 24, note: "24 porcijos" },
  { id: "sulciu-pakuote", name: "Sulčių pakuotė", category: "gerimai", price: 4, portions: 8, note: "8 porcijos" },
  { id: "vaisiu-gerimas", name: "Vaisių gėrimas", category: "gerimai", price: 3, portions: 12, note: "12 porcijų" },
  { id: "obuoliai", name: "Obuolių rinkinys", category: "uzkandziai", price: 6, portions: 12, note: "12 porcijų" },
  { id: "mini-sumustiniai", name: "Mini sumuštiniai", category: "uzkandziai", price: 7, portions: 8, note: "8 porcijos" },
  { id: "spragesiai", name: "Spragėsių dubenys", category: "uzkandziai", price: 4, portions: 12, note: "12 porcijų" },
  { id: "viktorina", name: "Klasės viktorina", category: "veikla", price: 0, note: "Paruošia mokiniai" },
  { id: "zaidimu-rinkinys", name: "Žaidimų rinkinys", category: "veikla", price: 5, note: "Visai klasei" },
  { id: "kurybos-rinkinys", name: "Kūrybos dirbtuvės", category: "veikla", price: 10, note: "Priemonės klasei" },
  { id: "dekoracijos", name: "Dekoracijos", category: "papildomai", price: 4, note: "Gražu, bet nebūtina" },
  { id: "vardu-korteles", name: "Vardų kortelės", category: "papildomai", price: 2, note: "Galime pasigaminti" },
  { id: "muzika", name: "Muzikos grojaraštis", category: "papildomai", price: 0, note: "Sukuriame patys" },
] as const satisfies readonly GameItem[];

export const MODES = [
  {
    id: "paprasta",
    grades: "1–2 klasėms",
    title: "Pirmas planas",
    summary: "Pasirinkite, ko reikia šventei, ir neišleiskite visų pinigų.",
    duration: "10 min.",
    budget: 24,
    reserve: 2,
    items: SIMPLE_ITEMS,
    reflection: ["Ko šventei reikėjo, o ko tik norėjome?", "Kodėl negalėjome pasirinkti visko?", "Kam galėtų prireikti paliktų pinigų?"],
  },
  {
    id: "iprasta",
    grades: "3 klasei",
    title: "Užteks visiems?",
    summary: "Skaičiuokite porcijas, palyginkite kainas ir palikite rezervą.",
    duration: "15 min.",
    budget: 38,
    reserve: 4,
    participants: 24,
    items: ADVANCED_ITEMS,
    reflection: ["Kuris pasirinkimas davė daugiausia porcijų už savo kainą?", "Ko atsisakėme, kad planas tilptų į biudžetą?", "Ar pigiausias planas visada yra geriausias? Kodėl?"],
  },
  {
    id: "issukis",
    grades: "4–5 klasėms",
    title: "Planas su staigmena",
    summary: "Sudarykite planą su rezervu, o tada prisitaikykite prie pokyčio.",
    duration: "20 min.",
    budget: 42,
    reserve: 8,
    participants: 24,
    surpriseGuests: 4,
    items: ADVANCED_ITEMS,
    reflection: ["Kaip rezervas padėjo pasikeitus planui?", "Kokia buvo jūsų pasirinkimo kaina – ko teko atsisakyti?", "Ką kitą kartą suplanuotumėte kitaip?"],
  },
] as const satisfies readonly GameMode[];

const itemIds = MODES.flatMap((mode) => mode.items.map((item) => `${mode.id}:${item.id}`));
assert(new Set(itemIds).size === itemIds.length, "Kiekvieno režimo prekių ID turi būti unikalūs.");
for (const mode of MODES) {
  assert(mode.budget > mode.reserve, `Režimo „${mode.id}“ rezervas turi būti mažesnis už biudžetą.`);
  for (const category of ["gerimai", "uzkandziai", "veikla"] as const) {
    assert(mode.items.some((item) => item.category === category), `Režime „${mode.id}“ trūksta kategorijos „${category}“.`);
  }
}

export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

export function getMode(modeId: ModeId): GameMode {
  const mode = MODES.find((candidate) => candidate.id === modeId);
  assert(mode !== undefined, `Nežinomas žaidimo režimas: ${modeId}`);
  return mode;
}

export function calculateTotals(mode: GameMode, selection: Selection): PlanTotals {
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
    if (item.category === "gerimai") { hasDrink = true; drinkPortions += (item.portions ?? 0) * quantity; }
    if (item.category === "uzkandziai") { hasSnack = true; snackPortions += (item.portions ?? 0) * quantity; }
    if (item.category === "veikla") hasActivity = true;
  }
  return { spent, remaining: mode.budget - spent, drinkPortions, snackPortions, hasDrink, hasSnack, hasActivity };
}

export function planProblems(mode: GameMode, totals: PlanTotals, surpriseRevealed: boolean): readonly string[] {
  const problems: string[] = [];
  const people = (mode.participants ?? 0) + (surpriseRevealed ? (mode.surpriseGuests ?? 0) : 0);
  if (totals.spent > mode.budget) problems.push(`Biudžetą viršijote ${totals.spent - mode.budget} €.`);
  if (mode.participants === undefined) {
    if (!totals.hasDrink) problems.push("Pasirinkite gėrimą.");
    if (!totals.hasSnack) problems.push("Pasirinkite užkandį.");
  } else {
    if (totals.drinkPortions < people) problems.push(`Gėrimų trūksta ${people - totals.drinkPortions} žmonėms.`);
    if (totals.snackPortions < people) problems.push(`Užkandžių trūksta ${people - totals.snackPortions} žmonėms.`);
  }
  if (!totals.hasActivity) problems.push("Pasirinkite bent vieną bendrą veiklą.");
  const requiredReserve = surpriseRevealed ? 0 : mode.reserve;
  if (totals.spent <= mode.budget && totals.remaining < requiredReserve) problems.push(`Rezervui dar trūksta ${requiredReserve - totals.remaining} €.`);
  return problems;
}

export function snapshotPlan(mode: GameMode, selection: Selection, totals: PlanTotals): PlanSnapshot {
  return {
    spent: totals.spent,
    remaining: totals.remaining,
    itemNames: mode.items.filter((item) => (selection[item.id] ?? 0) > 0).map((item) => {
      const quantity = selection[item.id] ?? 0;
      return quantity > 1 ? `${item.name} × ${quantity}` : item.name;
    }),
  };
}
