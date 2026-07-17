import { type CategoryId, type ChallengeId, type EventId, type GameItem, type GameConfig, type ItemId, type ItemTag } from "../../domain";
import { ITEM_ART_SOURCES } from "../../itemArt";
import { CATEGORIES, classes, formatEuros } from "../../ui";
import { ChallengeStrip } from "./ChallengeStrip";
import { EventStrip } from "./EventStrip";

type SupplyShelfProps = {
  game: GameConfig;
  addableItemIds: ReadonlySet<ItemId>;
  category: CategoryId;
  completedChallengeIds: ReadonlySet<ChallengeId>;
  activeEventIds: readonly EventId[];
  revealedEventIds: readonly EventId[];
  eventCardsNeedAttention: boolean;
  shoppingCardOwned: boolean;
  shoppingCardSelected: boolean;
  onCategory: (category: CategoryId) => void;
  onPlace: (item: GameItem) => void;
  onToggleShoppingCardDiscount: (item: GameItem) => void;
  onOpenChallenges: () => void;
  onOpenEvents: () => void;
};

export function SupplyShelf({ game, addableItemIds, category, completedChallengeIds, activeEventIds, revealedEventIds, eventCardsNeedAttention, shoppingCardOwned, shoppingCardSelected, onCategory, onPlace, onToggleShoppingCardDiscount, onOpenChallenges, onOpenEvents }: SupplyShelfProps) {
  const categoryItems = game.items.filter((item) => item.category === category);

  return (
    <aside className="flex min-h-0 min-w-0 flex-col" aria-label="Daiktų pasirinkimai">
      <div className="flex min-h-0 flex-1 flex-col gap-1 pt-11">
        <div className="shelf-items game-scrollbar min-h-0 pr-2">
          <div className="grid content-center gap-0 [grid-auto-rows:4.75rem]">
            {categoryItems.map((item) => (
              <ShelfItem
                key={item.id}
                item={item}
                unavailable={!addableItemIds.has(item.id)}
                shoppingCardEligible={shoppingCardOwned && item.price + (item.shoppingCardDiscount ?? 0) > 0}
                shoppingCardSelected={shoppingCardSelected}
                onPlace={() => onPlace(item)}
                onToggleShoppingCardDiscount={() => onToggleShoppingCardDiscount(item)}
              />
            ))}
          </div>
        </div>
        <div className="mt-1 grid shrink-0 grid-cols-2 gap-1" aria-label="Pasirinkimų grupės">
          {CATEGORIES.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={category === item.id}
              className={classes(
                "min-h-11 rounded-lg border-[0.125rem] border-navy bg-cream px-1 text-[0.9375rem] font-black text-navy",
                (item.id === "papildomai" || item.id === "veikla") && "col-span-2",
                category === item.id && "bg-yellow shadow-[inset_0_-0.1875rem_0_#e1a72b]",
              )}
              onClick={() => onCategory(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="shrink-0">
          <ChallengeStrip completedChallengeIds={completedChallengeIds} onOpen={onOpenChallenges} />
        </div>
      </div>
      <div className="mt-auto shrink-0">
        <EventStrip
          activeEventIds={activeEventIds}
          revealedEventIds={revealedEventIds}
          attention={eventCardsNeedAttention}
          onOpen={onOpenEvents}
        />
      </div>
    </aside>
  );
}

type ShelfItemProps = {
  item: GameItem;
  unavailable: boolean;
  shoppingCardEligible: boolean;
  shoppingCardSelected: boolean;
  onPlace: () => void;
  onToggleShoppingCardDiscount: () => void;
};

function ShelfItem({ item, unavailable, shoppingCardEligible, shoppingCardSelected, onPlace, onToggleShoppingCardDiscount }: ShelfItemProps) {
  const hypeTags = item.tags?.filter((tag) => tag.tone === "hype") ?? [];
  const standardTags = item.tags?.filter((tag) => tag.tone === "standard") ?? [];
  const displayTags = [...standardTags, ...hypeTags];
  const originalPrice = item.originalPrice;
  const shoppingCardDiscount = item.shoppingCardDiscount ?? 0;
  const priceBeforeShoppingCard = item.price + shoppingCardDiscount;
  const priceIncreased = originalPrice !== undefined && priceBeforeShoppingCard > originalPrice;
  const priceDecreased = shoppingCardDiscount > 0;
  const shoppingCardTarget = shoppingCardEligible && shoppingCardSelected;
  const actionLabel = shoppingCardTarget
    ? priceDecreased
      ? "Pašalinti pirkėjo kortelės nuolaidą."
      : "Pritaikyti pirkėjo kortelės nuolaidą."
    : item.locked === true
      ? "Užrakinta."
      : unavailable
        ? "Daugiau pridėti negalima."
        : "Palieskite, kad pridėtumėte ant stalo.";
  const priceChangeLabel = [
    priceIncreased ? `kaina padidėjo nuo ${formatEuros(originalPrice)} iki ${formatEuros(priceBeforeShoppingCard)}` : null,
    priceDecreased ? `pirkėjo kortelė kainą sumažino ${formatEuros(shoppingCardDiscount)} iki ${formatEuros(item.price)}` : null,
  ].filter((label) => label !== null).join(", ");

  return (
    <button
      className={classes(
        "relative flex min-h-0 w-full select-none items-end pt-3 text-left outline-none transition focus-visible:ring-[0.25rem] focus-visible:ring-yellow",
        unavailable && !shoppingCardTarget ? "cursor-not-allowed grayscale opacity-45" : "active:translate-y-0.5",
      )}
      type="button"
      disabled={unavailable && !shoppingCardTarget}
      aria-label={`${item.name}, ${priceChangeLabel === "" ? formatEuros(item.price) : priceChangeLabel}${item.portions === undefined ? "" : `, porcijų skaičius ${item.portions}`}. ${actionLabel}`}
      onClick={shoppingCardTarget ? onToggleShoppingCardDiscount : onPlace}
    >
      <div className={classes(
        "relative isolate grid h-16 w-full grid-cols-[4.75rem_minmax(0,1fr)_auto] items-center gap-2 rounded-full border-[0.1875rem] border-navy bg-paper pl-1 shadow-[0_0.1875rem_0_#17233f] transition",
        shoppingCardTarget && "shopping-card-target-highlight ring-[0.25rem] ring-blue ring-offset-1",
      )}>
        <div className="relative z-10 h-full w-[4.75rem]" aria-hidden="true">
          <img
            className={classes(
              "absolute -left-1 bottom-0 size-20 object-contain object-bottom",
              item.hype === true && !unavailable && "hype-item-icon-wiggle",
            )}
            src={ITEM_ART_SOURCES[item.art]}
            alt=""
            draggable={false}
          />
          {item.portions !== undefined && <span className="absolute bottom-[0.1875rem] right-0 text-[1.875rem] font-black leading-none text-white [-webkit-text-stroke:0.25rem_#17233f] [paint-order:stroke_fill]">{item.portions}</span>}
        </div>
        <div className="min-w-0 self-center pl-1">
          <strong className="block text-[1.1875rem] leading-[1.05]">{item.name}</strong>
        </div>
        <div className={classes(
          "grid h-full aspect-square place-items-center self-center justify-self-center rounded-full bg-yellow text-center text-xl font-black tracking-[-0.06em] text-orange-dark",
          priceIncreased && !priceDecreased && "!text-[#d21f2b]",
          priceDecreased && "!bg-blue !text-[#102a56]",
        )}>{formatEuros(item.price)}</div>
        {item.hype === true && !unavailable && (
          <span className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-full" aria-hidden="true">
            <span className="hype-card-sheen absolute inset-y-0 left-0 w-2/5" />
          </span>
        )}
        <ItemTags tags={displayTags} />
      </div>
    </button>
  );
}

function ItemTags({ tags }: { tags: readonly ItemTag[] }) {
  if (tags.length === 0) return null;

  return (
    <span className="absolute right-2 top-0 z-30 flex -translate-y-1/2 items-center gap-1">
      {tags.map((tag) => (
        <span
          className={classes(
            "rounded-full border-navy font-black leading-none tracking-[-0.01em]",
            tag.tone === "hype"
              ? "hype-tag-pulse -rotate-2 border-[0.1875rem] bg-blue px-2 py-1 text-[0.6875rem] shadow-[0_0.125rem_0_#17233f]"
              : "border-[0.125rem] bg-yellow px-2 py-0.5 text-[0.625rem]",
          )}
          key={`${tag.tone}:${tag.label}`}
        >
          <span className="relative top-[0.0625rem]">{tag.label}</span>
        </span>
      ))}
    </span>
  );
}
