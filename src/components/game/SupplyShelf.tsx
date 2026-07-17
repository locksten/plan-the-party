import type { ReactNode } from "react";
import { canAddItem, type CategoryId, type GameItem, type GameMode, type GamePlan, type MysteryEvent, type MysteryEventId, type Selection } from "../../game";
import { ITEM_ART_SOURCES } from "../../itemArt";
import { CATEGORIES, classes, formatEuros } from "../../ui";
import { ChallengeStrip } from "./ChallengeStrip";
import { EventStrip } from "./EventStrip";
import type { BeginDrag, DragPointerHandler } from "./drag";

type SupplyShelfProps = {
  mode: GameMode;
  plan: GamePlan;
  selection: Selection;
  category: CategoryId;
  activeEvents: readonly MysteryEvent[];
  revealedEventIds: readonly MysteryEventId[];
  onCategory: (category: CategoryId) => void;
  onQuantity: (item: GameItem, change: -1 | 1) => void;
  onOpenChallenges: () => void;
  onOpenEvents: () => void;
  onBeginDrag: BeginDrag;
  onMoveDrag: DragPointerHandler;
  onFinishDrag: DragPointerHandler;
  onCancelDrag: DragPointerHandler;
  controls: ReactNode;
};

export function SupplyShelf({ mode, plan, selection, category, activeEvents, revealedEventIds, onCategory, onQuantity, onOpenChallenges, onOpenEvents, onBeginDrag, onMoveDrag, onFinishDrag, onCancelDrag, controls }: SupplyShelfProps) {
  const categoryItems = mode.items.filter((item) => item.category === category);

  return (
    <aside className="flex min-h-0 min-w-0 flex-col" data-drop-shelf aria-label="Daiktų pasirinkimai">
      <div className="grid gap-1 pt-10">
        <div className="grid min-h-0 grid-rows-[repeat(5,76px)] content-center gap-0">
          {categoryItems.map((item) => (
            <ShelfItem
              key={item.id}
              item={item}
              unavailable={!canAddItem(mode, selection, item)}
              onPlace={() => onQuantity(item, 1)}
              onPointerDown={(event) => onBeginDrag(event, item, "shelf")}
              onPointerMove={onMoveDrag}
              onPointerUp={onFinishDrag}
              onPointerCancel={onCancelDrag}
            />
          ))}
        </div>
        <div className="mt-1 grid grid-cols-2 gap-1" aria-label="Pasirinkimų grupės">
          {CATEGORIES.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={category === item.id}
              className={classes(
                "min-h-11 rounded-lg border-2 border-navy bg-cream px-1 text-[15px] font-black text-navy",
                (item.id === "papildomai" || item.id === "veikla") && "col-span-2",
                category === item.id && "bg-yellow shadow-[inset_0_-3px_0_#e1a72b]",
              )}
              onClick={() => onCategory(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="hidden">{controls}</div>
        <ChallengeStrip mode={mode} plan={plan} selection={selection} onOpen={onOpenChallenges} />
      </div>
      <div className="mt-auto">
        <EventStrip mode={mode} activeEvents={activeEvents} revealedEventIds={revealedEventIds} onOpen={onOpenEvents} />
      </div>
    </aside>
  );
}

type ShelfItemProps = {
  item: GameItem;
  unavailable: boolean;
  onPlace: () => void;
  onPointerDown: DragPointerHandler;
  onPointerMove: DragPointerHandler;
  onPointerUp: DragPointerHandler;
  onPointerCancel: DragPointerHandler;
};

function ShelfItem({ item, unavailable, onPlace, onPointerDown, onPointerMove, onPointerUp, onPointerCancel }: ShelfItemProps) {
  return (
    <div
      className={classes(
        "relative flex min-h-0 touch-none select-none items-end pt-3 outline-none transition focus-visible:ring-4 focus-visible:ring-yellow",
        unavailable ? "cursor-not-allowed grayscale opacity-45" : "cursor-grab active:translate-y-0.5 active:cursor-grabbing",
      )}
      role="button"
      tabIndex={unavailable ? -1 : 0}
      aria-disabled={unavailable}
      aria-label={`${item.name}, ${formatEuros(item.price)}${item.portions === undefined ? "" : `, porcijų skaičius ${item.portions}`}. ${unavailable ? "Daugiau pridėti negalima." : "Palieskite arba tempkite ant stalo."}`}
      onPointerDown={unavailable ? undefined : onPointerDown}
      onPointerMove={unavailable ? undefined : onPointerMove}
      onPointerUp={unavailable ? undefined : onPointerUp}
      onPointerCancel={unavailable ? undefined : onPointerCancel}
      onKeyDown={(event) => {
        if (unavailable || (event.key !== "Enter" && event.key !== " ")) return;
        event.preventDefault();
        onPlace();
      }}
    >
      <div className="relative grid h-16 w-full grid-cols-[76px_minmax(0,1fr)_auto] items-center gap-2 rounded-full border-[3px] border-navy bg-paper pl-1 shadow-[0_3px_0_#17233f]">
        <div className="relative z-10 h-full w-[76px]" aria-hidden="true">
          <img className="absolute -left-1 bottom-0 size-20 object-contain object-bottom" src={ITEM_ART_SOURCES[item.art]} alt="" draggable={false} />
          {item.portions !== undefined && <span className="absolute bottom-0 right-0 text-[30px] font-black leading-none text-white [-webkit-text-stroke:4px_#17233f] [paint-order:stroke_fill]">{item.portions}</span>}
        </div>
        <div className="min-w-0 self-center">
          <strong className="block text-[17px] leading-[1.05]">{item.name}</strong>
        </div>
        <div className="grid size-[58px] place-items-center self-center justify-self-center rounded-full bg-yellow text-center text-xl font-black tracking-[-.06em] text-orange-dark">{formatEuros(item.price)}</div>
        {item.tag !== undefined && (
          <span
            className={classes(
              "absolute top-0 -translate-y-1/2 rounded-full border-navy font-black leading-none tracking-[-.01em]",
              item.hype === true
                ? "right-2 -rotate-2 border-[3px] bg-blue px-2 py-1 text-[11px] shadow-[0_2px_0_#17233f]"
                : "right-3 border-2 bg-yellow px-2 py-0.5 text-[10px]",
            )}
          >
            {item.tag}
          </span>
        )}
      </div>
    </div>
  );
}
