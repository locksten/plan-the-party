import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { assert } from "../../assert";
import { classes } from "../../ui";
import { useAutoAnimateRef } from "../../useAutoAnimateRef";
import { IconButton } from "../ui/IconButton";
import { CardBoardDialog } from "./DialogShell";
import { useI18n } from "../../i18n/I18nProvider";

export type FlipCardData<Id extends string = string> = Readonly<{
  id: Id;
  title: string;
  description: string;
}>;

type FocusedFlipCard = Readonly<{
  cardId: string;
  origin: Readonly<{ left: number; top: number; width: number; height: number }>;
  phase: "entering" | "focused" | "leaving";
  startsRevealed: boolean;
}>;

type FlipCardDialogProps<Card extends FlipCardData> = {
  labelledBy: string;
  title: string;
  description: string;
  cards: readonly Card[];
  revealedIds: readonly Card["id"][];
  activeIds?: readonly Card["id"][];
  onReveal?: (card: Card) => void;
  onFaceUpClick?: (card: Card) => void;
  onFlipAll?: (faceUp: boolean) => void;
  onClose: () => void;
  renderArt: (card: Card, className: string) => ReactNode;
  faceUpActionLabel?: (card: Card, isActive: boolean) => string;
  colorScheme: "pink" | "teal";
  readOnly?: boolean;
};

