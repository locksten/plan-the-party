import type { ChallengeId, MysteryEventId } from "./game";

export const CHALLENGE_ART_SOURCES = {
  "atsargesnis-planas": "/assets/cards/challenges/atsargesnis-planas.webp",
  "nemokama-pramoga": "/assets/cards/challenges/nemokama-pramoga.webp",
  "liko-rytojui": "/assets/cards/challenges/liko-rytojui.webp",
  "pasidaryk-pats": "/assets/cards/challenges/pasidaryk-pats.webp",
  "daugkartinis-pasirinkimas": "/assets/cards/challenges/daugkartinis-pasirinkimas.webp",
  "reklama-neitikino": "/assets/cards/challenges/reklama-neitikino.webp",
} as const satisfies Readonly<Record<ChallengeId, string>>;

export const EVENT_ART_SOURCES = {
  puodeliai: "/assets/cards/events/puodeliai.webp",
  sveciai: "/assets/cards/events/sveciai.webp",
  pristatymas: "/assets/cards/events/pristatymas.webp",
  issiliejo: "/assets/cards/events/issiliejo.webp",
  "nukrito-padeklas": "/assets/cards/events/nukrito-padeklas.webp",
  santaupos: "/assets/cards/events/santaupos.webp",
} as const satisfies Readonly<Record<MysteryEventId, string>>;
