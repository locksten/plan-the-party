import autoAnimate, { type AnimationController, type AutoAnimateOptions } from "@formkit/auto-animate";
import { useCallback, useRef, type RefCallback } from "react";

export function useAutoAnimateRef<TElement extends HTMLElement>(options: Partial<AutoAnimateOptions>): RefCallback<TElement> {
  const controllerRef = useRef<AnimationController | null>(null);
  const { duration, easing, disrespectUserMotionPreference } = options;

  return useCallback((element: TElement | null) => {
    controllerRef.current?.destroy?.();
    controllerRef.current = element === null
      ? null
      : autoAnimate(element, { duration, easing, disrespectUserMotionPreference });
  }, [duration, easing, disrespectUserMotionPreference]);
}
