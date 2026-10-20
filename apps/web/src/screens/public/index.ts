import type { ScreenEntry } from "@/screens/types";
import { ensureLookupTypes } from "@/utils/lookups";
import { Landing } from "./landing/landing";
import { SignUpChooser } from "./sign-up/sign-up-chooser";
import { TravelerSignUp } from "./sign-up/traveler-sign-up";
import { PlatformDriverSignUp } from "./sign-up/platform-driver-sign-up";
import { PhotographerSignUp } from "./sign-up/photographer-sign-up";
import { OrganizationSignUp } from "./sign-up/organization-sign-up";
import { VerificationByCode } from "./sign-up/verification-by-code";
import { SignIn } from "./sign-in/sign-in";
import { AdminSignIn } from "./sign-in/admin-sign-in";
import { AdminAuthenticatorSetUpAndCode } from "./sign-in/admin-authenticator-set-up-and-code";
import { OrganizationStaffSignInWithCode } from "./sign-in/organization-staff-sign-in-with-code";
import { StaffCodeSetUp } from "./sign-in/staff-code-set-up";
import { PasswordReset } from "./account-recovery/password-reset";
import { SessionExpired } from "./account-recovery/session-expired";
import { AccountSuspended } from "./account-recovery/account-suspended";
import { DeletionGracePeriod } from "./account-recovery/deletion-grace-period";
import { ApplicationStatusAndChangesResponse } from "./account-recovery/application-status-and-changes-response";
import { AppealARejection } from "./account-recovery/appeal-a-rejection";
import { ModeratorSignInWithStaffCode } from "./sign-in/moderator-sign-in-with-staff-code";
import { Legal } from "./legal/legal";
import { OrganizerPage } from "./organizer-page/organizer-page";
import { ForBusiness } from "./for-business/for-business";
import { serverQueryOptions } from "@/utils/server-rpc";

