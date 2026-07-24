import type {
  CategoryId,
  Challenge,
  ChallengeId,
  EventCard,
  EventId,
  ItemId,
  ItemTag,
  PlanProblem,
  ProjectId,
  UpgradeId,
  ValueModifier,
} from "../../domain";
import { SHOPPING_CARD_DISCOUNT } from "../../domain";
import type { DiscussionId } from "../../discussions";
import { challengeRule, eventEffect } from "../configuredCopy";
import { createEuroFormatter } from "../formatCurrency";

type CardCopy = Readonly<{ title: string; description: string }>;
type ConfiguredCardCopy<Definition> = Readonly<{
  title: string;
  description: (definition: Definition) => string;
}>;

const englishPluralRules = new Intl.PluralRules("en");
const formatCurrency = createEuroFormatter("en-GB");

function englishNoun(amount: number, singular: string, plural: string): string {
  return englishPluralRules.select(amount) === "one" ? singular : plural;
}

function englishQuantity(amount: number, singular: string, plural: string): string {
  return `${amount} ${englishNoun(amount, singular, plural)}`;
}

export const englishTranslations = {
  appTitle: "Plan the Party",
  language: {
    label: "Language",
    english: "English",
    lithuanian: "Lithuanian",
  },
  common: {
    close: "Close",
    cancel: "Cancel",
    delete: "Delete",
    portionsShort: (amount: number) => englishQuantity(amount, "portion", "portions"),
  },
  landing: {
    screenControls: "Screen controls",
    heroLines: ["What will", "your class", "choose?"],
    start: "Start planning →",
    continueClass: (classLabel: string) => `Continue with Class ${classLabel}`,
    deleteClassSave: (classLabel: string) => `Delete Class ${classLabel}’s progress`,
    confirmDeleteTitle: (classLabel: string) => `Delete Class ${classLabel}’s progress?`,
    confirmDeleteDescription: "All progress for this class will be lost.",
    tiles: [
      { title: "Choose", text: "Drinks, snacks, activities and decorations" },
      { title: "Work it out", text: "Will you have enough money and portions?" },
      { title: "Adapt", text: "Unexpected events will change your plan" },
      { title: "Decide together", text: "Make choices as a class" },
    ],
  },
  controls: {
    game: "Game controls",
    back: "Back to the home screen",
    settings: "Settings",
    help: "How to play",
    fullscreen: "Fullscreen",
  },
  shelf: {
    label: "Party items",
    categoryGroups: "Categories",
    applyShoppingCard: "Apply the discount card.",
    removeShoppingCard: "Remove the discount card.",
    locked: "Not unlocked yet.",
    cannotAddMore: "You can’t add another one.",
    addToTable: "Select to add one to the table.",
    priceIncreased: (from: string, to: string) => `price increased from ${from} to ${to}`,
    priceDecreased: (discount: string, to: string) => `discount card took ${discount} off, reducing the price to ${to}`,
    portions: (amount: number) => englishQuantity(amount, "portion", "portions"),
    itemLabel: (name: string, price: string, portions: string, action: string) =>
      `${name}, ${price}${portions === "" ? "" : `, ${portions}`}. ${action}`,
  },
  table: {
    label: "Class party table",
    shoppingCard: (discount: string) => `Discount card. Select the card, then choose an item to take up to ${discount} off its price.`,
    removeItem: (name: string, portions: number | undefined) =>
      `${name}${portions === undefined ? "" : `, ${englishQuantity(portions, "portion", "portions")}`}. Select to remove one.`,
    carriedFood: (portions: number) => `${englishQuantity(portions, "portion", "portions")} left over from the last party`,
    portionsCovered: (filled: number, people: number) => `${englishQuantity(filled, "portion", "portions")} out of ${people}`,
    portionsWithExtra: (people: number, extra: number) =>
      `${englishQuantity(people, "portion", "portions")}, plus ${englishQuantity(extra, "extra portion", "extra portions")}`,
    carriedDetail: (amount: number) => `, ${englishQuantity(amount, "portion", "portions")} from the last party`,
    homemadeDetail: (amount: number) => `, ${englishQuantity(amount, "portion", "portions")} brought from home`,
    choicesSelected: (selected: number) => `Selected: ${selected}`,
    choicesRequired: (selected: number, required: number) => `${selected} selected; at least ${required} needed`,
  },
  tray: {
    label: "Budget tray",
    leftFrom: (budget: string) => `Budget: ${budget}`,
    spent: (amount: string) => `Spent ${amount}`,
    checkPlan: "Finish planning",
  },
  discussionButton: "Let’s discuss",
  cardBoard: {
    unrevealedCard: "Face-down card",
    revealCard: "Reveal card",
    enlargeCard: (title: string) => `View: ${title}`,
    returnCard: (title: string) => `Return “${title}” to the board.`,
    shuffle: "Shuffle cards",
    revealAll: "Reveal all cards",
    turnAllDown: "Turn all cards face down",
  },
  events: {
    title: "Unexpected event cards",
    editableDescription: "Reveal a card and adjust your plan to the new situation",
    readOnlyDescription: "Review the events that affected this party",
    enable: (title: string) => `${title}. Apply event`,
    disable: (title: string) => `${title}. Remove event`,
    stripLabel: "Unexpected events",
    active: "active",
    inactive: "inactive",
    unrevealed: "Face-down event card",
    open: "Open unexpected events",
    openWithCount: (count: number) => `Open unexpected events. Active events: ${count}.`,
    openWithStatus: (revealed: number, total: number, active: number) =>
      `Open unexpected events. Revealed ${revealed} of ${total}; ${active} active.`,
  },
  challenges: {
    title: "Challenges",
    description: "Try as many challenges as you like — completed challenges are marked automatically",
    stripLabel: "Challenges",
    completed: "completed",
    incomplete: "incomplete",
    open: "Open challenges",
    openWithProgress: (completed: number, total: number) => `Open challenges. Completed ${completed} of ${total}.`,
  },
  discussions: {
    title: "Discussion cards",
    description: "Reveal a question and discuss it as a class",
  },
  help: {
    title: "How does it work?",
    paragraphs: [
      "Plan a party with your class. Make sure there are enough drinks and snacks for everyone, choose at least one activity, and stay within budget.",
      "Try to complete bonus challenges, reveal unexpected event cards, and discuss your choices.",
      "After the party, decide what to do with the leftovers and the money left over. Some choices can help with the next party.",
    ],
  },
  settings: {
    title: "Game settings",
    budget: "Budget",
    students: "Students",
    decreaseBudget: "Subtract one euro",
    increaseBudget: "Add one euro",
    decreaseStudents: "Decrease the number of students",
    increaseStudents: "Increase the number of students",
    usual: "Starting value",
    teacherAdjustment: "Teacher adjustment",
  },
  completion: {
    success: "The party was a success!",
    spoilingFood: "Food that spoils",
    longLastingFood: "Food that keeps",
    none: "None",
    crumbsOnly: "Only crumbs",
    noneLeft: "None left",
    returnToTable: "← Return to the table",
    organizeLargeParty: "Plan the whole-school party →",
    organizeNextParty: "Plan the next party →",
    remainingMoney: "Money left",
    allocationGroup: "How to use the money left",
    foodActionGroup: (title: string) => `What to do with ${title.toLowerCase()}`,
    plantFertilizer: "Plant fertilizer",
    projectFilled: "Fully funded",
    addProjectMoney: (amount: number) => `Add ${formatCurrency(amount)}`,
    restartProject: `Reset to ${formatCurrency(0)}`,
    projectNeeds: (amount: number) => `Needs at least ${formatCurrency(amount)}`,
    projectProgressLabel: (label: string, current: number, target: number, action: string) =>
      `${label}. ${formatCurrency(current)} out of ${formatCurrency(target)}. ${action}.`,
    foodChoices: {
      eat: "Eat the leftovers",
      discard: "Throw it away",
      compost: "Compost",
      keepForNextParty: "Keep for the next party",
    },
  },
  categories: {
    drinks: "Drinks",
    snacks: "Snacks",
    activities: "Activities",
    decorations: "Decorations",
  } satisfies Readonly<Record<CategoryId, string>>,
  items: {
    "water-station": "Water station",
    "tea-set": "Tea set",
    "juice-cartons": "Juice cartons",
    "berry-punch": "Berry drink",
    "deposit-bottles": "Lemonade bottles",
    "drink-mixing-station": "Drink lab",
    "vegetable-sticks": "Vegetable sticks",
    "cracker-packets": "Packs of crackers",
    "fruit-platter": "Fruit platter",
    "mini-sandwiches": "Mini sandwiches",
    "cookie-box": "Box of cookies",
    "celebration-cake": "Party cake",
    quiz: "Class quiz",
    "paper-airplane-challenge": "Paper plane workshop",
    "bracelet-workshop": "Bracelet workshop",
    "rc-car-racing": "RC car racing",
    "target-games": "Target games",
    "paper-tassel-garland": "Tassel garland",
    tablecloth: "Paper tablecloth",
    "fabric-bunting": "Fabric bunting",
    balloons: "Colourful balloons",
    "party-light-projector": "Party light projector",
    "karaoke-stage": "Karaoke stage",
    plant: "Classroom plant",
  } satisfies Readonly<Record<ItemId, string>>,
  itemTag: (tag: ItemTag): string => {
    switch (tag.kind) {
      case "deposit": return `${formatCurrency(tag.amount)} DEPOSIT`;
      case "long-lasting": return "KEEPS LONGER";
      case "hype": {
        const messages = {
          "mix-your-flavor": "MIX YOUR FLAVOUR!",
          "your-style": "YOUR STYLE!",
          "sweetest-moment": "THE SWEETEST MOMENT!",
          "party-in-the-air": "PARTY IN THE AIR!",
          "turn-on-the-sparkle": "TURN ON THE SPARKLE!",
        } satisfies Record<typeof tag.id, string>;
        return messages[tag.id];
      }
      case "self-made": return "DIY!";
      case "rental": return "RENTAL";
      case "reusable": return "REUSABLE";
      case "owned": return "WE HAVE IT";
      case "patience": return "KEEP GROWING!";
      case "patience-paid-off": return "WORTH THE WAIT!";
      case "no-time": return "NO TIME LEFT";
      case "borrowed": return "BORROWED";
      case "shopping-card-discount": return `CARD ${formatCurrency(-tag.amount)}`;
    }
  },
  eventCards: {
    "school-photographer": {
      title: "The school photographer is coming",
      description: (event: EventCard) => {
        const effect = eventEffect(event, "school-photographer", "minimumChoices");
        return `Choose at least ${englishQuantity(effect.count, "decoration", "decorations")} so the photos look festive.`;
      },
    },
    "borrowed-rc-cars": {
      title: "We borrowed RC cars",
      description: (event: EventCard) => {
        eventEffect(event, "borrowed-rc-cars", "borrowedItem");
        return `RC car racing is free this time (${formatCurrency(0)}).`;
      },
    },
    "forgot-cups": {
      title: "We forgot the cups",
      description: (event: EventCard) => {
        const effect = eventEffect(event, "forgot-cups", "pouredDrinkSurcharge");
        return `Each poured-drink choice costs ${formatCurrency(effect.amount)} more for cups.`;
      },
    },
    "homemade-snacks": {
      title: "Someone brought homemade snacks",
      description: (event: EventCard) => {
        const effect = eventEffect(event, "homemade-snacks", "snackBonus");
        return `The class brought ${englishQuantity(effect.amount, "extra portion", "extra portions")} of homemade snacks.`;
      },
    },
    "party-runs-long": {
      title: "The party will last longer",
      description: (event: EventCard) => {
        const effect = eventEffect(event, "party-runs-long", "minimumChoices");
        return `Choose at least ${englishQuantity(effect.count, "activity", "activities")} so everyone has plenty to do.`;
      },
    },
    "advertised-items-cost-more": {
      title: "Popular items cost more",
      description: (event: EventCard) => {
        const effect = eventEffect(event, "advertised-items-cost-more", "hypeSurcharge");
        return `Items with a catchy slogan cost ${formatCurrency(effect.amount)} more.`;
      },
    },
    "friends-join": {
      title: "More students are joining",
      description: (event: EventCard) => {
        const participants = eventEffect(event, "friends-join", "participants").amount;
        const budget = eventEffect(event, "friends-join", "budgetBonus").amount;
        return `${englishQuantity(participants, "more student is", "more students are")} joining. They bring ${formatCurrency(budget)}, but you also need drinks and snacks for them.`;
      },
    },
    "spilled-drink": {
      title: "A drink was spilled",
      description: (event: EventCard) => {
        const effect = eventEffect(event, "spilled-drink", "drinkLoss");
        return `You lost ${englishQuantity(effect.amount, "drink portion", "drink portions")}.`;
      },
    },
  } satisfies Readonly<Record<EventId, ConfiguredCardCopy<EventCard>>>,
  challengeCards: {
    "table-variety": {
      title: "Variety on the table",
      description: (challenge: Challenge) => {
        const rule = challengeRule(challenge, "table-variety", "minimumVariety");
        return `Choose at least ${englishQuantity(rule.drinkChoices, "different drink", "different drinks")} and ${englishQuantity(rule.snackChoices, "different snack", "different snacks")}.`;
      },
    },
    "perfect-balance": {
      title: "Perfect balance",
      description: (challenge: Challenge) => {
        challengeRule(challenge, "perfect-balance", "equalRefreshmentPortions");
        return "Plan the same number of drink and snack portions.";
      },
    },
    "just-enough": {
      title: "Just enough",
      description: (challenge: Challenge) => {
        const rule = challengeRule(challenge, "just-enough", "maximumSurplusPortions");
        return `Finish with no more than ${englishQuantity(rule.drinks, "extra drink portion", "extra drink portions")} and ${englishQuantity(rule.snacks, "extra snack portion", "extra snack portions")}.`;
      },
    },
    "one-euro-refreshments": {
      title: "Refreshments budget",
      description: (challenge: Challenge) => {
        const rule = challengeRule(challenge, "one-euro-refreshments", "refreshmentsWithinParticipantBudget");
        return `Spend no more than ${formatCurrency(rule.maximumPerParticipant)} per student on drinks and snacks combined.`;
      },
    },
    "one-expensive-purchase": {
      title: "One expensive purchase",
      description: (challenge: Challenge) => {
        const rule = challengeRule(challenge, "one-expensive-purchase", "exactlyOneAtOrAbovePrice");
        return `Choose exactly one item costing ${formatCurrency(rule.price)} or more.`;
      },
    },
    "one-bold-or-several-simple": {
      title: "Bold or simple?",
      description: (challenge: Challenge) => {
        challengeRule(challenge, "one-bold-or-several-simple", "oneHypeOrMultiplePlainDecorations");
        return "Choose a single slogan decoration, or at least two without slogans.";
      },
    },
    "useful-tomorrow": {
      title: "Useful next time",
      description: (challenge: Challenge) => {
        challengeRule(challenge, "useful-tomorrow", "reusableWithLongLastingSnack");
        return "Choose a reusable item and a snack that keeps.";
      },
    },
    "fun-and-frugal": {
      title: "Fun and frugal",
      description: (challenge: Challenge) => {
        const rule = challengeRule(challenge, "fun-and-frugal", "hypeWithRemainingMoney");
        return `Choose at least one item with a catchy slogan and have at least ${formatCurrency(rule.minimumRemaining)} left.`;
      },
    },
  } satisfies Readonly<Record<ChallengeId, ConfiguredCardCopy<Challenge>>>,
  discussionCards: {
    "needs-or-wants": { title: "Needs or wants?", description: "What does the party really need, and what would simply be nice to have? How does that help you choose?" },
    "same-price-same-choice": { title: "Same price, same choice?", description: "Compare two choices with the same price. Which provides more portions? Is that enough to decide?" },
    "more-or-varied": { title: "More of the same or more variety?", description: "When everyone has enough, is it better to have more of the same or less of each but more variety?" },
    "beyond-price": { title: "What matters beyond price?", description: "When is the cheapest choice not the best? What else is worth considering?" },
    "how-to-agree": { title: "How can we agree?", description: "If the class disagrees, how can you make a fair decision without buying everything?" },
    "what-to-give-up": { title: "What would we give up first?", description: `If you had to save another ${formatCurrency(5)}, what would you change in the plan? What would you lose?` },
    "more-money-better-party": { title: "Does more money mean a better party?", description: `What would you change with another ${formatCurrency(5)}? Would it really make the party better?` },
    "now-or-next-party": { title: "Now or the next party?", description: "Should you spend the money left now or save it for something useful next time?" },
  } satisfies Readonly<Record<DiscussionId, CardCopy>>,
  projects: {
    "large-celebration": { title: "Whole-school party fund", description: "Unlocks the “Whole school at one table” party." },
    "music-system": { title: "Classroom sound system", description: "Unlocks a reusable karaoke setup at no cost." },
    "shopping-card": { title: "Discount card", description: `Takes up to ${formatCurrency(SHOPPING_CARD_DISCOUNT)} off one item.` },
  } satisfies Readonly<Record<ProjectId, CardCopy>>,
  upgrades: {
    "compost-bin": { title: "Compost bin", description: "Lets you compost leftover food that spoils and grow the classroom plant." },
  } satisfies Readonly<Record<UpgradeId, CardCopy>>,
  planProblem: (problem: PlanProblem): string => {
    switch (problem.kind) {
      case "overBudget": return `You are ${formatCurrency(problem.amount)} over budget.`;
      case "missingDrinks": return `You need drinks for ${problem.amount} more ${englishNoun(problem.amount, "student", "students")}.`;
      case "missingSnacks": return `You need snacks for ${problem.amount} more ${englishNoun(problem.amount, "student", "students")}.`;
      case "missingDrinkVariety": return `Choose at least ${englishQuantity(problem.amount, "different drink", "different drinks")}.`;
      case "missingSnackVariety": return `Choose at least ${englishQuantity(problem.amount, "different snack", "different snacks")}.`;
      case "missingActivities": return problem.amount === 1
        ? "Choose at least one group activity."
        : `Choose at least ${englishQuantity(problem.amount, "different group activity", "different group activities")}.`;
      case "missingDecorations": return `Choose at least ${englishQuantity(problem.amount, "decoration", "decorations")}.`;
    }
  },
  modifierLabel: (modifier: ValueModifier): string => {
    switch (modifier.label.kind) {
      case "event": return englishTranslations.eventCards[modifier.label.eventId].title;
      case "whole-school-celebration": return "Whole school at one table";
      case "teacher-adjustment": return englishTranslations.settings.teacherAdjustment;
    }
  },
} as const;

type TranslationShape<T> =
  T extends (...args: infer Args) => string
    ? (...args: Args) => string
    : T extends readonly unknown[]
      ? { readonly [Index in keyof T]: TranslationShape<T[Index]> }
      : T extends object
        ? { readonly [Key in keyof T]: TranslationShape<T[Key]> }
        : T extends string
          ? string
          : never;

export type Translations = TranslationShape<typeof englishTranslations>;
