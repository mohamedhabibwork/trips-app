package com.tripsenjoy.auth

import com.tripsenjoy.api.ApiException
import kotlinx.serialization.json.JsonObject
import kotlin.coroutines.cancellation.CancellationException

/**
 * What the UI should do next after an error (contract `AuthErrorRecovery`).
 *
 * The wire value comes from `conventions.json`; the enum is what Kotlin switches on.
 */
enum class AuthErrorRecovery(val wire: String) {
    /** Keep the user where they are. */
    STAY("stay"),

    /** Focus the password field. */
    FOCUS_PASSWORD("focusPassword"),

    /** Focus the offending input named by [AuthErrorView.field]. */
    FOCUS_FIELD("focusField"),

    /** Disable submit and show a live countdown from `params["seconds"]`. */
    COUNTDOWN("countdown"),

    /** Clear the six OTP boxes and let the user retype. */
    CLEAR_CODE("clearCode"),

    /** Enable the Resend action. */
    ENABLE_RESEND("enableResend"),

    /** Route to the second-factor (TOTP) step. */
    ROUTE_MFA("routeMfa"),

    /** Route to the OTP step. */
    ROUTE_OTP("routeOtp"),

    /** Do not offer a retry. */
    NO_RETRY("noRetry"),

    /** Offer a retry action. */
    RETRY("retry"),

    /** Refresh silently; never shown as a user error. */
    REFRESH("refresh"),
    ;

    companion object {
        /** Resolves a wire value, defaulting to [STAY]. */
        fun fromWire(value: String?): AuthErrorRecovery =
            entries.firstOrNull { it.wire == value } ?: STAY
    }
}

/**
 * One mapped failure: a message key, its placeholders, an optional input to highlight, and the
 * recovery action (contract `AuthErrorView`).
 *
 * [params] values are already strings so the same view can be rendered by Compose and formatted by
 * [AuthErrorMapper.messageFor] without a second conversion.
 */
data class AuthErrorView(
    val key: String,
    val params: Map<String, String> = emptyMap(),
    val field: String? = null,
    val recovery: AuthErrorRecovery = AuthErrorRecovery.STAY,
    val requestId: String? = null,
)

/**
 * The single server code → message key → recovery mapping used by every mobile screen (PRD §7.6).
 *
 * The mapper is a pure function of its input (M3). It applies the disambiguation table from
 * ARCHITECTURE §3.5 **before** the `conventions.json` table, because the backend does not emit the
 * `AUTH_OTP_*` codes and reports a suspended account as a plain `FORBIDDEN` with
 * `details.status = "suspended"`.
 */
object AuthErrorMapper {

    /** Message keys the mapper emits directly; all of them must exist in `messages.json`. */
    object Keys {
        const val INVALID_CREDENTIALS = "auth.error.invalidCredentials"
        const val ACCOUNT_LOCKED = "auth.error.accountLocked"
        const val OTP_INVALID = "auth.error.otpInvalid"
        const val OTP_EXPIRED = "auth.error.otpExpired"
        const val OTP_PAUSED = "auth.error.otpPaused"
        const val OTP_COOLDOWN = "auth.error.otpCooldown"
        const val MFA_REQUIRED = "auth.error.mfaRequired"
        const val VERIFICATION_REQUIRED = "auth.error.verificationRequired"
        const val SUSPENDED = "auth.error.suspended"
        const val DELETION_PENDING = "auth.error.deletionPending"
        const val SESSION_EXPIRED = "auth.error.sessionExpired"
        const val VALIDATION = "auth.error.validation"
        const val ALREADY_EXISTS = "auth.error.alreadyExists"
        const val FORBIDDEN = "auth.error.forbidden"
        const val WEB_ONLY_REGISTRATION = "auth.error.webOnlyRegistration"
        const val RATE_LIMITED = "auth.error.rateLimited"
        const val NOT_FOUND = "auth.error.notFound"
        const val UNAVAILABLE = "auth.error.unavailable"
        const val UNEXPECTED = "auth.error.unexpected"
    }

