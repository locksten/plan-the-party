export type DiscussionId =
  | "ko-atsisakytume"
  | "brangiausia-geriausia"
  | "kiek-pinigu-palikti"
  | "reikia-ar-norime"
  | "daugiau-ar-ivairiau"
  | "kaip-susitarti"
  | "daugiau-pinigu-geresne-svente"
  | "kas-svarbu-be-kainos";

export type DiscussionCard = Readonly<{
  id: DiscussionId;
  title: string;
  description: string;
}>;

export const DISCUSSION_CARDS = [
  {
    id: "reikia-ar-norime",
    title: "Reikia ar norime?",
    description: "Ko šventei tikrai reikia, o ko tiesiog norisi? Kaip tai padeda pasirinkti?",
  },
  {
    id: "brangiausia-geriausia",
    title: "Ta pati kaina – tas pats pasirinkimas?",
    description: "Palyginkite du vienodai kainuojančius pasirinkimus. Kuris duoda daugiau porcijų? Ar to pakanka?",
  },
  {
    id: "daugiau-ar-ivairiau",
    title: "Daugiau ar įvairiau?",
    description: "Kai visiems užtenka, kas geriau: daugiau vienodų vaišių ar mažiau, bet įvairesnių?",
  },
  {
    id: "kas-svarbu-be-kainos",
    title: "Kas svarbu be kainos?",
    description: "Kada pigiausias pasirinkimas nėra geriausias? Į ką dar verta atsižvelgti?",
  },
  {
    id: "kaip-susitarti",
    title: "Kaip susitarti?",
    description: "Jei klasės nuomonės išsiskiria, kaip priimti sąžiningą sprendimą neperkant visko?",
  },
  {
    id: "ko-atsisakytume",
    title: "Ko atsisakytume pirmiausia?",
    description: "Jei reikėtų sutaupyti dar 5 €, ką pakeistumėte plane? Ko dėl to netektumėte?",
  },
  {
    id: "daugiau-pinigu-geresne-svente",
    title: "Ar daugiau pinigų reiškia geresnę šventę?",
    description: "Ką pakeistumėte gavę dar 5 €? Ar nuo to šventė tikrai taptų geresnė?",
  },
  {
    id: "kiek-pinigu-palikti",
    title: "Dabar ar kitai šventei?",
    description: "Ar likusius pinigus išleisti dabar, ar skirti tam, kas pravers kitą kartą?",
  },
] as const satisfies readonly DiscussionCard[];

if (DISCUSSION_CARDS.length !== 8 || new Set(DISCUSSION_CARDS.map((card) => card.id)).size !== DISCUSSION_CARDS.length) {
  throw new Error("Žaidime turi būti lygiai 8 unikalios diskusijų kortelės.");
}
