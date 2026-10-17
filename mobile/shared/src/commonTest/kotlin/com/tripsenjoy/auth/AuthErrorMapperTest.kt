package com.tripsenjoy.auth

import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotEquals
import kotlin.test.assertNull
import kotlin.test.assertTrue

/**
 * The same table as `packages/auth/test/errors.test.ts` (ARCHITECTURE §3.5), asserted on Kotlin.
 *
 * The fixtures mirror the real `ApiErrorResponse` envelope: `toORPCError` spreads the service
 * details into `data` at the top level, keeps `requestId` beside them, and nests the payload under
 * `data.error`.
 */
class AuthErrorMapperTest {

    private val now = 1_700_000_000_000L

    /** Builds the `data` object with details at the top level, exactly as the server sends it. */
    private fun details(vararg pairs: Pair<String, JsonElement>): JsonObject =
        buildJsonObject { pairs.forEach { (key, value) -> put(key, value) } }

    private fun map(
        code: String,
        status: Int? = null,
        details: JsonObject? = null,
        procedure: String? = null,
        locale: String = "en",
        requestId: String? = null,
    ): AuthErrorView = AuthErrorMapper.map(
        code = code,
        status = status,
        details = details,
        procedure = procedure,
        locale = locale,
        requestId = requestId,
        nowMs = now,
    )

    @Test
    fun `UNAUTHORIZED on a sign-in procedure is bad credentials`() {
        val view = map("UNAUTHORIZED", status = 401, procedure = AuthRepository.PROC_SIGN_IN)

        assertEquals(AuthErrorMapper.Keys.INVALID_CREDENTIALS, view.key)
        assertEquals(AuthErrorRecovery.FOCUS_PASSWORD, view.recovery)
        assertEquals("password", view.field)
    }

    @Test
    fun `UNAUTHORIZED on the refresh procedure is an expired session, never bad credentials`() {
        val view = map("UNAUTHORIZED", status = 401, procedure = AuthRepository.PROC_REFRESH_SESSION)

        assertEquals(AuthErrorMapper.Keys.SESSION_EXPIRED, view.key)
        assertEquals(AuthErrorRecovery.REFRESH, view.recovery)
        assertNull(view.field)
    }

    @Test
    fun `UNAUTHORIZED on an ordinary procedure is an expired session`() {
        val view = map("UNAUTHORIZED", status = 401, procedure = "trips/list")
        assertEquals(AuthErrorMapper.Keys.SESSION_EXPIRED, view.key)
    }

    @Test
    fun `RATE_LIMITED with remainingLockoutSeconds is an account lockout with a countdown`() {
        val view = map(
            code = "RATE_LIMITED",
            status = 429,
            details = details("remainingLockoutSeconds" to JsonPrimitive(120)),
            procedure = AuthRepository.PROC_SIGN_IN,
        )

        assertEquals(AuthErrorMapper.Keys.ACCOUNT_LOCKED, view.key)
        assertEquals(AuthErrorRecovery.COUNTDOWN, view.recovery)
        assertEquals("120", view.params[AuthErrorMapper.PARAM_SECONDS])
    }

    @Test
    fun `RATE_LIMITED with lockedUntil derives the countdown`() {
        val lockedUntil = AuthInstant.formatIsoUtc(now + 30_000L)
        val view = map(
            code = "RATE_LIMITED",
            status = 429,
            details = details("lockedUntil" to JsonPrimitive(lockedUntil)),
        )

        assertEquals(AuthErrorMapper.Keys.ACCOUNT_LOCKED, view.key)
        assertEquals("30", view.params[AuthErrorMapper.PARAM_SECONDS])
    }

    @Test
    fun `RATE_LIMITED with pausedUntil is a paused OTP channel`() {
        val pausedUntil = AuthInstant.formatIsoUtc(now + 45_000L)
        val view = map(
            code = "RATE_LIMITED",
            status = 429,
            details = details("pausedUntil" to JsonPrimitive(pausedUntil)),
            procedure = AuthRepository.PROC_VERIFY_OTP,
        )

        assertEquals(AuthErrorMapper.Keys.OTP_PAUSED, view.key)
        assertEquals(AuthErrorRecovery.COUNTDOWN, view.recovery)
        assertEquals("45", view.params[AuthErrorMapper.PARAM_SECONDS])
    }

