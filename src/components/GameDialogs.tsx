import type { ReactNode } from "react";
import { CHALLENGE_ART_SOURCES, EVENT_ART_SOURCES } from "../cardArt";
import {
  CHALLENGES,
  PARTICIPANT_RANGE,
  challengeCompleted,
  challengeDescription,
  type GameMode,
  type GamePlan,
  type ChallengeCard,
  type MysteryEvent,
  type Selection,
} from "../game";
import { classes, formatEuros, LEFTOVER_CHOICES, type LeftoverChoice } from "../ui";

const primaryButton = "min-h-[50px] rounded-lg border-[3px] border-navy bg-yellow px-[18px] font-black text-navy shadow-[0_4px_0_#17233f]";
const eyebrow = "mb-2 text-[11px] font-black uppercase tracking-[.11em] text-teal-dark";

type DialogShellProps = {
  labelledBy: string;
  onClose: () => void;
  children: ReactNode;
  className: string;
  lightBackdrop?: boolean;
};

function DialogShell({ labelledBy, onClose, children, className, lightBackdrop = false }: DialogShellProps) {
  return (
    <div className={classes("fixed inset-0 z-80 grid place-items-center bg-[#0b1429]/80 p-5", lightBackdrop && "bg-[#0b1429]/70")} role="presentation" onMouseDown={onClose}>
      <section
        className={classes("relative max-h-[calc(100vh-40px)] overflow-auto rounded-2xl border-4 border-navy bg-cream p-[38px] shadow-[9px_9px_0_#080f20]", className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="absolute right-3 top-3 min-h-10 rounded-lg border-2 border-navy bg-white px-2.5 font-black text-navy" type="button" onClick={onClose} aria-label="Uždaryti">
          Uždaryti
        </button>
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
    ["Pridėkite iššūkių.", "Pasirinkite vieną ar kelis neprivalomus tikslus, kuriuos klasė mėgins įvykdyti."],
    ["Pridėkite netikėtų įvykių.", "Mokytojas gali įjungti kelias korteles, o klasė pritaiko planą."],
    ["Baikite, bet tęskite laisvai.", "Tinkamo plano langą galima uždaryti ir toliau keisti pasirinkimus."],
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
              <span className="mt-0.5 block font-sans text-xs text-muted">{description}</span>
            </span>
          </li>
        ))}
      </ol>
      <div className="my-[18px] rounded-lg border-[3px] border-navy bg-mint-soft p-3">
        <strong>Sąvokos</strong>
        <p className="mb-0 mt-1 font-sans leading-[1.4]">Biudžetas – kiek galime išleisti. Išlaidos – ką išleidome. Rezervas – pinigai netikėtumams.</p>
      </div>
      <button className={classes(primaryButton, "w-full")} type="button" onClick={onClose}>Aišku, pradėkime</button>
    </DialogShell>
  );
}

type EventDialogProps = {
  mode: GameMode;
  activeEvents: readonly MysteryEvent[];
  onToggle: (event: MysteryEvent) => void;
  onClear: () => void;
  onClose: () => void;
};

