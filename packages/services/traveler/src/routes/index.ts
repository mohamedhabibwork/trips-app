// oRPC procedures for Traveler. Validate input with schemas, call services, map errors.
// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.
import {
  requestPrivacyActionInputSchema,
  updateNotificationPreferencesInputSchema,
  updateProfileInputSchema,
} from "../schemas/validation";
import { createTravelerService } from "../services";
import type { TravelerActorContext } from "../types";
import { procedure, protectedProcedure } from "./procedure";

function extractActorContext(context: {
  auth: { accountId: string; activeRole: TravelerActorContext["role"] };
  ipAddress?: string | null;
  requestId?: string | null;
}): TravelerActorContext {
  return {
    accountId: context.auth.accountId,
    role: context.auth.activeRole,
    ipAddress: context.ipAddress ?? null,
    requestId: context.requestId ?? null,
  };
}

export const routes = {
  status: procedure
    .route({
      method: "GET",
      path: "/traveler/status",
      operationId: "travelerStatus",
      summary: "Traveler service health status",
      tags: ["traveler"],
    })
    .handler(() => ({ service: "traveler", status: "ok" as const })),

  getProfile: protectedProcedure
    .route({
      method: "GET",
      path: "/traveler/profile",
      operationId: "travelerGetProfile",
      summary: "Get traveler profile, contact channels, language, and notification preferences",
      tags: ["traveler"],
    })
    .handler(async ({ context }) => {
      const service = createTravelerService(context.db);
      return service.getProfile(extractActorContext(context));
    }),

  updateProfile: protectedProcedure
    .route({
      method: "PATCH",
      path: "/traveler/profile",
      operationId: "travelerUpdateProfile",
      summary: "Update traveler profile, language, and avatar (D-20)",
      tags: ["traveler"],
    })
    .input(updateProfileInputSchema)
    .handler(async ({ input, context }) => {
      const service = createTravelerService(context.db);
      return service.updateProfile(extractActorContext(context), input);
    }),

  getNotificationPreferences: protectedProcedure
    .route({
      method: "GET",
      path: "/traveler/notification-preferences",
      operationId: "travelerGetNotificationPreferences",
      summary: "Get traveler notification channel preferences",
      tags: ["traveler"],
    })
    .handler(async ({ context }) => {
      const service = createTravelerService(context.db);
      return service.getNotificationPreferences(extractActorContext(context));
    }),

  updateNotificationPreferences: protectedProcedure
    .route({
      method: "PATCH",
      path: "/traveler/notification-preferences",
      operationId: "travelerUpdateNotificationPreferences",
      summary: "Update traveler notification channel preferences",
      tags: ["traveler"],
    })
    .input(updateNotificationPreferencesInputSchema)
    .handler(async ({ input, context }) => {
      const service = createTravelerService(context.db);
      return service.updateNotificationPreferences(extractActorContext(context), input);
    }),

  getPlanOverview: protectedProcedure
    .route({
      method: "GET",
      path: "/traveler/plan",
      operationId: "travelerGetPlanOverview",
      summary: "Get traveler current plan tier and comparison catalog (SCR-TRV-18)",
      tags: ["traveler"],
    })
    .handler(async ({ context }) => {
      const service = createTravelerService(context.db);
      return service.getPlanOverview(extractActorContext(context));
    }),

  requestPrivacyAction: protectedProcedure
    .route({
      method: "POST",
      path: "/traveler/privacy-requests",
      operationId: "travelerRequestPrivacyAction",
      summary: "Submit a personal data export or account deletion request (SCR-TRV-20)",
      tags: ["traveler"],
    })
    .input(requestPrivacyActionInputSchema)
    .handler(async ({ input, context }) => {
      const service = createTravelerService(context.db);
      return service.requestPrivacyAction(extractActorContext(context), input);
    }),
};
