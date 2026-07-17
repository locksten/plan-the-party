import { useEffect, useRef, useState, type CSSProperties } from "react";
import { classes } from "../../ui";
import {
  createPaperAirplaneFlyby,
  createPaperAirplaneFlybyDelay,
  type PaperAirplaneFlybyModel,
} from "./paperAirplaneFlybyModel";

type FlybyStyle = CSSProperties & Readonly<{
  "--paper-airplane-duration": string;
  "--paper-airplane-drift": string;
  "--paper-airplane-tilt": string;
  "--paper-airplane-top": string;
}>;

export function PaperAirplaneFlyby() {
  const sequenceRef = useRef(0);
  const [flyby, setFlyby] = useState<(PaperAirplaneFlybyModel & { id: number }) | null>(null);

  useEffect(() => {
    const launchFlyby = () => {
      sequenceRef.current += 1;
      setFlyby({ id: sequenceRef.current, ...createPaperAirplaneFlyby() });
    };
    let timeoutId: number;
    const scheduleNextFlyby = () => {
      timeoutId = window.setTimeout(() => {
        launchFlyby();
        scheduleNextFlyby();
      }, createPaperAirplaneFlybyDelay());
    };
    scheduleNextFlyby();

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  if (flyby === null) return null;

  const style: FlybyStyle = {
    "--paper-airplane-duration": `${flyby.durationMs}ms`,
    "--paper-airplane-drift": `${flyby.driftVh}vh`,
    "--paper-airplane-tilt": `${flyby.tiltDegrees}deg`,
    "--paper-airplane-top": `${flyby.topPercent}%`,
  };

  return (
    <div className="layer-airplane pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      <div
        key={flyby.id}
        className={classes(
          "paper-airplane-flyby",
          flyby.direction === "left-to-right"
            ? "paper-airplane-flyby--left-to-right"
            : "paper-airplane-flyby--right-to-left",
        )}
        style={style}
        onAnimationEnd={() => {
          setFlyby((current) => current?.id === flyby.id ? null : current);
        }}
      >
        <img
          className={classes("block h-auto w-full", flyby.direction === "right-to-left" && "-scale-x-100")}
          src={flyby.source}
          alt=""
          decoding="async"
          draggable={false}
        />
      </div>
    </div>
  );
}
