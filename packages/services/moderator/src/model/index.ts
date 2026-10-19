import type { CheckInMethod, CheckInStatus, TrackingAlertSeverity } from "@trips-app/domain";

export type { CheckInMethod, CheckInStatus, TrackingAlertSeverity };

export interface ModeratorAssignmentSummary {
  tenantId: string;
  tripId: string;
  vehicleId: string;
  tripTitleAr: string;
  tripTitleEn: string;
  totalPassengers: number;
  checkedInPassengers: number;
}
