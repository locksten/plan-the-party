import type { GameItem } from "../../domain";
import { ITEM_ART_SOURCES } from "../../itemArt";
import { classes } from "../../ui";

type ItemImageProps = {
  item: GameItem;
  className?: string;
};

export function ItemImage({ item, className }: ItemImageProps) {
  return (
    <div className={classes("relative aspect-square", className)} aria-hidden="true">
      <img className="size-full object-contain" src={ITEM_ART_SOURCES[item.art]} alt="" draggable={false} />
      {item.portions !== undefined && <ItemQuantity quantity={item.portions} />}
    </div>
  );
}

export function ItemQuantity({ quantity, size = "standard" }: { quantity: number; size?: "standard" | "small" }) {
  return (
    <span
      aria-hidden="true"
      className={classes(
        "absolute bottom-1 right-1 font-black leading-none text-white [paint-order:stroke_fill]",
        size === "standard"
          ? "text-[2.375rem] [-webkit-text-stroke:0.3125rem_#17233f]"
          : "text-[2rem] [-webkit-text-stroke:0.25rem_#17233f]",
      )}
    >
      {quantity}
    </span>
  );
}
