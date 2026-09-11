import type { SavedMissionSummary } from "../missionStorage";
import { FullscreenButton } from "./game/GameControls";
import { LandingPage } from "./start/LandingPage";
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
        onDelete={onDelete}
      />
    </main>
  );
}
