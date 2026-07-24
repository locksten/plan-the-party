import { assert } from "../../assert";
import { LONG_LASTING_FOOD_SOURCE } from "../../completionArt";
import { SHOPPING_CARD_DISCOUNT, type CategoryId, type GamePlan, type ItemId, type ResolvedPlacement } from "../../domain";
import { META_ART_SOURCES } from "../../metaArt";
import { classes } from "../../ui";
import { useAutoAnimateRef } from "../../useAutoAnimateRef";
import { ItemImage, ItemQuantity } from "./ItemImage";
import { useI18n } from "../../i18n/I18nProvider";

type PartyTableProps = {
  placements: readonly ResolvedPlacement[];
  selectedItemIds: ReadonlySet<ItemId>;
  plan: GamePlan;
  shoppingCardOwned: boolean;
  shoppingCardSelected: boolean;
  showProblems: boolean;
  onShoppingCardSelectedChange: (selected: boolean) => void;
  onRemoveAt: (selectionIndex: number) => void;
};

export function PartyTable({ placements, selectedItemIds, plan, shoppingCardOwned, shoppingCardSelected, showProblems, onShoppingCardSelectedChange, onRemoveAt }: PartyTableProps) {
  const { translations, formatCurrency } = useI18n();
  const selectedByCategory = (category: CategoryId) => placements.filter((placement) => placement.item.category === category);
  const needsDecoration = showProblems && plan.decorationChoices < plan.requiredDecorationChoices;
  const needsDrinks = showProblems && plan.drinkPortions < plan.participants.total;
  const needsSnacks = showProblems && plan.snackPortions < plan.participants.total;
  const needsActivity = showProblems && plan.activityChoices < plan.requiredActivityChoices;

  return (
    <section className="h-full min-h-0 min-w-0" aria-label={translations.table.label}>
      <div className="relative isolate h-full w-full overflow-visible rounded-[48%/18%] border-[0.3125rem] border-navy bg-table shadow-[inset_0_0_0_0.4375rem_#a7503d,0_0.5rem_0_rgba(23,35,63,0.25)]">
        <DecorationEffects selectedItemIds={selectedItemIds} />

        {shoppingCardOwned && (
          <button
            className={classes(
              "absolute bottom-[clamp(2.25rem,3vw,3.25rem)] left-[clamp(3rem,4vw,4.5rem)] z-[15] h-[clamp(3.05rem,4.49vw,4.17rem)] aspect-[1.559] select-none rounded-[12%] outline-none transition duration-300 ease-out focus-visible:ring-[0.25rem] focus-visible:ring-blue focus-visible:ring-offset-1",
              shoppingCardSelected
                ? "-translate-x-1/2 -translate-y-full -rotate-[30deg] ring-[0.25rem] ring-blue ring-offset-1"
                : "-rotate-6 active:translate-y-0.5",
            )}
            type="button"
            aria-pressed={shoppingCardSelected}
            aria-label={translations.table.shoppingCard(formatCurrency(SHOPPING_CARD_DISCOUNT))}
            onClick={() => onShoppingCardSelectedChange(!shoppingCardSelected)}
          >
            <img className="size-full object-contain" src={META_ART_SOURCES["shopping-card"]} alt="" draggable={false} />
          </button>
        )}

        <TableAttentionOverlay
          needsDecoration={needsDecoration}
          needsDrinks={needsDrinks}
          needsSnacks={needsSnacks}
          needsActivity={needsActivity}
        />

        <div className={TABLE_GRID_CLASS_NAME}>
          <TableZone
            category="decorations"
            title={translations.categories.decorations}
            items={selectedByCategory("decorations")}
            selectedChoices={plan.decorationChoices}
            requiredChoices={plan.requiredDecorationChoices}
            onRemoveAt={onRemoveAt}
          />
          <div className="grid min-h-0 grid-cols-2">
            <TableZone
              category="drinks"
              title={translations.categories.drinks}
              items={selectedByCategory("drinks")}
              people={plan.participants.total}
              covered={plan.drinkPortions}
              onRemoveAt={onRemoveAt}
            />
            <TableZone
              category="snacks"
              title={translations.categories.snacks}
              items={selectedByCategory("snacks")}
              people={plan.participants.total}
              covered={plan.snackPortions}
              carried={plan.carriedSnackPortions}
              eventSupplied={plan.eventSuppliedSnackPortions}
              onRemoveAt={onRemoveAt}
            />
          </div>
          <TableZone
            category="activities"
            title={translations.categories.activities}
            items={selectedByCategory("activities")}
            selectedChoices={plan.activityChoices}
            requiredChoices={plan.requiredActivityChoices}
            onRemoveAt={onRemoveAt}
          />
        </div>
      </div>
    </section>
  );
}

