package com.tripsenjoy.auth

import com.tripsenjoy.api.ApiClient
import com.tripsenjoy.api.ApiException
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonArray
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import kotlin.coroutines.cancellation.CancellationException

/**
 * Thrown when the session is over: the maximum duration was reached, or a refresh failed.
 *
 * It is a typed signal, not a message (PRD §7.3 F3): the UI switches on the type and renders the
 * session-expired notice; the request that triggered it is never replayed and never shown as a
 * generic error.
 */
class SessionExpiredException(
    val reason: String? = null,
    val draftsRetained: Boolean = true,
) : Exception("The session has ended.")

/** The OTP dispatch the server returned for a sign-in or registration step. */
@Serializable
data class OtpDispatch(
    @SerialName("channel") val channel: String,
    @SerialName("targetIdentifier") val targetIdentifier: String = "",
    @SerialName("expiresAt") val expiresAt: String = "",
    @SerialName("resendAvailableInSeconds") val resendAvailableInSeconds: Int = 0,
    @SerialName("fallbackChannelAvailable") val fallbackChannelAvailable: Boolean = false,
    @SerialName("devCodePreview") val devCodePreview: String? = null,
)

/** One role the account can switch to; decoded so a payload round-trips, unused in P0. */
@Serializable
data class AvailableRole(
    @SerialName("role") val role: String,
    @SerialName("status") val status: String = "",
    @SerialName("tenantId") val tenantId: String? = null,
    @SerialName("planTier") val planTier: String? = null,
)

/** Document metadata sent with supplier onboarding submissions, resubmissions, and appeals. */
@Serializable
data class OnboardingDocumentInput(
    @SerialName("documentType") val documentType: String,
    @SerialName("storageKey") val storageKey: String,
    @SerialName("mimeType") val mimeType: String = "application/pdf",
    @SerialName("fileSizeBytes") val fileSizeBytes: Int = 128_000,
    @SerialName("expiresAt") val expiresAt: String? = null,
)

/** A requested-change checklist item returned on a supplier application. */
@Serializable
data class OnboardingChecklistItem(
    @SerialName("field") val field: String = "",
    @SerialName("instruction") val instruction: String = "",
    @SerialName("resolved") val resolved: Boolean = false,
)

/** A stored document record returned by `onboarding/getApplicationStatus`. */
@Serializable
data class ApplicationDocumentRecord(
    @SerialName("id") val id: String = "",
    @SerialName("documentType") val documentType: String = "",
    @SerialName("storageKey") val storageKey: String = "",
    @SerialName("mimeType") val mimeType: String = "",
    @SerialName("fileSizeBytes") val fileSizeBytes: Int = 0,
    @SerialName("expiresAt") val expiresAt: String? = null,
    @SerialName("verifiedAt") val verifiedAt: String? = null,
)

/** The supplier application returned by onboarding procedures. */
@Serializable
data class SupplierApplication(
    @SerialName("id") val id: String = "",
    @SerialName("applicantAccountId") val applicantAccountId: String = "",
    @SerialName("applicationType") val applicationType: String = "",
    @SerialName("state") val state: String = "",
    @SerialName("decisionReasonCode") val decisionReasonCode: String? = null,
    @SerialName("decisionNotes") val decisionNotes: String? = null,
    @SerialName("changesRequestedChecklist")
    val changesRequestedChecklist: List<OnboardingChecklistItem> = emptyList(),
    @SerialName("changesDueAt") val changesDueAt: String? = null,
    @SerialName("changesExtensionUsed") val changesExtensionUsed: Boolean = false,
    @SerialName("appealStatement") val appealStatement: String? = null,
    @SerialName("appealedAt") val appealedAt: String? = null,
    @SerialName("reapplyBlockedUntil") val reapplyBlockedUntil: String? = null,
)

/** Result of `onboarding/getApplicationStatus`. */
@Serializable
data class ApplicationStatusResult(
    @SerialName("hasApplication") val hasApplication: Boolean = false,
    @SerialName("application") val application: SupplierApplication? = null,
    @SerialName("documents") val documents: List<ApplicationDocumentRecord> = emptyList(),
)

/** Result of `onboarding/submitDriverApplication` or `onboarding/submitPhotographerApplication`. */
@Serializable
data class SubmitApplicationResult(
    @SerialName("application") val application: SupplierApplication,
    @SerialName("duplicateHold") val duplicateHold: Boolean = false,
)

/** Result of `onboarding/submitAppeal`. */
@Serializable
data class AppealSubmissionResult(
    @SerialName("appealed") val appealed: Boolean = false,
    @SerialName("application") val application: SupplierApplication? = null,
)

/** What `auth/signIn` can answer (PRD §3 step machine). */
sealed interface SignInOutcome {
    /** A code was sent; show the OTP screen. No token is stored. */
    data class OtpRequired(val otpDispatch: OtpDispatch) : SignInOutcome

