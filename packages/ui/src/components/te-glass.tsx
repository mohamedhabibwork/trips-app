import { cn } from "@trips-app/ui/lib/utils";
import { TeIcon, type TeIconName } from "@trips-app/ui/components/te-icon";
import type { ComponentProps } from "react";

/** Regular glass. Every glass element also carries the `te-glass` base class. */
export function TeGlassSurface({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={cn("te-glass te-glass-surface", className)} />;
}

export interface TeGlassButtonProps extends ComponentProps<"button"> {
  /** Only for the single primary floating action (for example Track bus). */
  tint?: boolean;
}

export function TeGlassButton({
  tint = false,
  type = "button",
  className,
  ...props
}: TeGlassButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={cn("te-glass te-glass-button", tint && "te-glass--tint", className)}
    />
  );
}

export function TeGlassNavBar({ className, ...props }: ComponentProps<"header">) {
  return <header {...props} className={cn("te-glass te-glass-nav", className)} />;
}

export interface TeGlassTab {
  id: string;
  label: string;
  icon: TeIconName;
}

export interface TeGlassTabBarProps extends Omit<ComponentProps<"nav">, "onSelect"> {
  tabs: readonly TeGlassTab[];
  activeId: string;
  onSelect?: (id: string) => void;
  /** Accessible name for the navigation landmark. */
  ariaLabel?: string;
}

export function TeGlassTabBar({
  tabs,
  activeId,
  onSelect,
  ariaLabel = "Main navigation",
  className,
  ...props
}: TeGlassTabBarProps) {
  return (
    <nav {...props} aria-label={ariaLabel} className={cn("te-glass te-glass-tabbar", className)}>
      <ul className="te-glass-tabbar__list">
        {tabs.map((tab) => (
          <li key={tab.id} className="te-glass-tabbar__item">
            <button
              type="button"
              className="te-glass-tab"
              aria-current={tab.id === activeId ? "page" : undefined}
              onClick={() => onSelect?.(tab.id)}
            >
              <TeIcon name={tab.icon} />
              <span>{tab.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
