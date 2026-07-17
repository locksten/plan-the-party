import type { ReactNode } from "react";
import { CHALLENGE_ART_SOURCES, EVENT_ART_SOURCES } from "../cardArt";
import {
  CHALLENGES,
  PARTICIPANT_RANGE,
  challengeCompleted,
  challengeDescription,
  type GameMode,
  type GamePlan,
  type MysteryEvent,
  type MysteryEventId,
  type Selection,
} from "../game";
import {
  classes,
  FOOD_LEFTOVER_CHOICES,
  formatEuros,
  LONG_LASTING_FOOD_LEFTOVER_CHOICES,
  MONEY_LEFTOVER_CHOICES,
  type FoodLeftoverChoice,
  type LongLastingFoodLeftoverChoice,
  type MoneyLeftoverChoice,
} from "../ui";

const primaryButton = "min-h-[50px] rounded-lg border-[3px] border-navy bg-yellow px-[18px] font-black text-navy shadow-[0_4px_0_#17233f]";
const eyebrow = "mb-2 text-[11px] font-black uppercase tracking-[.11em] text-teal-dark";

type DialogShellProps = {
  labelledBy: string;
  onClose: () => void;
  children: ReactNode;
  className: string;
  lightBackdrop?: boolean;
  closeButton?: "text" | "icon" | "none";
};