export function EventDialog({ mode, activeEvents, onToggle, onClear, onClose }: EventDialogProps) {
  return (
    <DialogShell labelledBy="event-title" onClose={onClose} className="w-full max-w-[900px]">
      <p className={eyebrow}>Mokytojo valdomas posūkis</p>
      <h2 id="event-title" className="m-0 text-[clamp(30px,3vw,42px)] tracking-[-.04em]">Pasirinkite netikėtus įvykius</h2>
      <p className="mb-5 mt-2 font-sans text-[15px] text-muted">Galite įjungti kelis įvykius. Aptarkite, ar rezervas padės prie jų prisitaikyti.</p>
      <div className="grid grid-cols-3 gap-3">
        {mode.mysteryEvents.map((event) => {
          const isActive = activeEvents.some((active) => active.id === event.id);
          return (
            <button
              key={event.id}
              type="button"
              aria-pressed={isActive}
              className={classes(
                "flex min-h-[180px] flex-col items-center justify-center rounded-[14px] border-[3px] border-navy bg-white p-[18px] text-center text-navy shadow-[0_4px_0_#17233f] hover:-translate-y-0.5 hover:bg-[#ffe3dd] hover:shadow-[0_6px_0_#17233f]",
                isActive && "-translate-y-0.5 bg-[#ffe3dd] shadow-[0_6px_0_#17233f]",
              )}
              onClick={() => onToggle(event)}
            >
              <span className="relative grid h-16 w-20 place-items-center" aria-hidden="true">
                <img className="h-16 w-20 object-contain" src={EVENT_ART_SOURCES[event.id]} alt="" draggable={false} />
                {isActive && <span className="absolute -right-1 -top-1 grid size-7 place-items-center rounded-full border-2 border-navy bg-teal text-sm font-black text-white">✓</span>}
              </span>
              <strong className="mt-2.5 text-lg">{event.title}</strong>
              <small className="mt-1.5 font-sans text-xs leading-[1.35] text-muted">{event.description}</small>
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex justify-end gap-2 [&>button]:min-w-[190px]">
        {activeEvents.length > 0 && <button className="min-h-11 rounded-lg border-2 border-navy bg-transparent font-black text-navy" type="button" onClick={onClear}>Pašalinti visus įvykius</button>}
        <button className={primaryButton} type="button" onClick={onClose}>Atlikta</button>
      </div>
    </DialogShell>
  );
}

type ChallengeDialogProps = {
  mode: GameMode;
  plan: GamePlan;
  selection: Selection;
  activeChallenges: readonly ChallengeCard[];
  onToggle: (challenge: ChallengeCard) => void;
  onClear: () => void;
  onClose: () => void;
};

export function ChallengeDialog({ mode, plan, selection, activeChallenges, onToggle, onClear, onClose }: ChallengeDialogProps) {
  return (
    <DialogShell labelledBy="challenge-title" onClose={onClose} className="w-full max-w-[900px]">
      <p className={eyebrow}>Papildomas klasės iššūkis</p>
      <h2 id="challenge-title" className="m-0 text-[clamp(30px,3vw,42px)] tracking-[-.04em]">Pasirinkite iššūkius</h2>
      <p className="mb-5 mt-2 font-sans text-[15px] text-muted">Galite pasirinkti kelis. Iššūkiai yra neprivalomi ir netrukdo užbaigti pagrindinio plano.</p>
      <div className="grid grid-cols-3 gap-3">
        {CHALLENGES.map((challenge) => {
          const isActive = activeChallenges.some((active) => active.id === challenge.id);
          const isComplete = challengeCompleted(challenge, mode, selection, plan);
          return (
            <button
              key={challenge.id}
              type="button"
              aria-pressed={isActive}
              className={classes(
                "flex min-h-[180px] flex-col items-center justify-center rounded-[14px] border-[3px] border-navy bg-white p-[18px] text-center text-navy shadow-[0_4px_0_#17233f] hover:-translate-y-0.5 hover:bg-blue-soft/40 hover:shadow-[0_6px_0_#17233f]",
                isActive && "-translate-y-0.5 bg-blue-soft/60 shadow-[0_6px_0_#17233f]",
              )}
              onClick={() => onToggle(challenge)}
            >
              <span className="relative grid h-16 w-20 place-items-center" aria-hidden="true">
                <img className="h-16 w-20 object-contain" src={CHALLENGE_ART_SOURCES[challenge.id]} alt="" draggable={false} />
                {isActive && <span className="absolute -right-1 -top-1 grid size-7 place-items-center rounded-full border-2 border-navy bg-teal text-sm font-black text-white">✓</span>}
              </span>
              <strong className="mt-2.5 text-lg">{challenge.title}</strong>
              <small className="mt-1.5 font-sans text-xs leading-[1.35] text-muted">{challengeDescription(challenge, mode)}</small>
              <span className={classes("mt-2 rounded-md px-2 py-1 text-[10px] font-black", isComplete ? "bg-teal text-white" : "bg-[#e8e1d2] text-muted")}>
                {isComplete ? "Įvykdyta" : "Dar neįvykdyta"}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex justify-end gap-2 [&>button]:min-w-[190px]">
        {activeChallenges.length > 0 && <button className="min-h-11 rounded-lg border-2 border-navy bg-transparent font-black text-navy" type="button" onClick={onClear}>Pašalinti visus iššūkius</button>}
        <button className={primaryButton} type="button" onClick={onClose}>Atlikta</button>
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
    <DialogShell labelledBy="participants-title" onClose={onClose} className="w-full max-w-[570px] text-center">
      <p className={eyebrow}>Žaidimo sudėtingumas</p>
      <h2 id="participants-title" className="m-0 text-[36px] tracking-[-.04em]">Kiek klasėje mokinių?</h2>
      <p className="mx-auto mb-6 mt-3 max-w-[470px] font-sans text-[15px] leading-relaxed text-muted">
        Keisdami skaičių galite reguliuoti žaidimo sudėtingumą. Kuo daugiau mokinių, tuo daugiau porcijų reikės. O ar labai didelei klasei apskritai įmanoma sudaryti tinkamą planą? Pabandykite.
      </p>

      <div className="rounded-2xl border-[3px] border-navy bg-[#fff1b9] p-5">
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
        <div className="mt-1 flex justify-between font-sans text-[10px] font-bold text-muted"><span>{PARTICIPANT_RANGE.min}</span><span>{PARTICIPANT_RANGE.max}</span></div>
      </div>

      {additionalGuests > 0 && (
        <p className="my-4 rounded-lg bg-coral/35 p-3 font-sans text-sm">
          Netikėtas įvykis pridėjo dar <strong>{additionalGuests}</strong>. Dabar vaišių turi užtekti <strong>{totalParticipants} žmonėms</strong>.
        </p>
      )}
      <button className={classes(primaryButton, "mt-4 w-full")} type="button" onClick={onClose}>Atlikta</button>
    </DialogShell>
  );
}

type CompletionDialogProps = {
  mode: GameMode;
  plan: GamePlan;
  activeEvents: readonly MysteryEvent[];
  activeChallenges: readonly ChallengeCard[];
  selection: Selection;
  choice: LeftoverChoice | null;
  onChoice: (choice: LeftoverChoice) => void;
  onContinue: () => void;
};

export function CompletionDialog({ mode, plan, activeEvents, activeChallenges, selection, choice, onChoice, onContinue }: CompletionDialogProps) {
  const completedChallenges = activeChallenges.filter((challenge) => challengeCompleted(challenge, mode, selection, plan));

  return (
    <DialogShell labelledBy="completion-title" onClose={onContinue} className="w-full max-w-[760px] pt-[46px] text-center" lightBackdrop>
      <div className="mx-auto mb-3 grid size-[62px] place-items-center rounded-full border-4 border-navy bg-teal text-[34px] font-black text-white shadow-[4px_4px_0_#17233f]" aria-hidden="true">✓</div>
      <p className={eyebrow}>Planas tinka</p>
      <h2 id="completion-title" className="m-0 text-[clamp(30px,3vw,42px)] tracking-[-.04em]">Šventę galima surengti!</h2>
      <p className="mb-[17px] mt-2.5 font-sans text-muted">
        Rezervas: <strong>{formatEuros(plan.reserve)}</strong>
        {activeEvents.length > 0 && <> · Įvykiai: <strong>{activeEvents.length}</strong></>}
        {activeChallenges.length > 0 && <> · Iššūkiai: <strong>{completedChallenges.length} iš {activeChallenges.length}</strong></>}
      </p>
      {plan.available > 0 ? (
        <div className="rounded-xl border-[3px] border-navy bg-[#fff1b9] p-4">
          <h3 className="mb-3 mt-0 text-xl">Ką darysime su likusiais {formatEuros(plan.available)}?</h3>
          <div className="grid grid-cols-2 gap-2">
            {LEFTOVER_CHOICES.map((option) => (
              <button className={classes("min-h-12 rounded-lg border-2 border-navy bg-white px-2.5 py-2 text-xs font-black text-navy", choice === option.id && "bg-yellow shadow-[inset_0_-3px_0_#e1a72b]")} type="button" key={option.id} onClick={() => onChoice(option.id)}>
                {option.label}
              </button>
            ))}
            <button className="min-h-12 rounded-lg border-2 border-navy bg-white px-2.5 py-2 text-xs font-black text-navy" type="button" onClick={onContinue}>Papildyti šventės planą</button>
          </div>
        </div>
      ) : (
        <p className="rounded-xl bg-[#e8e1d2] p-[15px] font-sans">Laisvų pinigų neliko, tačiau pasirinktame rezerve yra {formatEuros(plan.reserve)}.</p>
      )}
      <div className="my-4 rounded-lg bg-mint-soft p-3 text-left">
        <span className="block text-[9px] font-black uppercase text-teal-dark">Aptarimui</span>
        <strong className="mt-1 block font-sans text-sm">{mode.reflection[0]}</strong>
      </div>
      <button className={classes(primaryButton, "w-full")} type="button" onClick={onContinue}>Grįžti prie stalo</button>
    </DialogShell>
  );
}
