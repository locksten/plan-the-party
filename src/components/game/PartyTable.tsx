import { useAutoAnimate } from "@formkit/auto-animate/react";
import { assert, type CategoryId, type GameItem, type GamePlan, type Selection } from "../../game";
import { classes } from "../../ui";
import type { BeginDrag, DragPointerHandler } from "./drag";
import { ItemImage } from "./ItemImage";

type PlacedItem = {
  placementId: string;
  item: GameItem;
  selectionIndex: number;
};

type PartyTableProps = {
  items: readonly GameItem[];
  selection: Selection;
  plan: GamePlan;
  showProblems: boolean;
  onRemoveAt: (selectionIndex: number) => void;
  onBeginDrag: BeginDrag;
  onMoveDrag: DragPointerHandler;
  onFinishDrag: DragPointerHandler;
  onCancelDrag: DragPointerHandler;
};

export function PartyTable({ items, selection, plan, showProblems, onRemoveAt, onBeginDrag, onMoveDrag, onFinishDrag, onCancelDrag }: PartyTableProps) {
  const itemsById = new Map(items.map((item) => [item.id, item]));
  const selectedByCategory = (category: CategoryId): PlacedItem[] => selection.flatMap((entry, selectionIndex) => {
    const item = itemsById.get(entry.itemId);
    assert(item !== undefined, `Pasirinkta nežinoma prekė „${entry.itemId}“.`);
    return item.category === category ? [{ placementId: entry.placementId, item, selectionIndex }] : [];
  });
  const dragHandlers = { onBeginDrag, onMoveDrag, onFinishDrag, onCancelDrag };

  return (
    <section className="min-h-0 min-w-0" aria-label="Klasės šventės stalas">
      <div className="grid h-full w-full grid-rows-[minmax(58px,.75fr)_minmax(108px,2fr)_minmax(54px,.7fr)] gap-2 overflow-hidden rounded-[48%/18%] border-[5px] border-navy bg-table px-[clamp(24px,3vw,54px)] py-3 shadow-[inset_0_0_0_7px_#a7503d,0_8px_0_rgba(23,35,63,.25)]">
        <TableZone category="papildomai" title="Papuošimai" items={selectedByCategory("papildomai")} onRemoveAt={onRemoveAt} {...dragHandlers} />
        <div className="grid min-h-0 grid-cols-2">
          <TableZone
            category="gerimai"
            title="Gėrimai"
            items={selectedByCategory("gerimai")}
            people={plan.participants}
            covered={plan.drinkPortions}
            attention={showProblems && (plan.participants === undefined ? !plan.hasDrink : plan.drinkPortions < plan.participants)}
            onRemoveAt={onRemoveAt}
            {...dragHandlers}
          />
          <TableZone
            category="uzkandziai"
            title="Užkandžiai"
            items={selectedByCategory("uzkandziai")}
            people={plan.participants}
            covered={plan.snackPortions}
            carried={plan.carriedSnackPortions}
            attention={showProblems && (plan.participants === undefined ? !plan.hasSnack : plan.snackPortions < plan.participants)}
            onRemoveAt={onRemoveAt}
            {...dragHandlers}
          />
        </div>
        <TableZone category="veikla" title="Bendra veikla" items={selectedByCategory("veikla")} attention={showProblems && !plan.hasActivity} onRemoveAt={onRemoveAt} {...dragHandlers} />
      </div>
    </section>
  );
}

type TableZoneProps = {
  category: CategoryId;
  title: string;
  items: readonly PlacedItem[];
  people?: number;
  covered?: number;
  carried?: number;
  attention?: boolean;
  onRemoveAt: (selectionIndex: number) => void;
  onBeginDrag: BeginDrag;
  onMoveDrag: DragPointerHandler;
  onFinishDrag: DragPointerHandler;
  onCancelDrag: DragPointerHandler;
};

function TableZone({ category, title, items, people, covered = 0, carried = 0, attention = false, onRemoveAt, onBeginDrag, onMoveDrag, onFinishDrag, onCancelDrag }: TableZoneProps) {
  const [itemsRef] = useAutoAnimate<HTMLDivElement>({ duration: 220, easing: "ease-out" });

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
      <div
        ref={itemsRef}
        className={classes(
          "flex min-h-8 flex-1 flex-wrap content-center items-center justify-center gap-1",
          (category === "gerimai" || category === "uzkandziai") && "relative top-4",
          category === "papildomai" && "relative top-[7px]",
          category === "veikla" && "relative top-[13px]",
        )}
      >
        {items.map(({ placementId, item, selectionIndex }) => (
          <div
            key={placementId}
            className="relative h-[clamp(75px,9vw,146px)] max-h-full shrink-0 aspect-square cursor-grab touch-none select-none"
            role="button"
            tabIndex={0}
            aria-label={`${item.name}${item.portions === undefined ? "" : `, ${item.portions} porcijos`}. Palieskite, kad nuimtumėte vieną.`}
            onPointerDown={(event) => onBeginDrag(event, item, "table", selectionIndex)}
            onPointerMove={onMoveDrag}
            onPointerUp={onFinishDrag}
            onPointerCancel={onCancelDrag}
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              onRemoveAt(selectionIndex);
            }}
          >
            <ItemImage item={item} className="size-full motion-safe:animate-table-item-enter" />
          </div>
        ))}
      </div>
      {(category === "gerimai" || category === "uzkandziai") && <SeatDots people={people} covered={covered} carried={carried} hasChoice={items.length > 0} />}
    </section>
  );
}

function SeatDots({ people, covered, carried, hasChoice }: { people?: number; covered: number; carried: number; hasChoice: boolean }) {
  if (people === undefined) {
    return hasChoice ? null : <div className="relative z-10 mt-2 rounded-xl bg-cream/20 px-2.5 py-2 text-center text-sm font-black text-red-dark">Dar nepasirinkta</div>;
  }

  const filled = Math.min(people, covered);
  const carriedFilled = Math.min(filled, carried);
  const excess = Math.max(0, covered - people);
  const label = excess === 0 ? `${filled} porcijos iš ${people}` : `${people} porcijos ir ${excess} papildomos`;
  const carriedLabel = carriedFilled > 0 ? `, ${carriedFilled} iš ankstesnės šventės` : "";
  return (
    <div className="relative z-10 mt-2 w-fit max-w-full self-center rounded-xl bg-cream/20 px-2.5 py-2">
      <div className="flex flex-wrap items-center gap-[3px]" aria-label={`${label}${carriedLabel}`}>
        {Array.from({ length: people }, (_, index) => (
          <i
            className={classes(
              "size-[14px] rounded-full border-2 border-navy",
              index < carriedFilled ? "bg-yellow" : index < filled ? "bg-teal" : "bg-cream",
            )}
            key={index}
            aria-hidden="true"
          />
        ))}
        {excess > 0 && <strong className="ml-1 text-xs font-black leading-none">+{excess}</strong>}
      </div>
    </div>
  );
}
