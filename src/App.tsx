import { useEffect, useState, type PointerEvent as ReactPointerEvent } from "react";
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
type DragSource = "shelf" | "table";
type ActiveDrag = {
  item: GameItem;
  source: DragSource;
  pointerId: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
};
const CATEGORIES: ReadonlyArray<{ id: CategoryId; label: string }> = [
  { id: "gerimai", label: "Gėrimai" },
  { id: "uzkandziai", label: "Užkandžiai" },
  { id: "veikla", label: "Veikla" },
  { id: "papildomai", label: "Papildomai" },
];
const MODE_VISUALS: Record<ModeId, { number: string; callout: string }> = {
  paprasta: { number: "1", callout: "Rinkis" },
  iprasta: { number: "2", callout: "Skaičiuok" },
  issukis: { number: "3", callout: "Reaguok" },
};
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
          surpriseRevealed={surpriseRevealed} selection={selection} onRetry={tryAnotherPlan} onHome={returnHome} />
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
        <span><strong>Šventės iššūkis</strong><small>Klasės biudžeto žaidimas</small></span>
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
        <p className="eyebrow">Klasės misija</p>
        <h1>Atverkite duris į<br /><span>klasės šventę!</span></h1>
        <p className="lead">Pasirinkite lygį. Tada tempkite daiktus ant šventės stalo ir saugokite biudžetą.</p>
      </section>
      <section className="level-room" aria-labelledby="mode-heading">
        <h2 id="mode-heading" className="visually-hidden">Pasirinkite lygį</h2>
        {MODES.map((mode) => (
          <article className={`level-door level-door-${mode.id}`} key={mode.id}>
            <div className="door-top" aria-hidden="true"><span>{MODE_VISUALS[mode.id].number}</span></div>
            <div className="door-face">
              <p>{mode.grades}</p>
              <strong>{mode.title}</strong>
              <small>{MODE_VISUALS[mode.id].callout}</small>
              <div className="door-budget"><span>{formatEuros(mode.budget)}</span><span>rezervas {formatEuros(mode.reserve)}</span></div>
              <button type="button" onClick={() => onStart(mode.id)}>Atverti</button>
            </div>
          </article>
        ))}
      </section>
      <p className="start-footer">Mokytojas valdo ekraną · klasė tariasi ir balsuoja</p>
    </main>
  );
}

