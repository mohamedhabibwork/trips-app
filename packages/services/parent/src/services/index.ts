import { ParentServiceError } from "../errors";
import { createParentRepository, type ServiceDatabase } from "../repository";
import type {
  ChildTripLiveStatusDto,
  LinkChildToParentInput,
  RevokeChildLinkInput,
} from "../types";

export function createParentService(deps: { db: ServiceDatabase }) {
  const repo = createParentRepository(deps.db);

  return {
    async listLinkedChildren(parentAccountId: string) {
      return repo.listLinksByParent(parentAccountId);
    },

    async linkChildToParent(parentAccountId: string, input: LinkChildToParentInput) {
      const booking = await repo.findBookingById(input.bookingId);
      if (!booking) {
        throw new ParentServiceError("BOOKING_NOT_FOUND", "Booking not found.");
      }
      if (booking.travelerAccountId !== parentAccountId) {
        throw new ParentServiceError(
          "FORBIDDEN_PARENT_ACCESS",
          "You cannot link a child for an unrelated booking.",
        );
      }
      const matchingPassenger = booking.passengers.find((p) => p.id === input.childPassengerId);
      if (booking.passengers.length > 0 && !matchingPassenger) {
        throw new ParentServiceError(
          "FORBIDDEN_PARENT_ACCESS",
          "Specified child passenger does not belong to this booking.",
        );
      }
      return repo.insertLink({
        parentAccountId,
        tenantId: booking.tenantId,
        tripId: booking.tripId,
        bookingId: booking.id,
        childPassengerId: input.childPassengerId,
        childFullName: input.childFullName,
        relationship: input.relationship,
      });
    },

    async revokeChildLink(parentAccountId: string, input: RevokeChildLinkInput) {
      const link = await repo.findLinkById(input.linkId);
      if (!link) {
        throw new ParentServiceError("CHILD_LINK_NOT_FOUND", "Child link not found.");
      }
      if (link.parentAccountId !== parentAccountId) {
        throw new ParentServiceError(
          "FORBIDDEN_PARENT_ACCESS",
          "You cannot revoke another guardian's link.",
        );
      }
      const updated = await repo.markLinkRevoked(link.id);
      if (!updated) {
        throw new ParentServiceError("CHILD_LINK_NOT_FOUND", "Child link not found.");
      }
      return updated;
    },

    async getChildTripLiveStatus(
      parentAccountId: string,
      linkId: string,
    ): Promise<ChildTripLiveStatusDto> {
      const link = await repo.findLinkById(linkId);
      if (!link) {
        throw new ParentServiceError("CHILD_LINK_NOT_FOUND", "Child link not found.");
      }
      if (link.parentAccountId !== parentAccountId || link.status !== "active") {
        throw new ParentServiceError(
          "FORBIDDEN_PARENT_ACCESS",
          "Active guardian link is required.",
        );
      }
      const checkInRecord = await repo.findChildCheckInRecord(
        link.bookingId,
        link.childPassengerId,
      );
      const events = await repo.listChildTripEvents(link.tripId, link.childPassengerId);
      return {
        link,
        checkInRecord,
        events,
      };
    },
  };
}

export type ParentService = ReturnType<typeof createParentService>;
