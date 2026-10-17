import { cn } from "@trips-app/ui/lib/utils";
import type { ReactNode } from "react";

export const TE_CARD_TAGS = ["div", "section", "article"] as const;
export const TE_CARD_PADDINGS = ["4", "6"] as const;

export type TeCardTag = (typeof TE_CARD_TAGS)[number];
export type TeCardPadding = (typeof TE_CARD_PADDINGS)[number];

export interface TeCardProps {
  as?: TeCardTag;
  /** space-4 on phones and compact content, space-6 for roomier web cards. */
  padding?: TeCardPadding;
  header?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/** Raised surface on the card shadow token. Content sits on surface-raised, never on glass. */
export function TeCard({
  as: Tag = "div",
  padding = "4",
  header,
  footer,
  children,
  className,
}: TeCardProps) {
  return (
    <Tag className={cn("te-card", `te-card--pad-${padding}`, className)}>
      {header ? <div className="te-card__header">{header}</div> : null}
      <div className="te-card__body">{children}</div>
      {footer ? <div className="te-card__footer">{footer}</div> : null}
    </Tag>
  );
}
