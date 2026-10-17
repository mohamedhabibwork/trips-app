import { cn } from "@trips-app/ui/lib/utils";
import { TeAvatar } from "@trips-app/ui/components/te-avatar";
import {
  TeTrackingStatus,
  type TeTrackingStatusValue,
} from "@trips-app/ui/components/te-tracking-status";

export interface TeChildCardProps {
  name: string;
  /** Photo URL. Initials are shown when it is missing. */
  photo?: string;
  tripName: string;
  status: TeTrackingStatusValue;
  /** When set, the whole card is a button that opens the child's trip. */
  onOpen?: () => void;
  className?: string;
}

/** Parent app: one child, their trip and boarding status. The avatar is decorative here. */
export function TeChildCard({
  name,
  photo,
  tripName,
  status,
  onOpen,
  className,
}: TeChildCardProps) {
  const content = (
    <>
      <span aria-hidden="true">
        <TeAvatar name={name} src={photo} size="lg" />
      </span>
      <span className="te-child-card__body">
        <span className="te-child-card__name">{name}</span>
        <span className="te-child-card__trip">{tripName}</span>
        <TeTrackingStatus status={status} />
      </span>
    </>
  );

  if (onOpen) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className={cn("te-child-card te-child-card--interactive", className)}
      >
        {content}
      </button>
    );
  }

  return <article className={cn("te-child-card", className)}>{content}</article>;
}
