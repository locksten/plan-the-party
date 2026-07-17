import { CHALLENGE_ART_SOURCES } from "../../cardArt";
import { CHALLENGES, type ChallengeId } from "../../domain";
import { classes } from "../../ui";

type ChallengeStripProps = {
  completedChallengeIds: ReadonlySet<ChallengeId>;
  onOpen: () => void;
};

export function ChallengeStrip({ completedChallengeIds, onOpen }: ChallengeStripProps) {
  const challengeStates = CHALLENGES.map((challenge) => ({
    challenge,
    isComplete: completedChallengeIds.has(challenge.id),
  }));
  const completedCount = challengeStates.filter(({ isComplete }) => isComplete).length;

  return (
    <button
      className="grid h-[2.875rem] w-full grid-cols-8 items-center rounded-lg outline-none focus-visible:outline-[0.25rem] focus-visible:outline-yellow active:translate-y-0.5"
      type="button"
      onClick={onOpen}
      aria-label={`Atverti iššūkius. Įvykdyta ${completedCount} iš ${challengeStates.length}.`}
    >
      {challengeStates.map(({ challenge, isComplete }) => {
        const status = isComplete ? "įvykdytas" : "dar neįvykdytas";

        return (
          <span
            key={challenge.id}
            className="grid h-[2.875rem] min-w-0 place-items-center"
            title={`${challenge.title} — ${status}`}
          >
            <img
              className={classes(
                "size-full max-h-[2.875rem] max-w-[2.875rem] object-contain",
                !isComplete && "grayscale opacity-45",
              )}
              src={CHALLENGE_ART_SOURCES[challenge.id]}
              alt=""
              draggable={false}
            />
          </span>
        );
      })}
    </button>
  );
}
