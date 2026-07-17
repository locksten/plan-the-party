import { useEffect, useState } from "react";
import { CompletionDialog, EventDialog, HelpDialog, ChallengeDialog, ParticipantDialog } from "./components/GameDialogs";
import { Header } from "./components/Header";
import { StartScreen } from "./components/StartScreen";
import { PlanScreen } from "./components/game/PlanScreen";
import {
  assert,
  calculatePlan,
  changeSelection,
  getMode,
  PARTICIPANT_RANGE,
  planProblems,
  removeSelectionAt,
  type CategoryId,
  type CarryoverResource,
  type GameItem,
  type ModeId,
  type MysteryEvent,
  type MysteryEventId,
  type Selection,
} from "./game";
import { preloadGameImages } from "./preloadImages";
import type { FoodLeftoverChoice, LongLastingFoodLeftoverChoice, MoneyLeftoverChoice } from "./ui";

type Screen = "start" | "plan";
type Overlay = "help" | "events" | "challenges" | "participants" | "completion";

export function App() {
  const [screen, setScreen] = useState<Screen>("start");
  const [modeId, setModeId] = useState<ModeId>("paprasta");
  const [selection, setSelection] = useState<Selection>([]);
  const [category, setCategory] = useState<CategoryId>("gerimai");
  const [problems, setProblems] = useState<readonly string[]>([]);
  const [reserve, setReserve] = useState(0);
  const [baseParticipants, setBaseParticipants] = useState<number | undefined>(undefined);
  const [activeEvents, setActiveEvents] = useState<readonly MysteryEvent[]>([]);
  const [revealedEventIds, setRevealedEventIds] = useState<readonly MysteryEventId[]>([]);
  const [carryoverResources, setCarryoverResources] = useState<readonly CarryoverResource[]>([]);
  const [celebrationNumber, setCelebrationNumber] = useState(1);
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const [spoilingFoodChoice, setSpoilingFoodChoice] = useState<FoodLeftoverChoice | null>(null);
  const [longLastingFoodChoice, setLongLastingFoodChoice] = useState<LongLastingFoodLeftoverChoice | null>(null);
  const [moneyChoice, setMoneyChoice] = useState<MoneyLeftoverChoice | null>(null);

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

  useEffect(() => {
    if (screen !== "start") return;
    void preloadGameImages().catch((error: unknown) => {
      console.error(error);
    });
  }, [screen]);

  const mode = getMode(modeId);
  const plan = calculatePlan(mode, selection, reserve, baseParticipants, activeEvents, carryoverResources);

  function resetCompletionChoices() {
    setSpoilingFoodChoice(null);
    setLongLastingFoodChoice(null);
    setMoneyChoice(null);
  }

  function invalidateCompletion() {
    setProblems([]);
    resetCompletionChoices();
    setOverlay((current) => current === "completion" ? null : current);
  }

  function startGame(nextModeId: ModeId) {
    const nextMode = getMode(nextModeId);
    setModeId(nextModeId);
    setSelection([]);
    setCategory("gerimai");
    setProblems([]);
    setReserve(nextMode.suggestedReserve);
    setBaseParticipants(nextMode.participants);
    setActiveEvents([]);
    setRevealedEventIds([]);
    setCarryoverResources([]);
    setCelebrationNumber(1);
    setOverlay(null);
    resetCompletionChoices();
    setScreen("plan");
  }

  function changeQuantity(item: GameItem, change: -1 | 1) {
    invalidateCompletion();
    setSelection((current) => changeSelection(mode, current, item, change));
  }

  function removeItemAt(selectionIndex: number) {
    invalidateCompletion();
    setSelection((current) => removeSelectionAt(mode, current, selectionIndex));
  }

  function changeReserve(change: -1 | 1) {
    invalidateCompletion();
    setReserve((current) => Math.max(0, Math.min(plan.totalFunds, current + change)));
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
    setRevealedEventIds((current) => current.includes(event.id) ? current : [...current, event.id]);
    setActiveEvents((current) => current.some((active) => active.id === event.id)
      ? current.filter((active) => active.id !== event.id)
      : [...current, event]);
  }

  function organizeNewCelebration() {
    const remainingMoney = plan.available + plan.reserve;
    assert(remainingMoney >= 0, "Negalima pradėti naujos šventės, kol dabartinis planas viršija biudžetą.");
    assert(plan.spoilingSnackLeftovers === 0 || spoilingFoodChoice !== null, "Nepasirinkta, ką daryti su greitai gendančiu maistu.");
    assert(plan.longLastingSnackLeftovers === 0 || longLastingFoodChoice !== null, "Nepasirinkta, ką daryti su ilgai išliekančiu maistu.");
    assert(remainingMoney === 0 || moneyChoice !== null, "Nepasirinkta, ką daryti su likusiais pinigais.");

    const nextResources: CarryoverResource[] = [];
    const source = { kind: "celebration-leftover", celebrationNumber } as const;
    if (moneyChoice === "kitai-sventei" && remainingMoney > 0) {
      nextResources.push({ id: globalThis.crypto.randomUUID(), kind: "money", amount: remainingMoney, source });
    }
    if (longLastingFoodChoice === "pasilikti-kitai-sventei" && plan.longLastingSnackLeftovers > 0) {
      nextResources.push({
        id: globalThis.crypto.randomUUID(),
        kind: "long-lasting-snack-portions",
        amount: plan.longLastingSnackLeftovers,
        source,
      });
    }

    setCarryoverResources(nextResources);
    setCelebrationNumber((current) => current + 1);
    setSelection([]);
    setCategory("gerimai");
    setProblems([]);
    setReserve(mode.suggestedReserve);
    setActiveEvents([]);
    setRevealedEventIds([]);
    setOverlay(null);
    resetCompletionChoices();
  }

  function returnHome() {
    setScreen("start");
    setModeId("paprasta");
    setSelection([]);
    setProblems([]);
    setActiveEvents([]);
    setRevealedEventIds([]);
    setCarryoverResources([]);
    setCelebrationNumber(1);
    setBaseParticipants(undefined);
    setOverlay(null);
    resetCompletionChoices();
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
          activeEvents={activeEvents}
          revealedEventIds={revealedEventIds}
          onCategory={setCategory}
          onQuantity={changeQuantity}
          onRemoveAt={removeItemAt}
          onReserve={changeReserve}
          onOpenEvents={() => setOverlay("events")}
          onOpenChallenges={() => setOverlay("challenges")}
          onOpenParticipants={() => setOverlay("participants")}
          onDismissProblems={() => setProblems([])}
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
          revealedEventIds={revealedEventIds}
          onToggle={toggleEvent}
          onClose={() => setOverlay(null)}
        />
      )}
      {overlay === "challenges" && (
        <ChallengeDialog
          mode={mode}
          plan={plan}
          selection={selection}
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
          plan={plan}
          spoilingFoodChoice={spoilingFoodChoice}
          longLastingFoodChoice={longLastingFoodChoice}
          moneyChoice={moneyChoice}
          onSpoilingFoodChoice={setSpoilingFoodChoice}
          onLongLastingFoodChoice={setLongLastingFoodChoice}
          onMoneyChoice={setMoneyChoice}
          onNewCelebration={organizeNewCelebration}
          onContinue={() => setOverlay(null)}
        />
      )}
    </div>
  );
}
