import { useEffect, useState } from "react";
import { CompletionDialog, EventDialog, HelpDialog, ChallengeDialog, ParticipantDialog } from "./components/GameDialogs";
import { Header } from "./components/Header";
import { StartScreen } from "./components/StartScreen";
import { PlanScreen } from "./components/game/PlanScreen";
import {
  calculatePlan,
  changeSelection,
  getMode,
  PARTICIPANT_RANGE,
  planProblems,
  type CategoryId,
  type GameItem,
  type ChallengeCard,
  type ModeId,
  type MysteryEvent,
  type Selection,
} from "./game";
import type { LeftoverChoice } from "./ui";

type Screen = "start" | "plan";
type Overlay = "help" | "events" | "challenges" | "participants" | "completion";

export function App() {
  const [screen, setScreen] = useState<Screen>("start");
  const [modeId, setModeId] = useState<ModeId>("paprasta");
  const [selection, setSelection] = useState<Selection>({});
  const [category, setCategory] = useState<CategoryId>("gerimai");
  const [problems, setProblems] = useState<readonly string[]>([]);
  const [reserve, setReserve] = useState(0);
  const [baseParticipants, setBaseParticipants] = useState<number | undefined>(undefined);
  const [activeEvents, setActiveEvents] = useState<readonly MysteryEvent[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<readonly ChallengeCard[]>([]);
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const [leftoverChoice, setLeftoverChoice] = useState<LeftoverChoice | null>(null);

  useEffect(() => {
    if (overlay === null) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOverlay(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [overlay]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  const mode = getMode(modeId);
  const plan = calculatePlan(mode, selection, reserve, baseParticipants, activeEvents);

  function invalidateCompletion() {
    setProblems([]);
    setLeftoverChoice(null);
    setOverlay((current) => current === "completion" ? null : current);
  }

  function startGame(nextModeId: ModeId) {
    const nextMode = getMode(nextModeId);
    setModeId(nextModeId);
    setSelection({});
    setCategory("gerimai");
    setProblems([]);
    setReserve(nextMode.suggestedReserve);
    setBaseParticipants(nextMode.participants);
    setActiveEvents([]);
    setActiveChallenges([]);
    setOverlay(null);
    setLeftoverChoice(null);
    setScreen("plan");
  }

  function changeQuantity(item: GameItem, change: -1 | 1) {
    invalidateCompletion();
    setSelection((current) => changeSelection(mode, current, item, change));
  }

  function changeReserve(change: -1 | 1) {
    invalidateCompletion();
    setReserve((current) => Math.max(0, Math.min(mode.budget, current + change)));
  }

  function changeParticipants(nextParticipants: number) {
    if (!Number.isInteger(nextParticipants) || nextParticipants < PARTICIPANT_RANGE.min || nextParticipants > PARTICIPANT_RANGE.max) {
      throw new Error(`Mokinių skaičius turi būti nuo ${PARTICIPANT_RANGE.min} iki ${PARTICIPANT_RANGE.max}.`);
    }
    invalidateCompletion();
    setBaseParticipants(nextParticipants);
  }

  function currentBaseParticipants(): number {
    if (baseParticipants === undefined) throw new Error("Šiame žaidimo režime mokinių skaičius nekeičiamas.");
    return baseParticipants;
  }

  function checkPlan() {
    const nextProblems = planProblems(mode, plan);
    setProblems(nextProblems);
    if (nextProblems.length === 0) setOverlay("completion");
  }

  function toggleEvent(event: MysteryEvent) {
    invalidateCompletion();
    setActiveEvents((current) => current.some((active) => active.id === event.id)
      ? current.filter((active) => active.id !== event.id)
      : [...current, event]);
  }

  function toggleChallenge(challenge: ChallengeCard) {
    setActiveChallenges((current) => current.some((active) => active.id === challenge.id)
      ? current.filter((active) => active.id !== challenge.id)
      : [...current, challenge]);
  }

  function returnHome() {
    setScreen("start");
    setModeId("paprasta");
    setSelection({});
    setProblems([]);
    setActiveEvents([]);
    setActiveChallenges([]);
    setBaseParticipants(undefined);
    setOverlay(null);
    setLeftoverChoice(null);
  }

  async function toggleFullscreen() {
    if (document.fullscreenElement === null) await document.documentElement.requestFullscreen();
    else await document.exitFullscreen();
  }

  return (
    <div className="min-h-dvh text-navy">
      {screen === "start" && (
        <>
          <Header onHome={returnHome} onHelp={() => setOverlay("help")} onFullscreen={() => void toggleFullscreen()} />
          <StartScreen onStart={startGame} />
        </>
      )}

      {screen === "plan" && (
        <PlanScreen
          mode={mode}
          plan={plan}
          selection={selection}
          category={category}
          problems={problems}
          activeEventCount={activeEvents.length}
          activeChallengeCount={activeChallenges.length}
          onCategory={setCategory}
          onQuantity={changeQuantity}
          onReserve={changeReserve}
          onOpenEvents={() => setOverlay("events")}
          onOpenChallenges={() => setOverlay("challenges")}
          onOpenParticipants={() => setOverlay("participants")}
          onCheck={checkPlan}
          onHome={returnHome}
          onHelp={() => setOverlay("help")}
          onFullscreen={() => void toggleFullscreen()}
        />
      )}

      {overlay === "help" && <HelpDialog onClose={() => setOverlay(null)} />}
      {overlay === "events" && (
        <EventDialog
          mode={mode}
          activeEvents={activeEvents}
          onToggle={toggleEvent}
          onClear={() => {
            invalidateCompletion();
            setActiveEvents([]);
          }}
          onClose={() => setOverlay(null)}
        />
      )}
      {overlay === "challenges" && (
        <ChallengeDialog
          mode={mode}
          plan={plan}
          selection={selection}
          activeChallenges={activeChallenges}
          onToggle={toggleChallenge}
          onClear={() => setActiveChallenges([])}
          onClose={() => setOverlay(null)}
        />
      )}
      {overlay === "participants" && (
        <ParticipantDialog
          participants={currentBaseParticipants()}
          totalParticipants={plan.participants ?? currentBaseParticipants()}
          onChange={changeParticipants}
          onClose={() => setOverlay(null)}
        />
      )}
      {overlay === "completion" && (
        <CompletionDialog
          mode={mode}
          plan={plan}
          activeEvents={activeEvents}
          activeChallenges={activeChallenges}
          selection={selection}
          choice={leftoverChoice}
          onChoice={setLeftoverChoice}
          onContinue={() => setOverlay(null)}
        />
      )}
    </div>
  );
}
