import {
  FERTILIZER_COST,
  PROJECT_ALLOCATION_STEP,
  type GameItem,
  type MoneyAllocation,
  type ProjectDefinition,
  type ProjectId,
  type ProjectProgress,
  type UpgradeDefinition,
  type UpgradeId,
} from "../../domain";
import { assert } from "../../assert";
import { COMPLETION_ART_SOURCES } from "../../completionArt";
import { ITEM_ART_SOURCES } from "../../itemArt";
import { META_ART_SOURCES } from "../../metaArt";
import { classes } from "../../ui";
import { SelectedMark } from "./SelectedMark";
import { useI18n } from "../../i18n/I18nProvider";

export function MoneyDecision({ unallocated, hasDepositBottles, reusableItems, upgrades, projects, projectProgress, allocation, onToggleFertilizer, onToggleReusable, onToggleUpgrade, onToggleProject }: {
  unallocated: number;
  hasDepositBottles: boolean;
  reusableItems: readonly GameItem[];
  upgrades: readonly UpgradeDefinition[];
  projects: readonly ProjectDefinition[];
  projectProgress: ProjectProgress;
  allocation: MoneyAllocation;
  onToggleFertilizer: () => void;
  onToggleReusable: (item: GameItem) => void;
  onToggleUpgrade: (upgradeId: UpgradeId) => void;
  onToggleProject: (projectId: ProjectId) => void;
}) {
  const { translations, formatCurrency } = useI18n();
  return (
    <section className="grid min-w-0 grid-rows-[11.875rem_minmax(0,1fr)] px-3 pb-3 pt-6 text-center">
      <div className="relative flex min-h-0 flex-col items-center justify-center">
        <div className="flex min-h-0 w-full flex-1 items-center justify-center gap-2">
          <img className="h-full min-h-0 w-auto max-w-[10.625rem] scale-110 object-contain" src={COMPLETION_ART_SOURCES.money} alt="" draggable={false} />
          {hasDepositBottles && (
            <img
              className="h-[82%] min-h-0 w-auto max-w-[8.5rem] object-contain"
              src={COMPLETION_ART_SOURCES["empty-deposit-bottles"]}
              alt=""
              draggable={false}
            />
          )}
        </div>
        <h3 className="m-0 text-[clamp(1.25rem,1.8vw,1.75rem)] leading-none">{translations.completion.remainingMoney}</h3>
        <strong className="mt-1 inline-block rounded-full bg-yellow px-3 py-0.5 text-xl"><span className="relative top-px">{formatCurrency(unallocated)}</span></strong>
      </div>

      <div className="flex flex-wrap content-center justify-center gap-x-2 gap-y-1" role="group" aria-label={translations.completion.allocationGroup}>
        {projects.map((project) => (
          <MoneyAmountOption
            key={project.id}
            projectId={project.id}
            label={translations.projects[project.id].title}
            artSource={META_ART_SOURCES[project.id]}
            amount={allocation.projectAmounts[project.id]}
            unallocated={unallocated}
            maximumAmount={project.target - projectProgress[project.id]}
            progress={{ current: projectProgress[project.id], target: project.target }}
            onToggle={() => onToggleProject(project.id)}
          />
        ))}
        {upgrades.map((upgrade) => {
          const selected = allocation.upgradeIds.includes(upgrade.id);
          return (
            <FixedMoneyOption
              key={upgrade.id}
              label={translations.upgrades[upgrade.id].title}
              artSource={META_ART_SOURCES[upgrade.id]}
              price={upgrade.price}
              selected={selected}
              disabled={!selected && unallocated < upgrade.price}
              onToggle={() => onToggleUpgrade(upgrade.id)}
            />
          );
        })}
        <FixedMoneyOption
          label={translations.completion.plantFertilizer}
          artSource={META_ART_SOURCES.fertilizer}
          price={FERTILIZER_COST}
          selected={allocation.fertilizer}
          disabled={!allocation.fertilizer && unallocated < FERTILIZER_COST}
          onToggle={onToggleFertilizer}
        />
        {reusableItems.map((item) => {
          const selected = allocation.reusableItemIds.includes(item.id);
          const disabled = !selected && item.price > unallocated;
          return (
            <button
              key={item.id}
              className="group flex w-[9.375rem] min-w-0 flex-col items-center rounded-xl px-1 py-1 outline-none focus-visible:ring-[0.25rem] focus-visible:ring-blue disabled:cursor-not-allowed disabled:grayscale disabled:opacity-35"
              type="button"
              aria-pressed={selected}
              disabled={disabled}
              onClick={() => onToggleReusable(item)}
            >
              <span className={classes(
                "relative grid size-[5.125rem] place-items-center rounded-full border-[0.1875rem] border-transparent transition group-hover:-translate-y-1 group-hover:bg-mint-soft",
                selected && "animate-choice-pop border-navy bg-yellow shadow-[0_0.25rem_0_#17233f] group-hover:bg-yellow",
              )}>
                <img className="size-[88%] object-contain" src={ITEM_ART_SOURCES[item.art]} alt="" draggable={false} />
                <MoneyOptionPrice price={item.price} />
                {selected && <SelectedMark />}
              </span>
              <span className="mt-1 max-w-36 text-[0.8125rem] font-black leading-[1.05]">{translations.items[item.id]}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function FixedMoneyOption({ label, artSource, price, selected, disabled, onToggle }: {
  label: string;
  artSource: string;
  price: number;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      className="group flex w-[9.375rem] min-w-0 flex-col items-center rounded-xl px-1 py-1 outline-none focus-visible:ring-[0.25rem] focus-visible:ring-blue disabled:cursor-not-allowed disabled:grayscale disabled:opacity-35"
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onToggle}
    >
      <span className={classes(
        "relative grid size-[5.125rem] place-items-center rounded-full border-[0.1875rem] border-transparent transition group-hover:-translate-y-1 group-hover:bg-mint-soft",
        selected && "animate-choice-pop border-navy bg-yellow shadow-[0_0.25rem_0_#17233f] group-hover:bg-yellow",
      )}>
        <img className="size-[88%] object-contain" src={artSource} alt="" draggable={false} />
        <MoneyOptionPrice price={price} />
        {selected && <SelectedMark />}
      </span>
      <span className="mt-1 max-w-36 text-[0.8125rem] font-black leading-[1.05]">{label}</span>
    </button>
  );
}

function MoneyOptionPrice({ price }: { price: number }) {
  const { formatCurrency } = useI18n();
  return (
    <span className="absolute -bottom-1 -right-1 rounded-full border-[0.125rem] border-navy bg-yellow px-1.5 text-sm font-black">
      <span className="relative top-[0.5px]">{formatCurrency(price)}</span>
    </span>
  );
}

function MoneyAmountOption({ projectId, label, artSource, amount, unallocated, maximumAmount, progress, onToggle }: {
  projectId: ProjectId;
  label: string;
  artSource: string;
  amount: number;
  unallocated: number;
  maximumAmount: number;
  progress: Readonly<{ current: number; target: number }>;
  onToggle: () => void;
}) {
  const { translations, formatCurrency } = useI18n();
  assert(Number.isInteger(amount) && amount >= 0 && amount <= maximumAmount, `Invalid allocation for project "${label}".`);
  assert(Number.isInteger(unallocated) && unallocated >= 0, "Unallocated funds must be a non-negative integer.");
  assert(
    Number.isInteger(progress.current)
      && progress.current >= 0
      && Number.isInteger(progress.target)
      && progress.target > 0
      && progress.current <= progress.target,
    `Invalid progress for project "${label}".`,
  );
  const selected = amount > 0;
  const increment = Math.min(PROJECT_ALLOCATION_STEP, maximumAmount - amount, unallocated);
  const canAdvance = increment > 0;
  const totalProgress = progress.current + amount;
  const complete = totalProgress === progress.target;
  const existingProgressPercent = progress.current / progress.target * 100;
  const newProgressPercent = amount / progress.target * 100;
  const actionDescription = complete
    ? translations.completion.projectFilled
    : canAdvance
      ? translations.completion.addProjectMoney(increment)
      : selected ? translations.completion.restartProject : translations.completion.projectNeeds(PROJECT_ALLOCATION_STEP);

  return (
    <button
      className="group flex w-[9.375rem] min-w-0 flex-col items-center rounded-xl px-1 py-1 outline-none focus-visible:ring-[0.25rem] focus-visible:ring-blue disabled:cursor-not-allowed disabled:grayscale disabled:opacity-35"
      type="button"
      disabled={!selected && !canAdvance}
      aria-label={translations.completion.projectProgressLabel(label, totalProgress, progress.target, actionDescription)}
      onClick={onToggle}
    >
      <span className="relative grid size-[5.125rem] place-items-center transition group-hover:-translate-y-1">
        <span className={classes(
          "relative grid size-full place-items-center overflow-hidden rounded-full border-[0.1875rem] border-navy bg-mint-soft",
          selected && "shadow-[0_0.25rem_0_#17233f]",
        )}>
          <span className="absolute inset-x-0 bottom-0 bg-blue-soft transition-[height] duration-200" style={{ height: `${existingProgressPercent}%` }} />
          <span
            className="absolute inset-x-0 bg-yellow transition-[bottom,height] duration-200"
            style={{ bottom: `${existingProgressPercent}%`, height: `${newProgressPercent}%` }}
          />
          <img
            className={classes(
              "relative z-10 object-contain",
              projectId === "shopping-card" ? "size-[80%]" : "size-[88%]",
              projectId === "shopping-card" && "-rotate-6",
            )}
            src={artSource}
            alt=""
            draggable={false}
          />
        </span>
        {complete && <SelectedMark />}
      </span>
      <span className="mt-1 max-w-36 text-[0.8125rem] font-black leading-[1.05]">{label}</span>
      <small className="mt-0.5 text-xs font-black text-muted">{formatCurrency(totalProgress)} / {formatCurrency(progress.target)}</small>
    </button>
  );
}
