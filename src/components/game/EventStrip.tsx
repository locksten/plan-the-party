import { EVENT_ART_SOURCES } from "../../cardArt";
import { EVENTS, type EventId } from "../../domain";
import { classes } from "../../ui";
import { useI18n } from "../../i18n/I18nProvider";

type EventStripProps = {
  activeEventIds: readonly EventId[];
  revealedEventIds: readonly EventId[];
  attention: boolean;
  onOpen: () => void;
};

export function EventStrip({ activeEventIds, revealedEventIds, attention, onOpen }: EventStripProps) {
  const { translations } = useI18n();
  return (
    <button
      className="grid h-10 w-full grid-cols-8 items-center rounded-lg outline-none focus-visible:outline-[0.25rem] focus-visible:outline-yellow active:translate-y-0.5"
      type="button"
      onClick={onOpen}
      aria-label={translations.events.openWithStatus(revealedEventIds.length, EVENTS.length, activeEventIds.length)}
    >
      {EVENTS.map((event, index) => {
        const isRevealed = revealedEventIds.includes(event.id);
        const isActive = activeEventIds.includes(event.id);
        const status = isActive ? translations.events.active : translations.events.inactive;

        return (
          <span
            key={event.id}
            className={classes(
              "grid h-10 min-w-0 place-items-center",
              attention && index === 0 && "event-icon-bounce",
            )}
            title={isRevealed ? `${translations.eventCards[event.id].title} — ${status}` : translations.events.unrevealed}
          >
            {isRevealed ? (
              <img
                className={classes(
                  "size-full max-h-10 max-w-10 object-contain",
                  !isActive && "grayscale opacity-45",
                )}
                src={EVENT_ART_SOURCES[event.id]}
                alt=""
                draggable={false}
              />
            ) : (
              <span className="relative isolate grid size-full max-h-10 max-w-10 place-items-center" aria-hidden="true">
                <img
                  className="absolute size-full -scale-x-100 object-contain brightness-0 opacity-65"
                  src={EVENT_ART_SOURCES[event.id]}
                  alt=""
                  draggable={false}
                />
                <span className="relative z-10 text-base font-black leading-none text-cream/70">?</span>
              </span>
            )}
          </span>
        );
      })}
    </button>
  );
}
