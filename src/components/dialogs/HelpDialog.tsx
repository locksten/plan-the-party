import { DialogShell } from "./DialogShell";
import { useI18n } from "../../i18n/I18nProvider";

export function HelpDialog({ onClose }: { onClose: () => void }) {
  const { translations } = useI18n();
  return (
    <DialogShell labelledBy="help-title" onClose={onClose} className="w-full max-w-[53.75rem]">
      <h2 id="help-title" className="m-0 pr-12 text-[2.625rem] tracking-[-0.04em]">{translations.help.title}</h2>
      {translations.help.paragraphs.map((paragraph) => (
        <p className="mb-0 mt-4 max-w-[46.875rem] text-xl leading-relaxed text-muted" key={paragraph}>
          {paragraph}
        </p>
      ))}
    </DialogShell>
  );
}
