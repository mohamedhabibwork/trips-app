import {
  CHECK_IN_METHODS,
  CHECK_IN_STATUSES,
  TRACKING_ALERT_SEVERITIES,
  type CheckInMethod,
  type CheckInStatus,
  type TrackingAlertSeverity,
} from "@trips-app/domain";

export {
  CHECK_IN_METHODS,
  CHECK_IN_STATUSES,
  TRACKING_ALERT_SEVERITIES,
  type CheckInMethod,
  type CheckInStatus,
  type TrackingAlertSeverity,
};

export interface ModeratorAssignmentSummary {
  tenantId: string;
  tripId: string;
  vehicleId: string;
  tripTitleAr: string;
  tripTitleEn: string;
  totalPassengers: number;
  checkedInPassengers: number;
}
