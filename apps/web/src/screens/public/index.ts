import type { ScreenEntry } from "@/screens/types";
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

export const PUBLIC_SCREENS: readonly ScreenEntry[] = [
  {
    id: "SCR-PUB-01",
    slug: "landing",
    title: "Landing",
    surface: "public",
    component: Landing,
  },
  {
    id: "SCR-PUB-02",
    slug: "sign-up-chooser",
    title: "Sign-up chooser (/register)",
    surface: "public",
    component: SignUpChooser,
  },
  {
    id: "SCR-PUB-03",
    slug: "traveler-sign-up",
    title: "Traveler sign-up",
    surface: "public",
    component: TravelerSignUp,
  },
  {
    id: "SCR-PUB-04",
    slug: "platform-driver-sign-up",
    title: "Platform driver sign-up",
    surface: "public",
    component: PlatformDriverSignUp,
  },
  {
    id: "SCR-PUB-05",
    slug: "photographer-sign-up",
    title: "Photographer sign-up",
    surface: "public",
    component: PhotographerSignUp,
  },
  {
    id: "SCR-PUB-06",
    slug: "organization-sign-up",
    title: "Organization sign-up (web only)",
    surface: "public",
    component: OrganizationSignUp,
  },
  {
    id: "SCR-PUB-07",
    slug: "verification-by-code",
    title: "Verification by code",
    surface: "public",
    component: VerificationByCode,
  },
  {
    id: "SCR-PUB-08",
    slug: "sign-in",
    title: "Sign-in (traveler and supplier)",
    surface: "public",
    component: SignIn,
  },
  {
    id: "SCR-PUB-09",
    slug: "admin-sign-in",
    title: "Admin sign-in",
    surface: "public",
    component: AdminSignIn,
  },
  {
    id: "SCR-PUB-10",
    slug: "admin-authenticator-set-up-and-code",
    title: "Admin authenticator set-up and code",
    surface: "public",
    component: AdminAuthenticatorSetUpAndCode,
  },
  {
    id: "SCR-PUB-11",
    slug: "organization-staff-sign-in-with-code",
    title: "Organization staff sign-in with code",
    surface: "public",
    component: OrganizationStaffSignInWithCode,
  },
  {
    id: "SCR-PUB-12",
    slug: "staff-code-set-up",
    title: "Staff code set-up (first sign-in)",
    surface: "public",
    component: StaffCodeSetUp,
  },
  {
    id: "SCR-PUB-13",
    slug: "password-reset",
    title: "Password reset",
    surface: "public",
    component: PasswordReset,
  },
  {
    id: "SCR-PUB-14",
    slug: "session-expired",
    title: "Session expired",
    surface: "public",
    component: SessionExpired,
  },
  {
    id: "SCR-PUB-15",
    slug: "account-suspended",
    title: "Account suspended",
    surface: "public",
    component: AccountSuspended,
  },
  {
    id: "SCR-PUB-16",
    slug: "deletion-grace-period",
    title: "Deletion grace period",
    surface: "public",
    component: DeletionGracePeriod,
  },
  {
    id: "SCR-PUB-17",
    slug: "application-status-and-changes-response",
    title: "Application status and changes response",
    surface: "public",
    component: ApplicationStatusAndChangesResponse,
  },
  {
    id: "SCR-PUB-18",
    slug: "appeal-a-rejection",
    title: "Appeal a rejection",
    surface: "public",
    component: AppealARejection,
  },
  {
    id: "SCR-PUB-19",
    slug: "moderator-sign-in-with-staff-code",
    title: "Moderator sign-in with staff code",
    surface: "public",
    component: ModeratorSignInWithStaffCode,
  },
];