    @Test
    fun `RATE_LIMITED with retryAfterSeconds is a resend cooldown`() {
        val view = map(
            code = "RATE_LIMITED",
            status = 429,
            details = details("retryAfterSeconds" to JsonPrimitive(30)),
            procedure = AuthRepository.PROC_RESEND_OTP,
        )

        assertEquals(AuthErrorMapper.Keys.OTP_COOLDOWN, view.key)
        assertEquals(AuthErrorRecovery.ENABLE_RESEND, view.recovery)
        assertEquals("30", view.params[AuthErrorMapper.PARAM_SECONDS])
    }

    @Test
    fun `RATE_LIMITED with no details falls back to the rate-limited copy`() {
        val view = map("RATE_LIMITED", status = 429)
        assertEquals(AuthErrorMapper.Keys.RATE_LIMITED, view.key)
        assertEquals(AuthErrorRecovery.COUNTDOWN, view.recovery)
    }

    @Test
    fun `a wrong OTP is distinguished by wrongAttempts, not by an AUTH_OTP code`() {
        val view = map(
            code = "VALIDATION_ERROR",
            status = 400,
            details = details("wrongAttempts" to JsonPrimitive(2)),
            procedure = AuthRepository.PROC_VERIFY_OTP,
        )

        assertEquals(AuthErrorMapper.Keys.OTP_INVALID, view.key)
        assertEquals(AuthErrorRecovery.CLEAR_CODE, view.recovery)
        assertEquals("2", view.params[AuthErrorMapper.PARAM_WRONG_ATTEMPTS])
        assertEquals("3", view.params[AuthErrorMapper.PARAM_REMAINING])
        assertEquals("code", view.field)
    }

    @Test
    fun `an OTP validation failure with no wrongAttempts is an expired code`() {
        val view = map(
            code = "VALIDATION_ERROR",
            status = 400,
            procedure = AuthRepository.PROC_VERIFY_OTP,
        )

        assertEquals(AuthErrorMapper.Keys.OTP_EXPIRED, view.key)
        assertEquals(AuthErrorRecovery.ENABLE_RESEND, view.recovery)
    }

    @Test
    fun `a suspended account is FORBIDDEN plus details status`() {
        val view = map(
            code = "FORBIDDEN",
            status = 403,
            details = details(
                "status" to JsonPrimitive("suspended"),
                "reason" to JsonPrimitive("Chargeback investigation"),
            ),
            procedure = AuthRepository.PROC_SIGN_IN,
        )

        assertEquals(AuthErrorMapper.Keys.SUSPENDED, view.key)
        assertEquals(AuthErrorRecovery.NO_RETRY, view.recovery)
        assertEquals("Chargeback investigation", view.params[AuthErrorMapper.PARAM_REASON])
    }

    @Test
    fun `a plain FORBIDDEN keeps the session and shows the forbidden copy`() {
        val view = map("FORBIDDEN", status = 403)
        assertEquals(AuthErrorMapper.Keys.FORBIDDEN, view.key)
        assertEquals(AuthErrorRecovery.STAY, view.recovery)
    }

    @Test
    fun `FORBIDDEN on the surface field is the web-only registration guard`() {
        val error = buildJsonObject {
            put("fieldErrors", kotlinx.serialization.json.JsonArray(listOf(
                buildJsonObject {
                    put("field", "surface")
                    put("code", "FORBIDDEN")
                    put("message", "Organization accounts are created on the web.")
                },
            )))
        }
        val view = map(
            code = "FORBIDDEN",
            status = 403,
            details = details("error" to error),
            procedure = AuthRepository.PROC_REGISTER_SUPPLIER,
        )

        assertEquals(AuthErrorMapper.Keys.WEB_ONLY_REGISTRATION, view.key)
        assertEquals(AuthErrorRecovery.NO_RETRY, view.recovery)
    }