export function FlipCardDialog<Card extends FlipCardData>({
  labelledBy,
  title,
  description,
  cards,
  revealedIds,
  activeIds,
  onReveal,
  onFaceUpClick,
  onFlipAll,
  onClose,
  renderArt,
  faceUpActionLabel,
  colorScheme,
  readOnly = false,
}: FlipCardDialogProps<Card>) {
  const { translations } = useI18n();
  const [cardOrder, setCardOrder] = useState<readonly Card["id"][]>(() => cards.map((card) => card.id));
  const [focusedCard, setFocusedCard] = useState<FocusedFlipCard | null>(null);
  const cardBoardRef = useAutoAnimateRef<HTMLDivElement>({ duration: 420, easing: "ease-in-out" });
  const focusedOverlayRef = useRef<HTMLButtonElement>(null);
  const cardRefs = useRef(new Map<string, HTMLButtonElement>());

  assert(readOnly === (onReveal === undefined && onFaceUpClick === undefined && onFlipAll === undefined), "Read-only mode must not provide card mutation actions.");
  const cardsById = new Map(cards.map((card) => [card.id, card]));
  assert(cardsById.size === cards.length, "Card IDs must be unique.");
  assert(cardOrder.length === cards.length, "The card order must contain every card.");
  const orderedCards = cardOrder.map((cardId) => {
    const card = cardsById.get(cardId);
    assert(card !== undefined, `The card order contains unknown ID "${cardId}".`);
    return card;
  });

  useEffect(() => {
    if (focusedCard?.phase !== "entering") return;
    focusedOverlayRef.current?.focus();
    const animationFrame = requestAnimationFrame(() => {
      setFocusedCard((current) => current === null ? null : { ...current, phase: "focused" });
    });
    return () => cancelAnimationFrame(animationFrame);
  }, [focusedCard?.cardId, focusedCard?.phase]);

  useEffect(() => {
    if (focusedCard?.phase !== "leaving") return;
    const cardId = focusedCard.cardId;
    const timeout = window.setTimeout(() => {
      setFocusedCard(null);
      cardRefs.current.get(cardId)?.focus();
    }, 320);
    return () => window.clearTimeout(timeout);
  }, [focusedCard?.cardId, focusedCard?.phase]);

  function focusCard(card: Card, button: HTMLButtonElement, startsRevealed: boolean) {
    const origin = button.getBoundingClientRect();
    setFocusedCard({
      cardId: card.id,
      origin: { left: origin.left, top: origin.top, width: origin.width, height: origin.height },
      phase: "entering",
      startsRevealed,
    });
  }

  function handleCardClick(card: Card, button: HTMLButtonElement, isRevealed: boolean) {
    if (isRevealed) {
      if (!readOnly && onFaceUpClick !== undefined) onFaceUpClick(card);
      else focusCard(card, button, true);
      return;
    }

    if (readOnly) return;
    assert(onReveal !== undefined, "An editable card dialog must provide a reveal action.");
    focusCard(card, button, false);
    onReveal(card);
  }

  function dismissFocusedCard() {
    setFocusedCard((current) => current === null ? null : { ...current, phase: "leaving" });
  }

  function shuffleCards() {
    setCardOrder((current) => {
      assert(current.length > 1, "Shuffling requires at least two cards.");
      const shuffled = [...current];
      for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
      }
      if (shuffled.every((cardId, index) => cardId === current[index])) {
        const firstCardId = shuffled.shift();
        assert(firstCardId !== undefined, "The shuffled card list must not be empty.");
        shuffled.push(firstCardId);
      }
      return shuffled;
    });
  }

  let focusedCardData: Card | null = null;
  if (focusedCard !== null) {
    const matchingCard = cardsById.get(focusedCard.cardId);
    assert(matchingCard !== undefined, "The focused card must belong to the board.");
    focusedCardData = matchingCard;
  }

  const allFaceDown = revealedIds.length === 0;

  return (
    <>
      <CardBoardDialog
        labelledBy={labelledBy}
        title={title}
        description={description}
        onClose={onClose}
        boardRef={cardBoardRef}
        headerActions={readOnly ? undefined : (
          <CardBoardActions
            allFaceDown={allFaceDown}
            onShuffle={shuffleCards}
            onFlipAll={() => {
              assert(onFlipAll !== undefined, "An editable card dialog must provide a flip-all action.");
              onFlipAll(allFaceDown);
            }}
          />
        )}
      >
        {orderedCards.map((card) => {
          const isRevealed = revealedIds.includes(card.id);
          const isActive = activeIds === undefined || activeIds.includes(card.id);
          const isFocused = focusedCard?.cardId === card.id;
          const actionLabel = !isRevealed && readOnly
            ? translations.cardBoard.unrevealedCard
            : !isRevealed
            ? translations.cardBoard.revealCard
            : faceUpActionLabel?.(card, isActive) ?? translations.cardBoard.enlargeCard(card.title);

          return (
            <div className="relative h-full min-h-0" key={card.id}>
              <button
                ref={(button) => {
                  if (button === null) cardRefs.current.delete(card.id);
                  else cardRefs.current.set(card.id, button);
                }}
                type="button"
                aria-label={actionLabel}
                disabled={readOnly && !isRevealed}
                aria-pressed={activeIds !== undefined && isRevealed ? isActive : undefined}
                className={classes(
                  "h-full w-full min-h-0 [perspective:56.25rem] hover:-translate-y-0.5",
                  isFocused && "opacity-0",
                  readOnly && !isRevealed && "cursor-default hover:translate-y-0",
                )}
                onClick={(clickEvent) => handleCardClick(card, clickEvent.currentTarget, isRevealed)}
              >
                <span className={classes("event-card-inner relative block h-full min-h-0 w-full", isRevealed && "event-card-inner--revealed")}>
                  <FlipCardBack art={renderArt(card, "absolute size-full -scale-x-100 object-contain brightness-0 opacity-65")} colorScheme={colorScheme} />
                  <FlipCardFront
                    card={card}
                    art={renderArt(card, "h-32 w-36 object-contain")}
                    isActive={isActive}
                    ariaHidden={!isRevealed}
                    colorScheme={colorScheme}
                  />
                </span>
              </button>
            </div>
          );
        })}
      </CardBoardDialog>

      {focusedCard !== null && focusedCardData !== null && createPortal(
        <FocusedFlipCardOverlay
          card={focusedCard}
          cardData={focusedCardData}
          art={renderArt(focusedCardData, "h-32 w-36 object-contain")}
          backArt={renderArt(focusedCardData, "absolute size-full -scale-x-100 object-contain brightness-0 opacity-65")}
          isActive={activeIds === undefined || activeIds.includes(focusedCardData.id)}
          colorScheme={colorScheme}
          overlayRef={focusedOverlayRef}
          onDismiss={dismissFocusedCard}
        />,
        document.body,
      )}
    </>
  );
}

function FlipCardBack({ art, colorScheme }: { art: ReactNode; colorScheme: "pink" | "teal" }) {
  return (
    <span className={classes(
      "event-card-face event-card-back absolute inset-0 grid place-items-center overflow-hidden rounded-2xl border-[0.1875rem] border-navy shadow-[0_0.25rem_0_#17233f]",
      colorScheme === "teal" && "discussion-card-back",
    )} aria-hidden="true">
      <span className="relative isolate grid h-36 w-40 place-items-center">
        {art}
        <span className="relative z-10 text-[3.625rem] font-black leading-none text-cream">?</span>
      </span>
    </span>
  );
}