function DialogShell({ labelledBy, onClose, children, className, lightBackdrop = false, closeButton = "text" }: DialogShellProps) {
  return (
    <div className={classes("fixed inset-0 z-80 grid place-items-center bg-[#0b1429]/80 p-5", lightBackdrop && "bg-[#0b1429]/70")} role="presentation" onMouseDown={onClose}>
      <section
        className={classes("relative max-h-[calc(100vh-40px)] overflow-auto rounded-2xl border-4 border-navy bg-cream p-[38px] shadow-[9px_9px_0_#080f20]", className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {closeButton !== "none" && (
          <button
            className={classes(
              "absolute right-3 top-3 border-2 border-navy bg-white font-black text-navy hover:bg-yellow",
              closeButton === "icon" ? "grid size-11 place-items-center rounded-lg" : "min-h-10 rounded-lg px-2.5",
            )}
            type="button"
            onClick={onClose}
            aria-label="Uždaryti"
          >
            {closeButton === "icon" ? (
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            ) : "Uždaryti"}
          </button>
        )}
        {children}
      </section>
    </div>
  );
}

export function HelpDialog({ onClose }: { onClose: () => void }) {
  const steps = [
    ["Suskirstykite klasę komandomis.", "Kiekviena komanda aptaria vieną pasirinkimų grupę."],
    ["Paprašykite paaiškinti.", "Prieš tempdami daiktą ant stalo išklausykite bent du pasiūlymus."],
    ["Tempkite arba palieskite.", "Daiktą galima nutempti ant tinkamos stalo vietos arba tiesiog paliesti."],
    ["Pasirinkite rezervą.", "Didinkite arba mažinkite jį planuodami ir stebėkite, kiek dar galima išleisti."],
    ["Stebėkite iššūkius.", "Jie įvykdomi automatiškai, kai klasės planas atitinka kortelėje nurodytą tikslą."],
    ["Atverskite netikėtų įvykių.", "Atversta kortelė iškart įsigalioja. Palieskite ją dar kartą, jei norite išjungti."],
    ["Baikite arba tęskite.", "Aptarkite likučius, grįžkite keisti planą arba pradėkite naują šventę."],
  ] as const;

  return (
    <DialogShell labelledBy="help-title" onClose={onClose} className="w-full max-w-[680px]">
      <p className={eyebrow}>Trumpa atmintinė mokytojui</p>
      <h2 id="help-title" className="m-0 text-[33px]">Kaip žaisti su klase?</h2>
      <ol className="my-[18px] list-none p-0">
        {steps.map(([title, description], index) => (
          <li className="grid grid-cols-[28px_1fr] gap-3 border-b-2 border-dashed border-[#c9bfa8] py-2.5" key={title}>
            <span className="grid size-7 place-items-center rounded-full border-2 border-navy bg-yellow font-black">{index + 1}</span>
            <span>
              <strong className="block">{title}</strong>
              <span className="mt-0.5 block text-xs text-muted">{description}</span>
            </span>
          </li>
        ))}
      </ol>
      <div className="my-[18px] rounded-lg border-[3px] border-navy bg-mint-soft p-3">
        <strong>Sąvokos</strong>
        <p className="mb-0 mt-1 leading-[1.4]">Biudžetas – kiek galime išleisti. Išlaidos – ką išleidome. Rezervas – pinigai netikėtumams.</p>
      </div>
      <button className={classes(primaryButton, "w-full")} type="button" onClick={onClose}>Aišku, pradėkime</button>
    </DialogShell>
  );
}

type EventDialogProps = {
  mode: GameMode;
  activeEvents: readonly MysteryEvent[];
  revealedEventIds: readonly MysteryEventId[];
  onToggle: (event: MysteryEvent) => void;
  onClose: () => void;
};

export function EventDialog({ mode, activeEvents, revealedEventIds, onToggle, onClose }: EventDialogProps) {
  return (
    <DialogShell labelledBy="event-title" onClose={onClose} className="w-full max-w-[1100px]" closeButton="icon">
      <h2 id="event-title" className="m-0 text-[clamp(36px,3.5vw,50px)] tracking-[-.04em]">Netikėtų įvykių kortelės</h2>
      <p className="mb-6 mt-2 text-lg text-muted">Atverskite kortelę, kad įvykis iškart įsigaliotų. Aptarkite, ar rezervas padės prie jo prisitaikyti.</p>
      <div className="grid grid-cols-3 gap-4">
        {mode.mysteryEvents.map((event) => {
          const isRevealed = revealedEventIds.includes(event.id);
          const isActive = activeEvents.some((active) => active.id === event.id);
          const actionLabel = !isRevealed
            ? "Atversti netikėto įvykio kortelę"
            : `${event.title}. ${isActive ? "Išjungti" : "Įjungti"} įvykį`;

          return (
            <button
              key={event.id}
              type="button"
              aria-label={actionLabel}
              aria-pressed={isRevealed ? isActive : undefined}
              className="min-h-[230px] [perspective:900px] hover:-translate-y-0.5"
              onClick={() => onToggle(event)}
            >
              <span className={classes("event-card-inner relative block min-h-[230px] w-full", isRevealed && "event-card-inner--revealed")}>
                <span className="event-card-face event-card-back absolute inset-0 grid place-items-center overflow-hidden rounded-2xl border-[3px] border-navy shadow-[0_4px_0_#17233f]" aria-hidden="true">
                  <span className="relative grid h-36 w-40 place-items-center">
                    <img
                      className="absolute size-full object-contain brightness-0 opacity-65"
                      src={EVENT_ART_SOURCES[event.id]}
                      alt=""
                      draggable={false}
                    />
                    <span className="relative z-10 text-[58px] font-black leading-none text-cream">?</span>
                  </span>
                </span>
                <span
                  className={classes(
                    "event-card-face event-card-front absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-[3px] border-navy p-4 text-center text-navy shadow-[0_4px_0_#17233f]",
                    isActive ? "bg-[#ffe3dd]" : "bg-white grayscale opacity-55",
                  )}
                  aria-hidden={!isRevealed}
                >
                  <span className="grid h-32 w-36 place-items-center" aria-hidden="true">
                    <img className="h-32 w-36 object-contain" src={EVENT_ART_SOURCES[event.id]} alt="" draggable={false} />
                  </span>
                  <strong className="mt-3 text-xl">{event.title}</strong>
                  <small className="mt-2 text-sm leading-[1.35] text-muted">{event.description}</small>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </DialogShell>
  );
}

type ChallengeDialogProps = {
  mode: GameMode;
  plan: GamePlan;
  selection: Selection;
  onClose: () => void;
};

export function ChallengeDialog({ mode, plan, selection, onClose }: ChallengeDialogProps) {
  return (
    <DialogShell labelledBy="challenge-title" onClose={onClose} className="w-full max-w-[1100px]" closeButton="icon">
      <h2 id="challenge-title" className="m-0 text-[clamp(36px,3.5vw,50px)] tracking-[-.04em]">Iššūkių lenta</h2>
      <p className="mb-6 mt-2 text-lg text-muted">Iššūkiai yra neprivalomi. Jų būsena keičiasi kartu su jūsų planu.</p>
      <div className="grid grid-cols-3 gap-4">
        {CHALLENGES.map((challenge) => {
          const isComplete = challengeCompleted(challenge, mode, selection, plan);
          return (
            <article
              key={challenge.id}
              className={classes(
                "flex min-h-[230px] flex-col items-center justify-center rounded-2xl border-[3px] border-navy bg-white p-4 text-center text-navy shadow-[0_4px_0_#17233f]",
                !isComplete && "grayscale opacity-55",
              )}
            >
              <span className="grid h-32 w-36 place-items-center" aria-hidden="true">
                <img className="h-32 w-36 object-contain" src={CHALLENGE_ART_SOURCES[challenge.id]} alt="" draggable={false} />
              </span>
              <strong className="mt-3 text-xl">{challenge.title}</strong>
              <small className="mt-2 text-sm leading-[1.35] text-muted">{challengeDescription(challenge, mode)}</small>
            </article>
          );
        })}
      </div>
    </DialogShell>
  );
}

type ParticipantDialogProps = {
  participants: number;
  totalParticipants: number;
  onChange: (participants: number) => void;
  onClose: () => void;
};

export function ParticipantDialog({ participants, totalParticipants, onChange, onClose }: ParticipantDialogProps) {
  const additionalGuests = totalParticipants - participants;

  return (
    <DialogShell labelledBy="participants-title" onClose={onClose} className="w-full max-w-[570px] text-center" closeButton="icon">
      <h2 id="participants-title" className="m-0 text-[36px] tracking-[-.04em]">Kiek klasėje mokinių?</h2>
      <p className="mx-auto mb-6 mt-3 max-w-[470px] text-[15px] leading-relaxed text-muted">
        Kuo daugiau mokinių, tuo daugiau porcijų reikės
      </p>

      <div>
        <div className="mx-auto grid max-w-[330px] grid-cols-[64px_1fr_64px] items-center gap-4">
          <button className="grid size-16 place-items-center rounded-full border-[3px] border-navy bg-white text-[34px] font-black leading-none disabled:cursor-not-allowed disabled:opacity-35" type="button" onClick={() => onChange(participants - 1)} disabled={participants === PARTICIPANT_RANGE.min} aria-label="Sumažinti mokinių skaičių">−</button>
          <div aria-live="polite">
            <strong className="block text-[52px] leading-none">{participants}</strong>
            <span className="mt-1 block text-xs font-black uppercase text-muted">mokiniai klasėje</span>
          </div>
          <button className="grid size-16 place-items-center rounded-full border-[3px] border-navy bg-white text-[34px] font-black leading-none disabled:cursor-not-allowed disabled:opacity-35" type="button" onClick={() => onChange(participants + 1)} disabled={participants === PARTICIPANT_RANGE.max} aria-label="Padidinti mokinių skaičių">+</button>
        </div>
        <input
          className="mt-5 w-full accent-navy"
          type="range"
          min={PARTICIPANT_RANGE.min}
          max={PARTICIPANT_RANGE.max}
          value={participants}
          onChange={(event) => onChange(Number(event.currentTarget.value))}
          aria-label="Mokinių skaičius"
        />
      </div>

      {additionalGuests > 0 && (
        <p className="my-4 rounded-lg bg-coral/35 p-3 text-sm">
          Netikėtas įvykis pridėjo dar <strong>{additionalGuests}</strong>. Dabar vaišių turi užtekti <strong>{totalParticipants} žmonėms</strong>.
        </p>
      )}
    </DialogShell>
  );
}

type CompletionDialogProps = {
  plan: GamePlan;
  spoilingFoodChoice: FoodLeftoverChoice | null;
  longLastingFoodChoice: LongLastingFoodLeftoverChoice | null;
  moneyChoice: MoneyLeftoverChoice | null;
  onSpoilingFoodChoice: (choice: FoodLeftoverChoice) => void;
  onLongLastingFoodChoice: (choice: LongLastingFoodLeftoverChoice) => void;
  onMoneyChoice: (choice: MoneyLeftoverChoice) => void;
  onNewCelebration: () => void;
  onContinue: () => void;
};

export function CompletionDialog({
  plan,
  spoilingFoodChoice,
  longLastingFoodChoice,
  moneyChoice,
  onSpoilingFoodChoice,
  onLongLastingFoodChoice,
  onMoneyChoice,
  onNewCelebration,
  onContinue,
}: CompletionDialogProps) {
  const remainingMoney = plan.available + plan.reserve;
  const hasSpoilingFood = plan.spoilingSnackLeftovers > 0;
  const hasLongLastingFood = plan.longLastingSnackLeftovers > 0;
  const hasMoney = remainingMoney > 0;
  const hasLeftovers = hasSpoilingFood || hasLongLastingFood || hasMoney;
  const decisionsComplete = (!hasSpoilingFood || spoilingFoodChoice !== null)
    && (!hasLongLastingFood || longLastingFoodChoice !== null)
    && (!hasMoney || moneyChoice !== null);

  return (
    <DialogShell labelledBy="completion-title" onClose={onContinue} className="w-full max-w-[800px] !p-6 text-center" lightBackdrop>
      <div className="mx-auto mb-2 grid size-12 place-items-center rounded-full border-[3px] border-navy bg-teal text-2xl font-black text-white shadow-[3px_3px_0_#17233f]" aria-hidden="true">✓</div>
      <h2 id="completion-title" className="m-0 text-[clamp(30px,3vw,38px)] tracking-[-.04em]">Šventę galima surengti!</h2>
      {hasLeftovers ? (
        <div className="my-3 grid gap-2 text-left">
          {hasSpoilingFood && (
            <DecisionGroup
              title="Greitai gendantys užkandžiai"
              amount={`${plan.spoilingSnackLeftovers} porc.`}
              options={FOOD_LEFTOVER_CHOICES}
              choice={spoilingFoodChoice}
              onChoice={onSpoilingFoodChoice}
            />
          )}
          {hasLongLastingFood && (
            <DecisionGroup
              title="Ilgai išliekantys užkandžiai"
              amount={`${plan.longLastingSnackLeftovers} porc.`}
              options={LONG_LASTING_FOOD_LEFTOVER_CHOICES}
              choice={longLastingFoodChoice}
              onChoice={onLongLastingFoodChoice}
            />
          )}
          {hasMoney && (
            <DecisionGroup
              title="Likę pinigai"
              amount={formatEuros(remainingMoney)}
              options={MONEY_LEFTOVER_CHOICES}
              choice={moneyChoice}
              onChoice={onMoneyChoice}
            />
          )}
        </div>
      ) : <p className="my-3 rounded-xl bg-[#e8e1d2] p-3">Maisto ir pinigų neliko.</p>}
      <div className="grid grid-cols-2 gap-2.5">
        <button className="min-h-[50px] rounded-lg border-[3px] border-navy bg-white px-[18px] font-black text-navy" type="button" onClick={onContinue}>Grįžti prie stalo</button>
        <button className={classes(primaryButton, "disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none")} type="button" onClick={onNewCelebration} disabled={!decisionsComplete}>Rengti naują šventę</button>
      </div>
    </DialogShell>
  );
}

function DecisionGroup<Choice extends string>({ title, amount, options, choice, onChoice }: {
  title: string;
  amount: string;
  options: ReadonlyArray<{ id: Choice; label: string }>;
  choice: Choice | null;
  onChoice: (choice: Choice) => void;
}) {
  return (
    <section className="rounded-xl border-2 border-navy bg-[#fff1b9] p-2.5">
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <h3 className="m-0 text-base">{title}</h3>
        <strong className="shrink-0 text-base">{amount}</strong>
      </div>
      <div className={classes("grid gap-1.5", options.length === 3 ? "grid-cols-3" : "grid-cols-2")}>
        {options.map((option) => (
          <button
            className={classes(
              "min-h-9 rounded-lg border-2 border-navy bg-white px-2 py-1 text-xs font-black text-navy",
              choice === option.id && "bg-yellow shadow-[inset_0_-3px_0_#e1a72b]",
            )}
            type="button"
            key={option.id}
            aria-pressed={choice === option.id}
            onClick={() => onChoice(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </section>
  );
}