    @Test
    fun `field errors attach to their input`() {
        val error = buildJsonObject {
            put("fieldErrors", kotlinx.serialization.json.JsonArray(listOf(
                buildJsonObject {
                    put("field", "email")
                    put("code", "INVALID_INPUT")
                    put("message", "Enter a valid email address.")
                },
            )))
        }
        val view = map(
            code = "VALIDATION_ERROR",
            status = 400,
            details = details("error" to error),
            procedure = AuthRepository.PROC_REGISTER_TRAVELER,
        )

        assertEquals("field.email", view.key)
        assertEquals("email", view.field)
        assertEquals(AuthErrorRecovery.FOCUS_FIELD, view.recovery)
        assertEquals("Enter a valid email address.", view.params[AuthErrorMapper.PARAM_MESSAGE])
    }

    @Test
    fun `a duplicate resource focuses the conflicting field`() {
        val error = buildJsonObject {
            put("fieldErrors", kotlinx.serialization.json.JsonArray(listOf(
                buildJsonObject {
                    put("field", "phone")
                    put("code", "CONFLICT")
                    put("message", "Already registered.")
                },
            )))
        }
        val view = map(
            code = "CONFLICT",
            status = 409,
            details = details("error" to error),
            procedure = AuthRepository.PROC_REGISTER_TRAVELER,
        )

        assertEquals(AuthErrorMapper.Keys.ALREADY_EXISTS, view.key)
        assertEquals("phone", view.field)
        assertEquals(AuthErrorRecovery.FOCUS_FIELD, view.recovery)
    }

    @Test
    fun `the fixed codes keep their meaning`() {
        assertEquals(
            AuthErrorRecovery.ROUTE_MFA,
            map("AUTH_MFA_REQUIRED", status = 412).recovery,
        )
        assertEquals(
            AuthErrorMapper.Keys.VERIFICATION_REQUIRED,
            map("AUTH_VERIFICATION_REQUIRED", status = 412).key,
        )
        assertEquals(
            AuthErrorMapper.Keys.WEB_ONLY_REGISTRATION,
            map("AUTH_WEB_ONLY_REGISTRATION", status = 403).key,
        )
        assertEquals(
            AuthErrorMapper.Keys.DELETION_PENDING,
            map("AUTH_DELETION_PENDING", status = 412).key,
        )
        assertEquals(
            AuthErrorMapper.Keys.UNAVAILABLE,
            map("INTERNAL_ERROR", status = 500).key,
        )
        assertEquals(
            AuthErrorRecovery.RETRY,
            map("SERVICE_UNAVAILABLE", status = 503).recovery,
        )
        assertEquals(
            AuthErrorMapper.Keys.SESSION_EXPIRED,
            map("AUTH_TOKEN_EXPIRED", status = 401).key,
        )
    }

    @Test
    fun `a transport failure is unavailable with a retry`() {
        val view = map("HTTP_502", status = 502)
        assertEquals(AuthErrorMapper.Keys.UNAVAILABLE, view.key)
        assertEquals(AuthErrorRecovery.RETRY, view.recovery)
    }

    @Test
    fun `an unmapped code falls back to unexpected plus the requestId`() {
        val view = map(
            code = "SOMETHING_NEW",
            status = 418,
            details = details("requestId" to JsonPrimitive("req_abc123")),
        )

        assertEquals(AuthConventions.fallbackErrorKey, view.key)
        assertEquals("auth.error.unexpected", view.key)
        assertEquals("req_abc123", view.requestId)
        assertEquals(AuthErrorRecovery.RETRY, view.recovery)
    }

    @Test
    fun `the shared table is consulted for a code the mapper does not special-case`() {
        val view = map("AUTH_OTP_INVALID", status = 400)
        assertEquals("auth.error.otpInvalid", view.key)
        assertEquals(AuthErrorRecovery.CLEAR_CODE, view.recovery)
    }

    @Test
    fun `the mapper is pure`() {
        val input = { map("UNAUTHORIZED", status = 401, procedure = AuthRepository.PROC_SIGN_IN) }
        assertEquals(input(), input())
    }

