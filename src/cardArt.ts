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
  "just-enough": cardsChallengesTiekKiekReikiaV7Source,
  "table-variety": cardsChallengesIvairoveAntStaloV3Source,
  "perfect-balance": cardsChallengesTobulaPusiausvyraV5Source,
  "fun-and-frugal": cardsChallengesIrSmaguIrTaupuV3Source,
  "useful-tomorrow": cardsChallengesPraversIrRytojV3Source,
  "one-expensive-purchase": cardsChallengesVienasBrangesnisPirkinysV3Source,
  "one-euro-refreshments": cardsChallengesVaisesPoEuraKiekvienamV3Source,
  "one-bold-or-several-simple": cardsChallengesVienasRyskusArKeliPaprastiV6Source,
} as const satisfies Readonly<Record<ChallengeId, string>>;

export const EVENT_ART_SOURCES = {
  "school-photographer": cardsEventsMokyklosFotografasV2Source,
  "party-runs-long": cardsEventsSventeUzsitesV2Source,
  "advertised-items-cost-more": cardsEventsReklamaPabrangoV2Source,
  "spilled-drink": cardsEventsIssiliejoV2Source,
  "homemade-snacks": cardsEventsNaminiaiUzkandziaiSource,
  "forgot-cups": cardsEventsPamirsomePuodeliusVariant4Source,
  "friends-join": cardsEventsPrisijungiaDraugaiSource,
  "borrowed-rc-cars": cardsEventsPasiskolinomeMasinelesSource,
} as const satisfies Readonly<Record<EventId, string>>;

export const DISCUSSION_ART_SOURCES = {
  "what-to-give-up": cardsDiscussionsKoAtsisakytumeSource,
  "same-price-same-choice": cardsDiscussionsBrangiausiaGeriausiaSource,
  "now-or-next-party": cardsDiscussionsKiekPiniguPaliktiSource,
  "needs-or-wants": cardsDiscussionsReikiaArNorimeSource,
  "more-or-varied": cardsDiscussionsDaugiauArIvairiauSource,
  "how-to-agree": cardsDiscussionsKaipSusitartiSource,
  "more-money-better-party": cardsDiscussionsDaugiauPiniguGeresneSventeSource,
  "beyond-price": cardsDiscussionsKasSvarbuBeKainosSource,
} as const satisfies Readonly<Record<DiscussionId, string>>;
