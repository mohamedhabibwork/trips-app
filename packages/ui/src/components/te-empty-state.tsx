import { cn } from "@trips-app/ui/lib/utils";
import type { ReactNode } from "react";

export interface TeEmptyStateProps {
  title: string;
  description?: string;
  /** Optional call to action, usually a TeButton. */
  action?: ReactNode;
  className?: string;
}

/** Nothing here yet. This is not an error, so no alert role. */
export function TeEmptyState({ title, description, action, className }: TeEmptyStateProps) {
  return (
    <div className={cn("te-empty-state", className)}>
      <h2 className="te-h3 te-empty-state__title">{title}</h2>
      {description ? <p className="te-body te-empty-state__description">{description}</p> : null}
      {action ? <div className="te-empty-state__actions">{action}</div> : null}
    </div>
  );
}
