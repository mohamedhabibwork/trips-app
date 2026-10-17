import { cn } from "@trips-app/ui/lib/utils";

export const TE_PHOTO_GRID_COLUMNS = [2, 3] as const;
export type TePhotoGridColumns = (typeof TE_PHOTO_GRID_COLUMNS)[number];

export interface TePhoto {
  id: string;
  src: string;
  /** Required. Describes the photo for screen readers; it is the button's name. */
  alt: string;
}

export interface TePhotoGridProps {
  photos: readonly TePhoto[];
  onOpen?: (id: string) => void;
  /** Two columns on phones. Three columns from the tablet breakpoint when set to 3. */
  columns?: TePhotoGridColumns;
  className?: string;
}

/** Photo grid. Each photo is a button, so it can be opened from the keyboard. */
export function TePhotoGrid({ photos, onOpen, columns = 2, className }: TePhotoGridProps) {
  return (
    <ul className={cn("te-photo-grid", `te-photo-grid--cols-${columns}`, className)}>
      {photos.map((photo) => (
        <li key={photo.id} className="te-photo-grid__item">
          <button
            type="button"
            className="te-photo-grid__button"
            onClick={() => onOpen?.(photo.id)}
          >
            <img className="te-photo-grid__image" src={photo.src} alt={photo.alt} loading="lazy" />
          </button>
        </li>
      ))}
    </ul>
  );
}
