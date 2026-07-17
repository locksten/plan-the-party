import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { assert } from "../../assert";
import { CHALLENGE_ART_SOURCES } from "../../cardArt";
import { CHALLENGES, type Challenge, type ChallengeId } from "../../domain";
import { classes } from "../../ui";
import { CardBoardDialog } from "./DialogShell";

type FocusedChallenge = Readonly<{
  challengeId: ChallengeId;
  origin: Readonly<{ left: number; top: number; width: number; height: number }>;
  phase: "entering" | "focused" | "leaving";
}>;

export function ChallengeDialog({ completedChallengeIds, onClose }: {
  completedChallengeIds: ReadonlySet<ChallengeId>;
  onClose: () => void;
}) {
  const [focusedChallenge, setFocusedChallenge] = useState<FocusedChallenge | null>(null);
  const focusedOverlayRef = useRef<HTMLButtonElement>(null);
  const cardRefs = useRef(new Map<ChallengeId, HTMLButtonElement>());

  useEffect(() => {
    if (focusedChallenge?.phase !== "entering") return;
    focusedOverlayRef.current?.focus();
    const animationFrame = requestAnimationFrame(() => {
      setFocusedChallenge((current) => current === null ? null : { ...current, phase: "focused" });
    });
    return () => cancelAnimationFrame(animationFrame);
  }, [focusedChallenge?.challengeId, focusedChallenge?.phase]);

  useEffect(() => {
    if (focusedChallenge?.phase !== "leaving") return;
    const challengeId = focusedChallenge.challengeId;
    const timeout = window.setTimeout(() => {
      setFocusedChallenge(null);
      cardRefs.current.get(challengeId)?.focus();
    }, 320);
    return () => window.clearTimeout(timeout);
  }, [focusedChallenge?.challengeId, focusedChallenge?.phase]);

  let focusedChallengeData: Challenge | null = null;
  if (focusedChallenge !== null) {
    focusedChallengeData = CHALLENGES.find((challenge) => challenge.id === focusedChallenge.challengeId) ?? null;
    assert(focusedChallengeData !== null, "Padidintas iššūkis turi priklausyti iššūkių lentai.");
  }

  return (
    <>
      <CardBoardDialog
        labelledBy="challenge-title"
        title="Iššūkių lenta"
        description="Siekite tiek iššūkių, kiek norite – įvykdyti iššūkiai pažymimi automatiškai"
        onClose={onClose}
      >
        {CHALLENGES.map((challenge) => {
          const isComplete = completedChallengeIds.has(challenge.id);
          const isFocused = focusedChallenge?.challengeId === challenge.id;
          return (
            <button
              ref={(button) => {
                if (button === null) cardRefs.current.delete(challenge.id);
                else cardRefs.current.set(challenge.id, button);
              }}
              key={challenge.id}
              type="button"
              aria-label={`${challenge.title}. Padidinti kortelę.`}
              className={classes(
                "h-full min-h-0 w-full rounded-2xl outline-none hover:-translate-y-0.5 focus-visible:outline-[0.25rem] focus-visible:outline-yellow",
                isFocused && "opacity-0",
              )}
              onClick={(event) => {
                const origin = event.currentTarget.getBoundingClientRect();
                setFocusedChallenge({
                  challengeId: challenge.id,
                  origin: { left: origin.left, top: origin.top, width: origin.width, height: origin.height },
                  phase: "entering",
                });
              }}
            >
              <ChallengeCard challenge={challenge} isComplete={isComplete} />
            </button>
          );
        })}
      </CardBoardDialog>

      {focusedChallenge !== null && focusedChallengeData !== null && createPortal(
        <FocusedChallengeOverlay
          focusedChallenge={focusedChallenge}
          challenge={focusedChallengeData}
          isComplete={completedChallengeIds.has(focusedChallengeData.id)}
          overlayRef={focusedOverlayRef}
          onDismiss={() => setFocusedChallenge((current) => current === null ? null : { ...current, phase: "leaving" })}
        />,
        document.body,
      )}
    </>
  );
}

function ChallengeCard({ challenge, isComplete, isZoomed = false }: { challenge: Challenge; isComplete: boolean; isZoomed?: boolean }) {
  return (
    <span
      className={classes(
        "flex size-full min-h-0 flex-col items-center justify-center rounded-2xl border-[0.1875rem] p-4 text-center text-navy",
        isComplete
          ? "border-navy bg-white shadow-[0_0.25rem_0_#17233f]"
          : isZoomed
            ? "border-0 bg-cream grayscale shadow-none"
            : "border-transparent bg-transparent grayscale opacity-55 shadow-none",
      )}
    >
      <span className="grid h-32 w-36 place-items-center" aria-hidden="true">
        <img className="h-32 w-36 object-contain" src={CHALLENGE_ART_SOURCES[challenge.id]} alt="" draggable={false} />
      </span>
      <strong className="mt-3 text-xl">{challenge.title}</strong>
      <small className="mt-2 text-sm leading-[1.35] text-muted">{challenge.description}</small>
    </span>
  );
}

function FocusedChallengeOverlay({ focusedChallenge, challenge, isComplete, overlayRef, onDismiss }: {
  focusedChallenge: FocusedChallenge;
  challenge: Challenge;
  isComplete: boolean;
  overlayRef: RefObject<HTMLButtonElement | null>;
  onDismiss: () => void;
}) {
  const viewportPadding = 40;
  const scale = Math.min(
    2.35,
    (window.innerWidth - viewportPadding * 2) / focusedChallenge.origin.width,
    (window.innerHeight - viewportPadding * 2) / focusedChallenge.origin.height,
  );
  assert(scale >= 1, "Padidinamai iššūkio kortelei ekrane neužtenka vietos.");
  const targetLeft = (window.innerWidth - focusedChallenge.origin.width * scale) / 2;
  const targetTop = (window.innerHeight - focusedChallenge.origin.height * scale) / 2;
  const isExpanded = focusedChallenge.phase === "focused";

  return (
    <button
      ref={overlayRef}
      className={classes(
        "layer-dialog-focus fixed inset-0 cursor-pointer bg-[#0b1429]/70 transition-colors duration-300",
        !isExpanded && "bg-[#0b1429]/0",
      )}
      type="button"
      aria-label={`${challenge.title}. Grąžinti kortelę į vietą.`}
      onClick={onDismiss}
    >
      <span
        className="fixed block origin-top-left transition-transform duration-300 ease-out"
        style={{
          left: focusedChallenge.origin.left,
          top: focusedChallenge.origin.top,
          width: focusedChallenge.origin.width,
          height: focusedChallenge.origin.height,
          transform: isExpanded
            ? `translate(${targetLeft - focusedChallenge.origin.left}px, ${targetTop - focusedChallenge.origin.top}px) scale(${scale})`
            : "translate(0, 0) scale(1)",
        }}
      >
        <ChallengeCard challenge={challenge} isComplete={isComplete} isZoomed />
      </span>
    </button>
  );
}