function PlanScreen({ mode, selection, category, problems, surpriseRevealed, onCategory, onQuantity, onCheck }: {
  mode: GameMode; selection: Selection; category: CategoryId; problems: readonly string[]; surpriseRevealed: boolean;
  onCategory: (category: CategoryId) => void; onQuantity: (item: GameItem, change: number) => void; onCheck: () => void;
}) {
  const [drag, setDrag] = useState<ActiveDrag | null>(null);
  const totals = calculateTotals(mode, selection);
  const people = (mode.participants ?? 0) + (surpriseRevealed ? (mode.surpriseGuests ?? 0) : 0);
  const categoryItems = mode.items.filter((item) => item.category === category);
  const selectedItems = mode.items.filter((item) => (selection[item.id] ?? 0) > 0);
  const selectedByCategory = (categoryId: CategoryId) => selectedItems.filter((item) => item.category === categoryId);

  function beginDrag(event: ReactPointerEvent<HTMLElement>, item: GameItem, source: DragSource) {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ item, source, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, x: event.clientX, y: event.clientY });
  }

  function moveDrag(event: ReactPointerEvent<HTMLElement>) {
    if (drag === null || event.pointerId !== drag.pointerId) return;
    setDrag((current) => current === null ? null : { ...current, x: event.clientX, y: event.clientY });
  }

  function finishDrag(event: ReactPointerEvent<HTMLElement>) {
    if (drag === null || event.pointerId !== drag.pointerId) return;
    const completedDrag = drag;
    const moved = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 10;
    const target = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
    const dropZone = target?.closest<HTMLElement>("[data-drop-category]");
    const droppedOnShelf = target?.closest<HTMLElement>("[data-drop-shelf]") !== null;
    setDrag(null);

    if (completedDrag.source === "shelf") {
      if (!moved || dropZone?.dataset.dropCategory === completedDrag.item.category) onQuantity(completedDrag.item, 1);
    } else if (!moved || droppedOnShelf) {
      onQuantity(completedDrag.item, -1);
    }
  }

  function cancelDrag(event: ReactPointerEvent<HTMLElement>) {
    if (drag !== null && event.pointerId === drag.pointerId) setDrag(null);
  }

  return (
    <main className="game-screen">
      <section className={`table-mission ${surpriseRevealed ? "table-mission-alert" : ""}`}>
        <div>
          <p className="eyebrow">{surpriseRevealed ? "Netikėtas įvykis!" : `Misija · ${mode.grades}`}</p>
          <h1>{surpriseRevealed ? `Dabar dalyvaus ${people} mokiniai` : mode.title}</h1>
        </div>
        <div className="people-badge"><span aria-hidden="true">● ● ●</span><strong>{mode.participants === undefined ? "Visa klasė" : `${people} mokiniai`}</strong></div>
      </section>

      {problems.length > 0 && (
        <div className="table-feedback" role="alert"><strong>{problems[0]}</strong>{problems.length > 1 && <span>Dar {problems.length - 1}</span>}</div>
      )}

      <div className="table-workspace">
        <aside className="supply-shelf" data-drop-shelf aria-labelledby="shelf-heading">
          <div className="shelf-title"><span>Daiktų lentyna</span><strong id="shelf-heading">Ką dedame?</strong></div>
          <div className="shelf-categories" aria-label="Pasirinkimų grupės">
            {CATEGORIES.map((item) => (
              <button key={item.id} type="button" aria-pressed={category === item.id} className={category === item.id ? "active" : ""} onClick={() => onCategory(item.id)}>
                {item.label}
              </button>
            ))}
          </div>
          <div className="shelf-items">
            {categoryItems.map((item) => (
              <ShelfItem key={item.id} item={item} quantity={selection[item.id] ?? 0}
                onPlace={() => onQuantity(item, 1)} onPointerDown={(event) => beginDrag(event, item, "shelf")}
                onPointerMove={moveDrag} onPointerUp={finishDrag} onPointerCancel={cancelDrag} />
            ))}
          </div>
          <p className="shelf-help">Tempkite ant stalo<br />arba palieskite.</p>
        </aside>

        <section className="party-scene" aria-label="Klasės šventės stalas">
          <div className="party-table">
            <TableZone category="papildomai" title="Papuošimai" items={selectedByCategory("papildomai")} selection={selection}
              onRemove={(item) => onQuantity(item, -1)} onPointerDown={beginDrag} onPointerMove={moveDrag} onPointerUp={finishDrag} onPointerCancel={cancelDrag} />
            <div className="main-place-settings">
              <TableZone category="gerimai" title="Gėrimai" items={selectedByCategory("gerimai")} selection={selection}
                people={mode.participants === undefined ? undefined : people} covered={totals.drinkPortions}
                attention={problems.length > 0 && (mode.participants === undefined ? !totals.hasDrink : totals.drinkPortions < people)}
                onRemove={(item) => onQuantity(item, -1)} onPointerDown={beginDrag} onPointerMove={moveDrag} onPointerUp={finishDrag} onPointerCancel={cancelDrag} />
              <TableZone category="uzkandziai" title="Užkandžiai" items={selectedByCategory("uzkandziai")} selection={selection}
                people={mode.participants === undefined ? undefined : people} covered={totals.snackPortions}
                attention={problems.length > 0 && (mode.participants === undefined ? !totals.hasSnack : totals.snackPortions < people)}
                onRemove={(item) => onQuantity(item, -1)} onPointerDown={beginDrag} onPointerMove={moveDrag} onPointerUp={finishDrag} onPointerCancel={cancelDrag} />
            </div>
            <TableZone category="veikla" title="Bendra veikla" items={selectedByCategory("veikla")} selection={selection}
              attention={problems.length > 0 && !totals.hasActivity} onRemove={(item) => onQuantity(item, -1)} onPointerDown={beginDrag} onPointerMove={moveDrag} onPointerUp={finishDrag} onPointerCancel={cancelDrag} />
          </div>
        </section>
      </div>

      <MoneyTray mode={mode} spent={totals.spent} remaining={totals.remaining} surpriseRevealed={surpriseRevealed}
        attention={problems.length > 0 && (totals.spent > mode.budget || (!surpriseRevealed && totals.remaining < mode.reserve))} onCheck={onCheck} />

      {drag !== null && <div className={`drag-ghost ghost-${drag.item.category}`} style={{ left: drag.x, top: drag.y }}>{drag.item.name}<strong>{formatEuros(drag.item.price)}</strong></div>}
    </main>
  );
}

