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
    title: "Admin home",
    surface: "admin",
    component: AdminHome,
  },
  {
    id: "SCR-ADM-02",
    slug: "application-queue",
    title: "Application queue",
    surface: "admin",
    component: ApplicationQueue,
  },
  {
    id: "SCR-ADM-03",
    slug: "application-review-detail",
    title: "Application review detail",
    surface: "admin",
    component: ApplicationReviewDetail,
  },
  {
    id: "SCR-ADM-04",
    slug: "request-changes-decision",
    title: "Request changes (decision)",
    surface: "admin",
    component: RequestChangesDecision,
  },
  {
    id: "SCR-ADM-05",
    slug: "reject-with-reason-decision",
    title: "Reject with reason (decision)",
    surface: "admin",
    component: RejectWithReasonDecision,
  },
  {
    id: "SCR-ADM-06",
    slug: "appeal-review",
    title: "Appeal review",
    surface: "admin",
    component: AppealReview,
  },
  {
    id: "SCR-ADM-07",
    slug: "users-and-entities-directory",
    title: "Users and entities directory",
    surface: "admin",
    component: UsersAndEntitiesDirectory,
  },
  {
    id: "SCR-ADM-08",
    slug: "entity-detail",
    title: "Entity detail",
    surface: "admin",
    component: EntityDetail,
  },
  {
    id: "SCR-ADM-09",
    slug: "suspend-or-reinstate-decision",
    title: "Suspend or reinstate (decision)",
    surface: "admin",
    component: SuspendOrReinstateDecision,
  },
  {
    id: "SCR-ADM-10",
    slug: "deletion-and-data-requests",
    title: "Deletion and data requests",
    surface: "admin",
    component: DeletionAndDataRequests,
  },
  {
    id: "SCR-ADM-11",
    slug: "admin-staff-accounts",
    title: "Admin staff accounts",
    surface: "admin",
    component: AdminStaffAccounts,
  },
  {
    id: "SCR-ADM-12",
    slug: "lab-tests-queue",
    title: "Lab tests queue",
    surface: "admin",
    component: LabTestsQueue,
  },
  {
    id: "SCR-ADM-13",
    slug: "lab-test-detail-and-decision",
    title: "Lab test detail and decision",
    surface: "admin",
    component: LabTestDetailAndDecision,
  },
  {
    id: "SCR-ADM-14",
    slug: "request-lab-test-decision",
    title: "Request lab test (decision)",
    surface: "admin",
    component: RequestLabTestDecision,
  },
  {
    id: "SCR-ADM-15",
    slug: "plans-catalog",
    title: "Plans catalog",
    surface: "admin",
    component: PlansCatalog,
  },
  {
    id: "SCR-ADM-16",
    slug: "plan-editor",
    title: "Plan editor",
    surface: "admin",
    component: PlanEditor,
  },
];
