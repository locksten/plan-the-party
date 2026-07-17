import { DialogShell } from "./DialogShell";

export function HelpDialog({ onClose }: { onClose: () => void }) {
  return (
    <DialogShell labelledBy="help-title" onClose={onClose} className="w-full max-w-[53.75rem]">
      <h2 id="help-title" className="m-0 pr-12 text-[2.625rem] tracking-[-0.04em]">Kaip viskas vyksta?</h2>
      <p className="mb-0 mt-4 max-w-[46.875rem] text-xl leading-relaxed text-muted">
        Su klase suplanuokite šventę: pasirūpinkite, kad visiems užtektų gėrimų ir užkandžių, pasirinkite bent vieną veiklą ir neviršykite biudžeto.
      </p>
      <p className="mb-0 mt-4 max-w-[46.875rem] text-xl leading-relaxed text-muted">
        Siekite papildomų iššūkių, atverskite netikėtus įvykius ir aptarkite pasirinkimus.
      </p>
      <p className="mb-0 mt-4 max-w-[46.875rem] text-xl leading-relaxed text-muted">
        Po šventės nuspręskite, ką daryti su maisto likučiais ir kam skirti likusius pinigus. Kai kurie pasirinkimai padės kitą kartą.
      </p>
    </DialogShell>
  );
}
