import { cn } from "@trips-app/ui/lib/utils";
import { TeIcon } from "@trips-app/ui/components/te-icon";

export const TE_AVATAR_SIZES = ["sm", "md", "lg"] as const;
export type TeAvatarSize = (typeof TE_AVATAR_SIZES)[number];

/** First letter of the first and last word. Works for Arabic and Latin names. */
export function getInitials(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);
  const firstWord = words[0];
  const lastWord = words.length > 1 ? words[words.length - 1] : undefined;
  return [firstWord, lastWord]
    .map((word) => (word ? (Array.from(word)[0] ?? "") : ""))
    .join("")
    .toUpperCase();
}

export interface TeAvatarProps {
  name: string;
  src?: string;
  size?: TeAvatarSize;
  className?: string;
}

/** Photo, or initials when there is no image. The name is the accessible label. */
export function TeAvatar({ name, src, size = "md", className }: TeAvatarProps) {
  const initials = getInitials(name);

  return (
    <span role="img" aria-label={name} className={cn("te-avatar", `te-avatar--${size}`, className)}>
      {src ? (
        <img className="te-avatar__image" src={src} alt="" />
      ) : initials.length > 0 ? (
        <span className="te-avatar__initials" aria-hidden="true">
          {initials}
        </span>
      ) : (
        <TeIcon name="user" />
      )}
    </span>
  );
}
