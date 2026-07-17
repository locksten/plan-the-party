import { useEffect, useState } from "react";
import type { SavedMissionSummary } from "../missionStorage";
import { DialogShell } from "./dialogs/DialogShell";
import { FullscreenButton } from "./game/GameControls";
import { LandingPage } from "./start/LandingPage";
import { RaisedButton } from "./ui/RaisedButton";

type StartScreenProps = {
  missions: readonly SavedMissionSummary[];
  onStart: () => void;
  onContinue: (id: string) => void;
  onDelete: (id: string) => void;
  onFullscreen: () => void;
};

export function StartScreen({ missions, onStart, onContinue, onDelete, onFullscreen }: StartScreenProps) {
  const [missionToDelete, setMissionToDelete] = useState<SavedMissionSummary | null>(null);

  useEffect(() => {
    if (missionToDelete === null) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMissionToDelete(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [missionToDelete]);

  function confirmDelete() {
    if (missionToDelete === null) throw new Error("Nepasirinktas įrašas, kurį reikėtų pašalinti.");
    onDelete(missionToDelete.id);
    setMissionToDelete(null);
  }

  return (
    <main className="relative min-h-dvh overflow-hidden">
      <nav className="layer-ui absolute right-3 top-3 flex gap-1.5" aria-label="Ekrano valdymas">
        <FullscreenButton onFullscreen={onFullscreen} />
      </nav>
      <LandingPage
        missions={missions}
        onStart={onStart}
        onContinue={onContinue}
        onRequestDelete={setMissionToDelete}
      />

      {missionToDelete !== null && (
        <DialogShell labelledBy="delete-save-title" onClose={() => setMissionToDelete(null)} className="w-full max-w-[34rem]">
          <h2 id="delete-save-title" className="m-0 pr-10 text-[2rem] leading-tight">
            Pašalinti {missionToDelete.classLabel} klasės įrašą?
          </h2>
          <p className="mb-7 mt-3 text-lg font-bold text-muted">Visa šios klasės pažanga bus prarasta.</p>
          <div className="flex justify-end gap-3">
            <RaisedButton className="min-h-12 px-6 text-lg" type="button" onClick={() => setMissionToDelete(null)}>
              Atšaukti
            </RaisedButton>
            <RaisedButton className="min-h-12 bg-coral px-6 text-lg" type="button" onClick={confirmDelete}>
              Pašalinti
            </RaisedButton>
          </div>
        </DialogShell>
      )}
    </main>
  );
}
