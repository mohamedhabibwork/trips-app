package com.tripsenjoy.auth

import kotlinx.serialization.json.JsonObject

/**
 * The decisions around a failed or expiring call (PRD §7.2 R2/R4, §7.3 F2, AC-2 countdown).
 *
 * Pure functions so the same fixture list can be asserted on web and on mobile (success criterion G2).
 */
object AuthRefreshPolicy {

    /** The codes that mean "this access token is no longer accepted" (R2). */
    val expiredCodes: Set<String> get() = AuthConventions.refreshableCodes.toSet()

    /**
     * Procedures that must never trigger a refresh (R4).
     *
     * Read from `conventions.json` so web and Kotlin cannot disagree about the list.
     */
    val noRefreshProcedures: Set<String> get() = AuthConventions.noRefreshProcedures.toSet()

    /** True when [procedure] is one of the six procedures a refresh must never wrap (R4). */
    fun isNoRefreshProcedure(procedure: String?): Boolean =
        procedure != null && procedure in noRefreshProcedures

    /**
     * True when a failed call should be refreshed once and replayed (R2), false when it should be
     * surfaced as-is (R4).
     *
     * A 401 is enough on its own: the server answers 401 for an expired token, a revoked session and
     * `UNAUTHORIZED` on any authenticated procedure, and each of those deserves exactly one refresh
     * attempt before the session is declared over.
     */
    fun needsRefreshOnError(status: Int, code: String, procedure: String?): Boolean {
        if (isNoRefreshProcedure(procedure)) return false
        if (status == HTTP_UNAUTHORIZED) return true
        return code in expiredCodes
    }

    /** True when the failure reason is the 12-hour cap, which gets the drafts-retained wording (F2). */
    fun isMaxSessionReason(details: JsonObject?): Boolean =
        AuthErrorDetails(details).reason == maxSessionReason

    /** The `details.reason` the server sends when the session cap was reached (F2). */
    val maxSessionReason: String get() = AuthConventions.maxSessionReason

    /**
     * The countdown to show, in seconds, from whichever detail the server sent (AC-2).
     *
     * Order: `remainingLockoutSeconds` (present when the account is already locked), then
     * `lockedUntil` derived against [nowMs], then `retryAfterSeconds`. Zero means "no countdown".
     */
    fun lockoutSecondsRemaining(details: JsonObject?, nowMs: Long): Long {
        val view = AuthErrorDetails(details)
        view.remainingLockoutSeconds?.let { return it.coerceAtLeast(0L) }
        view.lockedUntil?.let { lockedUntil ->
            val remainingMs = lockedUntil - nowMs
            if (remainingMs <= 0L) return 0L
            // Round up so a 4.2 s remainder shows "5" and the button never re-enables early.
            return (remainingMs + 999L) / 1_000L
        }
        view.retryAfterSeconds?.let { return it.coerceAtLeast(0L) }
        return 0L
    }

    /** The countdown for a paused OTP channel, in seconds; zero when no pause hint was sent. */
    fun pauseSecondsRemaining(details: JsonObject?, nowMs: Long): Long {
        val view = AuthErrorDetails(details)
        view.pausedUntil?.let { pausedUntil ->
            val remainingMs = pausedUntil - nowMs
            if (remainingMs <= 0L) return 0L
            return (remainingMs + 999L) / 1_000L
        }
        return view.retryAfterSeconds?.coerceAtLeast(0L) ?: 0L
    }

    /** HTTP 401. */
    const val HTTP_UNAUTHORIZED: Int = 401

    /** HTTP 403. */
    const val HTTP_FORBIDDEN: Int = 403

    /** HTTP 409. */
    const val HTTP_CONFLICT: Int = 409

    /** HTTP 429. */
    const val HTTP_RATE_LIMITED: Int = 429

    /** HTTP 412. */
    const val HTTP_PRECONDITION_FAILED: Int = 412
}