const TABLE_GRID_CLASS_NAME = "grid h-full w-full grid-rows-[minmax(3.625rem,0.75fr)_minmax(6.75rem,2fr)_minmax(3.375rem,0.7fr)] gap-2 px-[clamp(1.5rem,3vw,3.375rem)] py-3";

function TableAttentionOverlay({ needsDecoration, needsDrinks, needsSnacks, needsActivity }: {
  needsDecoration: boolean;
  needsDrinks: boolean;
  needsSnacks: boolean;
  needsActivity: boolean;
}) {
  return (
    <div className="table-surface-clip pointer-events-none absolute inset-0 z-[5] overflow-hidden" aria-hidden="true">
      <div className={TABLE_GRID_CLASS_NAME}>
        <AttentionHighlight attention={needsDecoration} className="-mb-2 -mt-3" />
        <div className="grid min-h-0 grid-cols-2">
          <AttentionHighlight attention={needsDrinks} className="-my-2" />
          <AttentionHighlight attention={needsSnacks} className="-my-2" />
        </div>
        <AttentionHighlight attention={needsActivity} className="-mb-3 -mt-2" />
      </div>
    </div>
  );
}

function AttentionHighlight({ attention, className }: { attention: boolean; className?: string }) {
  return <div className={classes(className, attention && "animate-zone-pulse bg-coral/60")} />;
}

function DecorationEffects({ selectedItemIds }: { selectedItemIds: ReadonlySet<ItemId> }) {
  return (
    <div className="table-surface-clip pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {selectedItemIds.has("tablecloth") && (
        <div className="tablecloth-effect absolute inset-0" />
      )}

      {selectedItemIds.has("party-light-projector") && (
        <div className="projector-light-effect absolute inset-0" />
      )}
    </div>
  );
}

type TableZoneProps = {
  category: CategoryId;
  title: string;
  items: readonly ResolvedPlacement[];
  people?: number;
  covered?: number;
  carried?: number;
  eventSupplied?: number;
  selectedChoices?: number;
  requiredChoices?: number;
  onRemoveAt: (selectionIndex: number) => void;
};

const zoneItemAlignment: Readonly<Record<CategoryId, string>> = {
  drinks: "translate-y-4",
  snacks: "translate-y-4",
  decorations: "translate-y-2",
  activities: "translate-y-3.5",
};

function TableZone({ category, title, items, people, covered = 0, carried = 0, eventSupplied = 0, selectedChoices, requiredChoices, onRemoveAt }: TableZoneProps) {
  const { translations } = useI18n();
  const itemsRef = useAutoAnimateRef<HTMLDivElement>({ duration: 220, easing: "ease-out" });

  return (
    <section
      className={classes(
        "relative z-10 isolate flex min-h-0 min-w-0 flex-col gap-2 overflow-visible px-3.5 py-2.5 before:pointer-events-none before:absolute before:inset-x-2.5 before:top-3 before:-z-10 before:text-center before:text-[clamp(1.5625rem,3vw,2.875rem)] before:font-black before:uppercase before:leading-[0.9] before:tracking-[-0.045em] before:text-cream before:opacity-40 before:content-[attr(data-zone-title)]",
        category === "decorations" && "border-b-[0.1875rem] border-navy/50",
        category === "drinks" && "border-r-[0.1875rem] border-navy/50",
        category === "activities" && "border-t-[0.1875rem] border-navy/50",
      )}
      data-zone-title={title}
      aria-label={title}
    >
      <div
        ref={itemsRef}
        className={classes(
          "flex min-h-8 flex-1 flex-wrap content-center items-center justify-center gap-1",
          zoneItemAlignment[category],
        )}
      >
        {items.map(({ placementId, item, selectionIndex }) => (
          <button
            key={placementId}
            className="relative h-[clamp(4.6875rem,9vw,9.125rem)] max-h-full aspect-square shrink-0 select-none"
            type="button"
            aria-label={translations.table.removeItem(translations.items[item.id], item.portions)}
            onClick={() => onRemoveAt(selectionIndex)}
          >
            <ItemImage item={item} className="size-full" />
          </button>
        ))}
      </div>
      {category === "snacks" && carried > 0 && <CarriedSnackItem portions={carried} />}
      {(category === "drinks" || category === "snacks") && (
        <SeatDots
          items={items}
          people={people}
          covered={covered}
          carried={carried}
          eventSupplied={eventSupplied}
        />
      )}
      {(category === "decorations" || category === "activities") && (
        <ChoiceDots selected={selectedChoices} required={requiredChoices} />
      )}
    </section>
  );
}

