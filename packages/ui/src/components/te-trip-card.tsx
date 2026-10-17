import { cn } from "@trips-app/ui/lib/utils";
import type { ReactNode } from "react";

export interface TeTripCardImage {
  url: string;
  alt: string;
}

export interface TeTripCardProps {
  title: string;
  meta?: ReactNode;
  image: TeTripCardImage;
  status?: ReactNode;
  /** When set, the card renders as a button. Otherwise it renders as an article. */
  onSelect?: () => void;
  className?: string;
}

export function TeTripCard({ title, meta, image, status, onSelect, className }: TeTripCardProps) {
  const isInteractive = onSelect !== undefined;
  const TitleTag = isInteractive ? "span" : "h3";
  const BodyTag = isInteractive ? "span" : "div";

  const content = (
    <>
      <img className="te-trip-card__image" src={image.url} alt={image.alt} loading="lazy" />
      <BodyTag className="te-trip-card__body">
        <TitleTag className="te-h3 te-trip-card__title">{title}</TitleTag>
        {meta ? <span className="te-caption te-trip-card__meta">{meta}</span> : null}
        {status ? <span className="te-trip-card__status">{status}</span> : null}
      </BodyTag>
    </>
  );

  if (isInteractive) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={cn("te-trip-card te-trip-card--interactive", className)}
      >
        {content}
      </button>
    );
  }

  return <article className={cn("te-trip-card", className)}>{content}</article>;
}