    /** The user is in. */
    data class Authenticated(val record: SessionRecord) : SignInOutcome

    /** A supplier application is still under review; session is saved when returned so onboarding RPCs work. */
    data class PendingApproval(val accountId: String, val role: String) : SignInOutcome
}

/** What `auth/adminSignIn` can answer. */
sealed interface AdminSignInOutcome {
    /** A TOTP code is required; [challengeToken] must be sent to `auth/adminVerifyTotp`. */
    data class TotpRequired(val challengeToken: String) : AdminSignInOutcome

    /** The account is not enrolled; P0 has no enrollment screen (D4, O3). */
    data class EnrollmentRequired(val enrollmentToken: String, val otpauthUri: String) :
        AdminSignInOutcome
}

/** What `auth/staffSignIn` can answer. */
sealed interface StaffSignInOutcome {
    /** First sign-in: the second factor must be set up before a session exists. */
    data class SetupRequired(val challengeToken: String, val totpSecret: String) : StaffSignInOutcome

    /** A second factor was already set up; [method] is `sms` or `totp`. */
    data class SecondFactorRequired(val challengeToken: String, val method: String) :
        StaffSignInOutcome
}

/** What `auth/verifyOtp` answered. */
data class VerifyOtpOutcome(
    val verified: Boolean,
    val channel: String,
    val accountActivated: Boolean,
    val record: SessionRecord?,
)

/** What a registration answered: the account exists and OTPs were dispatched. */
data class RegistrationOutcome(
    val accountId: String,
    val status: String,
    val role: String?,
    val otpDispatches: List<OtpDispatch>,
)

/**
 * Every auth call the four apps make, plus the single implementation of the refresh rules.
 *
 * R1–R5 live in [ensureFresh], [refreshOnce] and [authed]; no screen and no app repeats them
 * (ARCHITECTURE §5.1: "`authed { }` is the single implementation of R1/R2/R3").
 *
 * The class is plain Kotlin with no Compose types so it can be unit-tested with a Ktor `MockEngine`.
 */
