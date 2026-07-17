import { EVENT_ART_SOURCES, DISCUSSION_ART_SOURCES } from "../../cardArt";
import { DISCUSSION_CARDS, type DiscussionCard, type DiscussionId } from "../../discussions";
import { EVENTS, type EventId } from "../../domain";
import { FlipCardDialog } from "./FlipCardDialog";

type EditableEventDialogProps = Readonly<{
  readOnly?: false;
  activeEventIds: readonly EventId[];
  revealedEventIds: readonly EventId[];
  onToggle: (eventId: EventId) => void;
  onFlipAll: (faceUp: boolean) => void;
  onClose: () => void;
}>;

type ReadOnlyEventDialogProps = Readonly<{
  readOnly: true;
  activeEventIds: readonly EventId[];
  revealedEventIds: readonly EventId[];
  onClose: () => void;
}>;

type EventDialogProps = EditableEventDialogProps | ReadOnlyEventDialogProps;

export function EventDialog(props: EventDialogProps) {
  const { activeEventIds, revealedEventIds, onClose } = props;
  const isReadOnly = props.readOnly === true;
  return (
    <FlipCardDialog
      labelledBy="event-title"
      title="Netikėtų įvykių kortelės"
      description={isReadOnly ? "Peržiūrėkite šventės metu galiojusius netikėtus įvykius" : "Atverskite kortelę ir prisitaikykite prie pasikeitusių sąlygų"}
      colorScheme="pink"
      cards={EVENTS}
      revealedIds={revealedEventIds}
      activeIds={activeEventIds}
      onReveal={isReadOnly ? undefined : (event) => props.onToggle(event.id)}
      onFaceUpClick={isReadOnly ? undefined : (event) => props.onToggle(event.id)}
      onFlipAll={isReadOnly ? undefined : props.onFlipAll}
      onClose={onClose}
      faceUpActionLabel={isReadOnly ? undefined : (event, isActive) => `${event.title}. ${isActive ? "Išjungti" : "Įjungti"} įvykį`}
      renderArt={(event, className) => <img className={className} src={EVENT_ART_SOURCES[event.id]} alt="" draggable={false} />}
      readOnly={isReadOnly}
    />
  );
}

type DiscussionDialogProps = Readonly<{
  revealedDiscussionIds: readonly DiscussionId[];
  onReveal: (card: DiscussionCard) => void;
  onFlipAll: (faceUp: boolean) => void;
  onClose: () => void;
}>;

export function DiscussionDialog({ revealedDiscussionIds, onReveal, onFlipAll, onClose }: DiscussionDialogProps) {
  return (
    <FlipCardDialog
      labelledBy="discussion-title"
      title="Pokalbio kortelės"
      description="Atverskite klausimą ir aptarkite jį su klase"
      colorScheme="teal"
      cards={DISCUSSION_CARDS}
      revealedIds={revealedDiscussionIds}
      onReveal={onReveal}
      onFlipAll={onFlipAll}
      onClose={onClose}
      renderArt={(card, className) => <img className={className} src={DISCUSSION_ART_SOURCES[card.id]} alt="" draggable={false} />}
    />
  );
}
