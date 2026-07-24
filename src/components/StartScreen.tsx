import { useEffect, useState } from "react";
import type { SavedMissionSummary } from "../missionStorage";
import { DialogShell } from "./dialogs/DialogShell";
import { FullscreenButton } from "./game/GameControls";
import { LandingPage } from "./start/LandingPage";
import { RaisedButton } from "./ui/RaisedButton";
import { LanguageSelector } from "./LanguageSelector";
import { useI18n } from "../i18n/I18nProvider";

type StartScreenProps = {
  missions: readonly SavedMissionSummary[];
  onStart: () => void;
  onContinue: (id: string) => void;
  onDelete: (id: string) => void;
  onFullscreen: () => void;
};

export function StartScreen({ missions, onStart, onContinue, onDelete, onFullscreen }: StartScreenProps) {
  const { translations } = useI18n();
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
    if (missionToDelete === null) throw new Error("No saved mission was selected for deletion.");
    onDelete(missionToDelete.id);
    setMissionToDelete(null);
  }

  return (
    <main className="relative min-h-dvh overflow-hidden">
      <nav className="layer-ui absolute right-3 top-3 flex items-center gap-2" aria-label={translations.landing.screenControls}>
        <LanguageSelector />
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
            {translations.landing.confirmDeleteTitle(missionToDelete.classLabel)}
          </h2>
          <p className="mb-7 mt-3 text-lg font-bold text-muted">{translations.landing.confirmDeleteDescription}</p>
          <div className="flex justify-end gap-3">
            <RaisedButton className="min-h-12 px-6 text-lg" type="button" onClick={() => setMissionToDelete(null)}>
              {translations.common.cancel}
            </RaisedButton>
            <RaisedButton className="min-h-12 bg-coral px-6 text-lg" type="button" onClick={confirmDelete}>
              {translations.common.delete}
            </RaisedButton>
          </div>
        </DialogShell>
      )}
    </main>
  );
}
