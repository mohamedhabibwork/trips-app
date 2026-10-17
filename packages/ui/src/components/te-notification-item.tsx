import { cn } from "@trips-app/ui/lib/utils";

export interface TeNotificationItemProps {
  title: string;
  body: string;
  /** Already formatted time, for example "07:32" or "2 h ago". */
  time: string;
  unread: boolean;
  onOpen?: () => void;
  /** Read by screen readers for unread items. */
  unreadLabel?: string;
  className?: string;
}

/** One notification row. The unread dot has a word too, so colour is never the only cue. */
export function TeNotificationItem({
  title,
  body,
  time,
  unread,
  onOpen,
  unreadLabel = "Unread",
  className,
}: TeNotificationItemProps) {
  const content = (
    <>
      <span className="te-notification-item__marker">
        {unread ? (
          <>
            <span aria-hidden="true" className="te-notification-item__dot" />
            <span className="te-visually-hidden">{unreadLabel}</span>
          </>
        ) : null}
      </span>
      <span className="te-notification-item__text">
        <span className="te-notification-item__title">{title}</span>
        <span className="te-notification-item__body">{body}</span>
        <span className="te-notification-item__time">{time}</span>
      </span>
    </>
  );

  const classes = cn(
    "te-notification-item",
    unread && "te-notification-item--unread",
    onOpen && "te-notification-item--interactive",
    className,
  );

  if (onOpen) {
    return (
      <button type="button" className={classes} onClick={onOpen}>
        {content}
      </button>
    );
  }

  return <div className={classes}>{content}</div>;
}
