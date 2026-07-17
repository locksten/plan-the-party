import type { CategoryId, GameItem, GamePlan, Selection } from "../../game";
import { CATEGORY_ACCENT, classes } from "../../ui";
import type { BeginDrag, DragPointerHandler } from "./drag";

type PartyTableProps = {
  items: readonly GameItem[];
  selection: Selection;
  plan: GamePlan;
  showProblems: boolean;
  onRemove: (item: GameItem) => void;
  onBeginDrag: BeginDrag;
  onMoveDrag: DragPointerHandler;
  onFinishDrag: DragPointerHandler;
  onCancelDrag: DragPointerHandler;
};

export function PartyTable({ items, selection, plan, showProblems, onRemove, onBeginDrag, onMoveDrag, onFinishDrag, onCancelDrag }: PartyTableProps) {
  const selectedItems = items.filter((item) => (selection[item.id] ?? 0) > 0);
  const selectedByCategory = (category: CategoryId) => selectedItems.filter((item) => item.category === category);
  const dragHandlers = { onBeginDrag, onMoveDrag, onFinishDrag, onCancelDrag };

  return (
    <section className="min-h-0 min-w-0" aria-label="Klasės šventės stalas">
      <div className="grid h-full w-full grid-rows-[minmax(58px,.75fr)_minmax(108px,2fr)_minmax(54px,.7fr)] gap-2 rounded-[48%/18%] border-[5px] border-navy bg-table px-[clamp(24px,3vw,54px)] py-3 shadow-[inset_0_0_0_7px_#a7503d,0_8px_0_rgba(23,35,63,.25)]">
        <TableZone category="papildomai" title="Papuošimai" items={selectedByCategory("papildomai")} selection={selection} onRemove={onRemove} {...dragHandlers} />
        <div className="grid min-h-0 grid-cols-2">
          <TableZone
            category="gerimai"
            title="Gėrimai"
            items={selectedByCategory("gerimai")}
            selection={selection}
            people={plan.participants}
            covered={plan.drinkPortions}
            attention={showProblems && (plan.participants === undefined ? !plan.hasDrink : plan.drinkPortions < plan.participants)}
            onRemove={onRemove}
            {...dragHandlers}
          />
          <TableZone
            category="uzkandziai"
            title="Užkandžiai"
            items={selectedByCategory("uzkandziai")}
            selection={selection}
            people={plan.participants}
            covered={plan.snackPortions}
            attention={showProblems && (plan.participants === undefined ? !plan.hasSnack : plan.snackPortions < plan.participants)}
            onRemove={onRemove}
            {...dragHandlers}
          />
        </div>
        <TableZone category="veikla" title="Bendra veikla" items={selectedByCategory("veikla")} selection={selection} attention={showProblems && !plan.hasActivity} onRemove={onRemove} {...dragHandlers} />
      </div>
    </section>
  );
}

type TableZoneProps = {
  category: CategoryId;
  title: string;
  items: readonly GameItem[];
  selection: Selection;
  people?: number;
  covered?: number;
  attention?: boolean;
  onRemove: (item: GameItem) => void;
  onBeginDrag: BeginDrag;
  onMoveDrag: DragPointerHandler;
  onFinishDrag: DragPointerHandler;
  onCancelDrag: DragPointerHandler;
};

function TableZone({ category, title, items, selection, people, covered = 0, attention = false, onRemove, onBeginDrag, onMoveDrag, onFinishDrag, onCancelDrag }: TableZoneProps) {
  return (
    <section
      className={classes(
        "relative isolate flex min-h-0 min-w-0 flex-col overflow-hidden px-3.5 py-2.5 transition before:pointer-events-none before:absolute before:inset-x-2.5 before:top-3 before:-z-10 before:text-center before:text-[clamp(25px,3vw,46px)] before:font-black before:uppercase before:leading-[.9] before:tracking-[-.045em] before:text-cream/40 before:content-[attr(data-zone-title)]",
        category === "papildomai" && "border-b-[3px] border-navy/50",
        category === "gerimai" && "border-r-[3px] border-navy/50",
        category === "veikla" && "border-t-[3px] border-navy/50",
        attention && "animate-zone-pulse bg-coral/60",
      )}
      data-drop-category={category}
      data-zone-title={title}
      aria-label={title}
    >
      <div className="flex min-h-8 flex-1 flex-wrap items-center justify-center gap-1.5">
        {items.map((item) => {
          const quantity = selection[item.id] ?? 0;
          return (
            <div
              key={item.id}
              className="relative grid max-w-36 cursor-grab touch-none select-none grid-cols-[25px_minmax(0,1fr)_auto] items-center gap-1 rounded-2xl border-2 border-navy bg-white py-1 pl-1 pr-2 shadow-[0_3px_0_#17233f]"
              role="button"
              tabIndex={0}
              aria-label={`${item.name}, kiekis ${quantity}. Palieskite, kad nuimtumėte vieną.`}
              onPointerDown={(event) => onBeginDrag(event, item, "table")}
              onPointerMove={onMoveDrag}
              onPointerUp={onFinishDrag}
              onPointerCancel={onCancelDrag}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                onRemove(item);
              }}
            >
              <span className={classes("grid size-6 place-items-center rounded-full border-2 border-navy text-[10px] font-black", CATEGORY_ACCENT[item.category])} aria-hidden="true">{item.name.slice(0, 1)}</span>
              <strong className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[9px] leading-none">{item.name}</strong>
              {quantity > 1 && <b className="min-w-7 rounded-lg bg-yellow px-1.5 py-1 text-center text-[13px]">×{quantity}</b>}
            </div>
          );
        })}
      </div>
      {(category === "gerimai" || category === "uzkandziai") && <SeatDots people={people} covered={covered} hasChoice={items.length > 0} />}
    </section>
  );
}

function SeatDots({ people, covered, hasChoice }: { people?: number; covered: number; hasChoice: boolean }) {
  if (people === undefined) {
    return hasChoice ? null : <div className="relative z-10 mt-2 rounded-xl bg-cream/20 px-2.5 py-2 text-center text-sm font-black text-red-dark">Dar nepasirinkta</div>;
  }

  const filled = Math.min(people, covered);
  return (
    <div className="relative z-10 mt-2 grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl bg-cream/20 px-2.5 py-2">
      <div className="flex flex-wrap gap-1" aria-hidden="true">
        {Array.from({ length: people }, (_, index) => (
          <i className={classes("size-3 rounded-full border-2 border-navy bg-cream", index < filled && "bg-teal")} key={index} />
        ))}
      </div>
      {covered < people && <strong className="min-w-24 text-right text-sm font-black text-red-dark">Trūksta {people - covered}</strong>}
    </div>
  );
}
