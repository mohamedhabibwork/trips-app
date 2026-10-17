package com.tripsenjoy.auth

/**
 * When a session must be renewed, expired, or left alone (PRD §7.2 R1 and R6).
 *
 * Pure functions with an explicit `nowMs` so every boundary is unit-testable against the same
 * fixtures the web contract uses (`packages/auth/src/expiry.ts`).
 */
object AuthExpiry {

    /** The default proactive refresh window: 60 s before `accessTokenExpiresAt` (R1). */
    val defaultLeadMs: Long get() = AuthConventions.refreshLeadMs

    /**
     * True when the access token is inside the refresh window, i.e. `now >= exp - leadMs`.
     *
     * The comparison is inclusive so the exact boundary refreshes; a refresh that happens one tick
     * early costs nothing, one that happens late costs a 401 round trip.
     */
    fun isAccessTokenExpiring(
        record: SessionRecord,
        nowMs: Long,
        leadMs: Long = defaultLeadMs,
    ): Boolean = nowMs >= record.accessTokenExpiresAt - leadMs

    /** True when the session reached its hard cap, i.e. `now >= sessionMaxExpiresAt` (R6). */
    fun isSessionExpired(record: SessionRecord, nowMs: Long): Boolean =
        nowMs >= record.sessionMaxExpiresAt

    /**
     * True when the caller should refresh before issuing an authenticated request: R1 **and not** R6.
     *
     * R6 wins: past the session cap there is no point spending a request that can only fail.
     */
    fun shouldRefreshBeforeCall(record: SessionRecord, nowMs: Long): Boolean =
        !isSessionExpired(record, nowMs) && isAccessTokenExpiring(record, nowMs)
}