    /** The message key of a single input's error, for example `field.password`. */
    fun fieldKey(name: String): String = "field.$name"

    /**
     * A local "this field is required" error, for validation that never reaches the server.
     *
     * `field.*` copy is the `{message}` placeholder the server's own field message is substituted
     * into, so a local error supplies `auth.common.required` as that message. That keeps every
     * string in `AuthStrings` and stops a literal `{message}` reaching the screen.
     */
    fun requiredFieldError(
        field: String,
        locale: String = AuthStrings.defaultLocale,
    ): AuthErrorView = AuthErrorView(
        key = fieldKey(field),
        params = mapOf(PARAM_MESSAGE to AuthStrings.t(KEY_REQUIRED, locale)),
        field = field,
        recovery = AuthErrorRecovery.FOCUS_FIELD,
    )

    /** The copy key for a local "required" message. */
    const val KEY_REQUIRED = "auth.common.required"

    /** The copy key for an absent value, used when a placeholder has nothing to show. */
    const val KEY_NONE = "auth.account.none"

    /**
     * Maps one failure to a view.
     *
     * [details] is `ApiException.details` (the oRPC `data` object) and is the only place the mapper
     * looks for `status`, `lockedUntil`, `reason`, `retryAfterSeconds` and `wrongAttempts`.
     */
    fun map(
        code: String,
        status: Int? = null,
        details: JsonObject? = null,
        procedure: String? = null,
        locale: String = AuthStrings.defaultLocale,
        requestId: String? = null,
        nowMs: Long = 0L,
    ): AuthErrorView {
        val view = AuthErrorDetails(details)
        val effectiveRequestId = requestId ?: view.requestId
        val httpStatus = status ?: 0

        // 1. UNAUTHORIZED on a sign-in procedure is bad credentials; anywhere else it means the
        //    session ended. Never show "wrong password" for an expired session (ARCHITECTURE §1.2).
        if (code == CODE_UNAUTHORIZED) {
            return if (isSignInProcedure(procedure)) {
                AuthErrorView(
                    key = Keys.INVALID_CREDENTIALS,
                    field = FIELD_PASSWORD,
                    recovery = AuthErrorRecovery.FOCUS_PASSWORD,
                    requestId = effectiveRequestId,
                )
            } else {
                AuthErrorView(
                    key = Keys.SESSION_EXPIRED,
                    recovery = AuthErrorRecovery.REFRESH,
                    requestId = effectiveRequestId,
                )
            }
        }

        // 2. Rate limiting: the three shapes the server actually sends (AC-2, R-6).
        if (code == CODE_RATE_LIMITED || httpStatus == AuthRefreshPolicy.HTTP_RATE_LIMITED) {
            if (view.lockedUntil != null || view.remainingLockoutSeconds != null) {
                return AuthErrorView(
                    key = Keys.ACCOUNT_LOCKED,
                    params = mapOf(
                        PARAM_SECONDS to
                            AuthRefreshPolicy.lockoutSecondsRemaining(details, nowMs).toString(),
                    ),
                    recovery = AuthErrorRecovery.COUNTDOWN,
                    requestId = effectiveRequestId,
                )
            }
            if (view.pausedUntil != null) {
                return AuthErrorView(
                    key = Keys.OTP_PAUSED,
                    params = mapOf(
                        PARAM_SECONDS to
                            AuthRefreshPolicy.pauseSecondsRemaining(details, nowMs).toString(),
                    ),
                    recovery = AuthErrorRecovery.COUNTDOWN,
                    requestId = effectiveRequestId,
                )
            }
            if (view.retryAfterSeconds != null) {
                return AuthErrorView(
                    key = Keys.OTP_COOLDOWN,
                    params = mapOf(PARAM_SECONDS to view.retryAfterSeconds.toString()),
                    recovery = AuthErrorRecovery.ENABLE_RESEND,
                    requestId = effectiveRequestId,
                )
            }
            return AuthErrorView(
                key = Keys.RATE_LIMITED,
                params = mapOf(
                    PARAM_SECONDS to
                        AuthRefreshPolicy.lockoutSecondsRemaining(details, nowMs).toString(),
                ),
                recovery = AuthErrorRecovery.COUNTDOWN,
                requestId = effectiveRequestId,
            )
        }

        // 3. OTP validation: the backend never emits AUTH_OTP_*, so the distinction between a wrong
        //    code and an expired one is `details.wrongAttempts` (ARCHITECTURE §1.2, O2).
        if (code == CODE_VALIDATION_ERROR || code == CODE_INVALID_INPUT) {
            if (isOtpProcedure(procedure)) {
                val wrongAttempts = view.wrongAttempts ?: 0
                if (wrongAttempts >= 1) {
                    val remaining = view.remainingAttempts
                        ?: (AuthConventions.otpMaxWrongAttempts - wrongAttempts).coerceAtLeast(0)
                    return AuthErrorView(
                        key = Keys.OTP_INVALID,
                        params = mapOf(
                            PARAM_WRONG_ATTEMPTS to wrongAttempts.toString(),
                            PARAM_REMAINING to remaining.toString(),
                        ),
                        field = FIELD_CODE,
                        recovery = AuthErrorRecovery.CLEAR_CODE,
                        requestId = effectiveRequestId,
                    )
                }
                return AuthErrorView(
                    key = Keys.OTP_EXPIRED,
                    field = FIELD_CODE,
                    recovery = AuthErrorRecovery.ENABLE_RESEND,
                    requestId = effectiveRequestId,
                )
            }
            // 4. A suspended account is a plain FORBIDDEN plus `details.status`.
        }

        if (code == CODE_FORBIDDEN || code == CODE_ROLE_FORBIDDEN ||
            code == CODE_PERMISSION_DENIED || code == CODE_ADMIN_SUBROLE_FORBIDDEN ||
            code == CODE_MODERATOR_SCOPE_FORBIDDEN
        ) {
            if (view.status == STATUS_SUSPENDED) {
                // `auth.error.suspended` is "…suspended: {reason}". With no reason the placeholder
                // would leak, so the em dash copy stands in for it.
                val reason = view.reason ?: AuthStrings.t(KEY_NONE, locale)
                return AuthErrorView(
                    key = Keys.SUSPENDED,
                    params = mapOf(PARAM_REASON to reason),
                    recovery = AuthErrorRecovery.NO_RETRY,
                    requestId = effectiveRequestId,
                )
            }
            // A FORBIDDEN with `field: "surface"` is the server's web-only-registration guard (G5).
            val fieldErrors = view.fieldErrors
            if (fieldErrors.any { it.field == FIELD_SURFACE }) {
                return AuthErrorView(
                    key = Keys.WEB_ONLY_REGISTRATION,
                    field = FIELD_SURFACE,
                    recovery = AuthErrorRecovery.NO_RETRY,
                    requestId = effectiveRequestId,
                )
            }
            return AuthErrorView(
                key = Keys.FORBIDDEN,
                recovery = AuthErrorRecovery.STAY,
                requestId = effectiveRequestId,
            )
        }

        // 5. Per-input validation issues attach to their input, not to the banner (M2).
        val fieldErrors = view.fieldErrors
        if (fieldErrors.isNotEmpty() &&
            (code == CODE_VALIDATION_ERROR || code == CODE_INVALID_INPUT ||
                code == CODE_CONFLICT || code == CODE_DUPLICATE_RESOURCE)
        ) {
            val first = fieldErrors.first()
            val conflictKey = code == CODE_CONFLICT || code == CODE_DUPLICATE_RESOURCE
            val key = if (!conflictKey && AuthStrings.has(fieldKey(first.field), locale)) {
                fieldKey(first.field)
            } else if (conflictKey) {
                Keys.ALREADY_EXISTS
            } else {
                Keys.VALIDATION
            }
            return AuthErrorView(
                key = key,
                params = mapOf(
                    PARAM_FIELD to first.field,
                    PARAM_MESSAGE to first.message,
                ),
                field = first.field,
                recovery = AuthErrorRecovery.FOCUS_FIELD,
                requestId = effectiveRequestId,
            )
        }

        // 6. Codes whose meaning is fixed regardless of details.
        fixedViewFor(code)?.let { fixed ->
            return fixed.copy(requestId = effectiveRequestId)
        }

        // 7. Transport failures: no oRPC envelope, so the code is HTTP_<status>.
        if (httpStatus >= 500 || code.startsWith(HTTP_CODE_PREFIX)) {
            return AuthErrorView(
                key = Keys.UNAVAILABLE,
                recovery = AuthErrorRecovery.RETRY,
                requestId = effectiveRequestId,
            )
        }

        // 8. Everything else falls back through the shared table, then to `unexpected` + requestId (M1).
        val row = AuthConventions.errorRowFor(code)
        if (row != null) {
            return AuthErrorView(
                key = row.key,
                params = mapOf(PARAM_CODE to code),
                field = row.field,
                recovery = AuthErrorRecovery.fromWire(row.recovery),
                requestId = effectiveRequestId,
            )
        }
        return AuthErrorView(
            key = AuthConventions.fallbackErrorKey.ifBlank { Keys.UNEXPECTED },
            params = mapOf(PARAM_CODE to code),
            recovery = AuthErrorRecovery.RETRY,
            requestId = effectiveRequestId,
        )
    }

