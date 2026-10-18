import type { ScreenEntry } from "@/screens/types";
import { AdminHome } from "./home/admin-home";
import { ApplicationQueue } from "./applications/application-queue";
import { ApplicationReviewDetail } from "./applications/application-review-detail";
import { RequestChangesDecision } from "./applications/request-changes-decision";
import { RejectWithReasonDecision } from "./applications/reject-with-reason-decision";
import { AppealReview } from "./applications/appeal-review";
import { UsersAndEntitiesDirectory } from "./directory/users-and-entities-directory";
import { EntityDetail } from "./directory/entity-detail";
import { SuspendOrReinstateDecision } from "./directory/suspend-or-reinstate-decision";
import { DeletionAndDataRequests } from "./directory/deletion-and-data-requests";
import { AdminStaffAccounts } from "./directory/admin-staff-accounts";
import { LabTestsQueue } from "./lab-tests/lab-tests-queue";
import { LabTestDetailAndDecision } from "./lab-tests/lab-test-detail-and-decision";
import { RequestLabTestDecision } from "./lab-tests/request-lab-test-decision";
import { PlansCatalog } from "./plans/plans-catalog";
import { PlanEditor } from "./plans/plan-editor";

export const ADMIN_SCREENS_PART_1: readonly ScreenEntry[] = [
  {
    id: "SCR-ADM-01",
    slug: "admin-home",
    titleKey: "screen.registry.admin.adminHome.title",
    surface: "admin",
    component: AdminHome,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(orpc.onboarding.listReviewQueue.queryOptions({ input: {} })),
          queryClient.prefetchQuery(
            orpc.accounting.listAdminReconciliationExceptions.queryOptions(),
          ),
          queryClient.prefetchQuery(orpc.coupons.listPlatformCoupons.queryOptions({ input: {} })),
        ]);
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ADM-02",
    slug: "application-queue",
    titleKey: "screen.registry.admin.applicationQueue.title",
    surface: "admin",
    component: ApplicationQueue,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(
          orpc.onboarding.listReviewQueue.queryOptions({ input: {} }),
        );
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ADM-03",
    slug: "application-review-detail",
    titleKey: "screen.registry.admin.applicationReviewDetail.title",
    surface: "admin",
    component: ApplicationReviewDetail,
    loader: async ({ queryClient, orpc, auth, search, params }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        const appId = (search.applicationId as string) ?? (params.applicationId as string);
        if (appId) {
          await queryClient.ensureQueryData(
            orpc.onboarding.getApplicationDetail.queryOptions({ input: { applicationId: appId } }),
          );
        } else {
          await queryClient.ensureQueryData(
            orpc.onboarding.listReviewQueue.queryOptions({ input: {} }),
          );
        }
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ADM-04",
    slug: "request-changes-decision",
    titleKey: "screen.registry.admin.requestChangesDecision.title",
    surface: "admin",
    component: RequestChangesDecision,
    loader: async ({ queryClient, orpc, auth, search, params }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        const appId = (search.applicationId as string) ?? (params.applicationId as string);
        if (appId) {
          await queryClient.ensureQueryData(
            orpc.onboarding.getApplicationDetail.queryOptions({ input: { applicationId: appId } }),
          );
        }
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ADM-05",
    slug: "reject-with-reason-decision",
    titleKey: "screen.registry.admin.rejectWithReasonDecision.title",
    surface: "admin",
    component: RejectWithReasonDecision,
    loader: async ({ queryClient, orpc, auth, search, params }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        const appId = (search.applicationId as string) ?? (params.applicationId as string);
        if (appId) {
          await queryClient.ensureQueryData(
            orpc.onboarding.getApplicationDetail.queryOptions({ input: { applicationId: appId } }),
          );
        }
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ADM-06",
    slug: "appeal-review",
    titleKey: "screen.registry.admin.appealReview.title",
    surface: "admin",
    component: AppealReview,
    loader: async ({ queryClient, orpc, auth, search, params }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        const appId = (search.applicationId as string) ?? (params.applicationId as string);
        if (appId) {
          await queryClient.ensureQueryData(
            orpc.onboarding.getApplicationDetail.queryOptions({ input: { applicationId: appId } }),
          );
        } else {
          await queryClient.ensureQueryData(
            orpc.onboarding.listReviewQueue.queryOptions({ input: { state: "Appealed" } }),
          );
        }
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ADM-07",
    slug: "users-and-entities-directory",
    titleKey: "screen.registry.admin.usersAndEntitiesDirectory.title",
    surface: "admin",
    component: UsersAndEntitiesDirectory,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(
          orpc.onboarding.listReviewQueue.queryOptions({ input: {} }),
        );
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ADM-08",
    slug: "entity-detail",
    titleKey: "screen.registry.admin.entityDetail.title",
    surface: "admin",
    component: EntityDetail,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.ensureQueryData(orpc.onboarding.listReviewQueue.queryOptions({ input: {} })),
          queryClient.ensureQueryData(orpc.trips.browsePublicTrips.queryOptions({ input: {} })),
          queryClient.ensureQueryData(orpc.plans.getCatalog.queryOptions({ input: {} })),
        ]);
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ADM-09",
    slug: "suspend-or-reinstate-decision",
    titleKey: "screen.registry.admin.suspendOrReinstateDecision.title",
    surface: "admin",
    component: SuspendOrReinstateDecision,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(
          orpc.onboarding.listReviewQueue.queryOptions({ input: {} }),
        );
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ADM-10",
    slug: "deletion-and-data-requests",
    titleKey: "screen.registry.admin.deletionAndDataRequests.title",
    surface: "admin",
    component: DeletionAndDataRequests,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(
          orpc.onboarding.listReviewQueue.queryOptions({ input: { state: "Closed" } }),
        );
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ADM-11",
    slug: "admin-staff-accounts",
    titleKey: "screen.registry.admin.adminStaffAccounts.title",
    surface: "admin",
    component: AdminStaffAccounts,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-ADM-12",
    slug: "lab-tests-queue",
    titleKey: "screen.registry.admin.labTestsQueue.title",
    surface: "admin",
    component: LabTestsQueue,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(
          orpc.onboarding.listReviewQueue.queryOptions({
            input: { applicationType: "platform_driver" },
          }),
        );
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ADM-13",
    slug: "lab-test-detail-and-decision",
    titleKey: "screen.registry.admin.labTestDetailAndDecision.title",
    surface: "admin",
    component: LabTestDetailAndDecision,
    loader: async ({ queryClient, orpc, auth, search, params }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        const appId = (search.applicationId as string) ?? (params.applicationId as string);
        if (appId) {
          await queryClient.ensureQueryData(
            orpc.onboarding.getApplicationDetail.queryOptions({ input: { applicationId: appId } }),
          );
        } else {
          await queryClient.ensureQueryData(
            orpc.onboarding.listReviewQueue.queryOptions({
              input: { applicationType: "platform_driver" },
            }),
          );
        }
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ADM-14",
    slug: "request-lab-test-decision",
    titleKey: "screen.registry.admin.requestLabTestDecision.title",
    surface: "admin",
    component: RequestLabTestDecision,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(
          orpc.onboarding.listReviewQueue.queryOptions({
            input: { applicationType: "platform_driver" },
          }),
        );
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ADM-15",
    slug: "plans-catalog",
    titleKey: "screen.registry.admin.plansCatalog.title",
    surface: "admin",
    component: PlansCatalog,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(orpc.plans.getCatalog.queryOptions({ input: {} }));
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ADM-16",
    slug: "plan-editor",
    titleKey: "screen.registry.admin.planEditor.title",
    surface: "admin",
    component: PlanEditor,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(orpc.plans.getCatalog.queryOptions({ input: {} }));
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
];
