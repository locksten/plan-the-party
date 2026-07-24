import { assert } from "../assert";
import type { Challenge, ChallengeId, EventCard, EventId } from "../domain";

export function eventEffect<Kind extends EventCard["effects"][number]["kind"]>(
  event: EventCard,
  expectedId: EventId,
  kind: Kind,
): Extract<EventCard["effects"][number], { kind: Kind }> {
  assert(event.id === expectedId, `Expected event "${expectedId}", received "${event.id}".`);
  const effects = event.effects.filter((effect) => effect.kind === kind);
  assert(effects.length === 1, `Event "${event.id}" must have exactly one "${kind}" effect.`);
  return effects[0] as Extract<EventCard["effects"][number], { kind: Kind }>;
}

export function challengeRule<Kind extends Challenge["rule"]["kind"]>(
  challenge: Challenge,
  expectedId: ChallengeId,
  kind: Kind,
): Extract<Challenge["rule"], { kind: Kind }> {
  assert(challenge.id === expectedId, `Expected challenge "${expectedId}", received "${challenge.id}".`);
  assert(challenge.rule.kind === kind, `Challenge "${challenge.id}" must use the "${kind}" rule.`);
  return challenge.rule as Extract<Challenge["rule"], { kind: Kind }>;
}
