import { CHALLENGE_ART_SOURCES } from "../../cardArt";
import { CHALLENGES, challengeCompleted, type GameMode, type GamePlan, type Selection } from "../../game";
import { classes } from "../../ui";

type ChallengeStripProps = {
  mode: GameMode;
  plan: GamePlan;
  selection: Selection;
  onOpen: () => void;
};

export function ChallengeStrip({ mode, plan, selection, onOpen }: ChallengeStripProps) {
  return (
    <nav className="flex h-[46px] w-full items-center justify-between" aria-label="Iššūkiai">
      {CHALLENGES.map((challenge) => {
        const isComplete = challengeCompleted(challenge, mode, selection, plan);
        const status = isComplete ? "įvykdytas" : "dar neįvykdytas";

        return (
          <button
            key={challenge.id}
            className="group grid size-[46px] place-items-center focus-visible:rounded-lg focus-visible:outline-4 focus-visible:outline-yellow"
            type="button"
            onClick={onOpen}
            aria-label={`${challenge.title}: ${status}. Atverti iššūkių lentą.`}
            title={`${challenge.title} — ${status}`}
          >
            <img
              className={classes(
                "size-[46px] object-contain transition group-hover:scale-105",
                !isComplete && "grayscale opacity-45",
              )}
              src={CHALLENGE_ART_SOURCES[challenge.id]}
              alt=""
              draggable={false}
            />
          </button>
        );
      })}
    </nav>
  );
}