    /** Maps a caught [ApiException], carrying its `data` details into the view. */
    fun fromException(
        error: ApiException,
        procedure: String? = null,
        locale: String = AuthStrings.defaultLocale,
        nowMs: Long = 0L,
    ): AuthErrorView = map(
        code = error.code,
        status = error.status,
        details = error.details,
        procedure = procedure,
        locale = locale,
        nowMs = nowMs,
    )

    /**
     * Maps any thrown value. Cancellation is rethrown so a coroutine that was cancelled is never
     * reported as a user-facing failure; everything else becomes [Keys.UNAVAILABLE].
     */
    fun fromThrowable(
        error: Throwable,
        procedure: String? = null,
        locale: String = AuthStrings.defaultLocale,
        nowMs: Long = 0L,
    ): AuthErrorView {
        if (error is CancellationException) throw error
        if (error is SessionExpiredException) {
            return AuthErrorView(
                key = Keys.SESSION_EXPIRED,
                recovery = AuthErrorRecovery.REFRESH,
            )
        }
        if (error is ApiException) return fromException(error, procedure, locale, nowMs)
        return AuthErrorView(
            key = Keys.UNAVAILABLE,
            recovery = AuthErrorRecovery.RETRY,
        )
    }

    /** The localized message for [view], resolved from the generated `AuthStrings`. */
    fun messageFor(view: AuthErrorView, locale: String = AuthStrings.defaultLocale): String =
        AuthStrings.format(view.key, locale, view.params)

