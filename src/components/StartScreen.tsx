import { MODES, type ModeId } from "../game";
import { classes, formatEuros, MODE_VISUALS } from "../ui";

export function StartScreen({ onStart }: { onStart: (modeId: ModeId) => void }) {
  return (
    <main className="grid min-h-[calc(100dvh-64px)] grid-rows-[auto_1fr_auto] overflow-hidden px-[clamp(20px,5vw,80px)] pb-[18px] pt-7">
      <section className="mx-auto mb-[18px] max-w-[860px] text-center">
        <p className="mb-2 text-[11px] font-black uppercase tracking-[.11em] text-teal-dark">Klasės iššūkis</p>
        <h1 className="m-0 text-[clamp(44px,5vw,68px)] font-black leading-[.94] tracking-[-.055em] text-white [text-shadow:4px_4px_0_#17233f]">
          Atverkite duris į<br /><span className="text-yellow">klasės šventę!</span>
        </h1>
        <p className="mx-auto mt-3 max-w-[760px] font-sans text-[clamp(16px,1.6vw,20px)] font-bold text-teal-dark">
          Pasirinkite lygį. Tada tempkite daiktus ant šventės stalo ir saugokite biudžetą.
        </p>
      </section>

      <section className="grid w-full grid-cols-3 items-end gap-[clamp(18px,3vw,48px)]" aria-labelledby="mode-heading">
        <h2 id="mode-heading" className="sr-only">Pasirinkite lygį</h2>
        {MODES.map((mode) => {
          const visual = MODE_VISUALS[mode.id];
          return (
            <article className={classes(
              "relative min-h-[285px] rounded-[140px_140px_16px_16px] border-4 border-navy p-[13px] shadow-[9px_9px_0_#17233f]",
              visual.frameColor,
            )} key={mode.id}>
              <div className="grid h-[55px] place-items-center" aria-hidden="true">
                <span className="grid size-12 place-items-center rounded-full border-4 border-navy bg-cream text-2xl font-black shadow-[3px_3px_0_#17233f]">{visual.number}</span>
              </div>
              <div className="flex h-[205px] flex-col items-center rounded-[95px_95px_10px_10px] border-4 border-navy bg-cream px-[18px] pb-[13px] pt-4 text-center">
                <p className="text-[11px] font-black uppercase tracking-[.08em] text-teal-dark">{mode.grades}</p>
                <strong className="mt-1 text-2xl tracking-[-.03em]">{mode.title}</strong>
                <small className="mt-1 font-sans text-xs font-bold text-muted">{visual.callout}</small>
                <div className="mb-2 mt-auto flex w-full justify-center gap-2">
                  <span className="rounded-lg border-2 border-navy bg-white px-2 py-1 text-xs font-black">{formatEuros(mode.budget)}</span>
                  <span className="rounded-lg border-2 border-navy bg-white px-2 py-1 text-xs font-black">rezervą renkatės</span>
                </div>
                <button className="min-h-11 w-full rounded-lg border-[3px] border-navy bg-yellow font-black text-navy shadow-[0_4px_0_#17233f] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#17233f]" type="button" onClick={() => onStart(mode.id)}>
                  Atverti
                </button>
              </div>
            </article>
          );
        })}
      </section>
      <p className="mb-0 mt-3.5 text-center text-xs font-black uppercase text-teal-dark">Mokytojas valdo ekraną · klasė tariasi ir balsuoja</p>
    </main>
  );
}
