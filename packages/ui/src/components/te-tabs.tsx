import { cn } from "@trips-app/ui/lib/utils";
import { useRef, type KeyboardEvent } from "react";

export interface TeTab {
  id: string;
  label: string;
  count?: number;
}

export interface TeTabsProps {
  tabs: readonly TeTab[];
  activeId: string;
  onSelect: (id: string) => void;
  /** Accessible name for the tab list. */
  ariaLabel: string;
  className?: string;
}

/**
 * Index of the tab a navigation key moves to, or undefined when the key is not a tab key.
 * In RTL the arrows flip so "next" always means the visually following tab.
 */
export function nextTabIndex(
  currentIndex: number,
  count: number,
  key: string,
  rtl: boolean,
): number | undefined {
  if (count === 0) return undefined;
  const forwardKey = rtl ? "ArrowLeft" : "ArrowRight";
  const backwardKey = rtl ? "ArrowRight" : "ArrowLeft";
  if (key === forwardKey) return (currentIndex + 1) % count;
  if (key === backwardKey) return (currentIndex - 1 + count) % count;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  return undefined;
}

/** Tab list with roving tabindex. Arrow keys move and select; Home and End jump to the ends. */
export function TeTabs({ tabs, activeId, onSelect, ariaLabel, className }: TeTabsProps) {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const hasActiveTab = tabs.some((tab) => tab.id === activeId);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const nextIndex = nextTabIndex(index, tabs.length, event.key, rtl);
    const nextTab = nextIndex === undefined ? undefined : tabs[nextIndex];
    if (nextIndex === undefined || nextTab === undefined) return;
    event.preventDefault();
    buttonRefs.current[nextIndex]?.focus();
    onSelect(nextTab.id);
  }

  return (
    <div role="tablist" aria-label={ariaLabel} className={cn("te-tabs", className)}>
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeId;
        const isTabStop = isActive || (!hasActiveTab && index === 0);
        return (
          <button
            key={tab.id}
            ref={(element) => {
              buttonRefs.current[index] = element;
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isTabStop ? 0 : -1}
            className="te-tabs__tab"
            onClick={() => onSelect(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined ? <span className="te-tabs__count">{tab.count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
