import type { GameItem } from "../../game";
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
      {item.portions !== undefined && (
        <span className="absolute bottom-1 right-1 text-[38px] font-black leading-none text-white [-webkit-text-stroke:5px_#17233f] [paint-order:stroke_fill]">
          {item.portions}
        </span>
      )}
    </div>
  );
}