function FlipCardFront({ card, art, isActive, ariaHidden, colorScheme, isZoomed = false }: {
  card: FlipCardData;
  art: ReactNode;
  isActive: boolean;
  ariaHidden: boolean;
  colorScheme: "pink" | "teal";
  isZoomed?: boolean;
}) {
  return (
    <span
      className={classes(
        "event-card-face event-card-front absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-[0.1875rem] p-4 text-center text-navy",
        isActive
          ? classes("border-navy shadow-[0_0.25rem_0_#17233f]", colorScheme === "teal" ? "bg-mint-soft" : "bg-[#ffe3dd]")
          : isZoomed
            ? "border-0 bg-cream grayscale shadow-none"
            : "border-transparent bg-transparent grayscale opacity-55 shadow-none",
      )}
      aria-hidden={ariaHidden}
    >
      <span className="grid h-32 w-36 place-items-center" aria-hidden="true">
        {art}
      </span>
      <strong className="mt-3 text-xl">{card.title}</strong>
      <small className="mt-2 text-sm leading-[1.35] text-muted">{card.description}</small>
    </span>
  );
}

type FocusedFlipCardOverlayProps = {
  card: FocusedFlipCard;
  cardData: FlipCardData;
  art: ReactNode;
  backArt: ReactNode;
  isActive: boolean;
  colorScheme: "pink" | "teal";
  overlayRef: RefObject<HTMLButtonElement | null>;
  onDismiss: () => void;
};

function FocusedFlipCardOverlay({ card, cardData, art, backArt, isActive, colorScheme, overlayRef, onDismiss }: FocusedFlipCardOverlayProps) {
  const { translations } = useI18n();
  const viewportPadding = 40;
  const scale = Math.min(
    2.35,
    (window.innerWidth - viewportPadding * 2) / card.origin.width,
    (window.innerHeight - viewportPadding * 2) / card.origin.height,
  );
  assert(scale >= 1, "The focused card does not fit on screen.");
  const targetLeft = (window.innerWidth - card.origin.width * scale) / 2;
  const targetTop = (window.innerHeight - card.origin.height * scale) / 2;
  const isExpanded = card.phase === "focused";

  return (
    <button
      ref={overlayRef}
      className={classes(
        "layer-dialog-focus fixed inset-0 cursor-pointer bg-[#0b1429]/70 transition-colors duration-300",
        !isExpanded && "bg-[#0b1429]/0",
      )}
      type="button"
      aria-label={translations.cardBoard.returnCard(cardData.title)}
      onClick={onDismiss}
    >
      <span
        className="fixed block origin-top-left transition-transform duration-300 ease-out [perspective:56.25rem]"
        style={{
          left: card.origin.left,
          top: card.origin.top,
          width: card.origin.width,
          height: card.origin.height,
          transform: isExpanded
            ? `translate(${targetLeft - card.origin.left}px, ${targetTop - card.origin.top}px) scale(${scale})`
            : "translate(0, 0) scale(1)",
        }}
      >
        <span className={classes(
          "event-card-inner relative block h-full w-full",
          (card.startsRevealed || card.phase !== "entering") && "event-card-inner--revealed",
        )}>
          <FlipCardBack art={backArt} colorScheme={colorScheme} />
          <FlipCardFront card={cardData} art={art} isActive={isActive} ariaHidden={false} colorScheme={colorScheme} isZoomed />
        </span>
      </span>
    </button>
  );
}

function CardBoardActions({ allFaceDown, onShuffle, onFlipAll }: { allFaceDown: boolean; onShuffle: () => void; onFlipAll: () => void }) {
  const { translations } = useI18n();
  const flipLabel = allFaceDown ? translations.cardBoard.revealAll : translations.cardBoard.turnAllDown;
  return (
    <>
      <IconButton type="button" onClick={onShuffle} aria-label={translations.cardBoard.shuffle} title={translations.cardBoard.shuffle}>
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 7h3c5 0 6 10 11 10h4" />
          <path d="m18 14 3 3-3 3M3 17h3c2.1 0 3.4-1.8 4.7-4M14 7c1-1.2 2-2 3-2h4" />
          <path d="m18 2 3 3-3 3" />
        </svg>
      </IconButton>
      <IconButton type="button" onClick={onFlipAll} aria-label={flipLabel} title={flipLabel}>
        <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="5" width="11" height="14" rx="2" />
          <path d="M10 2h7a4 4 0 0 1 4 4v9M18 12l3 3 3-3" />
        </svg>
      </IconButton>
    </>
  );
}
