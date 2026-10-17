import { cn } from "@trips-app/ui/lib/utils";
import { TeIcon } from "@trips-app/ui/components/te-icon";
import { useId } from "react";

export interface TeMaintenanceNoticeProps {
  title: string;
  description: string;
  /** Planned return time, already formatted in the viewer's time zone. */
  estimatedReturn?: string;
  estimatedReturnLabel?: string;
  className?: string;
}

/** Planned maintenance. Centred, with the shield icon. Not an error. */
export function TeMaintenanceNotice({
  title,
  description,
  estimatedReturn,
  estimatedReturnLabel = "Expected back",
  className,
}: TeMaintenanceNoticeProps) {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId} className={cn("te-maintenance", className)}>
      <TeIcon name="shield" className="te-maintenance__icon" />
      <h1 id={titleId} className="te-maintenance__title">
        {title}
      </h1>
      <p className="te-maintenance__description">{description}</p>
      {estimatedReturn ? (
        <p className="te-maintenance__return">
          <span>{estimatedReturnLabel}:</span> <span>{estimatedReturn}</span>
        </p>
      ) : null}
    </section>
  );
}