    /** Codes that always mean the same thing, regardless of `details`. */
    private fun fixedViewFor(code: String): AuthErrorView? = when (code) {
        CODE_MFA_REQUIRED -> AuthErrorView(Keys.MFA_REQUIRED, recovery = AuthErrorRecovery.ROUTE_MFA)
        CODE_VERIFICATION_REQUIRED ->
            AuthErrorView(Keys.VERIFICATION_REQUIRED, recovery = AuthErrorRecovery.ROUTE_OTP)
        CODE_ACCOUNT_SUSPENDED ->
            AuthErrorView(Keys.SUSPENDED, recovery = AuthErrorRecovery.NO_RETRY)
        CODE_DELETION_PENDING ->
            AuthErrorView(Keys.DELETION_PENDING, recovery = AuthErrorRecovery.STAY)
        CODE_WEB_ONLY_REGISTRATION ->
            AuthErrorView(Keys.WEB_ONLY_REGISTRATION, recovery = AuthErrorRecovery.NO_RETRY)
        CODE_TOKEN_EXPIRED, CODE_SESSION_EXPIRED ->
            AuthErrorView(Keys.SESSION_EXPIRED, recovery = AuthErrorRecovery.REFRESH)
        CODE_INTERNAL_ERROR, CODE_SERVICE_UNAVAILABLE ->
            AuthErrorView(Keys.UNAVAILABLE, recovery = AuthErrorRecovery.RETRY)
        CODE_NOT_FOUND, CODE_RESOURCE_NOT_FOUND, CODE_TENANT_NOT_FOUND ->
            AuthErrorView(Keys.NOT_FOUND, recovery = AuthErrorRecovery.STAY)
        else -> null
    }

