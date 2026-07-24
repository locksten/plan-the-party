import type { DiscussionId } from "./domain/ids";

export type { DiscussionId } from "./domain/ids";

export type DiscussionCard = Readonly<{ id: DiscussionId }>;

export const DISCUSSION_CARDS = [
  { id: "needs-or-wants" },
  { id: "same-price-same-choice" },
  { id: "more-or-varied" },
  { id: "beyond-price" },
  { id: "how-to-agree" },
  { id: "what-to-give-up" },
  { id: "more-money-better-party" },
  { id: "now-or-next-party" },
] as const satisfies readonly DiscussionCard[];

if (DISCUSSION_CARDS.length !== 8 || new Set(DISCUSSION_CARDS.map((card) => card.id)).size !== DISCUSSION_CARDS.length) {
  throw new Error("The game must contain exactly eight unique discussion cards.");
}
