import { DiscussionButton } from "../DiscussionButton";
import type { GamePlan } from "../../domain";
import { classes } from "../../ui";
import { useAutoAnimateRef } from "../../useAutoAnimateRef";
import { UI_ART_SOURCES } from "../../uiArt";
import { RaisedButton } from "../ui/RaisedButton";
import { useI18n } from "../../i18n/I18nProvider";

type MoneyTrayProps = {
  plan: GamePlan;
  problems: readonly string[];
  attention: boolean;
  onOpenDiscussions: () => void;
  onCheck: () => void;
};

export function MoneyTray({ plan, problems, attention, onOpenDiscussions, onCheck }: MoneyTrayProps) {
  const { translations, formatCurrency } = useI18n();
  return (
    <section
      className="relative z-30 grid h-[6.5rem] grid-cols-[minmax(0,4fr)_minmax(10rem,0.72fr)_minmax(11rem,0.82fr)] items-stretch gap-2"
      aria-label={translations.tray.label}
    >
      <div className={classes(
        "grid min-h-0 min-w-0 grid-cols-[auto_minmax(0,1fr)] grid-rows-[minmax(0,1fr)] items-center gap-5 rounded-xl border-[0.125rem] border-navy p-2",
        plan.available < 0 ? "bg-[#ffd9d4]" : "bg-cream",
        attention && "animate-tray-shake",
      )}>
        <div className="min-w-0">
          <span className="block text-[0.9375rem] font-bold text-muted">{translations.tray.leftFrom(formatCurrency(plan.budget.total))}</span>
          <strong className={classes("block text-[2.625rem] leading-none", plan.available < 0 && "text-[#b72f27]")}>{formatCurrency(plan.available)}</strong>
          <small className="mt-1 block whitespace-nowrap text-sm font-bold text-muted">
            {translations.tray.spent(formatCurrency(plan.spent))}
          </small>
        </div>
        <CoinGrid amount={plan.available} />
      </div>

      <DiscussionButton className="h-[calc(100%-0.25rem)] w-full text-[1.375rem]" onClick={onOpenDiscussions} />

      <div className="relative h-[calc(100%-0.25rem)] min-w-0">
        {problems.length > 0 && (
          <ul className="layer-ui absolute bottom-[calc(100%+0.75rem)] right-0 flex w-[min(26.25rem,45vw)] flex-col items-end gap-2" role="alert" aria-live="assertive">
            {problems.map((problem) => (
              <li className="flex min-h-11 w-fit max-w-full items-center gap-2.5 rounded-xl border-[0.1875rem] border-navy bg-coral px-3 py-2 text-[0.9375rem] font-black text-navy shadow-[0_0.25rem_0_#17233f]" key={problem}>
                {problem}
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-navy text-lg leading-none text-white" aria-hidden="true">!</span>
              </li>
            ))}
          </ul>
        )}
        <RaisedButton className="h-full w-full text-[1.375rem]" tone="yellow" type="button" onClick={onCheck}>
          {translations.tray.checkPlan}
        </RaisedButton>
      </div>
    </section>
  );
}

function CoinGrid({ amount }: { amount: number }) {
  const visibleAmount = Math.max(0, amount);
  const groups = Array.from({ length: Math.ceil(visibleAmount / 5) }, (_, groupIndex) => ({
    start: groupIndex * 5,
    count: Math.min(5, visibleAmount - groupIndex * 5),
  }));
  const coinGridRef = useAutoAnimateRef<HTMLDivElement>({ duration: 220, easing: "ease-out" });

  return (
    <div ref={coinGridRef} className="coin-grid" aria-hidden="true">
      {groups.map((group) => <CoinGroup key={group.start} {...group} />)}
    </div>
  );
}

function CoinGroup({ start, count }: { start: number; count: number }) {
  const groupRef = useAutoAnimateRef<HTMLSpanElement>({ duration: 220, easing: "ease-out" });

  return (
    <span ref={groupRef} className="coin-group flex shrink-0">
      {Array.from({ length: count }, (_, offset) => (
        <img
          alt=""
          className="relative size-[2.125rem] shrink-0 object-contain"
          draggable={false}
          key={start + offset}
          src={UI_ART_SOURCES.coin}
          style={{ zIndex: offset }}
        />
      ))}
    </span>
  );
}