function CarriedSnackItem({ portions }: { portions: number }) {
  const { translations } = useI18n();
  assert(Number.isInteger(portions) && portions > 0, "Carried snack portions must be a positive integer.");
  const className = "absolute bottom-[2.75rem] left-1.5 z-20 size-[clamp(4.25rem,6vw,5.75rem)]";
  return (
    <div className={`${className} pointer-events-none`} role="img" aria-label={translations.table.carriedFood(portions)}>
      <img
        className="size-full object-contain"
        src={LONG_LASTING_FOOD_SOURCE}
        alt=""
        draggable={false}
      />
      <ItemQuantity quantity={portions} size="small" />
    </div>
  );
}

function SeatDots({ items, people, covered, carried, eventSupplied }: {
  items: readonly ResolvedPlacement[];
  people: number | undefined;
  covered: number;
  carried: number;
  eventSupplied: number;
}) {
  const { translations } = useI18n();
  assert(people !== undefined, "Drink and snack zones require a participant count.");
  const filled = Math.min(people, covered);
  const carriedFilled = Math.min(filled, carried);
  const eventFilled = Math.min(filled - carriedFilled, eventSupplied);
  const excess = Math.max(0, covered - people);
  const label = excess === 0 ? translations.table.portionsCovered(filled, people) : translations.table.portionsWithExtra(people, excess);
  const carriedLabel = carriedFilled > 0 ? translations.table.carriedDetail(carriedFilled) : "";
  const eventLabel = eventFilled > 0 ? translations.table.homemadeDetail(eventFilled) : "";
  const dotCount = people + excess;
  const empty = Math.max(0, people - covered);
  const groupSizes = portionDotGroupSizes(items, covered, carried, eventSupplied, empty);
  return (
    <QuantityDots
      count={dotCount}
      groupSizes={groupSizes}
      ungroupedFromIndex={empty > 0 ? filled : undefined}
      label={`${label}${carriedLabel}${eventLabel}`}
      classNameForIndex={(index) => classes(
        index < people && "border-[0.125rem] border-navy",
        index >= people
          ? "after:size-2 after:rounded-full after:bg-teal-medium after:content-['']"
          : index < carriedFilled
            ? "bg-yellow"
            : index < carriedFilled + eventFilled
              ? "bg-purple-soft"
              : index < filled ? "bg-teal" : "bg-cream",
      )}
    />
  );
}

