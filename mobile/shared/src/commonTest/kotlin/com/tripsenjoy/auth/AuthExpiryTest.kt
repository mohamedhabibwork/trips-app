package com.tripsenjoy.auth

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNull
import kotlin.test.assertTrue

/**
 * The same fixtures the web contract uses (`packages/auth/test/expiry.test.ts`), so success
 * criterion G2 is checked with identical numbers on both platforms.
 *
 * 900 s access token, 60 s lead, 43 200 s (12 h) session cap.
 */
class AuthExpiryTest {

    private val issuedAt = 1_700_000_000_000L
    private val accessTtlMs = 900L * 1_000L
    private val sessionCapMs = 43_200L * 1_000L

    private fun record(
        accessTokenExpiresAt: Long = issuedAt + accessTtlMs,
        sessionMaxExpiresAt: Long = issuedAt + sessionCapMs,
    ) = SessionRecord(
        accessToken = "access",
        refreshToken = "refresh",
        accessTokenExpiresAt = accessTokenExpiresAt,
        sessionMaxExpiresAt = sessionMaxExpiresAt,
        actor = AuthActor(accountId = "acct-1", sessionId = "s1", activeRole = "traveler"),
    )

    @Test
    fun `the lead window is the generated convention`() {
        assertEquals(60_000L, AuthExpiry.defaultLeadMs)
        assertEquals(60_000L, AuthConventions.refreshLeadMs)
    }

    @Test
    fun `a token with more than the lead window left is not expiring`() {
        val session = record()
        assertFalse(AuthExpiry.isAccessTokenExpiring(session, nowMs = issuedAt))
        assertFalse(
            AuthExpiry.isAccessTokenExpiring(
                session,
                nowMs = issuedAt + accessTtlMs - 60_001L,
            ),
        )
    }

    @Test
    fun `the exact boundary refreshes`() {
        val session = record()
        assertTrue(AuthExpiry.isAccessTokenExpiring(session, nowMs = issuedAt + accessTtlMs - 60_000L))
        assertTrue(AuthExpiry.isAccessTokenExpiring(session, nowMs = issuedAt + accessTtlMs))
        assertTrue(AuthExpiry.isAccessTokenExpiring(session, nowMs = issuedAt + accessTtlMs + 1L))
    }

    @Test
    fun `a custom lead window is honoured`() {
        val session = record()
        assertTrue(AuthExpiry.isAccessTokenExpiring(session, nowMs = issuedAt + 1_000L, leadMs = accessTtlMs))
        assertFalse(AuthExpiry.isAccessTokenExpiring(session, nowMs = issuedAt, leadMs = 0L))
    }

    @Test
    fun `the session expires at its cap and not one millisecond earlier`() {
        val session = record()
        assertFalse(AuthExpiry.isSessionExpired(session, nowMs = issuedAt + sessionCapMs - 1L))
        assertTrue(AuthExpiry.isSessionExpired(session, nowMs = issuedAt + sessionCapMs))
        assertTrue(AuthExpiry.isSessionExpired(session, nowMs = issuedAt + sessionCapMs + 1L))
    }

    @Test
    fun `R6 short-circuits R1 past the session cap`() {
        val session = record()
        // Both windows are open, but the cap wins: there is no point refreshing.
        assertTrue(AuthExpiry.isAccessTokenExpiring(session, nowMs = issuedAt + sessionCapMs))
        assertFalse(AuthExpiry.shouldRefreshBeforeCall(session, nowMs = issuedAt + sessionCapMs))
    }

    @Test
    fun `shouldRefreshBeforeCall is true inside the window and before the cap`() {
        val session = record()
        assertFalse(AuthExpiry.shouldRefreshBeforeCall(session, nowMs = issuedAt))
        assertTrue(
            AuthExpiry.shouldRefreshBeforeCall(
                session,
                nowMs = issuedAt + accessTtlMs - 60_000L,
            ),
        )
    }

    @Test
    fun `an ISO timestamp converts to epoch milliseconds`() {
        assertEquals(0L, AuthInstant.parseIsoUtc("1970-01-01T00:00:00.000Z"))
        assertEquals(1_700_000_000_000L, AuthInstant.parseIsoUtc("2023-11-14T22:13:20.000Z"))
        assertEquals(1_700_000_000_123L, AuthInstant.parseIsoUtc("2023-11-14T22:13:20.123Z"))
        assertEquals(1_700_000_000_500L, AuthInstant.parseIsoUtc("2023-11-14T22:13:20.5Z"))
        // An explicit zero offset is the same instant as Z.
        assertEquals(
            AuthInstant.parseIsoUtc("2023-11-14T22:13:20.000Z"),
            AuthInstant.parseIsoUtc("2023-11-14T22:13:20.000+00:00"),
        )
    }

    @Test
    fun `an unparsable ISO value is null rather than a guess`() {
        assertNull(AuthInstant.parseIsoUtc(null))
        assertNull(AuthInstant.parseIsoUtc(""))
        assertNull(AuthInstant.parseIsoUtc("not a date"))
        assertNull(AuthInstant.parseIsoUtc("2023-13-01T00:00:00Z"))
        assertNull(AuthInstant.parseIsoUtc("2023-11-14T22:13:20"))
    }

    @Test
    fun `formatting round-trips through the parser`() {
        val instant = 1_700_000_000_123L
        assertEquals(instant, AuthInstant.parseIsoUtc(AuthInstant.formatIsoUtc(instant)))
    }

    @Test
    fun `toSessionRecord computes the access expiry and takes the cap verbatim`() {
        val payload = SessionTokenPayload(
            sessionId = "s1",
            accessToken = "access",
            refreshToken = "refresh",
            accessTokenExpiresInSeconds = 900L,
            sessionMaxExpiresAt = "2023-11-15T10:13:20.000Z",
            activeRole = "traveler",
        )
        val session = toSessionRecord(payload, accountId = "acct-1", nowMs = issuedAt)

        assertEquals(issuedAt + 900_000L, session.accessTokenExpiresAt)
        assertEquals(AuthInstant.parseIsoUtc("2023-11-15T10:13:20.000Z"), session.sessionMaxExpiresAt)
        assertEquals("acct-1", session.actor.accountId)
        assertEquals("s1", session.actor.sessionId)
        assertEquals("traveler", session.actor.activeRole)
    }

    @Test
    fun `an unparsable cap falls back to the access expiry instead of failing`() {
        val payload = SessionTokenPayload(
            sessionId = "s1",
            accessToken = "access",
            refreshToken = "refresh",
            accessTokenExpiresInSeconds = 900L,
            sessionMaxExpiresAt = "whenever",
            activeRole = "traveler",
        )
        val session = toSessionRecord(payload, accountId = "acct-1", nowMs = issuedAt)
        assertEquals(session.accessTokenExpiresAt, session.sessionMaxExpiresAt)
    }
}
