import type { GamePlan } from "../../game";
import { classes } from "../../ui";

type GameToolbarProps = {
  plan: GamePlan;
  activeEventCount: number;
  activeChallengeCount: number;
  onHome: () => void;
  onHelp: () => void;
  onFullscreen: () => void;
  onOpenParticipants: () => void;
  onOpenChallenges: () => void;
  onOpenEvents: () => void;
};

const toolbarButton = "min-h-[38px] rounded-lg border-2 border-navy bg-cream px-3 text-xs font-black text-navy hover:bg-white";

export function GameToolbar({ plan, activeEventCount, activeChallengeCount, onHome, onHelp, onFullscreen, onOpenParticipants, onOpenChallenges, onOpenEvents }: GameToolbarProps) {
  return (
    <footer className="grid min-h-12 grid-cols-[auto_auto_1fr_auto_auto] items-stretch gap-2 text-navy">
      <button className={toolbarButton} type="button" onClick={onHome}>← Grįžti</button>
      <div className="flex gap-1.5">
        <button className={toolbarButton} type="button" onClick={onHelp}>Kaip žaisti?</button>
        <button className={toolbarButton} type="button" onClick={onFullscreen}>Per visą ekraną</button>
      </div>
      {plan.participants === undefined ? (
        <div className="flex items-center justify-self-end rounded-lg bg-blue-soft px-3">
          <strong className="text-sm">Visa klasė</strong>
        </div>
      ) : (
        <button className="flex items-center justify-self-end rounded-lg border-2 border-navy bg-blue-soft px-3 text-navy hover:bg-blue" type="button" onClick={onOpenParticipants} aria-label={`Keisti mokinių skaičių. Dabar ${plan.participants}.`}>
          <strong className="text-sm">{plan.participants} mokiniai</strong>
        </button>
      )}
      <button className={classes(toolbarButton, "bg-blue-soft", activeChallengeCount > 0 && "bg-blue")} type="button" onClick={onOpenChallenges}>
        {activeChallengeCount > 0 ? `Iššūkiai (${activeChallengeCount})` : "Iššūkiai"}
      </button>
      <button className={classes(toolbarButton, "bg-purple-soft", activeEventCount > 0 && "bg-coral")} type="button" onClick={onOpenEvents}>
        {activeEventCount > 0 ? `Įvykiai (${activeEventCount})` : "Netikėtas įvykis"}
      </button>
    </footer>
  );
}
