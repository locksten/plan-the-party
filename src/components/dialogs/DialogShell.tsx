import type { ReactNode } from "react";
import { classes } from "../../ui";
import { IconButton } from "../ui/IconButton";
import { useI18n } from "../../i18n/I18nProvider";

type DialogShellProps = Readonly<{
  labelledBy: string;
  onClose: () => void;
  children: ReactNode;
  className: string;
  showClose?: boolean;
}>;

function DialogCloseButton({ onClose }: { onClose: () => void }) {
  const { translations } = useI18n();
  return (
    <IconButton type="button" onClick={onClose} aria-label={translations.common.close} title={translations.common.close}>
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
        <path d="M6 6l12 12M18 6 6 18" />
      </svg>
    </IconButton>
  );
}

export function DialogShell({ labelledBy, onClose, children, className, showClose = true }: DialogShellProps) {
  return (
    <div className="layer-dialog fixed inset-0 grid place-items-center bg-[#0b1429]/80 p-5" role="presentation" onMouseDown={onClose}>
      <section
        className={classes("relative max-h-[calc(100vh-2.5rem)] overflow-auto rounded-2xl border-[0.25rem] border-navy bg-cream p-[2.375rem] shadow-[0.5625rem_0.5625rem_0_#080f20]", className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {showClose && <div className="absolute right-3 top-3"><DialogCloseButton onClose={onClose} /></div>}
        {children}
      </section>
    </div>
  );
}

type CardBoardDialogProps = Readonly<{
  labelledBy: string;
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
  headerActions?: ReactNode;
  boardRef?: (element: HTMLDivElement | null) => void;
}>;

export function CardBoardDialog({ labelledBy, title, description, onClose, children, headerActions, boardRef }: CardBoardDialogProps) {
  return (
    <DialogShell
      labelledBy={labelledBy}
      onClose={onClose}
      className="flex h-[min(48.75rem,calc(100vh-2.5rem))] w-full max-w-[82.5rem] flex-col"
      showClose={false}
    >
      <header className="flex shrink-0 items-start justify-between gap-6">
        <div className="min-w-0">
          <h2 id={labelledBy} className="m-0 text-[clamp(2.25rem,3.5vw,3.125rem)] leading-none tracking-[-0.04em]">{title}</h2>
          <p className="mb-6 mt-1 text-xl text-muted">{description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {headerActions}
          <DialogCloseButton onClose={onClose} />
        </div>
      </header>
      <div ref={boardRef} className="grid min-h-0 flex-1 grid-cols-4 grid-rows-2 gap-4">
        {children}
      </div>
    </DialogShell>
  );
}
