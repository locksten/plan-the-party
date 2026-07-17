type HeaderProps = {
  onHome: () => void;
  onHelp: () => void;
  onFullscreen: () => void;
};

const textButton = "rounded-lg border-2 border-navy bg-cream px-3 py-2 text-xs font-black text-navy hover:bg-white";

export function Header({ onHome, onHelp, onFullscreen }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b-[3px] border-navy bg-cream px-[clamp(18px,4vw,64px)]">
      <button className="flex items-center gap-3 text-left" type="button" onClick={onHome} aria-label="Grįžti į pradžią">
        <span className="grid size-10 place-items-center rounded-full border-[3px] border-navy bg-yellow text-xl font-black" aria-hidden="true">€</span>
        <span className="flex flex-col">
          <strong className="text-lg leading-none">Šventės iššūkis</strong>
          <small className="mt-1 font-sans text-[10px] font-bold text-muted">Klasės biudžeto žaidimas</small>
        </span>
      </button>
      <div className="flex gap-2">
        <button className={textButton} type="button" onClick={onHelp}>Kaip žaisti?</button>
        <button className={textButton} type="button" onClick={onFullscreen}>Per visą ekraną</button>
      </div>
    </header>
  );
}