    private fun isSignInProcedure(procedure: String?): Boolean =
        procedure != null && procedure in AuthConventions.signInProcedures

    private fun isOtpProcedure(procedure: String?): Boolean =
        procedure != null && procedure in AuthConventions.otpProcedures

    // Parameter names the generated copy uses in its placeholders.
    const val PARAM_SECONDS = "seconds"
    const val PARAM_WRONG_ATTEMPTS = "wrongAttempts"
    const val PARAM_REMAINING = "remaining"
    const val PARAM_REASON = "reason"
    const val PARAM_FIELD = "field"
    const val PARAM_MESSAGE = "message"
    const val PARAM_CODE = "code"

    // Input names the screens highlight.
    const val FIELD_PASSWORD = "password"
    const val FIELD_CODE = "code"
    const val FIELD_SURFACE = "surface"
    const val FIELD_IDENTIFIER = "identifier"
    const val FIELD_STAFF_CODE = "staffCode"
    const val FIELD_EMAIL = "email"
    const val FIELD_PHONE = "phone"
    const val FIELD_FULL_NAME = "fullName"
    const val FIELD_COUNTRY = "country"
    const val FIELD_ROLE = "role"

    // The status detail a suspended account carries.
    const val STATUS_SUSPENDED = "suspended"

    // Shared error codes the mapper treats specially.
    const val CODE_UNAUTHORIZED = "UNAUTHORIZED"
    const val CODE_FORBIDDEN = "FORBIDDEN"
    const val CODE_ROLE_FORBIDDEN = "ROLE_FORBIDDEN"
    const val CODE_PERMISSION_DENIED = "PERMISSION_DENIED"
    const val CODE_ADMIN_SUBROLE_FORBIDDEN = "ADMIN_SUBROLE_FORBIDDEN"
    const val CODE_MODERATOR_SCOPE_FORBIDDEN = "MODERATOR_SCOPE_FORBIDDEN"
    const val CODE_RATE_LIMITED = "RATE_LIMITED"
    const val CODE_VALIDATION_ERROR = "VALIDATION_ERROR"
    const val CODE_INVALID_INPUT = "INVALID_INPUT"
    const val CODE_CONFLICT = "CONFLICT"
    const val CODE_DUPLICATE_RESOURCE = "DUPLICATE_RESOURCE"
    const val CODE_MFA_REQUIRED = "AUTH_MFA_REQUIRED"
    const val CODE_VERIFICATION_REQUIRED = "AUTH_VERIFICATION_REQUIRED"
    const val CODE_ACCOUNT_SUSPENDED = "AUTH_ACCOUNT_SUSPENDED"
    const val CODE_DELETION_PENDING = "AUTH_DELETION_PENDING"
    const val CODE_WEB_ONLY_REGISTRATION = "AUTH_WEB_ONLY_REGISTRATION"
    const val CODE_TOKEN_EXPIRED = "AUTH_TOKEN_EXPIRED"
    const val CODE_SESSION_EXPIRED = "AUTH_SESSION_EXPIRED"
    const val CODE_INTERNAL_ERROR = "INTERNAL_ERROR"
    const val CODE_SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"
    const val CODE_NOT_FOUND = "NOT_FOUND"
    const val CODE_RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND"
    const val CODE_TENANT_NOT_FOUND = "TENANT_NOT_FOUND"

    /** The prefix [ApiClient] uses when the response was not an oRPC envelope. */
    const val HTTP_CODE_PREFIX = "HTTP_"
}