class AuthRepository(
    private val api: ApiClient,
    private val store: AuthTokenStore,
    private val now: () -> Long = { 0L },
) {

    /** Guards [pendingRefresh] only; it is never held across a network call. */
    private val refreshLock = Mutex()

    /** The in-flight refresh, shared by every concurrent caller (R3 single-flight). */
    private var pendingRefresh: CompletableDeferred<SessionRecord>? = null

    /** The surface every call declares; `mobile` for the three mobile apps, `pwa` for moderator. */
    var surface: String = SURFACE_MOBILE

    /**
     * The clock every expiry decision uses.
     *
     * Injected so tests can drive the 60 s window and the 12-hour cap without waiting; the default
     * reads the platform clock.
     */
    fun nowMillis(): Long = now()

    // ---------------------------------------------------------------------------------------
    // Sign-in
    // ---------------------------------------------------------------------------------------

    /**
     * `auth/signIn`. Never stores a token on the OTP step: the session only arrives once the code
     * is verified (AC-2).
     */
    suspend fun signIn(
        identifier: String,
        method: String,
        password: String? = null,
        otpCode: String? = null,
        requestedRole: String? = null,
    ): SignInOutcome {
        val input = buildJsonObject {
            put("identifier", identifier)
            put("method", method)
            if (password != null) put("password", password)
            if (otpCode != null) put("otpCode", otpCode)
            if (requestedRole != null) put("requestedRole", requestedRole)
            put("surface", surface)
        }
        val response = api.call(PROC_SIGN_IN, input, SignInResponse.serializer())
        return when (response.step) {
            STEP_OTP_REQUIRED -> SignInOutcome.OtpRequired(response.otpDispatch ?: EMPTY_DISPATCH)
            STEP_AUTHENTICATED -> {
                val payload = response.session
                    ?: throw ApiException("INVALID_RESPONSE", 0, "signIn returned no session.")
                val record = toSessionRecord(payload, accountIdOf(payload, response.accountId), now())
                store.save(record)
                SignInOutcome.Authenticated(record)
            }
            STEP_PENDING_APPROVAL -> {
                response.session?.let { payload ->
                    store.save(toSessionRecord(payload, accountIdOf(payload, response.accountId), now()))
                }
                SignInOutcome.PendingApproval(
                    accountId = response.accountId.orEmpty(),
                    role = response.role.orEmpty(),
                )
            }
            else -> throw ApiException(
                "INVALID_RESPONSE",
                0,
                "signIn returned an unknown step: ${response.step}",
            )
        }
    }

    /** `auth/moderatorSignIn` — staff code only, and the only role that uses it (PRD §3). */
    suspend fun moderatorSignIn(identifier: String, staffCode: String): SessionRecord {
        val input = buildJsonObject {
            put("identifier", identifier)
            put("staffCode", staffCode)
            put("surface", surface)
        }
        val response = api.call(PROC_MODERATOR_SIGN_IN, input, ModeratorSignInResponse.serializer())
        val payload = response.session
            ?: throw ApiException("INVALID_RESPONSE", 0, "moderatorSignIn returned no session.")
        val record = toSessionRecord(payload, accountIdOf(payload, null), now())
        store.save(record)
        return record
    }

    /** `auth/adminSignIn` — step one only; no token is stored until the TOTP is verified (AC-2). */
    suspend fun adminSignIn(email: String, password: String): AdminSignInOutcome {
        val input = buildJsonObject {
            put("email", email)
            put("password", password)
        }
        val response = api.call(PROC_ADMIN_SIGN_IN, input, AdminSignInResponse.serializer())
        return when (response.step) {
            STEP_TOTP_VERIFICATION_REQUIRED -> AdminSignInOutcome.TotpRequired(
                response.challengeToken.orEmpty(),
            )
            STEP_TOTP_ENROLLMENT_REQUIRED -> AdminSignInOutcome.EnrollmentRequired(
                enrollmentToken = response.enrollmentToken.orEmpty(),
                otpauthUri = response.otpauthUri.orEmpty(),
            )
            else -> throw ApiException(
                "INVALID_RESPONSE",
                0,
                "adminSignIn returned an unknown step: ${response.step}",
            )
        }
    }

    /** `auth/adminVerifyTotp` — step two, which is where the admin session is issued. */
    suspend fun adminVerifyTotp(challengeToken: String, totpCode: String): SessionRecord {
        val input = buildJsonObject {
            put("challengeToken", challengeToken)
            put("totpCode", totpCode)
        }
        val response = api.call(PROC_ADMIN_VERIFY_TOTP, input, SessionStepResponse.serializer())
        val payload = response.session
            ?: throw ApiException("INVALID_RESPONSE", 0, "adminVerifyTotp returned no session.")
        val record = toSessionRecord(payload, accountIdOf(payload, null), now())
        store.save(record)
        return record
    }

    /** `auth/staffSignIn` — step one only; no token is stored until the second factor is done. */
    suspend fun staffSignIn(email: String, password: String): StaffSignInOutcome {
        val input = buildJsonObject {
            put("email", email)
            put("password", password)
        }
        val response = api.call(PROC_STAFF_SIGN_IN, input, StaffSignInResponse.serializer())
        return when (response.step) {
            STEP_STAFF_2FA_SETUP_REQUIRED -> StaffSignInOutcome.SetupRequired(
                challengeToken = response.challengeToken.orEmpty(),
                totpSecret = response.totpSecret.orEmpty(),
            )
            STEP_STAFF_2FA_VERIFICATION_REQUIRED -> StaffSignInOutcome.SecondFactorRequired(
                challengeToken = response.challengeToken.orEmpty(),
                method = response.method ?: METHOD_SMS,
            )
            else -> throw ApiException(
                "INVALID_RESPONSE",
                0,
                "staffSignIn returned an unknown step: ${response.step}",
            )
        }
    }

    /** `auth/staffVerifySecondFactor` — step two, which is where the staff session is issued. */
    suspend fun staffVerifySecondFactor(
        challengeToken: String,
        code: String,
        tenantId: String? = null,
    ): SessionRecord {
        val input = buildJsonObject {
            put("challengeToken", challengeToken)
            put("code", code)
            if (tenantId != null) put("tenantId", tenantId)
        }
        val response = api.call(
            PROC_STAFF_VERIFY_SECOND_FACTOR,
            input,
            SessionStepResponse.serializer(),
        )
        val payload = response.session
            ?: throw ApiException(
                "INVALID_RESPONSE",
                0,
                "staffVerifySecondFactor returned no session.",
            )
        val record = toSessionRecord(payload, accountIdOf(payload, null), now())
        store.save(record)
        return record
    }

    // ---------------------------------------------------------------------------------------
    // Registration and OTP
    // ---------------------------------------------------------------------------------------

    /**
     * `auth/verifyOtp`. A non-null session means the account became active, so the user is signed in
     * directly without a second `auth/signIn` call (PRD §3).
     */
    suspend fun verifyOtp(
        targetIdentifier: String,
        purpose: String,
        code: String,
    ): VerifyOtpOutcome {
        val input = buildJsonObject {
            put("targetIdentifier", targetIdentifier)
            put("purpose", purpose)
            put("code", code)
            put("surface", surface)
        }
        val response = api.call(PROC_VERIFY_OTP, input, VerifyOtpResponse.serializer())
        val payload = response.session
        val record = payload?.let {
            toSessionRecord(it, accountIdOf(it, response.accountId), now()).also(store::save)
        }
        return VerifyOtpOutcome(
            verified = response.verified,
            channel = response.channel.orEmpty(),
            accountActivated = response.accountActivated,
            record = record,
        )
    }

    /** `auth/resendOtp`. Returns the new dispatch so the countdown can restart (AC-2). */
    suspend fun resendOtp(
        targetIdentifier: String,
        purpose: String,
        channel: String? = null,
        useFallbackChannel: Boolean = false,
    ): OtpDispatch {
        val input = buildJsonObject {
            put("targetIdentifier", targetIdentifier)
            put("purpose", purpose)
            if (channel != null) put("channel", channel)
            put("useFallbackChannel", useFallbackChannel)
        }
        return api.call(PROC_RESEND_OTP, input, OtpDispatch.serializer())
    }

    /**
     * `auth/registerTraveler`.
     *
     * [countryCode] is collected by the form (FR-AUTH-02) but the server schema has no country
     * field and Zod strips unknown keys, so it is deliberately **not** sent — the documented gap G1.
     */
    suspend fun registerTraveler(
        fullName: String,
        email: String? = null,
        phone: String? = null,
        password: String? = null,
        preferredSignInMethod: String = METHOD_OTP,
        preferredLanguage: String = LANGUAGE_AR,
        enableParentRole: Boolean = false,
        countryCode: String? = null,
    ): RegistrationOutcome {
        // TODO(FR-AUTH-02): send countryCode once the schema and the accounts table accept it.
        val input = buildJsonObject {
            put("fullName", fullName)
            if (email != null) put("email", email)
            if (phone != null) put("phone", phone)
            if (password != null) put("password", password)
            put("preferredSignInMethod", preferredSignInMethod)
            put("preferredLanguage", preferredLanguage)
            put("surface", surface)
            put("enableParentRole", enableParentRole)
        }
        val response = api.call(PROC_REGISTER_TRAVELER, input, RegistrationResponse.serializer())
        return RegistrationOutcome(
            accountId = response.accountId,
            status = response.status,
            role = null,
            otpDispatches = response.otpDispatches,
        )
    }

    /**
     * `auth/registerSupplierAccount` for a driver or a photographer.
     *
     * `organization_owner` is rejected here on purpose: organization registration is web-only
     * (FR-AUTH-11, G4), so no mobile app can submit it even if a future screen asked.
     */
    suspend fun registerSupplierAccount(
        role: String,
        fullName: String,
        email: String,
        phone: String,
        password: String,
        preferredLanguage: String = LANGUAGE_AR,
        countryCode: String? = null,
    ): RegistrationOutcome {
        require(role != ROLE_ORGANIZATION_OWNER) {
            "Organization registration is web-only (FR-AUTH-11); mobile must not submit it."
        }
        // TODO(FR-AUTH-02): send countryCode once the schema and the accounts table accept it.
        val input = buildJsonObject {
            put("role", role)
            put("fullName", fullName)
            put("email", email)
            put("phone", phone)
            put("password", password)
            put("preferredLanguage", preferredLanguage)
            put("surface", surface)
        }
        val response = api.call(PROC_REGISTER_SUPPLIER, input, RegistrationResponse.serializer())
        return RegistrationOutcome(
            accountId = response.accountId,
            status = response.status,
            role = role,
            otpDispatches = response.otpDispatches,
        )
    }

    // ---------------------------------------------------------------------------------------
    // Session lifecycle (R1–R6, F1–F3, S1–S5)
    // ---------------------------------------------------------------------------------------

    /**
     * Restores the actor after a relaunch.
     *
     * A stored record is already authenticated, so this only calls `auth/getSession` when the cached
     * actor is missing (P0-4) — no network round trip on the common path (AC-4).
     */
    suspend fun restore() {
        val current = store.current() ?: return
        if (current.actor.accountId.isNotBlank()) return
        val actor = getSession()
        store.updateActor(actor)
    }

    /** `auth/getSession` — the authoritative actor for the current token (PRD §7.8 A4). */
    suspend fun getSession(): AuthActor = authed(PROC_GET_SESSION) {
        val response = api.call(PROC_GET_SESSION, JsonNull, GetSessionResponse.serializer())
        response.actor ?: throw ApiException("INVALID_RESPONSE", 0, "getSession returned no actor.")
    }

    /**
     * R1/R6 before a call: refresh when the token is inside the 60 s window, and declare the session
     * over **without a network call** once `sessionMaxExpiresAt` has passed.
     *
     * Returns `null` when there is nothing stored, so an anonymous call never waits.
     */
    suspend fun ensureFresh(): SessionRecord? {
        val current = store.current() ?: return null
        if (AuthExpiry.isSessionExpired(current, now())) {
            store.clear()
            throw SessionExpiredException(reason = AuthRefreshPolicy.maxSessionReason)
        }
        if (!AuthExpiry.shouldRefreshBeforeCall(current, now())) return current
        return refreshOnce()
    }

    /**
     * One refresh, shared by every concurrent caller (R3).
     *
     * The first caller performs the request; the others await the same [CompletableDeferred], so two
     * authenticated calls in flight at the 60 s boundary produce exactly one `auth/refreshSession`.
     */
    suspend fun refreshOnce(): SessionRecord {
        val (shared, isOwner) = refreshLock.withLock {
            val existing = pendingRefresh
            if (existing != null) {
                existing to false
            } else {
                CompletableDeferred<SessionRecord>().also { pendingRefresh = it } to true
            }
        }
        if (!isOwner) return shared.await()

        return try {
            val record = performRefresh()
            refreshLock.withLock { pendingRefresh = null }
            shared.complete(record)
            record
        } catch (error: Throwable) {
            refreshLock.withLock { pendingRefresh = null }
            shared.completeExceptionally(error)
            throw error
        }
    }

    /**
     * `auth/refreshSession` with rotation (R5).
     *
     * Any failure clears the store and surfaces [SessionExpiredException] (F1): a 401, the maximum
     * session duration, a network error, a malformed body, or a response without a `refreshToken`.
     * The refresh call itself is issued through [ApiClient] directly, so it is never wrapped by the
     * reactive retry (R3).
     */
    private suspend fun performRefresh(): SessionRecord {
        val current = store.current()
        if (current == null || !current.hasRefreshToken) {
            store.clear()
            throw SessionExpiredException()
        }
        val startedAt = now()
        val response = try {
            api.call(
                PROC_REFRESH_SESSION,
                buildJsonObject { put("refreshToken", current.refreshToken) },
                RefreshSessionResponse.serializer(),
            )
        } catch (error: CancellationException) {
            throw error
        } catch (error: Throwable) {
            store.clear()
            throw SessionExpiredException(reason = sessionExpiryReason(error))
        }

        // R5: rotation is mandatory. A response without a new refresh token is a hard failure.
        if (response.refreshToken.isBlank() || response.accessToken.isBlank()) {
            store.clear()
            throw SessionExpiredException()
        }

        val rotated = current.copy(
            accessToken = response.accessToken,
            refreshToken = response.refreshToken,
            accessTokenExpiresAt = startedAt + response.accessTokenExpiresInSeconds * 1_000L,
            sessionMaxExpiresAt = AuthInstant.parseIsoUtc(response.sessionMaxExpiresAt)
                ?: current.sessionMaxExpiresAt,
        )
        store.save(rotated)
        return rotated
    }

    /**
     * Runs [block] with R1/R2/R3 applied.
     *
     * [procedure] is the procedure the block calls; it is what makes the retry procedure-aware, so
     * a sign-in failure is never mistaken for an expired session (R4).
     */
    suspend fun <T> authed(procedure: String, block: suspend () -> T): T {
        ensureFresh() ?: throw SessionExpiredException()
        return try {
            block()
        } catch (error: CancellationException) {
            throw error
        } catch (error: ApiException) {
            if (!AuthRefreshPolicy.needsRefreshOnError(error.status, error.code, procedure)) throw error
            // One reactive refresh, then exactly one replay (R2). A refresh failure throws
            // SessionExpiredException, so the original request is never replayed a second time (F3).
            refreshOnce()
            block()
        }
    }

    /**
     * `auth/signOut` with clear-always (S3).
     *
     * The local record is removed whether the call succeeds, fails, or never leaves the device: a
     * failed sign-out must not leave tokens behind (AC-3).
     */
    suspend fun signOut(allDevices: Boolean = false) {
        val current = store.current()
        try {
            if (current != null) {
                val input = buildJsonObject {
                    put("refreshToken", current.refreshToken)
                    put("allDevices", allDevices)
                }
                api.call(PROC_SIGN_OUT, input, SignOutResponse.serializer())
            }
        } catch (error: CancellationException) {
            // Cancellation still clears: the user asked to sign out, and the record must go.
            store.clear()
            throw error
        } catch (_: Throwable) {
            // Swallowed on purpose (S3): the local session ends even when the server is unreachable.
        } finally {
            store.clear()
        }
    }

    /** Drops the local session without a network call, used when a refresh already failed. */
    fun clearLocalSession() {
        store.clear()
    }

    /** True when a bearer token is currently stored (either active or pending supplier session). */
    fun hasStoredSession(): Boolean = store.accessToken() != null

    // ---------------------------------------------------------------------------------------
    // Supplier onboarding (`onboarding/*` procedures)
    // ---------------------------------------------------------------------------------------

    /** `onboarding/submitDriverApplication` (FR-ONB-01, FR-ONB-07, T-ONB-11). */
    suspend fun submitDriverApplication(
        fullName: String,
        email: String,
        phone: String,
        ownsVehicle: Boolean,
        vehiclePlateNumber: String? = null,
        vehicleModel: String? = null,
        vehicleSeatCapacity: Int? = null,
        driverLicenseNumber: String,
        driverLicenseExpiry: String,
        insurancePolicyExpiry: String? = null,
        initialLabTestCompletedAt: String,
        labTestConsentSigned: Boolean,
        backgroundCheckConsentSigned: Boolean = true,
        documents: List<OnboardingDocumentInput>,
    ): SubmitApplicationResult = authed(PROC_SUBMIT_DRIVER_APPLICATION) {
        val input = buildJsonObject {
            put("fullName", fullName)
            put("email", email)
            put("phone", phone)
            put("ownsVehicle", ownsVehicle)
            if (vehiclePlateNumber != null) put("vehiclePlateNumber", vehiclePlateNumber)
            if (vehicleModel != null) put("vehicleModel", vehicleModel)
            if (vehicleSeatCapacity != null) put("vehicleSeatCapacity", vehicleSeatCapacity)
            put("driverLicenseNumber", driverLicenseNumber)
            put("driverLicenseExpiry", driverLicenseExpiry)
            if (insurancePolicyExpiry != null) put("insurancePolicyExpiry", insurancePolicyExpiry)
            put("initialLabTestCompletedAt", initialLabTestCompletedAt)
            put("labTestConsentSigned", labTestConsentSigned)
            put("backgroundCheckConsentSigned", backgroundCheckConsentSigned)
            put("documents", encodeDocuments(documents))
        }
        api.call(PROC_SUBMIT_DRIVER_APPLICATION, input, SubmitApplicationResult.serializer())
    }

    /** `onboarding/submitPhotographerApplication` (FR-ONB-01, FR-ONB-06). */
    suspend fun submitPhotographerApplication(
        fullName: String,
        email: String,
        phone: String,
        portfolioPhotoCount: Int,
        cameraEquipmentSummary: String,
        documents: List<OnboardingDocumentInput>,
    ): SubmitApplicationResult = authed(PROC_SUBMIT_PHOTOGRAPHER_APPLICATION) {
        val input = buildJsonObject {
            put("fullName", fullName)
            put("email", email)
            put("phone", phone)
            put("portfolioPhotoCount", portfolioPhotoCount)
            put("cameraEquipmentSummary", cameraEquipmentSummary)
            put("documents", encodeDocuments(documents))
        }
        api.call(PROC_SUBMIT_PHOTOGRAPHER_APPLICATION, input, SubmitApplicationResult.serializer())
    }

    /** `onboarding/getApplicationStatus` (FR-ONB-01). */
    suspend fun getApplicationStatus(applicationId: String? = null): ApplicationStatusResult =
        authed(PROC_GET_APPLICATION_STATUS) {
            val input = buildJsonObject {
                if (applicationId != null) put("applicationId", applicationId)
            }
            api.call(PROC_GET_APPLICATION_STATUS, input, ApplicationStatusResult.serializer())
        }

    /** `onboarding/requestChangesExtension` (FR-ONB-04). */
    suspend fun requestChangesExtension(
        applicationId: String,
        reason: String? = null,
    ): SupplierApplication = authed(PROC_REQUEST_CHANGES_EXTENSION) {
        val input = buildJsonObject {
            put("applicationId", applicationId)
            if (reason != null) put("reason", reason)
        }
        api.call(PROC_REQUEST_CHANGES_EXTENSION, input, SupplierApplication.serializer())
    }

    /** `onboarding/resubmitApplication` (FR-ONB-04). */
    suspend fun resubmitApplication(
        applicationId: String,
        updatedPayload: JsonObject = buildJsonObject {},
        documents: List<OnboardingDocumentInput> = emptyList(),
    ): SupplierApplication = authed(PROC_RESUBMIT_APPLICATION) {
        val input = buildJsonObject {
            put("applicationId", applicationId)
            put("updatedPayload", updatedPayload)
            if (documents.isNotEmpty()) {
                put("documents", encodeDocuments(documents))
            }
        }
        api.call(PROC_RESUBMIT_APPLICATION, input, SupplierApplication.serializer())
    }

    /** `onboarding/submitAppeal` (FR-ONB-05). */
    suspend fun submitAppeal(
        applicationId: String,
        appealStatement: String,
        documents: List<OnboardingDocumentInput> = emptyList(),
    ): AppealSubmissionResult = authed(PROC_SUBMIT_APPEAL) {
        val input = buildJsonObject {
            put("applicationId", applicationId)
            put("appealStatement", appealStatement)
            if (documents.isNotEmpty()) {
                put("documents", encodeDocuments(documents))
            }
        }
        api.call(PROC_SUBMIT_APPEAL, input, AppealSubmissionResult.serializer())
    }

    private fun encodeDocuments(documents: List<OnboardingDocumentInput>) = buildJsonArray {
        for (doc in documents) {
            add(
                buildJsonObject {
                    put("documentType", doc.documentType)
                    put("storageKey", doc.storageKey)
                    put("mimeType", doc.mimeType)
                    put("fileSizeBytes", doc.fileSizeBytes)
                    if (doc.expiresAt != null) put("expiresAt", doc.expiresAt)
                },
            )
        }
    }

    // ---------------------------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------------------------

    /** The account id a payload belongs to: the actor claim when present, else the sibling field. */
    private fun accountIdOf(payload: SessionTokenPayload, fallback: String?): String {
        if (fallback != null && fallback.isNotBlank()) return fallback
        // The session payload does not repeat the account id, so the JWT `sub` is the only source.
        return decodeJwtSubject(payload.accessToken).orEmpty()
    }

    /**
     * Reads `sub` out of a JWT without verifying it.
     *
     * The signature is checked by the server on every call; the client only needs the claim to fill
     * the cached actor. A malformed token yields `null` rather than an exception.
     */
    private fun decodeJwtSubject(token: String): String? {
        val segments = token.split('.')
        if (segments.size < 2) return null
        val payload = base64UrlDecode(segments[1]) ?: return null
        return runCatching {
            val json = Json.parseToJsonElement(payload) as JsonObject
            json.stringAt("sub")
        }.getOrNull()
    }

    /** Decodes base64url (with or without padding) to a UTF-8 string, or `null`. */
    private fun base64UrlDecode(value: String): String? {
        val normalized = value.replace('-', '+').replace('_', '/')
        val padding = (4 - normalized.length % 4) % 4
        return decodeBase64(normalized + "=".repeat(padding))
    }

    private fun sessionExpiryReason(error: Throwable): String? {
        val apiError = error as? ApiException ?: return null
        return AuthErrorDetails(apiError.details).reason
    }

    // ---------------------------------------------------------------------------------------
    // Wire models. Every one of them tolerates unknown keys, so a server field added later does
    // not break an older app.
    // ---------------------------------------------------------------------------------------

    @Serializable
    private data class SignInResponse(
        @SerialName("step") val step: String,
        @SerialName("otpDispatch") val otpDispatch: OtpDispatch? = null,
        @SerialName("accountId") val accountId: String? = null,
        @SerialName("role") val role: String? = null,
        @SerialName("status") val status: String? = null,
        @SerialName("roleStatus") val roleStatus: String? = null,
        @SerialName("rolePauseReason") val rolePauseReason: String? = null,
        @SerialName("availableRoles") val availableRoles: List<AvailableRole>? = null,
        @SerialName("session") val session: SessionTokenPayload? = null,
    )

    @Serializable
    private data class ModeratorSignInResponse(
        @SerialName("step") val step: String = STEP_AUTHENTICATED,
        @SerialName("session") val session: SessionTokenPayload? = null,
    )

    @Serializable
    private data class AdminSignInResponse(
        @SerialName("step") val step: String,
        @SerialName("challengeToken") val challengeToken: String? = null,
        @SerialName("enrollmentToken") val enrollmentToken: String? = null,
        @SerialName("secret") val secret: String? = null,
        @SerialName("otpauthUri") val otpauthUri: String? = null,
        @SerialName("subRole") val subRole: String? = null,
    )

    @Serializable
    private data class StaffSignInResponse(
        @SerialName("step") val step: String,
        @SerialName("challengeToken") val challengeToken: String? = null,
        @SerialName("totpSecret") val totpSecret: String? = null,
        @SerialName("otpauthUri") val otpauthUri: String? = null,
        @SerialName("method") val method: String? = null,
        @SerialName("smsDispatch") val smsDispatch: OtpDispatch? = null,
    )

    @Serializable
    private data class SessionStepResponse(
        @SerialName("step") val step: String = STEP_AUTHENTICATED,
        @SerialName("session") val session: SessionTokenPayload? = null,
    )

    @Serializable
    private data class VerifyOtpResponse(
        @SerialName("verified") val verified: Boolean = false,
        @SerialName("channel") val channel: String? = null,
        @SerialName("accountId") val accountId: String? = null,
        @SerialName("accountActivated") val accountActivated: Boolean = false,
        @SerialName("allRequiredChannelsVerified") val allRequiredChannelsVerified: Boolean = false,
        @SerialName("session") val session: SessionTokenPayload? = null,
    )

    @Serializable
    private data class RegistrationResponse(
        @SerialName("accountId") val accountId: String,
        @SerialName("status") val status: String,
        @SerialName("role") val role: String? = null,
        @SerialName("otpDispatches") val otpDispatches: List<OtpDispatch> = emptyList(),
    )

    @Serializable
    private data class RefreshSessionResponse(
        @SerialName("sessionId") val sessionId: String = "",
        @SerialName("accessToken") val accessToken: String = "",
        @SerialName("refreshToken") val refreshToken: String = "",
        @SerialName("accessTokenExpiresInSeconds") val accessTokenExpiresInSeconds: Long = 0L,
        @SerialName("sessionMaxExpiresAt") val sessionMaxExpiresAt: String = "",
        @SerialName("draftsRetained") val draftsRetained: Boolean = true,
    )

    @Serializable
    private data class SignOutResponse(
        @SerialName("signedOut") val signedOut: Boolean = false,
        @SerialName("allDevices") val allDevices: Boolean = false,
    )

    @Serializable
    private data class GetSessionResponse(
        @SerialName("authenticated") val authenticated: Boolean = false,
        @SerialName("actor") val actor: AuthActor? = null,
    )

    companion object {
        /** The surface the traveler, driver and photographer apps declare. */
        const val SURFACE_MOBILE: String = "mobile"

        /** The surface the moderator app declares (it is the same PWA surface as `/crew`). */
        const val SURFACE_PWA: String = "pwa"

        // Procedure names, exactly as `packages/services/auth/src/routes/index.ts` declares them.
        const val PROC_SIGN_IN = "auth/signIn"
        const val PROC_MODERATOR_SIGN_IN = "auth/moderatorSignIn"
        const val PROC_ADMIN_SIGN_IN = "auth/adminSignIn"
        const val PROC_ADMIN_VERIFY_TOTP = "auth/adminVerifyTotp"
        const val PROC_STAFF_SIGN_IN = "auth/staffSignIn"
        const val PROC_STAFF_VERIFY_SECOND_FACTOR = "auth/staffVerifySecondFactor"
        const val PROC_VERIFY_OTP = "auth/verifyOtp"
        const val PROC_RESEND_OTP = "auth/resendOtp"
        const val PROC_REGISTER_TRAVELER = "auth/registerTraveler"
        const val PROC_REGISTER_SUPPLIER = "auth/registerSupplierAccount"
        const val PROC_REFRESH_SESSION = "auth/refreshSession"
        const val PROC_SIGN_OUT = "auth/signOut"
        const val PROC_GET_SESSION = "auth/getSession"

        // Onboarding procedure names (`packages/services/onboarding/src/routes/index.ts`).
        const val PROC_SUBMIT_DRIVER_APPLICATION = "onboarding/submitDriverApplication"
        const val PROC_SUBMIT_PHOTOGRAPHER_APPLICATION = "onboarding/submitPhotographerApplication"
        const val PROC_GET_APPLICATION_STATUS = "onboarding/getApplicationStatus"
        const val PROC_REQUEST_CHANGES_EXTENSION = "onboarding/requestChangesExtension"
        const val PROC_RESUBMIT_APPLICATION = "onboarding/resubmitApplication"
        const val PROC_SUBMIT_APPEAL = "onboarding/submitAppeal"

        // Step values the services return (PRD §3).
        const val STEP_OTP_REQUIRED = "otp_required"
        const val STEP_AUTHENTICATED = "authenticated"
        const val STEP_PENDING_APPROVAL = "application_pending_approval"
        const val STEP_TOTP_VERIFICATION_REQUIRED = "totp_verification_required"
        const val STEP_TOTP_ENROLLMENT_REQUIRED = "totp_enrollment_required"
        const val STEP_STAFF_2FA_SETUP_REQUIRED = "staff_2fa_setup_required"
        const val STEP_STAFF_2FA_VERIFICATION_REQUIRED = "staff_2fa_verification_required"

        // Sign-in methods and OTP purposes the schemas accept.
        const val METHOD_OTP = "otp"
        const val METHOD_PASSWORD = "password"
        const val METHOD_SMS = "sms"
        const val PURPOSE_SIGN_IN = "sign_in"
        const val PURPOSE_REGISTRATION = "registration"

        // Languages the schemas accept.
        const val LANGUAGE_AR = "ar"
        const val LANGUAGE_EN = "en"

        /** The role that must never be registered from a mobile surface (FR-AUTH-11). */
        const val ROLE_ORGANIZATION_OWNER = "organization_owner"

        /** Roles a supplier account may self-register as from mobile. */
        const val ROLE_PLATFORM_DRIVER = "platform_driver"

        /** The photographer role. */
        const val ROLE_PLATFORM_PHOTOGRAPHER = "platform_photographer"

        private val EMPTY_DISPATCH = OtpDispatch(channel = "sms")
    }
}

/**
 * Decodes standard base64 into a UTF-8 string.
 *
 * `kotlin.io.encoding.Base64` is experimental in the Kotlin version this project pins, and the
 * catalog has no alternative, so the decoder is written out here: a table lookup, no dependencies,
 * and the only input it ever sees is a JWT payload segment.
 */
internal fun decodeBase64(value: String): String? {
    val alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    val bytes = ArrayList<Byte>(value.length * 3 / 4 + 3)
    var buffer = 0
    var bits = 0
    for (character in value) {
        if (character == '=') break
        val index = alphabet.indexOf(character)
        if (index < 0) return null
        buffer = (buffer shl 6) or index
        bits += 6
        if (bits >= 8) {
            bits -= 8
            bytes.add(((buffer shr bits) and 0xFF).toByte())
        }
    }
    if (bytes.isEmpty()) return ""
    return bytes.toByteArray().decodeToString()
}
