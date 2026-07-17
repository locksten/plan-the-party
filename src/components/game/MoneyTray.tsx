import { useAutoAnimate } from "@formkit/auto-animate/react";
import type { GamePlan } from "../../game";
import { classes, formatEuros } from "../../ui";

type MoneyTrayProps = {
  plan: GamePlan;
  problems: readonly string[];
  attention: boolean;
  onReserve: (change: -1 | 1) => void;
  onCheck: () => void;
};

export function MoneyTray({ plan, problems, attention, onReserve, onCheck }: MoneyTrayProps) {
  return (
    <section className={classes(
      "mt-1 grid min-h-[104px] grid-cols-[minmax(0,3.15fr)_minmax(11rem,.75fr)] items-stretch gap-2",
      attention && "animate-tray-shake",
    )} aria-label="Biudžeto dėklas">
      <div className="grid min-w-0 grid-cols-[minmax(0,2fr)_minmax(0,1.15fr)] gap-1.5 rounded-xl border-2 border-navy bg-cream p-1.5">
        <div className={classes(
          "grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-lg px-2 py-1",
          plan.available < 0 && "bg-[#ffd9d4]",
        )}>
          <div className="min-w-0">
            <span className="block text-[13px] font-bold text-muted">Liko iš {formatEuros(plan.totalFunds)}</span>
            <strong className={classes("block text-[38px] leading-none", plan.available < 0 && "text-[#b72f27]")}>{formatEuros(plan.available)}</strong>
            <small className="mt-1 block whitespace-nowrap text-xs font-bold text-muted">
              Išleista {formatEuros(plan.totalSpent)}
            </small>
          </div>
          <CoinGrid amount={plan.available} />
        </div>

        <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2 rounded-lg bg-[#f1bd7f] px-2 py-1">
          <div className="flex gap-1">
            <ReserveButton change={-1} disabled={plan.reserve === 0} onReserve={onReserve}>←</ReserveButton>
            <ReserveButton change={1} disabled={plan.reserve === plan.totalFunds} onReserve={onReserve}>→</ReserveButton>
          </div>
          <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2">
            <div>
              <span className="block text-sm font-black leading-none">Rezervas</span>
              <strong className="mt-1 block text-[32px] leading-none">{formatEuros(plan.reserve)}</strong>
            </div>
            <CoinGrid amount={plan.reserve} compact />
          </div>
        </div>
      </div>

      <div className="relative min-w-0">
        {problems.length > 0 && (
          <ul className="absolute bottom-[calc(100%+12px)] right-0 z-20 flex w-[min(420px,45vw)] flex-col items-end gap-2" role="alert" aria-live="assertive">
            {problems.map((problem) => (
              <li className="flex min-h-11 w-fit max-w-full items-center gap-2.5 rounded-xl border-[3px] border-navy bg-coral px-3 py-2 text-[15px] font-black text-navy shadow-[0_4px_0_#17233f]" key={problem}>
                {problem}
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-navy text-lg leading-none text-white" aria-hidden="true">!</span>
              </li>
            ))}
          </ul>
        )}
        <button className="h-[calc(100%-4px)] w-full rounded-xl border-[3px] border-navy bg-yellow text-[22px] font-black text-navy shadow-[0_4px_0_#17233f] hover:-translate-y-px hover:shadow-[0_5px_0_#17233f]" type="button" onClick={onCheck}>
          Baigti planą
        </button>
      </div>
    </section>
  );
}

function ReserveButton({ change, disabled, onReserve, children }: {
  change: -1 | 1;
  disabled: boolean;
  onReserve: (change: -1 | 1) => void;
  children: string;
}) {
  const label = change === -1 ? "Sumažinti rezervą" : "Padidinti rezervą";
  return (
    <button className="size-[50px] rounded-full border-2 border-navy bg-cream text-[34px] font-black leading-none text-navy disabled:cursor-not-allowed disabled:opacity-35" type="button" onClick={() => onReserve(change)} disabled={disabled} aria-label={label}>
      {children}
    </button>
  );
}

function CoinGrid({ amount, compact = false }: { amount: number; compact?: boolean }) {
  const visibleAmount = Math.max(0, amount);
  const [coinGridRef] = useAutoAnimate<HTMLDivElement>({ duration: 220, easing: "ease-out" });

  return (
    <div ref={coinGridRef} className={classes(
      "grid min-w-0 content-center justify-start gap-[3px] [grid-template-columns:repeat(auto-fit,20px)]",
      compact && "gap-0.5 [grid-template-columns:repeat(auto-fit,18px)]",
    )} aria-hidden="true">
      {Array.from({ length: visibleAmount }, (_, index) => (
        <i className={classes(
          "grid size-5 place-items-center rounded-full border-[1.5px] border-navy bg-yellow text-[10px] font-black not-italic text-navy",
          compact && "size-[18px] text-[9px]",
        )} key={index}>€</i>
      ))}
    </div>
  );
}
