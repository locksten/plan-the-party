import { EVENT_ART_SOURCES } from "../../cardArt";
import type { GameMode, MysteryEvent, MysteryEventId } from "../../game";
import { classes } from "../../ui";

type EventStripProps = {
  mode: GameMode;
  activeEvents: readonly MysteryEvent[];
  revealedEventIds: readonly MysteryEventId[];
  onOpen: () => void;
};

export function EventStrip({ mode, activeEvents, revealedEventIds, onOpen }: EventStripProps) {
  return (
    <nav className="flex h-10 w-full items-center justify-between" aria-label="Netikėti įvykiai">
      {mode.mysteryEvents.map((event) => {
        const isRevealed = revealedEventIds.includes(event.id);
        const isActive = activeEvents.some((activeEvent) => activeEvent.id === event.id);
        const status = isActive ? "įjungtas" : "išjungtas";

        return (
          <button
            key={event.id}
            className="group grid size-10 place-items-center focus-visible:rounded-lg focus-visible:outline-4 focus-visible:outline-yellow"
            type="button"
            onClick={onOpen}
            aria-label={isRevealed
              ? `${event.title}: ${status}. Atverti netikėtų įvykių korteles.`
              : "Neatversta netikėto įvykio kortelė. Atverti netikėtų įvykių korteles."}
            title={isRevealed ? `${event.title} — ${status}` : "Neatverstas įvykis"}
          >
            {isRevealed ? (
              <img
                className={classes(
                  "size-10 object-contain transition group-hover:scale-105",
                  !isActive && "grayscale opacity-45",
                )}
                src={EVENT_ART_SOURCES[event.id]}
                alt=""
                draggable={false}
              />
            ) : (
              <span className="relative grid size-10 place-items-center transition group-hover:scale-105" aria-hidden="true">
                <img
                  className="absolute size-full object-contain brightness-0 opacity-65"
                  src={EVENT_ART_SOURCES[event.id]}
                  alt=""
                  draggable={false}
                />
                <span className="relative z-10 text-base font-black leading-none text-cream/70">?</span>
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