export const PUBLIC_SCREENS: readonly ScreenEntry[] = [
  {
    id: "SCR-PUB-01",
    slug: "landing",
    titleKey: "screen.registry.public.landing.title",
    surface: "public",
    component: Landing,
    loader: async ({ queryClient, orpc }) => {
      try {
        await queryClient.ensureQueryData(
          serverQueryOptions(orpc.trips.browsePublicTrips, "trips/browsePublicTrips", {
            input: {},
          }),
        );
      } catch {
        // Graceful handling for SSR
      }
    },
  },
  {
    id: "SCR-PUB-02",
    slug: "sign-up-chooser",
    titleKey: "screen.registry.public.signUpChooser.title",
    surface: "public",
    component: SignUpChooser,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-PUB-03",
    slug: "traveler-sign-up",
    titleKey: "screen.registry.public.travelerSignUp.title",
    surface: "public",
    component: TravelerSignUp,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-PUB-04",
    slug: "platform-driver-sign-up",
    titleKey: "screen.registry.public.platformDriverSignUp.title",
    surface: "public",
    component: PlatformDriverSignUp,
    loader: async ({ queryClient }) => {
      try {
        await ensureLookupTypes(queryClient);
      } catch {
        // Graceful handling for SSR
      }
    },
  },
  {
    id: "SCR-PUB-05",
    slug: "photographer-sign-up",
    titleKey: "screen.registry.public.photographerSignUp.title",
    surface: "public",
    component: PhotographerSignUp,
    loader: async ({ queryClient }) => {
      try {
        await ensureLookupTypes(queryClient);
      } catch {
        // Graceful handling for SSR
      }
    },
  },
  {
    id: "SCR-PUB-06",
    slug: "organization-sign-up",
    titleKey: "screen.registry.public.organizationSignUp.title",
    surface: "public",
    component: OrganizationSignUp,
    loader: async ({ queryClient }) => {
      try {
        await ensureLookupTypes(queryClient);
      } catch {
        // Graceful handling for SSR
      }
    },
  },
  {
    id: "SCR-PUB-07",
    slug: "verification-by-code",
    titleKey: "screen.registry.public.verificationByCode.title",
    surface: "public",
    component: VerificationByCode,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-PUB-08",
    slug: "sign-in",
    titleKey: "screen.registry.public.signIn.title",
    surface: "public",
    component: SignIn,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-PUB-09",
    slug: "admin-sign-in",
    titleKey: "screen.registry.public.adminSignIn.title",
    surface: "public",
    component: AdminSignIn,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-PUB-10",
    slug: "admin-authenticator-set-up-and-code",
    titleKey: "screen.registry.public.adminAuthenticatorSetUpAndCode.title",
    surface: "public",
    component: AdminAuthenticatorSetUpAndCode,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-PUB-11",
    slug: "organization-staff-sign-in-with-code",
    titleKey: "screen.registry.public.organizationStaffSignInWithCode.title",
    surface: "public",
    component: OrganizationStaffSignInWithCode,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-PUB-12",
    slug: "staff-code-set-up",
    titleKey: "screen.registry.public.staffCodeSetUp.title",
    surface: "public",
    component: StaffCodeSetUp,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-PUB-13",
    slug: "password-reset",
    titleKey: "screen.registry.public.passwordReset.title",
    surface: "public",
    component: PasswordReset,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-PUB-14",
    slug: "session-expired",
    titleKey: "screen.registry.public.sessionExpired.title",
    surface: "public",
    component: SessionExpired,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-PUB-15",
    slug: "account-suspended",
    titleKey: "screen.registry.public.accountSuspended.title",
    surface: "public",
    component: AccountSuspended,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-PUB-16",
    slug: "deletion-grace-period",
    titleKey: "screen.registry.public.deletionGracePeriod.title",
    surface: "public",
    component: DeletionGracePeriod,
    loader: async ({ queryClient, orpc }) => {
      try {
        await queryClient.ensureQueryData(
          serverQueryOptions(orpc.auth.getAuthSettings, "auth/getAuthSettings", {
            input: undefined,
          }),
        );
      } catch {
        // Graceful handling for SSR
      }
    },
  },
  {
    id: "SCR-PUB-17",
    slug: "application-status-and-changes-response",
    titleKey: "screen.registry.public.applicationStatusAndChangesResponse.title",
    surface: "public",
    component: ApplicationStatusAndChangesResponse,
    loader: async ({ queryClient, orpc, auth, search }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      const appId = search?.applicationId ? String(search.applicationId) : undefined;
      try {
        await queryClient.ensureQueryData(
          serverQueryOptions(
            orpc.onboarding.getApplicationStatus,
            "onboarding/getApplicationStatus",
            {
              input: appId ? { applicationId: appId } : {},
            },
          ),
        );
      } catch {
        // Graceful handling for SSR
      }
    },
  },
  {
    id: "SCR-PUB-18",
    slug: "appeal-a-rejection",
    titleKey: "screen.registry.public.appealARejection.title",
    surface: "public",
    component: AppealARejection,
    loader: async ({ queryClient, orpc, auth, search }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      const appId = search?.applicationId ? String(search.applicationId) : undefined;
      try {
        await queryClient.ensureQueryData(
          serverQueryOptions(
            orpc.onboarding.getApplicationStatus,
            "onboarding/getApplicationStatus",
            {
              input: appId ? { applicationId: appId } : {},
            },
          ),
        );
      } catch {
        // Graceful handling for SSR
      }
    },
  },
  {
    id: "SCR-PUB-19",
    slug: "moderator-sign-in-with-staff-code",
    titleKey: "screen.registry.public.moderatorSignInWithStaffCode.title",
    surface: "public",
    component: ModeratorSignInWithStaffCode,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-PUB-20",
    slug: "legal",
    titleKey: "screen.registry.public.legal.title",
    surface: "public",
    component: Legal,
    // Static policy content: nothing to prefetch.
    loader: async () => {},
  },
  {
    id: "SCR-PUB-21",
    slug: "organizer-page",
    titleKey: "screen.registry.public.organizerPage.title",
    surface: "public",
    component: OrganizerPage,
    // The organizer profile derives from the public trip rows; there is no organizer procedure.
    loader: async ({ queryClient, orpc }) => {
      try {
        await queryClient.ensureQueryData(
          serverQueryOptions(orpc.trips.browsePublicTrips, "trips/browsePublicTrips", {
            input: {},
          }),
        );
      } catch {
        // Graceful handling for SSR
      }
    },
  },
  {
    id: "SCR-PUB-22",
    slug: "for-business",
    titleKey: "screen.registry.public.forBusiness.title",
    surface: "public",
    component: ForBusiness,
    // Static marketing content: nothing to prefetch.
    loader: async () => {},
  },
];
