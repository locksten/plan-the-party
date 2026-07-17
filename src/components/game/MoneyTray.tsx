import type { GameMode, GamePlan } from "../../game";
import { classes, formatEuros } from "../../ui";

type MoneyTrayProps = {
  mode: GameMode;
  plan: GamePlan;
  attention: boolean;
  onReserve: (change: -1 | 1) => void;
  onCheck: () => void;
};

export function MoneyTray({ mode, plan, attention, onReserve, onCheck }: MoneyTrayProps) {
  return (
    <section className={classes(
      "mt-1.5 grid min-h-[78px] grid-cols-[minmax(0,3.15fr)_minmax(11rem,.75fr)] items-stretch gap-2",
      attention && "animate-tray-shake",
    )} aria-label="Biudžeto dėklas">
      <div className="grid min-w-0 grid-cols-[minmax(0,2fr)_minmax(0,1.15fr)] gap-1 rounded-xl border-2 border-navy bg-cream p-1">
        <div className={classes(
          "grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-lg px-2 py-1",
          plan.available < 0 && "bg-[#ffd9d4]",
        )}>
          <div className="min-w-0">
            <span className="block font-sans text-[10px] font-bold text-muted">Liko iš {formatEuros(plan.totalFunds)}</span>
            <strong className={classes("block text-[27px] leading-none", plan.available < 0 && "text-[#b72f27]")}>{formatEuros(plan.available)}</strong>
            <small className="mt-1 block whitespace-nowrap font-sans text-[9px] font-bold text-muted">
              Išleista {formatEuros(plan.totalSpent)}{plan.budgetBonus > 0 && ` · Santaupos +${formatEuros(plan.budgetBonus)}`}
            </small>
          </div>
          <CoinGrid amount={plan.available} />
        </div>

        <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-lg bg-[#f1bd7f] px-2 py-1">
          <ReserveButton change={-1} disabled={plan.reserve === 0} onReserve={onReserve}>−</ReserveButton>
          <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] grid-rows-[auto_1fr] items-center gap-x-2 gap-y-1">
            <span className="col-span-2 text-[11px] font-black">Rezervas</span>
            <strong className="text-[21px]">{formatEuros(plan.reserve)}</strong>
            <CoinGrid amount={plan.reserve} compact />
          </div>
          <ReserveButton change={1} disabled={plan.reserve === mode.budget} onReserve={onReserve}>+</ReserveButton>
        </div>
      </div>

      <button className="rounded-xl border-[3px] border-navy bg-yellow text-[17px] font-black text-navy shadow-[0_4px_0_#17233f] hover:-translate-y-px hover:shadow-[0_5px_0_#17233f]" type="button" onClick={onCheck}>
        Baigti planą
      </button>
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
    <button className="size-[38px] rounded-full border-2 border-navy bg-white text-2xl font-black leading-none text-navy disabled:cursor-not-allowed disabled:opacity-35" type="button" onClick={() => onReserve(change)} disabled={disabled} aria-label={label}>
      {children}
    </button>
  );
}

function CoinGrid({ amount, compact = false }: { amount: number; compact?: boolean }) {
  const visibleAmount = Math.max(0, amount);
  return (
    <div className={classes(
      "grid min-w-0 content-center justify-start gap-[3px] [grid-template-columns:repeat(auto-fit,16px)]",
      compact && "gap-0.5 [grid-template-columns:repeat(auto-fit,14px)]",
    )} aria-hidden="true">
      {Array.from({ length: visibleAmount }, (_, index) => (
        <i className={classes(
          "grid size-4 place-items-center rounded-full border-[1.5px] border-navy bg-yellow text-[8px] font-black not-italic text-navy",
          compact && "size-3.5 text-[7px]",
        )} key={index}>€</i>
      ))}
    </div>
  );
}
