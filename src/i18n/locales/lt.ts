import { SHOPPING_CARD_DISCOUNT } from "../../domain";
import type {
  Challenge,
  EventCard,
  ItemTag,
  PlanProblem,
  ValueModifier,
} from "../../domain";
import { challengeRule, eventEffect } from "../configuredCopy";
import { createEuroFormatter } from "../formatCurrency";
import type { Translations } from "./en";

type LithuanianForms = Readonly<{
  one: string;
  few: string;
  other: string;
}>;

const lithuanianPluralRules = new Intl.PluralRules("lt");
const formatCurrency = createEuroFormatter("lt-LT");

function lithuanianWord(amount: number, forms: LithuanianForms): string {
  switch (lithuanianPluralRules.select(amount)) {
    case "one": return forms.one;
    case "few": return forms.few;
    default: return forms.other;
  }
}

function lithuanianQuantity(amount: number, forms: LithuanianForms): string {
  return `${amount} ${lithuanianWord(amount, forms)}`;
}

const PORTION_FORMS = {
  one: "porcija",
  few: "porcijos",
  other: "porcijų",
} as const satisfies LithuanianForms;

export const lithuanianTranslations = {
  appTitle: "Planuokime šventę",
  language: {
    label: "Kalba",
    english: "Anglų",
    lithuanian: "Lietuvių",
  },
  common: {
    close: "Uždaryti",
    cancel: "Atšaukti",
    delete: "Pašalinti",
    portionsShort: (amount: number) => lithuanianQuantity(amount, PORTION_FORMS),
  },
  landing: {
    screenControls: "Ekrano valdymas",
    heroLines: ["Ką pasirinks", "jūsų", "klasė?"],
    start: "Pradėti planuoti →",
    continueClass: (classLabel: string) => `Tęsti su ${classLabel} klase`,
    deleteClassSave: (classLabel: string) => `Pašalinti ${classLabel} klasės įrašą`,
    confirmDeleteTitle: (classLabel: string) => `Pašalinti ${classLabel} klasės įrašą?`,
    confirmDeleteDescription: "Visa šios klasės pažanga bus prarasta.",
    tiles: [
      { title: "Rinkitės", text: "Vaišes, veiklas ir papuošimus" },
      { title: "Skaičiuokite", text: "Ar užteks pinigų ir porcijų?" },
      { title: "Prisitaikykite", text: "Netikėtumai keis jūsų planą" },
      { title: "Susitarkite", text: "Priimkite sprendimą kartu su klase" },
    ],
  },
  controls: {
    game: "Žaidimo valdymas",
    back: "Grįžti",
    settings: "Nustatymai",
    help: "Kaip žaisti?",
    fullscreen: "Per visą ekraną",
  },
  shelf: {
    label: "Daiktų pasirinkimai",
    categoryGroups: "Pasirinkimų grupės",
    applyShoppingCard: "Pritaikyti nuolaidų kortelę.",
    removeShoppingCard: "Pašalinti nuolaidų kortelę.",
    locked: "Užrakinta.",
    cannotAddMore: "Daugiau pridėti negalima.",
    addToTable: "Palieskite, kad pridėtumėte ant stalo.",
    priceIncreased: (from: string, to: string) => `kaina padidėjo nuo ${from} iki ${to}`,
    priceDecreased: (discount: string, to: string) => `nuolaidų kortelė kainą sumažino ${discount} iki ${to}`,
    portions: (amount: number) => lithuanianQuantity(amount, PORTION_FORMS),
    itemLabel: (name: string, price: string, portions: string, action: string) =>
      `${name}, ${price}${portions === "" ? "" : `, ${portions}`}. ${action}`,
  },
  table: {
    label: "Klasės šventės stalas",
    shoppingCard: (discount: string) => `Nuolaidų kortelė. Pasirinkite kortelę, tada prekę, kad jai pritaikytumėte iki ${discount} nuolaidą.`,
    removeItem: (name: string, portions: number | undefined) =>
      `${name}${portions === undefined ? "" : `, ${lithuanianQuantity(portions, PORTION_FORMS)}`}. Palieskite, kad nuimtumėte vieną.`,
    carriedFood: (portions: number) => `${lithuanianQuantity(portions, PORTION_FORMS)} iš ankstesnės šventės`,
    portionsCovered: (filled: number, people: number) => `${lithuanianQuantity(filled, PORTION_FORMS)} iš ${people}`,
    portionsWithExtra: (people: number, extra: number) =>
      `${lithuanianQuantity(people, PORTION_FORMS)} ir ${lithuanianQuantity(extra, {
        one: "papildoma porcija",
        few: "papildomos porcijos",
        other: "papildomų porcijų",
      })}`,
    carriedDetail: (amount: number) => `, ${lithuanianQuantity(amount, PORTION_FORMS)} iš ankstesnės šventės`,
    homemadeDetail: (amount: number) => `, ${lithuanianQuantity(amount, PORTION_FORMS)} atnešta iš namų`,
    choicesSelected: (selected: number) => `Pasirinkta: ${selected}`,
    choicesRequired: (selected: number, required: number) => `Pasirinkta ${selected}, reikia bent ${required}`,
  },
  tray: {
    label: "Biudžeto dėklas",
    leftFrom: (budget: string) => `Liko iš ${budget}`,
    spent: (amount: string) => `Išleista ${amount}`,
    checkPlan: "Baigti planą",
  },
  discussionButton: "Aptarkime",
  cardBoard: {
    unrevealedCard: "Neatversta kortelė",
    revealCard: "Atversti kortelę",
    enlargeCard: (title: string) => `Padidinti kortelę „${title}“`,
    returnCard: (title: string) => `Grąžinti kortelę „${title}“ į vietą.`,
    shuffle: "Sumaišyti korteles",
    revealAll: "Atversti visas korteles",
    turnAllDown: "Užversti visas korteles",
  },
  events: {
    title: "Netikėtų įvykių kortelės",
    editableDescription: "Atverskite kortelę ir prisitaikykite prie pasikeitusių sąlygų",
    readOnlyDescription: "Peržiūrėkite šventės metu galiojusius netikėtus įvykius",
    enable: (title: string) => `${title}. Įjungti įvykį`,
    disable: (title: string) => `${title}. Išjungti įvykį`,
    stripLabel: "Netikėti įvykiai",
    active: "aktyvus",
    inactive: "neaktyvus",
    unrevealed: "Neatverstas įvykis",
    open: "Atverti netikėtus įvykius",
    openWithCount: (count: number) => `Atverti netikėtus įvykius. Aktyvių įvykių: ${count}.`,
    openWithStatus: (revealed: number, total: number, active: number) =>
      `Atverti netikėtus įvykius. Atverta ${revealed} iš ${total}, įjungta ${active}.`,
  },
  challenges: {
    title: "Iššūkių lenta",
    description: "Siekite tiek iššūkių, kiek norite — įvykdyti iššūkiai pažymimi automatiškai",
    stripLabel: "Iššūkiai",
    completed: "įvykdytas",
    incomplete: "neįvykdytas",
    open: "Atverti iššūkius",
    openWithProgress: (completed: number, total: number) => `Atverti iššūkius. Įvykdyta ${completed} iš ${total}.`,
  },
  discussions: {
    title: "Pokalbio kortelės",
    description: "Atverskite klausimą ir aptarkite jį su klase",
  },
  help: {
    title: "Kaip viskas vyksta?",
    paragraphs: [
      "Su klase suplanuokite šventę: pasirūpinkite, kad visiems užtektų gėrimų ir užkandžių, pasirinkite bent vieną veiklą ir neviršykite biudžeto.",
      "Siekite papildomų iššūkių, atverskite netikėtus įvykius ir aptarkite pasirinkimus.",
      "Po šventės nuspręskite, ką daryti su maisto likučiais ir kam skirti likusius pinigus. Kai kurie pasirinkimai padės kitą kartą.",
    ],
  },
  settings: {
    title: "Žaidimo nustatymai",
    budget: "Biudžetas",
    students: "Mokiniai",
    decreaseBudget: "Atimti vieną eurą",
    increaseBudget: "Pridėti vieną eurą",
    decreaseStudents: "Sumažinti mokinių skaičių",
    increaseStudents: "Padidinti mokinių skaičių",
    usual: "Įprastai",
    teacherAdjustment: "Mokytojo pakeitimas",
  },
  completion: {
    success: "Šventė pavyko!",
    spoilingFood: "Gendantis maistas",
    longLastingFood: "Išsilaikantis maistas",
    none: "Nebuvo",
    crumbsOnly: "Tik trupiniai",
    noneLeft: "Neliko",
    returnToTable: "← Grįžti prie stalo",
    organizeLargeParty: "Rengti didžiąją šventę →",
    organizeNextParty: "Rengti kitą šventę →",
    remainingMoney: "Liko pinigų",
    allocationGroup: "Kam paskirstyti likusius pinigus",
    foodActionGroup: (title: string) => `Ką daryti: ${title}`,
    plantFertilizer: "Trąšos augalui",
    projectFilled: "Visa suma skirta",
    addProjectMoney: (amount: number) => `Pridėti ${formatCurrency(amount)}`,
    restartProject: `Atstatyti į ${formatCurrency(0)}`,
    projectNeeds: (amount: number) => `Reikia bent ${formatCurrency(amount)}`,
    projectProgressLabel: (label: string, current: number, target: number, action: string) =>
      `${label}. ${formatCurrency(current)} iš ${formatCurrency(target)}. ${action}.`,
    foodChoices: {
      eat: "Suvalgyti likučius",
      discard: "Išmesti",
      compost: "Kompostuoti",
      keepForNextParty: "Pasilikti kitai šventei",
    },
  },
  categories: {
    drinks: "Gėrimai",
    snacks: "Užkandžiai",
    activities: "Bendra veikla",
    decorations: "Papuošimai",
  },
  items: {
    "water-station": "Vandens stotelė",
    "tea-set": "Arbatos rinkinys",
    "juice-cartons": "Sulčių pakeliai",
    "berry-punch": "Uogų gaiva",
    "deposit-bottles": "Limonado buteliukai",
    "drink-mixing-station": "Gėrimų laboratorija",
    "vegetable-sticks": "Daržovių lazdelės",
    "cracker-packets": "Krekerių pakeliai",
    "fruit-platter": "Vaisių lėkštė",
    "mini-sandwiches": "Mini sumuštiniai",
    "cookie-box": "Sausainių dėžutė",
    "celebration-cake": "Šventinis tortas",
    quiz: "Klasės viktorina",
    "paper-airplane-challenge": "Lėktuvėlių dirbtuvės",
    "bracelet-workshop": "Apyrankių dirbtuvės",
    "rc-car-racing": "Mašinėlių lenktynės",
    "target-games": "Taiklumo žaidimai",
    "paper-tassel-garland": "Kutų girlianda",
    tablecloth: "Popierinė staltiesė",
    "fabric-bunting": "Medžiaginės vėliavėlės",
    balloons: "Spalvoti balionai",
    "party-light-projector": "Šviesų projektorius",
    "karaoke-stage": "Karaokės scena",
    plant: "Klasės augalas",
  },
  itemTag: (tag: ItemTag): string => {
    switch (tag.kind) {
      case "deposit": return `UŽSTATAS ${formatCurrency(tag.amount)}`;
      case "long-lasting": return "ILGAI IŠLIEKA";
      case "hype": {
        const messages = {
          "mix-your-flavor": "SUSIKURK SKONĮ!",
          "your-style": "TAVO STILIUS!",
          "sweetest-moment": "SALDŽIAUSIA AKIMIRKA!",
          "party-in-the-air": "ŠVENTĖ ORE!",
          "turn-on-the-sparkle": "ĮJUNK SPINDESĮ!",
        } satisfies Record<typeof tag.id, string>;
        return messages[tag.id];
      }
      case "self-made": return "PATYS!";
      case "rental": return "NUOMA";
      case "reusable": return "DAUGKARTINIS";
      case "owned": return "TURIME";
      case "patience": return "KANTRYBĖS";
      case "patience-paid-off": return "KANTRYBĖ ATSIPIRKO!";
      case "no-time": return "NELIKO LAIKO";
      case "borrowed": return "PASISKOLINOME";
      case "shopping-card-discount": return `KORTELĖ ${formatCurrency(-tag.amount)}`;
    }
  },
  eventCards: {
    "school-photographer": {
      title: "Atvyks mokyklos fotografas",
      description: (event: EventCard) => {
        const effect = eventEffect(event, "school-photographer", "minimumChoices");
        return `Kad nuotraukos būtų šventiškos, pasirinkite bent ${lithuanianQuantity(effect.count, {
          one: "papuošimą",
          few: "papuošimus",
          other: "papuošimų",
        })}.`;
      },
    },
    "borrowed-rc-cars": {
      title: "Pasiskolinome mašinėles",
      description: (event: EventCard) => {
        eventEffect(event, "borrowed-rc-cars", "borrowedItem");
        return `Mašinėlių lenktynės šįkart kainuoja ${formatCurrency(0)}.`;
      },
    },
    "forgot-cups": {
      title: "Pamiršome puodelius",
      description: (event: EventCard) => {
        const effect = eventEffect(event, "forgot-cups", "pouredDrinkSurcharge");
        return `Kiekvienas pilstomo gėrimo pasirinkimas dėl puodelių kainuoja ${formatCurrency(effect.amount)} daugiau.`;
      },
    },
    "homemade-snacks": {
      title: "Atnešė naminių užkandžių",
      description: (event: EventCard) => {
        const effect = eventEffect(event, "homemade-snacks", "snackBonus");
        return `Klasė atsinešė ${lithuanianQuantity(effect.amount, {
          one: "papildomą užkandžių porciją",
          few: "papildomas užkandžių porcijas",
          other: "papildomų užkandžių porcijų",
        })}.`;
      },
    },
    "party-runs-long": {
      title: "Šventė užsitęs",
      description: (event: EventCard) => {
        const effect = eventEffect(event, "party-runs-long", "minimumChoices");
        return `Kad veiklos nepritrūktų, pasirinkite bent ${lithuanianQuantity(effect.count, {
          one: "skirtingą veiklą",
          few: "skirtingas veiklas",
          other: "skirtingų veiklų",
        })}.`;
      },
    },
    "advertised-items-cost-more": {
      title: "Reklamuojamos prekės pabrango",
      description: (event: EventCard) => {
        const effect = eventEffect(event, "advertised-items-cost-more", "hypeSurcharge");
        return `Daiktai su reklaminiu šūkiu kainuoja ${formatCurrency(effect.amount)} daugiau.`;
      },
    },
    "friends-join": {
      title: "Prisijungia draugai",
      description: (event: EventCard) => {
        const participants = eventEffect(event, "friends-join", "participants").amount;
        const budget = eventEffect(event, "friends-join", "budgetBonus").amount;
        return `Prisijungia ${lithuanianQuantity(participants, {
          one: "mokinys",
          few: "mokiniai",
          other: "mokinių",
        })} ir atsineša ${formatCurrency(budget)}, bet vaišių dabar reikės ir jiems.`;
      },
    },
    "spilled-drink": {
      title: "Išsiliejo gėrimas",
      description: (event: EventCard) => {
        const effect = eventEffect(event, "spilled-drink", "drinkLoss");
        return `Praradote ${lithuanianQuantity(effect.amount, {
          one: "gėrimo porciją",
          few: "gėrimo porcijas",
          other: "gėrimo porcijų",
        })}.`;
      },
    },
  },
  challengeCards: {
    "table-variety": {
      title: "Įvairovė ant stalo",
      description: (challenge: Challenge) => {
        const rule = challengeRule(challenge, "table-variety", "minimumVariety");
        return `Pasirinkite bent ${lithuanianQuantity(rule.drinkChoices, {
          one: "skirtingą gėrimą",
          few: "skirtingus gėrimus",
          other: "skirtingų gėrimų",
        })} ir ${lithuanianQuantity(rule.snackChoices, {
          one: "skirtingą užkandį",
          few: "skirtingus užkandžius",
          other: "skirtingų užkandžių",
        })}.`;
      },
    },
    "perfect-balance": {
      title: "Tobula pusiausvyra",
      description: (challenge: Challenge) => {
        challengeRule(challenge, "perfect-balance", "equalRefreshmentPortions");
        return "Paruoškite vienodą skaičių gėrimų ir užkandžių porcijų.";
      },
    },
    "just-enough": {
      title: "Tiek, kiek reikia",
      description: (challenge: Challenge) => {
        const rule = challengeRule(challenge, "just-enough", "maximumSurplusPortions");
        return `Suplanuokite taip, kad liktų ne daugiau kaip ${lithuanianQuantity(rule.drinks, {
          one: "gėrimo porcija",
          few: "gėrimo porcijos",
          other: "gėrimo porcijų",
        })} ir ${lithuanianQuantity(rule.snacks, {
          one: "užkandžio porcija",
          few: "užkandžio porcijos",
          other: "užkandžio porcijų",
        })}.`;
      },
    },
    "one-euro-refreshments": {
      title: "Vaišių biudžetas",
      description: (challenge: Challenge) => {
        const rule = challengeRule(challenge, "one-euro-refreshments", "refreshmentsWithinParticipantBudget");
        return `Gėrimams ir užkandžiams kartu skirkite ne daugiau kaip ${formatCurrency(rule.maximumPerParticipant)} vienam mokiniui.`;
      },
    },
    "one-expensive-purchase": {
      title: "Vienas brangesnis pirkinys",
      description: (challenge: Challenge) => {
        const rule = challengeRule(challenge, "one-expensive-purchase", "exactlyOneAtOrAbovePrice");
        return `Pasirinkite tik vieną ${formatCurrency(rule.price)} ar brangesnį daiktą.`;
      },
    },
    "one-bold-or-several-simple": {
      title: "Ryškiai ar paprastai?",
      description: (challenge: Challenge) => {
        challengeRule(challenge, "one-bold-or-several-simple", "oneHypeOrMultiplePlainDecorations");
        return "Rinkitės vieną papuošimą su šūkiu arba bent du be šūkių.";
      },
    },
    "useful-tomorrow": {
      title: "Pravers ir rytoj",
      description: (challenge: Challenge) => {
        challengeRule(challenge, "useful-tomorrow", "reusableWithLongLastingSnack");
        return "Pasirinkite daugkartinį daiktą ir ilgai išsilaikantį užkandį.";
      },
    },
    "fun-and-frugal": {
      title: "Ir smagu, ir taupu",
      description: (challenge: Challenge) => {
        const rule = challengeRule(challenge, "fun-and-frugal", "hypeWithRemainingMoney");
        return `Pasirinkite bent vieną daiktą su reklaminiu šūkiu ir palikite bent ${formatCurrency(rule.minimumRemaining)} neišleistus.`;
      },
    },
  },
  discussionCards: {
    "needs-or-wants": { title: "Reikia ar norime?", description: "Ko šventei tikrai reikia, o ko tiesiog norisi? Kaip tai padeda pasirinkti?" },
    "same-price-same-choice": { title: "Ta pati kaina – tas pats pasirinkimas?", description: "Palyginkite du vienodai kainuojančius pasirinkimus. Kuris duoda daugiau porcijų? Ar to pakanka?" },
    "more-or-varied": { title: "Daugiau ar įvairiau?", description: "Kai visiems užtenka, kas geriau: daugiau vienodų vaišių ar mažiau, bet įvairesnių?" },
    "beyond-price": { title: "Kas svarbu be kainos?", description: "Kada pigiausias pasirinkimas nėra geriausias? Į ką dar verta atsižvelgti?" },
    "how-to-agree": { title: "Kaip susitarti?", description: "Jei klasės nuomonės išsiskiria, kaip priimti sąžiningą sprendimą neperkant visko?" },
    "what-to-give-up": { title: "Ko atsisakytume pirmiausia?", description: `Jei reikėtų sutaupyti dar ${formatCurrency(5)}, ką pakeistumėte plane? Ko dėl to netektumėte?` },
    "more-money-better-party": { title: "Ar daugiau pinigų reiškia geresnę šventę?", description: `Ką pakeistumėte gavę dar ${formatCurrency(5)}? Ar nuo to šventė tikrai taptų geresnė?` },
    "now-or-next-party": { title: "Dabar ar kitai šventei?", description: "Ar likusius pinigus išleisti dabar, ar skirti tam, kas pravers kitą kartą?" },
  },
  projects: {
    "large-celebration": { title: "Didžiosios šventės fondas", description: "Atrakina šventę „Visa mokykla prie vieno stalo“." },
    "music-system": { title: "Klasės garso sistema", description: "Atrakina nemokamą daugkartinę karaokės sceną." },
    "shopping-card": { title: "Nuolaidų kortelė", description: `Vienai pasirinktai prekei pritaiko iki ${formatCurrency(SHOPPING_CARD_DISCOUNT)} nuolaidą.` },
  },
  upgrades: {
    "compost-bin": { title: "Komposto dėžė", description: "Leidžia kompostuoti gendančio maisto likučius ir auginti klasės augalą." },
  },
  planProblem: (problem: PlanProblem): string => {
    switch (problem.kind) {
      case "overBudget": return `Biudžetą viršijote ${formatCurrency(problem.amount)}.`;
      case "missingDrinks": return `Gėrimų dar reikia ${lithuanianQuantity(problem.amount, {
        one: "mokiniui",
        few: "mokiniams",
        other: "mokinių",
      })}.`;
      case "missingSnacks": return `Užkandžių dar reikia ${lithuanianQuantity(problem.amount, {
        one: "mokiniui",
        few: "mokiniams",
        other: "mokinių",
      })}.`;
      case "missingDrinkVariety": return `Pasirinkite bent ${lithuanianQuantity(problem.amount, {
        one: "skirtingą gėrimą",
        few: "skirtingus gėrimus",
        other: "skirtingų gėrimų",
      })}.`;
      case "missingSnackVariety": return `Pasirinkite bent ${lithuanianQuantity(problem.amount, {
        one: "skirtingą užkandį",
        few: "skirtingus užkandžius",
        other: "skirtingų užkandžių",
      })}.`;
      case "missingActivities": return `Pasirinkite bent ${lithuanianQuantity(problem.amount, {
        one: "bendrą veiklą",
        few: "skirtingas bendras veiklas",
        other: "skirtingų bendrų veiklų",
      })}.`;
      case "missingDecorations": return `Pasirinkite bent ${lithuanianQuantity(problem.amount, {
        one: "papuošimą",
        few: "papuošimus",
        other: "papuošimų",
      })}.`;
    }
  },
  modifierLabel: (modifier: ValueModifier): string => {
    switch (modifier.label.kind) {
      case "event": return lithuanianTranslations.eventCards[modifier.label.eventId].title;
      case "whole-school-celebration": return "Visa mokykla prie vieno stalo";
      case "teacher-adjustment": return lithuanianTranslations.settings.teacherAdjustment;
    }
  },
} as const satisfies Translations;
