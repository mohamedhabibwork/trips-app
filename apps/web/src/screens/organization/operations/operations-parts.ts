// Data shaping shared by the operations pages (SCR-ORG-40 to SCR-ORG-42): tracking events per
// vehicle, GPS pings projected onto the live map, and the trip a page shows.
import { NO_VALUE } from "../common/org-ui";

/** The tracking event fields these pages read (tracking.getTripLiveTracking). */
export interface TrackingEventView {
  id: string;
  vehicleId: string | null;
  eventType: string;
  severity: string;
  coordinates: { latitude: number; longitude: number; speedKmh?: number | null } | null;
  childPassengerId: string | null;
  messageAr: string | null;
  messageEn: string | null;
  metadata: Record<string, unknown> | null;
  occurredAt: string | Date;
}

/** The trip vehicle fields these pages read (trips.listOrganizationTrips → vehicles). */
export interface TripVehicleView {
  vehicleId: string;
  plateNumber: string | null;
  seatCountSnapshot: number;
}

export interface FleetVehicleView {
  id: string;
  plateNumber: string;
}

export function eventsOf(data: unknown): readonly TrackingEventView[] {
  const events = (data as { events?: unknown } | undefined)?.events;
  return Array.isArray(events) ? (events as TrackingEventView[]) : [];
}

function time(value: string | Date): number {
  return new Date(value).getTime();
}

/** Events of one type, newest first. */
export function eventsOfType(
  events: readonly TrackingEventView[],
  type: string,
): readonly TrackingEventView[] {
  return events
    .filter((event) => event.eventType === type)
    .sort((a, b) => time(b.occurredAt) - time(a.occurredAt));
}

/** A vehicle's plate: the trip's snapshot, else the fleet registry, else NO_VALUE. */
export function plateOf(
  vehicleId: string | null,
  tripVehicles: readonly TripVehicleView[],
  fleet: readonly FleetVehicleView[],
): string {
  if (!vehicleId) return NO_VALUE;
  return (
    tripVehicles.find((vehicle) => vehicle.vehicleId === vehicleId)?.plateNumber ??
    fleet.find((vehicle) => vehicle.id === vehicleId)?.plateNumber ??
    NO_VALUE
  );
}

/** The event's message in the reader's language, else the other one. */
export function eventMessage(event: TrackingEventView, locale: string): string {
  const ar = event.messageAr ?? "";
  const en = event.messageEn ?? "";
  return (locale === "ar" ? ar || en : en || ar) || NO_VALUE;
}

export type VehicleMotion = "moving" | "stopped" | "noSignal";

/** Moving when the vehicle's latest GPS ping reports a speed above zero. */
export function vehicleMotion(
  vehicleId: string,
  pings: readonly TrackingEventView[],
): VehicleMotion {
  const latest = pings.find((ping) => ping.vehicleId === vehicleId && ping.coordinates);
  if (!latest?.coordinates) return "noSignal";
  return (latest.coordinates.speedKmh ?? 0) > 0 ? "moving" : "stopped";
}

export interface MapPoint {
  x: number;
  y: number;
}

const MAP_MARGIN = 10;
const MAP_SPAN = 80;

/** GPS pings (newest first, as eventsOfType returns them) drawn oldest first in the 0-100 map box, north up. */
export function projectRoute(pings: readonly TrackingEventView[]): readonly MapPoint[] {
  const coordinates = pings
    .flatMap((ping) => (ping.coordinates ? [ping.coordinates] : []))
    .reverse();
  if (coordinates.length === 0) return [];
  const lats = coordinates.map((point) => point.latitude);
  const lngs = coordinates.map((point) => point.longitude);
  const minLat = Math.min(...lats);
  const minLng = Math.min(...lngs);
  const latSpan = Math.max(...lats) - minLat || 1;
  const lngSpan = Math.max(...lngs) - minLng || 1;
  return coordinates.map((point) => ({
    x: MAP_MARGIN + ((point.longitude - minLng) / lngSpan) * MAP_SPAN,
    y: MAP_MARGIN + (1 - (point.latitude - minLat) / latSpan) * MAP_SPAN,
  }));
}
