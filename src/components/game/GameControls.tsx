import { IconButton } from "../ui/IconButton";
import { useI18n } from "../../i18n/I18nProvider";

type GameCornerControlsProps = {
  onHome: () => void;
  onOpenSettings: () => void;
  onHelp: () => void;
  onFullscreen: () => void;
};

type HelpFullscreenButtonsProps = {
  onHelp: () => void;
  onFullscreen: () => void;
};

function HelpFullscreenButtons({ onHelp, onFullscreen }: HelpFullscreenButtonsProps) {
  const { translations } = useI18n();
  return (
    <>
      <IconButton className="pointer-events-auto" shape="round" tone="cream" type="button" onClick={onHelp} aria-label={translations.controls.help} title={translations.controls.help}>
        <span className="text-xl font-black leading-none" aria-hidden="true">?</span>
      </IconButton>
      <FullscreenButton onFullscreen={onFullscreen} />
    </>
  );
}

export function FullscreenButton({ onFullscreen }: { onFullscreen: () => void }) {
  const { translations } = useI18n();
  return (
    <IconButton className="pointer-events-auto" shape="round" tone="cream" type="button" onClick={onFullscreen} aria-label={translations.controls.fullscreen} title={translations.controls.fullscreen}>
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" />
      </svg>
    </IconButton>
  );
}

export function GameCornerControls({ onHome, onOpenSettings, onHelp, onFullscreen }: GameCornerControlsProps) {
  const { translations } = useI18n();
  return (
    <nav className="layer-ui pointer-events-none absolute inset-x-3 top-3 flex justify-between" aria-label={translations.controls.game}>
      <IconButton className="pointer-events-auto" shape="round" tone="cream" type="button" onClick={onHome} aria-label={translations.controls.back} title={translations.controls.back}>
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </IconButton>
      <div className="flex gap-1.5">
        <IconButton
          className="pointer-events-auto"
          shape="round"
          tone="cream"
          type="button"
          onClick={onOpenSettings}
          aria-label={translations.controls.settings}
          title={translations.controls.settings}
        >
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M9.6 3.9c.1-.5.6-.9 1.1-.9h2.6c.5 0 1 .4 1.1.9l.2 1.3c.1.4.3.7.7.9l.2.1c.3.2.7.3 1.1.1l1.2-.5c.5-.2 1.1 0 1.4.5l1.3 2.3c.3.5.2 1.1-.3 1.4l-1 .8c-.3.3-.4.6-.4 1v.3c0 .4.1.8.4 1l1 .8c.4.4.5 1 .3 1.4l-1.3 2.3c-.3.5-.9.7-1.4.5l-1.2-.5c-.4-.1-.8-.1-1.1.1l-.2.1c-.3.2-.6.5-.7.9l-.2 1.3c-.1.5-.6.9-1.1.9h-2.6c-.5 0-1-.4-1.1-.9l-.2-1.3c-.1-.4-.3-.7-.7-.9l-.2-.1c-.3-.2-.7-.3-1.1-.1l-1.2.5c-.5.2-1.1 0-1.4-.5l-1.3-2.3c-.3-.5-.2-1.1.3-1.4l1-.8c.3-.3.4-.6.4-1v-.3c0-.4-.1-.8-.4-1l-1-.8c-.4-.4-.5-1-.3-1.4l1.3-2.3c.3-.5.9-.7 1.4-.5l1.2.5c.4.1.8.1 1.1-.1l.2-.1c.3-.2.6-.5.7-.9l.2-1.3Z" />
          </svg>
        </IconButton>
        <HelpFullscreenButtons onHelp={onHelp} onFullscreen={onFullscreen} />
      </div>
    </nav>
  );
}
