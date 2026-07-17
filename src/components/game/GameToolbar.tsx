import type { GamePlan } from "../../game";
import { classes } from "../../ui";

type GameToolbarProps = {
  plan: GamePlan;
  onOpenParticipants: () => void;
};

type GameCornerControlsProps = {
  canOpenParticipants: boolean;
  onHome: () => void;
  onOpenParticipants: () => void;
  onHelp: () => void;
  onFullscreen: () => void;
};

const toolbarControl = "flex min-h-11 min-w-0 items-center justify-center rounded-lg border-2 border-navy bg-cream px-1 text-center text-[13px] font-black leading-tight text-navy";
const toolbarButton = classes(toolbarControl, "hover:bg-white");
const cornerButton = "grid size-10 place-items-center rounded-full border-2 border-navy bg-cream text-navy shadow-[0_3px_0_#17233f] hover:bg-white active:translate-y-0.5 active:shadow-[0_1px_0_#17233f] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:bg-cream disabled:active:translate-y-0";

export function GameCornerControls({ canOpenParticipants, onHome, onOpenParticipants, onHelp, onFullscreen }: GameCornerControlsProps) {
  return (
    <nav className="pointer-events-none absolute inset-x-3 top-3 z-20 flex justify-between" aria-label="Žaidimo valdymas">
      <button className={classes(cornerButton, "pointer-events-auto")} type="button" onClick={onHome} aria-label="Grįžti" title="Grįžti">
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
      <div className="flex gap-1.5">
        <button
          className={classes(cornerButton, "pointer-events-auto")}
          type="button"
          onClick={onOpenParticipants}
          disabled={!canOpenParticipants}
          aria-label="Nustatymai"
          title={canOpenParticipants ? "Nustatymai" : "Šiame lygyje mokinių skaičius nekeičiamas"}
        >
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M9.6 3.9c.1-.5.6-.9 1.1-.9h2.6c.5 0 1 .4 1.1.9l.2 1.3c.1.4.3.7.7.9l.2.1c.3.2.7.3 1.1.1l1.2-.5c.5-.2 1.1 0 1.4.5l1.3 2.3c.3.5.2 1.1-.3 1.4l-1 .8c-.3.3-.4.6-.4 1v.3c0 .4.1.8.4 1l1 .8c.4.4.5 1 .3 1.4l-1.3 2.3c-.3.5-.9.7-1.4.5l-1.2-.5c-.4-.1-.8-.1-1.1.1l-.2.1c-.3.2-.6.5-.7.9l-.2 1.3c-.1.5-.6.9-1.1.9h-2.6c-.5 0-1-.4-1.1-.9l-.2-1.3c-.1-.4-.3-.7-.7-.9l-.2-.1c-.3-.2-.7-.3-1.1-.1l-1.2.5c-.5.2-1.1 0-1.4-.5l-1.3-2.3c-.3-.5-.2-1.1.3-1.4l1-.8c.3-.3.4-.6.4-1v-.3c0-.4-.1-.8-.4-1l-1-.8c-.4-.4-.5-1-.3-1.4l1.3-2.3c.3-.5.9-.7 1.4-.5l1.2.5c.4.1.8.1 1.1-.1l.2-.1c.3-.2.6-.5.7-.9l.2-1.3Z" />
          </svg>
        </button>
        <button className={classes(cornerButton, "pointer-events-auto")} type="button" onClick={onHelp} aria-label="Kaip žaisti?" title="Kaip žaisti?">
          <span className="text-xl font-black leading-none" aria-hidden="true">?</span>
        </button>
        <button className={classes(cornerButton, "pointer-events-auto")} type="button" onClick={onFullscreen} aria-label="Per visą ekraną" title="Per visą ekraną">
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" />
          </svg>
        </button>
      </div>
    </nav>
  );
}

export function GameToolbar({ plan, onOpenParticipants }: GameToolbarProps) {
  return (
    <footer className="grid text-navy">
      {plan.participants === undefined ? (
        <div className={toolbarControl}>Visa klasė</div>
      ) : (
        <button className={toolbarButton} type="button" onClick={onOpenParticipants} aria-label={`Keisti mokinių skaičių. Dabar ${plan.participants}.`}>
          {plan.participants} mokiniai
        </button>
      )}
    </footer>
  );
}
