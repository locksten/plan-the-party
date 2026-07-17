import cardsChallengesIrSmaguIrTaupuV3Source from "./assets/cards/challenges/ir-smagu-ir-taupu-v3.webp";
import cardsChallengesIvairoveAntStaloV3Source from "./assets/cards/challenges/ivairove-ant-stalo-v3.webp";
import cardsChallengesPraversIrRytojV3Source from "./assets/cards/challenges/pravers-ir-rytoj-v3.webp";
import cardsChallengesTiekKiekReikiaV7Source from "./assets/cards/challenges/tiek-kiek-reikia-v7.webp";
import cardsChallengesTobulaPusiausvyraV5Source from "./assets/cards/challenges/tobula-pusiausvyra-v5.webp";
import cardsChallengesVaisesPoEuraKiekvienamV3Source from "./assets/cards/challenges/vaises-po-eura-kiekvienam-v3.webp";
import cardsChallengesVienasBrangesnisPirkinysV3Source from "./assets/cards/challenges/vienas-brangesnis-pirkinys-v3.webp";
import cardsChallengesVienasRyskusArKeliPaprastiV6Source from "./assets/cards/challenges/vienas-ryskus-ar-keli-paprasti-v6.webp";
import cardsDiscussionsBrangiausiaGeriausiaSource from "./assets/cards/discussions/brangiausia-geriausia.webp";
import cardsDiscussionsDaugiauArIvairiauSource from "./assets/cards/discussions/daugiau-ar-ivairiau.webp";
import cardsDiscussionsDaugiauPiniguGeresneSventeSource from "./assets/cards/discussions/daugiau-pinigu-geresne-svente.webp";
import cardsDiscussionsKaipSusitartiSource from "./assets/cards/discussions/kaip-susitarti.webp";
import cardsDiscussionsKasSvarbuBeKainosSource from "./assets/cards/discussions/kas-svarbu-be-kainos.webp";
import cardsDiscussionsKiekPiniguPaliktiSource from "./assets/cards/discussions/kiek-pinigu-palikti.webp";
import cardsDiscussionsKoAtsisakytumeSource from "./assets/cards/discussions/ko-atsisakytume.webp";
import cardsDiscussionsReikiaArNorimeSource from "./assets/cards/discussions/reikia-ar-norime.webp";
import cardsEventsIssiliejoV2Source from "./assets/cards/events/issiliejo-v2.webp";
import cardsEventsMokyklosFotografasV2Source from "./assets/cards/events/mokyklos-fotografas-v2.webp";
import cardsEventsNaminiaiUzkandziaiSource from "./assets/cards/events/naminiai-uzkandziai.webp";
import cardsEventsPamirsomePuodeliusVariant4Source from "./assets/cards/events/pamirsome-puodelius-variant-4.webp";
import cardsEventsPasiskolinomeMasinelesSource from "./assets/cards/events/pasiskolinome-masineles.webp";
import cardsEventsPrisijungiaDraugaiSource from "./assets/cards/events/prisijungia-draugai.webp";
import cardsEventsReklamaPabrangoV2Source from "./assets/cards/events/reklama-pabrango-v2.webp";
import cardsEventsSventeUzsitesV2Source from "./assets/cards/events/svente-uzsites-v2.webp";
import type { ChallengeId, EventId } from "./domain";
import type { DiscussionId } from "./discussions";

export const CHALLENGE_ART_SOURCES = {
  "tiek-kiek-reikia": cardsChallengesTiekKiekReikiaV7Source,
  "ivairove-ant-stalo": cardsChallengesIvairoveAntStaloV3Source,
  "tobula-pusiausvyra": cardsChallengesTobulaPusiausvyraV5Source,
  "ir-smagu-ir-taupu": cardsChallengesIrSmaguIrTaupuV3Source,
  "pravers-ir-rytoj": cardsChallengesPraversIrRytojV3Source,
  "vienas-brangesnis-pirkinys": cardsChallengesVienasBrangesnisPirkinysV3Source,
  "vaises-po-eura-kiekvienam": cardsChallengesVaisesPoEuraKiekvienamV3Source,
  "vienas-ryskus-ar-keli-paprasti": cardsChallengesVienasRyskusArKeliPaprastiV6Source,
} as const satisfies Readonly<Record<ChallengeId, string>>;

export const EVENT_ART_SOURCES = {
  "mokyklos-fotografas": cardsEventsMokyklosFotografasV2Source,
  "svente-uzsites": cardsEventsSventeUzsitesV2Source,
  "reklama-pabrango": cardsEventsReklamaPabrangoV2Source,
  issiliejo: cardsEventsIssiliejoV2Source,
  "naminiai-uzkandziai": cardsEventsNaminiaiUzkandziaiSource,
  "pamirsome-puodelius": cardsEventsPamirsomePuodeliusVariant4Source,
  "prisijungia-draugai": cardsEventsPrisijungiaDraugaiSource,
  "pasiskolinome-masineles": cardsEventsPasiskolinomeMasinelesSource,
} as const satisfies Readonly<Record<EventId, string>>;

export const DISCUSSION_ART_SOURCES = {
  "ko-atsisakytume": cardsDiscussionsKoAtsisakytumeSource,
  "brangiausia-geriausia": cardsDiscussionsBrangiausiaGeriausiaSource,
  "kiek-pinigu-palikti": cardsDiscussionsKiekPiniguPaliktiSource,
  "reikia-ar-norime": cardsDiscussionsReikiaArNorimeSource,
  "daugiau-ar-ivairiau": cardsDiscussionsDaugiauArIvairiauSource,
  "kaip-susitarti": cardsDiscussionsKaipSusitartiSource,
  "daugiau-pinigu-geresne-svente": cardsDiscussionsDaugiauPiniguGeresneSventeSource,
  "kas-svarbu-be-kainos": cardsDiscussionsKasSvarbuBeKainosSource,
} as const satisfies Readonly<Record<DiscussionId, string>>;