    @Test
    fun `every emitted key resolves to real copy in both locales`() {
        val views = listOf(
            map("UNAUTHORIZED", status = 401, procedure = AuthRepository.PROC_SIGN_IN),
            map("UNAUTHORIZED", status = 401),
            map("RATE_LIMITED", status = 429, details = details("remainingLockoutSeconds" to JsonPrimitive(5))),
            map("VALIDATION_ERROR", status = 400, details = details("wrongAttempts" to JsonPrimitive(1)), procedure = AuthRepository.PROC_VERIFY_OTP),
            map("VALIDATION_ERROR", status = 400, procedure = AuthRepository.PROC_VERIFY_OTP),
            map("FORBIDDEN", status = 403),
            map("AUTH_MFA_REQUIRED", status = 412),
            map("AUTH_WEB_ONLY_REGISTRATION", status = 403),
            map("AUTH_DELETION_PENDING", status = 412),
            map("AUTH_TOKEN_EXPIRED", status = 401),
            map("INTERNAL_ERROR", status = 500),
            map("SOMETHING_NEW", status = 418),
        )
        for (view in views) {
            for (locale in AuthStrings.locales) {
                val message = AuthErrorMapper.messageFor(view, locale)
                assertTrue(message.isNotBlank(), "blank copy for ${view.key} in $locale")
                assertNotEquals(view.key, message, "missing copy for ${view.key} in $locale")
            }
        }
    }

    @Test
    fun `placeholders are filled from the view params`() {
        val view = map(
            code = "RATE_LIMITED",
            status = 429,
            details = details("remainingLockoutSeconds" to JsonPrimitive(90)),
        )
        val english = AuthErrorMapper.messageFor(view, "en")
        val arabic = AuthErrorMapper.messageFor(view, "ar")

        assertTrue(english.contains("90"), "english copy should show the countdown: $english")
        assertTrue(arabic.contains("90"), "arabic copy should show the countdown: $arabic")
        assertNotEquals(english, arabic)
    }

    @Test
    fun `fromException carries the details of an ApiException`() {
        val error = com.tripsenjoy.api.ApiException(
            code = "FORBIDDEN",
            status = 403,
            message = "Suspended",
            details = details(
                "status" to JsonPrimitive("suspended"),
                "reason" to JsonPrimitive("Policy breach"),
            ),
        )
        val view = AuthErrorMapper.fromException(error, procedure = AuthRepository.PROC_SIGN_IN)
        assertEquals(AuthErrorMapper.Keys.SUSPENDED, view.key)
        assertEquals("Policy breach", view.params[AuthErrorMapper.PARAM_REASON])
    }

    @Test
    fun `a SessionExpiredException maps to the expired copy`() {
        val view = AuthErrorMapper.fromThrowable(SessionExpiredException())
        assertEquals(AuthErrorMapper.Keys.SESSION_EXPIRED, view.key)
        assertEquals(AuthErrorRecovery.REFRESH, view.recovery)
    }

    @Test
    fun `lockoutSecondsRemaining prefers the explicit seconds`() {
        val explicit = details(
            "remainingLockoutSeconds" to JsonPrimitive(11),
            "retryAfterSeconds" to JsonPrimitive(99),
        )
        assertEquals(11L, AuthRefreshPolicy.lockoutSecondsRemaining(explicit, now))
        assertEquals(0L, AuthRefreshPolicy.lockoutSecondsRemaining(null, now))
    }

    @Test
    fun `needsRefreshOnError follows R2 and R4`() {
        assertTrue(
            AuthRefreshPolicy.needsRefreshOnError(401, "AUTH_TOKEN_EXPIRED", "trips/list"),
        )
        assertTrue(AuthRefreshPolicy.needsRefreshOnError(401, "UNAUTHORIZED", "trips/list"))
        for (procedure in AuthConventions.noRefreshProcedures) {
            assertTrue(
                !AuthRefreshPolicy.needsRefreshOnError(401, "AUTH_TOKEN_EXPIRED", procedure),
                "$procedure must never refresh",
            )
        }
        assertTrue(!AuthRefreshPolicy.needsRefreshOnError(400, "VALIDATION_ERROR", "trips/list"))
    }

    @Test
    fun `isMaxSessionReason reads the detail`() {
        assertTrue(
            AuthRefreshPolicy.isMaxSessionReason(
                details("reason" to JsonPrimitive(AuthConventions.maxSessionReason)),
            ),
        )
        assertTrue(!AuthRefreshPolicy.isMaxSessionReason(details("reason" to JsonPrimitive("other"))))
        assertTrue(!AuthRefreshPolicy.isMaxSessionReason(null))
    }
}