function ShelfItem({ item, quantity, onPlace, onPointerDown, onPointerMove, onPointerUp, onPointerCancel }: {
  item: GameItem;
  quantity: number;
  onPlace: () => void;
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => void;
}) {
  return (
    <div className={`shelf-item shelf-item-${item.category}`} role="button" tabIndex={0}
      aria-label={`${item.name}, ${formatEuros(item.price)}. Palieskite arba tempkite ant stalo.`}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerCancel}
      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onPlace(); } }}>
      <div className="shelf-item-picture" aria-hidden="true"><span>{item.name.slice(0, 1)}</span></div>
      <div className="shelf-item-copy"><strong>{item.name}</strong><small>{item.note}</small></div>
      <div className="shelf-item-price">{formatEuros(item.price)}</div>
      {quantity > 0 && <span className="on-table-count">Ant stalo: {quantity}</span>}
    </div>
  );
}

function TableZone({ category, title, items, selection, people, covered = 0, attention = false, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onRemove }: {
  category: CategoryId;
  title: string;
  items: readonly GameItem[];
  selection: Selection;
  people?: number;
  covered?: number;
  attention?: boolean;
  onPointerDown: (event: ReactPointerEvent<HTMLElement>, item: GameItem, source: DragSource) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => void;
  onRemove?: (item: GameItem) => void;
}) {
  return (
    <section className={`table-zone zone-${category} ${attention ? "zone-attention" : ""}`}
      data-drop-category={category} data-zone-title={title} aria-label={title}>
      <div className="placed-items">
        {items.map((item) => {
          const quantity = selection[item.id] ?? 0;
          return (
            <div key={item.id} className={`placed-item placed-${category}`} role="button" tabIndex={0}
              aria-label={`${item.name}, kiekis ${quantity}. Palieskite, kad nuimtumėte vieną.`}
              onPointerDown={(event) => onPointerDown(event, item, "table")} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerCancel}
              onKeyDown={(event) => { if ((event.key === "Enter" || event.key === " ") && onRemove !== undefined) { event.preventDefault(); onRemove(item); } }}>
              <span aria-hidden="true">{item.name.slice(0, 1)}</span><strong>{item.name}</strong>{quantity > 1 && <b>×{quantity}</b>}
            </div>
          );
        })}
      </div>
      {(category === "gerimai" || category === "uzkandziai") && (
        <SeatDots people={people} covered={covered} hasChoice={items.length > 0} />
      )}
    </section>
  );
}

function SeatDots({ people, covered, hasChoice }: { people?: number; covered: number; hasChoice: boolean }) {
  if (people === undefined) {
    return <div className={`simple-coverage ${hasChoice ? "covered" : ""}`}><span>{hasChoice ? "Užtenka klasei" : "Dar nepasirinkta"}</span></div>;
  }
  const filled = Math.min(people, covered);
  return (
    <div className={`seat-meter ${covered >= people ? "covered" : ""}`}>
      <div className="seat-dots" aria-hidden="true">
        {Array.from({ length: people }, (_, index) => <i className={index < filled ? "filled" : ""} key={index} />)}
      </div>
      <strong>{covered >= people ? `Užtenka ${people}` : `Trūksta ${people - covered}`}</strong>
    </div>
  );
}

