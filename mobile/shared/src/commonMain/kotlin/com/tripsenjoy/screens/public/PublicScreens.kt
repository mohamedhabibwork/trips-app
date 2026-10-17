package com.tripsenjoy.screens.public

import com.tripsenjoy.screens.ScreenEntry
import com.tripsenjoy.screens.public.account.AccountSuspended
import com.tripsenjoy.screens.public.account.DeletionGracePeriod
import com.tripsenjoy.screens.public.account.PasswordReset
import com.tripsenjoy.screens.public.account.SessionExpired
import com.tripsenjoy.screens.public.onboarding.AppealRejection
import com.tripsenjoy.screens.public.onboarding.ApplicationStatusAndChangesResponse
import com.tripsenjoy.screens.public.signin.AdminAuthenticatorSetUpAndCode
import com.tripsenjoy.screens.public.signin.AdminSignIn
import com.tripsenjoy.screens.public.signin.ModeratorSignInWithStaffCode
import com.tripsenjoy.screens.public.signin.OrganizationStaffSignInWithCode
import com.tripsenjoy.screens.public.signin.SignIn
import com.tripsenjoy.screens.public.signin.StaffCodeSetup
import com.tripsenjoy.screens.public.signup.Landing
import com.tripsenjoy.screens.public.signup.OrganizationSignUp
import com.tripsenjoy.screens.public.signup.PhotographerSignUp
import com.tripsenjoy.screens.public.signup.PlatformDriverSignUp
import com.tripsenjoy.screens.public.signup.SignUpChooser
import com.tripsenjoy.screens.public.signup.TravelerSignUp
import com.tripsenjoy.screens.public.signup.VerificationByCode

// Public and auth screens (SCR-PUB-01 to 19). Titles are the spec headings in docs/screens/00-public-and-auth.md.
// Ids and titles match the spec. Screen navigation runs through LocalScreenNavigator.
val PUBLIC_SCREENS: List<ScreenEntry> = listOf(
    ScreenEntry(id = "SCR-PUB-01", title = "Landing (gap)", content = { Landing() }),
    ScreenEntry(id = "SCR-PUB-02", title = "Sign-up chooser (/register)", content = { SignUpChooser() }),
    ScreenEntry(id = "SCR-PUB-03", title = "Traveler sign-up", content = { TravelerSignUp() }),
    ScreenEntry(id = "SCR-PUB-04", title = "Platform driver sign-up", content = { PlatformDriverSignUp() }),
    ScreenEntry(id = "SCR-PUB-05", title = "Photographer sign-up", content = { PhotographerSignUp() }),
    ScreenEntry(id = "SCR-PUB-06", title = "Organization sign-up (web only)", content = { OrganizationSignUp() }),
    ScreenEntry(id = "SCR-PUB-07", title = "Verification by code", content = { VerificationByCode() }),
    ScreenEntry(id = "SCR-PUB-08", title = "Sign-in (traveler and supplier)", content = { SignIn() }),
    ScreenEntry(id = "SCR-PUB-09", title = "Admin sign-in", content = { AdminSignIn() }),
    ScreenEntry(
        id = "SCR-PUB-10",
        title = "Admin authenticator set-up and code",
        content = { AdminAuthenticatorSetUpAndCode() },
    ),
    ScreenEntry(
        id = "SCR-PUB-11",
        title = "Organization staff sign-in with code",
        content = { OrganizationStaffSignInWithCode() },
    ),
    ScreenEntry(id = "SCR-PUB-12", title = "Staff code set-up (first sign-in)", content = { StaffCodeSetup() }),
    ScreenEntry(id = "SCR-PUB-13", title = "Password reset (gap)", content = { PasswordReset() }),
    ScreenEntry(id = "SCR-PUB-14", title = "Session expired", content = { SessionExpired() }),
    ScreenEntry(id = "SCR-PUB-15", title = "Account suspended", content = { AccountSuspended() }),
    ScreenEntry(id = "SCR-PUB-16", title = "Deletion grace period", content = { DeletionGracePeriod() }),
    ScreenEntry(
        id = "SCR-PUB-17",
        title = "Application status and changes response",
        content = { ApplicationStatusAndChangesResponse() },
    ),
    ScreenEntry(id = "SCR-PUB-18", title = "Appeal a rejection", content = { AppealRejection() }),
    ScreenEntry(
        id = "SCR-PUB-19",
        title = "Moderator sign-in with staff code",
        content = { ModeratorSignInWithStaffCode() },
    ),
)
