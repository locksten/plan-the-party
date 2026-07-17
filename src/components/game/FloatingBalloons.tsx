import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  createFloatingBalloon,
  createFloatingBalloonDelay,
  type FloatingBalloonModel,
} from "./floatingBalloonModel";

type FloatingBalloon = FloatingBalloonModel & Readonly<{ id: number }>;

type FloatingBalloonStyle = CSSProperties & Readonly<{
  "--balloon-duration": string;
  "--balloon-drift": string;
  "--balloon-left": string;
  "--balloon-size": string;
  "--balloon-sway-duration": string;
}>;

export function FloatingBalloons() {
  const sequenceRef = useRef(0);
  const [balloons, setBalloons] = useState<readonly FloatingBalloon[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timeoutIds = new Set<number>();
    const schedule = (callback: () => void, delayMs: number) => {
      const timeoutId = window.setTimeout(() => {
        timeoutIds.delete(timeoutId);
        callback();
      }, delayMs);
      timeoutIds.add(timeoutId);
    };
    const spawnBalloon = () => {
      sequenceRef.current += 1;
      const balloon: FloatingBalloon = { id: sequenceRef.current, ...createFloatingBalloon() };
      setBalloons((current) => [...current, balloon]);
      schedule(() => {
        setBalloons((current) => current.filter((candidate) => candidate.id !== balloon.id));
      }, balloon.durationMs + 100);
      schedule(spawnBalloon, createFloatingBalloonDelay());
    };

    schedule(spawnBalloon, createFloatingBalloonDelay());
    return () => {
      for (const timeoutId of timeoutIds) window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="layer-balloon pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      {balloons.map((balloon) => {
        const style: FloatingBalloonStyle = {
          "--balloon-duration": `${balloon.durationMs}ms`,
          "--balloon-drift": `${balloon.horizontalDriftVw}vw`,
          "--balloon-left": `${balloon.leftPercent}%`,
          "--balloon-size": `${balloon.sizeRem}rem`,
          "--balloon-sway-duration": `${balloon.swayDurationMs}ms`,
        };
        return (
          <span className="floating-balloon" key={balloon.id} style={style}>
            <img
              className="floating-balloon__shape"
              src={balloon.source}
              alt=""
              decoding="async"
              draggable={false}
            />
          </span>
        );
      })}
    </div>
  );
}
