import {
  bookingDetailDtoSchema,
  bookingDtoSchema,
  cancelBookingSchema,
  createBookingSchema,
  getBookingSchema,
  listOrganizationBookingsSchema,
} from "../schemas";
import { createBookingService } from "../services";
import { bookingAuthenticatedProcedure, bookingOrgViewProcedure, procedure } from "./procedure";

const status = procedure
  .route({
    method: "GET",
    path: "/booking/status",
    summary: "Health check for the booking service",
    tags: ["booking"],
  })
  .handler(async () => ({ service: "booking" as const, status: "ok" as const }));

const createBooking = bookingAuthenticatedProcedure
  .input(createBookingSchema)
  .output(bookingDetailDtoSchema)
  .handler(async ({ context, input }) => {
    const svc = createBookingService({ db: context.db });
    return await svc.createBooking(context.auth.accountId, input);
  });

const cancelBooking = bookingAuthenticatedProcedure
  .input(cancelBookingSchema)
  .output(bookingDtoSchema)
  .handler(async ({ context, input }) => {
    const svc = createBookingService({ db: context.db });
    return await svc.cancelBooking(
      {
        accountId: context.auth.accountId,
        tenantId: context.auth.activeTenantId,
        role: context.auth.activeRole,
      },
      input,
    );
  });

const getBooking = bookingAuthenticatedProcedure
  .input(getBookingSchema)
  .output(bookingDetailDtoSchema)
  .handler(async ({ context, input }) => {
    const svc = createBookingService({ db: context.db });
    return await svc.getBooking(
      {
        accountId: context.auth.accountId,
        tenantId: context.auth.activeTenantId,
        role: context.auth.activeRole,
      },
      input.bookingId,
    );
  });

const listMyBookings = bookingAuthenticatedProcedure
  .output(bookingDtoSchema.array())
  .handler(async ({ context }) => {
    const svc = createBookingService({ db: context.db });
    return await svc.listMyBookings(context.auth.accountId);
  });

const listOrganizationBookings = bookingOrgViewProcedure
  .input(listOrganizationBookingsSchema)
  .output(bookingDtoSchema.array())
  .handler(async ({ context, input }) => {
    const svc = createBookingService({ db: context.db });
    return await svc.listOrganizationBookings(context.auth.activeTenantId, input?.tripId);
  });

export const routes = {
  status,
  createBooking,
  cancelBooking,
  getBooking,
  listMyBookings,
  listOrganizationBookings,
};
