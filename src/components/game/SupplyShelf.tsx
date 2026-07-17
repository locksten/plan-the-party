import type { CategoryId, GameItem, Selection } from "../../game";
import { ITEM_ART_SOURCES } from "../../itemArt";
import { CATEGORIES, CATEGORY_ACCENT, classes, formatEuros } from "../../ui";
import type { BeginDrag, DragPointerHandler } from "./drag";

type SupplyShelfProps = {
  items: readonly GameItem[];
  selection: Selection;
  category: CategoryId;
  onCategory: (category: CategoryId) => void;
  onQuantity: (item: GameItem, change: -1 | 1) => void;
  onBeginDrag: BeginDrag;
  onMoveDrag: DragPointerHandler;
  onFinishDrag: DragPointerHandler;
  onCancelDrag: DragPointerHandler;
};

export function SupplyShelf({ items, selection, category, onCategory, onQuantity, onBeginDrag, onMoveDrag, onFinishDrag, onCancelDrag }: SupplyShelfProps) {
  const categoryItems = items.filter((item) => item.category === category);

  return (
    <aside className="relative grid min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)] gap-2 overflow-hidden rounded-xl border-4 border-navy bg-shelf p-3 shadow-[0_5px_0_#17233f]" data-drop-shelf aria-label="Daiktų pasirinkimai">
      <div className="grid grid-cols-2 gap-1" aria-label="Pasirinkimų grupės">
        {CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={category === item.id}
            className={classes(
              "min-h-9 rounded-lg border-2 border-navy bg-cream px-1 text-[11px] font-black text-navy",
              (item.id === "papildomai" || item.id === "veikla") && "col-span-2",
              category === item.id && "bg-yellow shadow-[inset_0_-3px_0_#e1a72b]",
            )}
            onClick={() => onCategory(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="grid min-h-0 grid-rows-5 gap-1.5">
        {categoryItems.map((item) => (
          <ShelfItem
            key={item.id}
            item={item}
            quantity={selection[item.id] ?? 0}
            onPlace={() => onQuantity(item, 1)}
            onPointerDown={(event) => onBeginDrag(event, item, "shelf")}
            onPointerMove={onMoveDrag}
            onPointerUp={onFinishDrag}
            onPointerCancel={onCancelDrag}
          />
        ))}
      </div>
    </aside>
  );
}

type ShelfItemProps = {
  item: GameItem;
  quantity: number;
  onPlace: () => void;
  onPointerDown: DragPointerHandler;
  onPointerMove: DragPointerHandler;
  onPointerUp: DragPointerHandler;
  onPointerCancel: DragPointerHandler;
};

function ShelfItem({ item, quantity, onPlace, onPointerDown, onPointerMove, onPointerUp, onPointerCancel }: ShelfItemProps) {
  return (
    <div
      className="relative grid min-h-0 cursor-grab touch-none select-none grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-2 rounded-lg border-[3px] border-navy bg-paper px-2 py-1.5 shadow-[0_3px_0_#17233f] active:translate-y-0.5 active:cursor-grabbing active:shadow-[0_2px_0_#17233f]"
      role="button"
      tabIndex={0}
      aria-label={`${item.name}, ${formatEuros(item.price)}. Palieskite arba tempkite ant stalo.`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        onPlace();
      }}
    >
      {item.art === undefined ? (
        <div className={classes("grid size-[42px] place-items-center rounded-[50%_50%_42%_42%] border-[3px] border-navy text-lg font-black", CATEGORY_ACCENT[item.category])} aria-hidden="true">
          {item.name.slice(0, 1)}
        </div>
      ) : (
        <img className="size-[42px] object-contain" src={ITEM_ART_SOURCES[item.art]} alt="" aria-hidden="true" draggable={false} />
      )}
      <div className="min-w-0">
        <strong className="block text-[13px] leading-[1.05]">{item.name}</strong>
        <small className="mt-0.5 block font-sans text-[9px] text-muted">{item.note}</small>
        {item.pitch !== undefined && <span className="mt-0.5 inline-block rounded bg-yellow px-1 py-0.5 text-[8px] font-black leading-none tracking-[-.01em]">{item.pitch}</span>}
      </div>
      <div className="rounded-lg border-2 border-navy bg-yellow px-1.5 py-1 text-sm font-black">{formatEuros(item.price)}</div>
      {quantity > 0 && <span className="absolute -right-2 -top-2 rounded-lg border-2 border-navy bg-coral px-1.5 py-0.5 text-[9px] font-black">Ant stalo: {quantity}</span>}
    </div>
  );
}
