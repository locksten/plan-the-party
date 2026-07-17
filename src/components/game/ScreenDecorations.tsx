import sceneFabricBuntingSource from "../../assets/scene/fabric-bunting.webp";
import type { ItemId } from "../../domain";
import { FloatingBalloons } from "./FloatingBalloons";

const FABRIC_BUNTING_SOURCE = sceneFabricBuntingSource;
const FABRIC_BUNTING_REPEATS = 5;

export function ScreenDecorations({ selectedItemIds }: { selectedItemIds: ReadonlySet<ItemId> }) {
  const hasBunting = selectedItemIds.has("veliaveles");
  const hasBalloons = selectedItemIds.has("balionai");
  if (!hasBunting && !hasBalloons) return null;

  return (
    <>
      {hasBalloons && <FloatingBalloons />}
      {hasBunting && (
        <div className="layer-bunting pointer-events-none absolute inset-x-0 top-[-0.5rem] overflow-hidden" aria-hidden="true">
          <div className="relative left-1/2 flex w-max -translate-x-1/2 items-start">
            {Array.from({ length: FABRIC_BUNTING_REPEATS }, (_, index) => (
              <img
                className="h-auto w-[clamp(17rem,24vw,24rem)] shrink-0"
                src={FABRIC_BUNTING_SOURCE}
                alt=""
                draggable={false}
                key={index}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
