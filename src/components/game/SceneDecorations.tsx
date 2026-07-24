import { assert } from "../../assert";
import type { ItemId } from "../../domain";
import { COMPOST_BIN_SOURCE, PLANT_STAGE_SOURCES } from "../../metaArt";
import { PAPER_GARLAND_SOURCE } from "../../sceneArt";

type SceneDecorationsProps = {
  selectedItemIds: ReadonlySet<ItemId>;
  plantGrowth: number;
  compostBinOwned: boolean;
};

export function SceneDecorations({ selectedItemIds, plantGrowth, compostBinOwned }: SceneDecorationsProps) {
  const showsPaperGarland = selectedItemIds.has("paper-tassel-garland");
  const plantSource = PLANT_STAGE_SOURCES[plantGrowth];
  assert(plantSource !== undefined, `Unknown plant growth stage "${plantGrowth}".`);
  const plantClassName = "layer-plant absolute bottom-0 right-[-2.5rem] aspect-[368/903] translate-x-[18%]";
  const plantStyle = { height: "clamp(30rem, 78vh, 52rem)" } as const;
  const plantImage = <img className="size-full object-contain object-bottom" src={plantSource} alt="" draggable={false} />;
  const compostBinClassName = "layer-compost absolute bottom-1 right-[8.75rem] w-[5.625rem]";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible">
      {showsPaperGarland && (
        <div
          className="layer-garland absolute left-[-4.375rem] top-[-1.5rem] aspect-[368/903] -translate-x-[18%]"
          style={plantStyle}
          aria-hidden="true"
        >
          <img className="size-full object-contain object-bottom" src={PAPER_GARLAND_SOURCE} alt="" draggable={false} />
        </div>
      )}
      {compostBinOwned && (
        <div className={compostBinClassName} aria-hidden="true">
          <img className="block h-auto w-full" src={COMPOST_BIN_SOURCE} alt="" draggable={false} />
        </div>
      )}
      <div className={plantClassName} style={plantStyle} aria-hidden="true">{plantImage}</div>
    </div>
  );
}
