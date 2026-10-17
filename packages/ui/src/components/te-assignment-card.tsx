import { cn } from "@trips-app/ui/lib/utils";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";

export interface TeAssignmentCardLabels {
  route: string;
  departure: string;
  vehicle: string;
}

export const TE_ASSIGNMENT_DEFAULT_LABELS: TeAssignmentCardLabels = {
  route: "Route",
  departure: "Departure",
  vehicle: "Vehicle",
};

export interface TeAssignmentCardProps {
  tripName: string;
  route: string;
  departure: string;
  vehicle: string;
  /** Shown on the action button. Only rendered when onAction is set. */
  actionLabel?: string;
  onAction?: () => void;
  labels?: Partial<TeAssignmentCardLabels>;
  className?: string;
}

/** Driver app: the trip a driver is assigned to, with its route, departure and vehicle. */
export function TeAssignmentCard({
  tripName,
  route,
  departure,
  vehicle,
  actionLabel = "View assignment",
  onAction,
  labels: labelOverrides,
  className,
}: TeAssignmentCardProps) {
  const labels = { ...TE_ASSIGNMENT_DEFAULT_LABELS, ...labelOverrides };

  return (
    <TeCard
      as="article"
      padding="4"
      className={cn("te-assignment-card", className)}
      header={<h3 className="te-assignment-card__title">{tripName}</h3>}
      footer={
        onAction ? (
          <TeButton variant="secondary" onClick={onAction}>
            {actionLabel}
          </TeButton>
        ) : undefined
      }
    >
      <dl className="te-assignment-card__facts">
        <div className="te-assignment-card__fact">
          <dt>{labels.route}</dt>
          <dd>{route}</dd>
        </div>
        <div className="te-assignment-card__fact">
          <dt>{labels.departure}</dt>
          <dd>{departure}</dd>
        </div>
        <div className="te-assignment-card__fact">
          <dt>{labels.vehicle}</dt>
          <dd>{vehicle}</dd>
        </div>
      </dl>
    </TeCard>
  );
}
