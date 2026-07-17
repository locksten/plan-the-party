import { useEffect, useState } from "react";
import {
  MODES,
  calculateTotals,
  getMode,
  planProblems,
  snapshotPlan,
  type CategoryId,
  type GameItem,
  type GameMode,
  type ModeId,
  type PlanSnapshot,
  type Selection,
} from "./game";

type Screen = "start" | "plan" | "checkpoint" | "result";
const CATEGORIES: ReadonlyArray<{ id: CategoryId; label: string }> = [
  { id: "gerimai", label: "Gėrimai" },
  { id: "uzkandziai", label: "Užkandžiai" },
  { id: "veikla", label: "Veikla" },
  { id: "papildomai", label: "Papildomai" },
];
const formatEuros = (value: number) => `${value} €`;

export function App() {
  const [screen, setScreen] = useState<Screen>("start");
  const [modeId, setModeId] = useState<ModeId>("paprasta");
  const [selection, setSelection] = useState<Selection>({});
  const [category, setCategory] = useState<CategoryId>("gerimai");
  const [problems, setProblems] = useState<readonly string[]>([]);
  const [surpriseRevealed, setSurpriseRevealed] = useState(false);
  const [comparison, setComparison] = useState<PlanSnapshot | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (!showHelp) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setShowHelp(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [showHelp]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  const mode = getMode(modeId);
  const totals = calculateTotals(mode, selection);

  function startGame(nextModeId: ModeId) {
    setModeId(nextModeId);
    setSelection({});
    setCategory("gerimai");
    setProblems([]);
    setSurpriseRevealed(false);
    setComparison(null);
    setScreen("plan");
  }

  function changeQuantity(item: GameItem, change: number) {
    setProblems([]);
    setSelection((current) => {
      const nextQuantity = Math.max(0, Math.min(6, (current[item.id] ?? 0) + change));
      if (mode.participants === undefined && nextQuantity > 1) return current;
      const next = { ...current };
      if (nextQuantity === 0) delete next[item.id];
      else next[item.id] = nextQuantity;
      return next;
    });
  }

  function checkPlan() {
    const nextProblems = planProblems(mode, totals, surpriseRevealed);
    setProblems(nextProblems);
    if (nextProblems.length > 0) return;
    if (mode.surpriseGuests !== undefined && !surpriseRevealed) setScreen("checkpoint");
    else setScreen("result");
  }

  function tryAnotherPlan() {
    setComparison(snapshotPlan(mode, selection, totals));
    setSelection({});
    setCategory("gerimai");
    setProblems([]);
    setSurpriseRevealed(false);
    setScreen("plan");
  }

  function returnHome() {
    setScreen("start");
    setSelection({});
    setProblems([]);
    setSurpriseRevealed(false);
    setComparison(null);
  }

  async function enterFullscreen() {
    if (document.fullscreenElement === null) await document.documentElement.requestFullscreen();
    else await document.exitFullscreen();
  }

  return (
    <div className="app-shell">
      <Header inGame={screen !== "start"} onHome={returnHome} onHelp={() => setShowHelp(true)} onFullscreen={() => void enterFullscreen()} />
      {screen === "start" && <StartScreen onStart={startGame} />}
      {screen === "plan" && (
        <PlanScreen mode={mode} selection={selection} category={category} problems={problems} surpriseRevealed={surpriseRevealed}
          onCategory={setCategory} onQuantity={changeQuantity} onCheck={checkPlan} />
      )}
      {screen === "checkpoint" && (
        <CheckpointScreen remaining={totals.remaining} onReveal={() => { setSurpriseRevealed(true); setProblems([]); setScreen("plan"); }} />
      )}
      {screen === "result" && (
        <ResultScreen mode={mode} plan={snapshotPlan(mode, selection, totals)} comparison={comparison}
          surpriseRevealed={surpriseRevealed} onRetry={tryAnotherPlan} onHome={returnHome} />
      )}
      {showHelp && <HelpDialog onClose={() => setShowHelp(false)} />}
    </div>
  );
}

function Header({ inGame, onHome, onHelp, onFullscreen }: {
  inGame: boolean; onHome: () => void; onHelp: () => void; onFullscreen: () => void;
}) {
  return (
    <header className="site-header">
      <button className="brand" type="button" onClick={onHome} aria-label="Grįžti į pradžią">
        <span className="brand-mark" aria-hidden="true">€</span>
        <span><strong>Klasės finansai</strong><small>Sprendžiame kartu</small></span>
      </button>
      <div className="header-actions">
        {inGame && <button className="text-button" type="button" onClick={onHome}>Baigti žaidimą</button>}
        <button className="text-button" type="button" onClick={onHelp}>Kaip žaisti?</button>
        <button className="text-button fullscreen-button" type="button" onClick={onFullscreen}>Per visą ekraną</button>
      </div>
    </header>
  );
}

function StartScreen({ onStart }: { onStart: (modeId: ModeId) => void }) {
  return (
    <main className="start-screen">
      <section className="start-intro">
        <div>
          <p className="eyebrow">Bendras klasės žaidimas</p>
          <h1>Suplanuokite klasės šventę</h1>
          <p className="lead">Turite ribotą biudžetą. Susitarkite, ką pirkti, kad užtektų visiems ir liktų pinigų netikėtumams.</p>
        </div>
        <div className="how-it-works" aria-label="Trys žaidimo žingsniai">
          <div><span>1</span><p><strong>Aptarkite</strong> pasirinkimus komandomis.</p></div>
          <div><span>2</span><p><strong>Balsuokite</strong> ir sudėkite bendrą planą.</p></div>
          <div><span>3</span><p><strong>Patikrinkite</strong> ir paaiškinkite sprendimą.</p></div>
        </div>
      </section>
      <section className="mode-section" aria-labelledby="mode-heading">
        <div className="section-heading">
          <div><p className="eyebrow">Mokytojui</p><h2 id="mode-heading">Pasirinkite sudėtingumą</h2></div>
          <p>Vienas ekranas visai klasei. Be laikmačio ir taškų.</p>
        </div>
        <div className="mode-grid">
          {MODES.map((mode, index) => (
            <article className={`mode-card mode-card-${mode.id}`} key={mode.id}>
              <div className="mode-card-top"><span className="mode-number">0{index + 1}</span><span className="duration">{mode.duration}</span></div>
              <p className="grade-label">{mode.grades}</p>
              <h3>{mode.title}</h3><p>{mode.summary}</p>
              <dl className="mode-facts">
                <div><dt>Biudžetas</dt><dd>{formatEuros(mode.budget)}</dd></div>
                <div><dt>Rezervas</dt><dd>{formatEuros(mode.reserve)}</dd></div>
              </dl>
              <button className="primary-button" type="button" onClick={() => onStart(mode.id)}>Pradėti</button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function PlanScreen({ mode, selection, category, problems, surpriseRevealed, onCategory, onQuantity, onCheck }: {
  mode: GameMode; selection: Selection; category: CategoryId; problems: readonly string[]; surpriseRevealed: boolean;
  onCategory: (category: CategoryId) => void; onQuantity: (item: GameItem, change: number) => void; onCheck: () => void;
}) {
  const totals = calculateTotals(mode, selection);
  const people = (mode.participants ?? 0) + (surpriseRevealed ? (mode.surpriseGuests ?? 0) : 0);
  const categoryItems = mode.items.filter((item) => item.category === category);
  const selectedItems = mode.items.filter((item) => (selection[item.id] ?? 0) > 0);
  const spentPercent = Math.min(100, Math.max(0, (totals.spent / mode.budget) * 100));
  const overBudget = totals.remaining < 0;
  return (
    <main className="game-screen">
      <section className={`mission-strip ${surpriseRevealed ? "mission-strip-alert" : ""}`}>
        <div>
          <p className="eyebrow">{surpriseRevealed ? "Planai pasikeitė" : mode.grades}</p>
          <h1>{surpriseRevealed ? `Dabar dalyvaus ${people} mokiniai` : mode.title}</h1>
          <p>{surpriseRevealed
            ? `Prisijungė ${mode.surpriseGuests} svečiai. Papildykite planą neviršydami biudžeto.`
            : mode.participants === undefined
              ? `Pasirinkite gėrimą, užkandį ir bendrą veiklą. Palikite bent ${mode.reserve} € rezerve.`
              : `Paruoškite gėrimų ir užkandžių ${people} mokiniams, pasirinkite veiklą ir palikite ${mode.reserve} € rezerve.`}</p>
        </div>
        <div className={`budget-summary ${overBudget ? "budget-over" : ""}`} aria-live="polite">
          <div><span>Biudžetas</span><strong>{formatEuros(mode.budget)}</strong></div>
          <div><span>Išleista</span><strong>{formatEuros(totals.spent)}</strong></div>
          <div className="remaining"><span>Liko</span><strong>{formatEuros(totals.remaining)}</strong></div>
          <div className="budget-track" aria-hidden="true"><span style={{ width: `${spentPercent}%` }} /></div>
        </div>
      </section>
      <div className="game-layout">
        <section className="shop-panel" aria-labelledby="shop-heading">
          <div className="panel-heading">
            <div><p className="step-label">1 žingsnis</p><h2 id="shop-heading">Sudėkite planą</h2></div>
            <p>Aptarkite, tada spauskite pasirinkimą.</p>
          </div>
          <div className="category-tabs" role="tablist" aria-label="Pasirinkimų grupės">
            {CATEGORIES.map((item) => {
              const count = mode.items.filter((candidate) => candidate.category === item.id).reduce((sum, candidate) => sum + (selection[candidate.id] ?? 0), 0);
              return <button key={item.id} type="button" role="tab" aria-selected={category === item.id} className={category === item.id ? "active" : ""} onClick={() => onCategory(item.id)}>
                {item.label}{count > 0 && <span>{count}</span>}
              </button>;
            })}
          </div>
          <div className="item-grid" role="tabpanel">
            {categoryItems.map((item) => <ItemCard key={item.id} item={item} quantity={selection[item.id] ?? 0}
              allowMultiple={mode.participants !== undefined && (item.category === "gerimai" || item.category === "uzkandziai")}
              onChange={(change) => onQuantity(item, change)} />)}
          </div>
        </section>
        <aside className="plan-panel" aria-labelledby="plan-heading">
          <div className="panel-heading compact"><div><p className="step-label">2 žingsnis</p><h2 id="plan-heading">Klasės planas</h2></div></div>
          <Requirements mode={mode} selection={selection} surpriseRevealed={surpriseRevealed} />
          {problems.length > 0 && <div className="feedback-box" role="alert"><strong>Planą dar pataisykite</strong><ul>{problems.map((problem) => <li key={problem}>{problem}</li>)}</ul></div>}
          <div className="receipt">
            <h3>Pasirinkta</h3>
            {selectedItems.length === 0 ? <p className="empty-receipt">Kol kas nieko. Pradėkite nuo gėrimų.</p> : (
              <ul>{selectedItems.map((item) => {
                const quantity = selection[item.id] ?? 0;
                return <li key={item.id}>
                  <div><strong>{item.name}</strong>{quantity > 1 && <span> × {quantity}</span>}</div>
                  <div><span>{formatEuros(item.price * quantity)}</span><button type="button" onClick={() => onQuantity(item, -quantity)} aria-label={`Pašalinti: ${item.name}`}>Pašalinti</button></div>
                </li>;
              })}</ul>
            )}
          </div>
          <button className="check-button" type="button" onClick={onCheck}>Patikrinkime planą</button>
        </aside>
      </div>
    </main>
  );
}

function ItemCard({ item, quantity, allowMultiple, onChange }: {
  item: GameItem; quantity: number; allowMultiple: boolean; onChange: (change: number) => void;
}) {
  const selected = quantity > 0;
  return (
    <article className={`item-card ${selected ? "selected" : ""}`}>
      <div className="item-placeholder" aria-hidden="true">{item.name}</div>
      <div className="item-copy"><div><p>{item.note}</p><h3>{item.name}</h3></div><strong className="item-price">{formatEuros(item.price)}</strong></div>
      {allowMultiple && selected ? (
        <div className="quantity-control" aria-label={`${item.name} kiekis`}>
          <button type="button" onClick={() => onChange(-1)} aria-label="Sumažinti kiekį">−</button>
          <span><small>Kiekis</small><strong>{quantity}</strong></span>
          <button type="button" onClick={() => onChange(1)} aria-label="Padidinti kiekį">+</button>
        </div>
      ) : <button className="add-button" type="button" onClick={() => onChange(selected ? -1 : 1)}>{selected ? "Pašalinti" : "Pasirinkti"}</button>}
    </article>
  );
}

function Requirements({ mode, selection, surpriseRevealed }: { mode: GameMode; selection: Selection; surpriseRevealed: boolean }) {
  const totals = calculateTotals(mode, selection);
  const people = (mode.participants ?? 0) + (surpriseRevealed ? (mode.surpriseGuests ?? 0) : 0);
  const reserveNeeded = surpriseRevealed ? 0 : mode.reserve;
  const rows = mode.participants === undefined
    ? [
        { label: "Gėrimas", value: totals.hasDrink ? "Pasirinkta" : "Trūksta", done: totals.hasDrink },
        { label: "Užkandis", value: totals.hasSnack ? "Pasirinkta" : "Trūksta", done: totals.hasSnack },
        { label: "Bendra veikla", value: totals.hasActivity ? "Pasirinkta" : "Trūksta", done: totals.hasActivity },
      ]
    : [
        { label: "Gėrimų porcijos", value: `${totals.drinkPortions} / ${people}`, done: totals.drinkPortions >= people },
        { label: "Užkandžių porcijos", value: `${totals.snackPortions} / ${people}`, done: totals.snackPortions >= people },
        { label: "Bendra veikla", value: totals.hasActivity ? "Pasirinkta" : "Trūksta", done: totals.hasActivity },
      ];
  return <div className="requirements">
    {rows.map((row) => <div className={row.done ? "done" : ""} key={row.label}>
      <span className="status-mark" aria-hidden="true">{row.done ? "✓" : "·"}</span><span>{row.label}</span><strong>{row.value}</strong>
    </div>)}
    {reserveNeeded > 0 && <div className={totals.remaining >= reserveNeeded ? "done" : ""}>
      <span className="status-mark" aria-hidden="true">{totals.remaining >= reserveNeeded ? "✓" : "·"}</span><span>Rezervas</span><strong>bent {formatEuros(reserveNeeded)}</strong>
    </div>}
  </div>;
}

function CheckpointScreen({ remaining, onReveal }: { remaining: number; onReveal: () => void }) {
  return <main className="focus-screen"><div className="focus-card">
    <p className="eyebrow">Planas paruoštas</p><h1>Palikote {formatEuros(remaining)} rezervo</h1>
    <p className="lead">Gėrimų ir užkandžių užtenka 24 mokiniams. Dabar patikrinkime, ar rezervas buvo naudingas.</p>
    <div className="discussion-prompt"><span>Prieš tęsiant</span><strong>Kaip manote, kas gali pakeisti mūsų planą?</strong></div>
    <button className="primary-button large" type="button" onClick={onReveal}>Atidengti staigmeną</button>
    <small>Mokytojas tęsia, kai klasė pasiruošusi.</small>
  </div></main>;
}

function ResultScreen({ mode, plan, comparison, surpriseRevealed, onRetry, onHome }: {
  mode: GameMode; plan: PlanSnapshot; comparison: PlanSnapshot | null; surpriseRevealed: boolean; onRetry: () => void; onHome: () => void;
}) {
  return <main className="result-screen">
    <section className="result-summary">
      <p className="eyebrow">Planas pavyko</p><h1>Šventė suplanuota</h1>
      <p className="lead">{surpriseRevealed ? "Prisitaikėte prie netikėtumo ir neviršijote biudžeto." : "Susitarimus įvykdėte ir neviršijote biudžeto."}</p>
      <div className="result-numbers">
        <div><span>Biudžetas</span><strong>{formatEuros(mode.budget)}</strong></div><div><span>Išleista</span><strong>{formatEuros(plan.spent)}</strong></div><div><span>Liko</span><strong>{formatEuros(plan.remaining)}</strong></div>
      </div>
      <div className="final-plan"><h2>Jūsų planas</h2><p>{plan.itemNames.join(" · ")}</p></div>
    </section>
    <section className="debrief-panel">
      <p className="step-label">3 žingsnis</p><h2>Aptarkite sprendimą</h2>
      <ol>{mode.reflection.map((question) => <li key={question}>{question}</li>)}</ol>
      {comparison !== null && <div className="comparison-box"><h3>Palyginkite du tinkamus planus</h3><div>
        <p><span>Pirmas planas</span><strong>Išleista {formatEuros(comparison.spent)}</strong></p><p><span>Antras planas</span><strong>Išleista {formatEuros(plan.spent)}</strong></p>
      </div><p>Kuris planas klasei tinkamesnis? Vien kainos atsakymui neužtenka.</p></div>}
      <div className="result-actions"><button className="primary-button" type="button" onClick={onRetry}>Kurti kitą planą</button><button className="secondary-button" type="button" onClick={onHome}>Rinktis kitą užduotį</button></div>
    </section>
  </main>;
}

function HelpDialog({ onClose }: { onClose: () => void }) {
  return <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="help-dialog" role="dialog" aria-modal="true" aria-labelledby="help-title" onMouseDown={(event) => event.stopPropagation()}>
      <button className="dialog-close" type="button" onClick={onClose} aria-label="Uždaryti">Uždaryti</button>
      <p className="eyebrow">Trumpa atmintinė mokytojui</p><h2 id="help-title">Kaip žaisti su klase?</h2>
      <ol>
        <li><strong>Suskirstykite klasę komandomis.</strong><span>Kiekviena komanda aptaria vieną pasirinkimų grupę.</span></li>
        <li><strong>Paprašykite paaiškinti.</strong><span>Prieš paspausdami kortelę išklausykite bent du pasiūlymus.</span></li>
        <li><strong>Balsuokite ir tikrinkite.</strong><span>Klaidos nėra bauda – planą galima taisyti.</span></li>
        <li><strong>Užbaikite aptarimu.</strong><span>Svarbu ne išleisti mažiausiai, o pagrįsti savo pasirinkimą.</span></li>
      </ol>
      <div className="teacher-note"><strong>Sąvokos</strong><p>Biudžetas – kiek galime išleisti. Išlaidos – ką išleidome. Rezervas – pinigai netikėtumams.</p></div>
      <button className="primary-button" type="button" onClick={onClose}>Aišku, pradėkime</button>
    </section>
  </div>;
}