function portionDotGroupSizes(
  items: readonly ResolvedPlacement[],
  covered: number,
  carried: number,
  eventSupplied: number,
  empty: number,
): readonly number[] {
  assert(Number.isInteger(covered) && covered >= 0, "Covered portions must be a non-negative integer.");
  assert(Number.isInteger(carried) && carried >= 0, "Carried portions must be a non-negative integer.");
  assert(Number.isInteger(eventSupplied) && eventSupplied >= 0, "Event-supplied portions must be a non-negative integer.");
  assert(Number.isInteger(empty) && empty >= 0, "Missing portions must be a non-negative integer.");

  const groups: number[] = [];
  let remaining = covered;
  const carriedGroup = Math.min(remaining, carried);
  if (carriedGroup > 0) groups.push(...groupsOfAtMostFive(carriedGroup));
  remaining -= carriedGroup;

  const eventGroup = Math.min(remaining, eventSupplied);
  if (eventGroup > 0) groups.push(eventGroup);
  remaining -= eventGroup;

  for (const { item } of items) {
    assert(item.portions !== undefined && Number.isInteger(item.portions) && item.portions > 0, "Every drink and snack item must provide a positive integer number of portions.");
    const itemGroup = Math.min(remaining, item.portions);
    if (itemGroup > 0) groups.push(itemGroup);
    remaining -= itemGroup;
  }
  assert(remaining === 0, "Portion groups must account for every available portion.");

  groups.push(...Array.from({ length: empty }, () => 1));
  return groups;
}

function groupsOfAtMostFive(count: number): readonly number[] {
  return Array.from({ length: Math.ceil(count / 5) }, (_, groupIndex) => Math.min(5, count - groupIndex * 5));
}

function ChoiceDots({ selected, required }: { selected: number | undefined; required: number | undefined }) {
  const { translations } = useI18n();
  assert(selected !== undefined && required !== undefined, "Activity and decoration zones require choice counts.");
  assert(Number.isInteger(selected) && selected >= 0, "The selected choice count must be a non-negative integer.");
  assert(Number.isInteger(required) && required >= 0, "The required choice count must be a non-negative integer.");
  const dotCount = Math.max(selected, required);
  if (dotCount === 0) return null;

  const label = required === 0
    ? translations.table.choicesSelected(selected)
    : translations.table.choicesRequired(selected, required);

  return (
    <QuantityDots
      count={dotCount}
      label={label}
      classNameForIndex={(index) => classes(
        index < required && "border-[0.125rem] border-navy",
        index >= required
          ? "after:size-2 after:rounded-full after:bg-teal-medium after:content-['']"
          : index < selected ? "bg-teal" : "bg-cream",
      )}
    />
  );
}

function QuantityDots({ count, groupSizes, ungroupedFromIndex, label, classNameForIndex }: {
  count: number;
  groupSizes?: readonly number[];
  ungroupedFromIndex?: number;
  label: string;
  classNameForIndex: (index: number) => string;
}) {
  assert(Number.isInteger(count) && count > 0, "The dot count must be a positive integer.");
  const resolvedGroupSizes = groupSizes ?? groupsOfAtMostFive(count);
  assert(resolvedGroupSizes.every((size) => Number.isInteger(size) && size > 0), "Every dot group must contain at least one dot.");
  assert(resolvedGroupSizes.reduce((total, size) => total + size, 0) === count, "Dot groups must account for every dot.");
  let nextIndex = 0;
  const groups = resolvedGroupSizes.map((size) => {
    const group = Array.from({ length: size }, () => nextIndex++);
    return group;
  });
  if (ungroupedFromIndex !== undefined) {
    assert(Number.isInteger(ungroupedFromIndex) && ungroupedFromIndex >= 0 && ungroupedFromIndex < count, "The ungrouped-dot start index must be within the dot range.");
    assert(groups.every((group) => group.every((index) => index < ungroupedFromIndex) || group.every((index) => index >= ungroupedFromIndex)), "The ungrouped-dot boundary must not split a dot group.");
  }
  return (
    <div
      className="relative z-10 flex w-fit max-w-full flex-wrap items-center justify-start gap-x-0.5 gap-y-1 self-center"
      role="img"
      aria-label={label}
    >
      {groups.map((group, groupIndex) => (
        <span
          className={classes(
            "flex max-w-full flex-wrap items-center gap-0.5",
            groupIndex < groups.length - 1 && (ungroupedFromIndex === undefined || group[0] < ungroupedFromIndex) && "mr-2.5",
          )}
          key={group[0]}
          aria-hidden="true"
        >
          {group.map((index) => (
            <span
              className={classes(
                "flex size-4 items-center justify-center rounded-full",
                classNameForIndex(index),
              )}
              key={index}
            />
          ))}
        </span>
      ))}
    </div>
  );
}
