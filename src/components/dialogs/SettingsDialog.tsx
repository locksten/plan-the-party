import { assert } from "../../assert";
import type { ValueBreakdown } from "../../domain";
import { formatEuros } from "../../ui";
import { DialogShell } from "./DialogShell";

type SettingsDialogProps = {
  budget: ValueBreakdown;
  participants: ValueBreakdown;
  canDecreaseBudget: boolean;
  canIncreaseBudget: boolean;
  canDecreaseParticipants: boolean;
  canIncreaseParticipants: boolean;
  onBudgetChange: (change: -1 | 1) => void;
  onParticipantChange: (change: -1 | 1) => void;
  onClose: () => void;
};

const settingsStepButton = "grid size-11 place-items-center rounded-full border-[0.1875rem] border-navy bg-yellow text-[1.75rem] font-black leading-none disabled:cursor-not-allowed disabled:opacity-35";

export function SettingsDialog({ budget, participants, canDecreaseBudget, canIncreaseBudget, canDecreaseParticipants, canIncreaseParticipants, onBudgetChange, onParticipantChange, onClose }: SettingsDialogProps) {
  return (
    <DialogShell labelledBy="settings-title" onClose={onClose} className="w-full max-w-[55rem]">
      <h2 id="settings-title" className="m-0 text-center text-[2.5rem] tracking-[-0.04em]">Žaidimo nustatymai</h2>

      <div className="mt-6 grid grid-cols-2 gap-8">
        <SettingsBreakdown
          id="budget-settings"
          title="Biudžetas"
          breakdown={budget}
          formatValue={formatEuros}
          canDecrease={canDecreaseBudget}
          canIncrease={canIncreaseBudget}
          decreaseLabel="Atimti vieną eurą"
          increaseLabel="Pridėti vieną eurą"
          onChange={onBudgetChange}
        />
        <SettingsBreakdown
          id="participant-settings"
          title="Mokiniai"
          breakdown={participants}
          formatValue={(value) => String(value)}
          canDecrease={canDecreaseParticipants}
          canIncrease={canIncreaseParticipants}
          decreaseLabel="Sumažinti mokinių skaičių"
          increaseLabel="Padidinti mokinių skaičių"
          onChange={onParticipantChange}
        />
      </div>
    </DialogShell>
  );
}

function SettingsBreakdown({ id, title, breakdown, formatValue, canDecrease, canIncrease, decreaseLabel, increaseLabel, onChange }: {
  id: string;
  title: string;
  breakdown: ValueBreakdown;
  formatValue: (value: number) => string;
  canDecrease: boolean;
  canIncrease: boolean;
  decreaseLabel: string;
  increaseLabel: string;
  onChange: (change: -1 | 1) => void;
}) {
  const teacherModifier = breakdown.modifiers.find((modifier) => modifier.source === "teacher");
  assert(teacherModifier !== undefined, `Nustatymui „${id}“ trūksta mokytojo pakeitimo.`);
  const automaticModifiers = breakdown.modifiers.filter((modifier) => modifier.source !== "teacher");
  const formatModifier = (amount: number) => `${amount > 0 ? "+" : ""}${formatValue(amount)}`;

  return (
    <section aria-labelledby={`${id}-title`}>
      <header className="text-center">
        <h3 id={`${id}-title`} className="m-0 text-[1.6875rem]">{title}</h3>
        <strong className="mt-1 block text-[3.25rem] leading-none" aria-live="polite">{formatValue(breakdown.total)}</strong>
      </header>

      <div className="mt-4 border-y-[0.125rem] border-navy/15 py-2 text-[0.9375rem] font-bold">
        <div className="flex items-center justify-between gap-4 px-2 py-1.5">
          <span>Įprastai</span>
          <strong>{formatValue(breakdown.base)}</strong>
        </div>
        {automaticModifiers.map((modifier) => (
          <div className="flex items-center justify-between gap-4 px-2 py-1.5" key={modifier.id}>
            <span className="min-w-0 leading-tight">{modifier.label}</span>
            <strong className="shrink-0">{formatModifier(modifier.amount)}</strong>
          </div>
        ))}
        <div className="mt-1 flex items-center justify-between gap-3 border-t-[0.125rem] border-navy/10 px-2 pt-3">
          <span>Mokytojo pakeitimas</span>
          <div className="flex items-center gap-2">
            <button className={settingsStepButton} type="button" onClick={() => onChange(-1)} disabled={!canDecrease} aria-label={decreaseLabel}>−</button>
            <strong className="min-w-14 text-center text-lg">{formatModifier(teacherModifier.amount)}</strong>
            <button className={settingsStepButton} type="button" onClick={() => onChange(1)} disabled={!canIncrease} aria-label={increaseLabel}>+</button>
          </div>
        </div>
      </div>
    </section>
  );
}
