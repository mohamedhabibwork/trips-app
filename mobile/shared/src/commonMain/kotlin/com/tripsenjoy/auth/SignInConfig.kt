package com.tripsenjoy.auth

import com.tripsenjoy.surfaces.SurfaceRole

/** The sign-in methods a surface offers (PRD §3). */
enum class SignInMethod(val wire: String) {
    /** A one-time code sent to the identifier. */
    OTP(AuthRepository.METHOD_OTP),

    /** A password. */
    PASSWORD(AuthRepository.METHOD_PASSWORD),

    /** A six-character staff code; the code itself is the second factor. */
    STAFF_CODE("staff_code"),
}

/**
 * The only per-app table in the mobile auth layer (ARCHITECTURE §5.3, PRD Q3).
 *
 * One parameterised sign-in screen serves all four apps; the app supplies one of these and nothing
 * else. That is what keeps the four surfaces behaviourally identical.
 */
data class SignInConfig(
    /** Which app this is. */
    val role: SurfaceRole,

    /** The methods the sign-in screen offers, in display order. */
    val methods: List<SignInMethod>,

    /** True when the app offers self-registration. */
    val allowRegistration: Boolean,

    /** The `role` a supplier registration submits, or `null` when registration is traveler-only. */
    val registrationRole: String?,

    /** The `surface` every auth call declares. */
    val surface: String,
) {
    /** True when the app has a role tab as well as the traveler tab (D-124). */
    val hasRoleTab: Boolean get() = role != SurfaceRole.TRAVELER

    /** True when the app signs in with a staff code only. */
    val isStaffCodeOnly: Boolean
        get() = methods.size == 1 && methods.first() == SignInMethod.STAFF_CODE

    /** True when the app offers the OTP/password segmented control. */
    val offersIdentifierSignIn: Boolean
        get() = SignInMethod.OTP in methods || SignInMethod.PASSWORD in methods

    /** True when the app offers a password field at all. */
    val offersPassword: Boolean get() = SignInMethod.PASSWORD in methods

    /** True when the app offers the OTP method. */
    val offersOtp: Boolean get() = SignInMethod.OTP in methods

    /**
     * The registration procedure this app calls, or `null` when it offers no registration.
     *
     * A traveler self-registers through `auth/registerTraveler`; a driver or photographer goes
     * through `auth/registerSupplierAccount` with [registrationRole] (PRD P0-1, ARCHITECTURE §5.3).
     * Using the wrong one would create the wrong account, so the choice lives here and nowhere else.
     */
    val registrationProcedure: String?
        get() = when {
            !allowRegistration -> null
            registrationRole == null -> AuthRepository.PROC_REGISTER_TRAVELER
            else -> AuthRepository.PROC_REGISTER_SUPPLIER
        }

    companion object {
        /** Traveler app: OTP or password, self-registration, `mobile` surface. */
        val TRAVELER: SignInConfig = SignInConfig(
            role = SurfaceRole.TRAVELER,
            methods = listOf(SignInMethod.OTP, SignInMethod.PASSWORD),
            allowRegistration = true,
            registrationRole = null,
            surface = AuthRepository.SURFACE_MOBILE,
        )

        /** Driver app: OTP or password, supplier registration as `platform_driver`. */
        val DRIVER: SignInConfig = SignInConfig(
            role = SurfaceRole.DRIVER,
            methods = listOf(SignInMethod.OTP, SignInMethod.PASSWORD),
            allowRegistration = true,
            registrationRole = AuthRepository.ROLE_PLATFORM_DRIVER,
            surface = AuthRepository.SURFACE_MOBILE,
        )

        /** Photographer app: OTP or password, supplier registration as `platform_photographer`. */
        val PHOTOGRAPHER: SignInConfig = SignInConfig(
            role = SurfaceRole.PHOTOGRAPHER,
            methods = listOf(SignInMethod.OTP, SignInMethod.PASSWORD),
            allowRegistration = true,
            registrationRole = AuthRepository.ROLE_PLATFORM_PHOTOGRAPHER,
            surface = AuthRepository.SURFACE_MOBILE,
        )

        /**
         * Moderator app: staff code only, no registration.
         *
         * The moderator is the crew surface, which the shared conventions map to the `pwa` platform,
         * and `moderatorSignInSchema` accepts `pwa`; the e2e flow uses it too. The mobile app sends
         * the same value so the two moderator clients are indistinguishable to the server.
         */
        val MODERATOR: SignInConfig = SignInConfig(
            role = SurfaceRole.MODERATOR,
            methods = listOf(SignInMethod.STAFF_CODE),
            allowRegistration = false,
            registrationRole = null,
            surface = AuthRepository.SURFACE_PWA,
        )

        /** The config for [role]; the traveler config is the safe default. */
        fun forRole(role: SurfaceRole): SignInConfig = when (role) {
            SurfaceRole.TRAVELER -> TRAVELER
            SurfaceRole.DRIVER -> DRIVER
            SurfaceRole.PHOTOGRAPHER -> PHOTOGRAPHER
            SurfaceRole.MODERATOR -> MODERATOR
        }
    }
}