function MoneyTray({ mode, spent, remaining, surpriseRevealed, attention, onCheck }: {
  mode: GameMode;
  spent: number;
  remaining: number;
  surpriseRevealed: boolean;
  attention: boolean;
  onCheck: () => void;
}) {
  const lockedReserve = surpriseRevealed ? 0 : mode.reserve;
  const spendable = Math.max(0, remaining - lockedReserve);
  const visibleCoins = Math.min(12, spendable);
  return (
    <section className={`money-tray ${attention ? "money-attention" : ""}`} aria-label="Biudžeto dėklas">
      <div className="spent-pile"><span>Išleista</span><strong>{formatEuros(spent)}</strong></div>
      <div className="loose-money">
        <div><span>Galima išleisti</span><strong>{formatEuros(spendable)}</strong></div>
        <div className="coin-row" aria-hidden="true">
          {Array.from({ length: visibleCoins }, (_, index) => <i key={index}>€</i>)}
          {spendable > visibleCoins && <b>+{spendable - visibleCoins}</b>}
        </div>
      </div>
      <div className={`reserve-envelope ${surpriseRevealed ? "open" : ""}`}>
        <span>{surpriseRevealed ? "Rezervas atidarytas" : "Užrakintas rezervas"}</span>
        <strong>{surpriseRevealed ? "Galima naudoti" : formatEuros(mode.reserve)}</strong>
      </div>
      <button className="tray-check" type="button" onClick={onCheck}>Patikrinkime</button>
    </section>
  );
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

function ResultScreen({ mode, plan, comparison, surpriseRevealed, selection, onRetry, onHome }: {
  mode: GameMode; plan: PlanSnapshot; comparison: PlanSnapshot | null; surpriseRevealed: boolean; selection: Selection; onRetry: () => void; onHome: () => void;
}) {
  const chosenItems = mode.items.filter((item) => (selection[item.id] ?? 0) > 0);
  return <main className="result-screen">
    <section className="result-summary">
      <p className="eyebrow">Misija įvykdyta!</p><h1>Šventė suplanuota</h1>
      <p className="lead">{surpriseRevealed ? "Prisitaikėte prie netikėtumo ir neviršijote biudžeto." : "Susitarimus įvykdėte ir neviršijote biudžeto."}</p>
      <div className="result-mini-table" aria-label="Galutinis šventės stalas">
        {chosenItems.map((item) => <div className={`mini-table-item mini-${item.category}`} key={item.id}>
          <span>{item.name.slice(0, 1)}</span><strong>{item.name}</strong>{(selection[item.id] ?? 0) > 1 && <b>×{selection[item.id]}</b>}
        </div>)}
      </div>
      <div className="result-numbers">
        <div><span>Biudžetas</span><strong>{formatEuros(mode.budget)}</strong></div><div><span>Išleista</span><strong>{formatEuros(plan.spent)}</strong></div><div><span>Liko</span><strong>{formatEuros(plan.remaining)}</strong></div>
      </div>
    </section>
    <section className="debrief-panel">
      <p className="step-label">Paskutinis etapas</p><h2>Aptarkite sprendimą</h2>
      <ol>{mode.reflection.map((question) => <li key={question}>{question}</li>)}</ol>
      {comparison !== null && <div className="comparison-box"><h3>Palyginkite du tinkamus planus</h3><div>
        <p><span>Pirmas planas</span><strong>Išleista {formatEuros(comparison.spent)}</strong></p><p><span>Antras planas</span><strong>Išleista {formatEuros(plan.spent)}</strong></p>
      </div><p>Kuris planas klasei tinkamesnis? Vien kainos atsakymui neužtenka.</p></div>}
      <div className="result-actions"><button className="primary-button" type="button" onClick={onRetry}>Žaisti dar kartą</button><button className="secondary-button" type="button" onClick={onHome}>Rinktis kitą lygį</button></div>
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
        <li><strong>Paprašykite paaiškinti.</strong><span>Prieš tempdami daiktą ant stalo išklausykite bent du pasiūlymus.</span></li>
        <li><strong>Tempkite arba palieskite.</strong><span>Daiktą galima nutempti ant tinkamos stalo vietos arba tiesiog paliesti.</span></li>
        <li><strong>Balsuokite ir tikrinkite.</strong><span>Tuščios vietos parodo, ko dar trūksta. Planą visada galima taisyti.</span></li>
        <li><strong>Užbaikite aptarimu.</strong><span>Svarbu ne išleisti mažiausiai, o pagrįsti savo pasirinkimą.</span></li>
      </ol>
      <div className="teacher-note"><strong>Sąvokos</strong><p>Biudžetas – kiek galime išleisti. Išlaidos – ką išleidome. Rezervas – pinigai netikėtumams.</p></div>
      <button className="primary-button" type="button" onClick={onClose}>Aišku, pradėkime</button>
    </section>
  </div>;
}
