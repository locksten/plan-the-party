import { EVENT_ART_SOURCES, DISCUSSION_ART_SOURCES } from "../../cardArt";
import { DISCUSSION_CARDS, type DiscussionCard, type DiscussionId } from "../../discussions";
import { EVENTS, type EventId } from "../../domain";
import { FlipCardDialog } from "./FlipCardDialog";
import { useI18n } from "../../i18n/I18nProvider";

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
  const { translations } = useI18n();
  const { activeEventIds, revealedEventIds, onClose } = props;
  const isReadOnly = props.readOnly === true;
  const cards = EVENTS.map((event) => {
    const copy = translations.eventCards[event.id];
    return { id: event.id, title: copy.title, description: copy.description(event) };
  });
  return (
    <FlipCardDialog
      labelledBy="event-title"
      title={translations.events.title}
      description={isReadOnly ? translations.events.readOnlyDescription : translations.events.editableDescription}
      colorScheme="pink"
      cards={cards}
      revealedIds={revealedEventIds}
      activeIds={activeEventIds}
      onReveal={isReadOnly ? undefined : (event) => props.onToggle(event.id)}
      onFaceUpClick={isReadOnly ? undefined : (event) => props.onToggle(event.id)}
      onFlipAll={isReadOnly ? undefined : props.onFlipAll}
      onClose={onClose}
      faceUpActionLabel={isReadOnly ? undefined : (event, isActive) => isActive
        ? translations.events.disable(event.title)
        : translations.events.enable(event.title)}
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
  const { translations } = useI18n();
  const cards = DISCUSSION_CARDS.map((card) => ({ id: card.id, ...translations.discussionCards[card.id] }));
  return (
    <FlipCardDialog
      labelledBy="discussion-title"
      title={translations.discussions.title}
      description={translations.discussions.description}
      colorScheme="teal"
      cards={cards}
      revealedIds={revealedDiscussionIds}
      onReveal={onReveal}
      onFlipAll={onFlipAll}
      onClose={onClose}
      renderArt={(card, className) => <img className={className} src={DISCUSSION_ART_SOURCES[card.id]} alt="" draggable={false} />}
    />
  );
}
