package com.tripsenjoy.auth

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

/**
 * What every platform persists: one JSON record under one key (PRD §7.1 T1).
 *
 * Field names are byte-identical to `SessionRecord` in `@trips-app/auth`; both expiry fields are
 * epoch **milliseconds** (T2). The web app writes the same shape into `localStorage["trips.auth.v1"]`,
 * so a record can be moved between platforms without translation.
 */
@Serializable
data class SessionRecord(
    @SerialName("accessToken") val accessToken: String,
    @SerialName("refreshToken") val refreshToken: String,
    @SerialName("accessTokenExpiresAt") val accessTokenExpiresAt: Long,
    @SerialName("sessionMaxExpiresAt") val sessionMaxExpiresAt: Long,
    @SerialName("actor") val actor: AuthActor,
) {
    /** True when this record holds a refresh token, which every refresh path requires (R4). */
    val hasRefreshToken: Boolean get() = refreshToken.isNotBlank()

    companion object {
        /** Strict reader for the persisted record: unknown keys are ignored, missing ones fail. */
        private val recordJson = Json {
            ignoreUnknownKeys = true
            encodeDefaults = true
        }

        /** Encodes [record] as the single JSON string written to platform storage. */
        fun serialize(record: SessionRecord): String = recordJson.encodeToString(serializer(), record)

        /**
         * Decodes a persisted record, returning `null` for anything that is not a complete record.
         *
         * Shape-validated on purpose: a truncated or hand-edited record must be treated as absent
         * so the app shows the sign-in screen instead of throwing on boot.
         */
        fun parse(raw: String?): SessionRecord? {
            if (raw.isNullOrBlank()) return null
            val decoded = runCatching { recordJson.decodeFromString(serializer(), raw) }.getOrNull()
                ?: return null
            if (decoded.accessToken.isBlank()) return null
            if (decoded.refreshToken.isBlank()) return null
            if (decoded.accessTokenExpiresAt <= 0L) return null
            if (decoded.sessionMaxExpiresAt <= 0L) return null
            if (decoded.actor.accountId.isBlank()) return null
            if (decoded.actor.sessionId.isBlank()) return null
            if (decoded.actor.activeRole.isBlank()) return null
            return decoded
        }
    }
}

/**
 * The `session` object every auth procedure returns (`SessionTokenPayload` in `@trips-app/auth`).
 *
 * `sessionMaxExpiresAt` arrives as an ISO-8601 string and is converted to epoch milliseconds by
 * [toSessionRecord]. `newDeviceAlertTriggered` is decoded so the payload round-trips, but no screen
 * depends on it in P0.
 */
@Serializable
data class SessionTokenPayload(
    @SerialName("sessionId") val sessionId: String,
    @SerialName("accessToken") val accessToken: String,
    @SerialName("refreshToken") val refreshToken: String,
    @SerialName("accessTokenExpiresInSeconds") val accessTokenExpiresInSeconds: Long,
    @SerialName("sessionMaxExpiresAt") val sessionMaxExpiresAt: String,
    @SerialName("activeRole") val activeRole: String,
    @SerialName("adminSubRole") val adminSubRole: String? = null,
    @SerialName("activeTenantId") val activeTenantId: String? = null,
    @SerialName("planTier") val planTier: String? = null,
    @SerialName("permissions") val permissions: Map<String, String>? = null,
    @SerialName("moderatorVehicleId") val moderatorVehicleId: String? = null,
    @SerialName("moderatorTripId") val moderatorTripId: String? = null,
    @SerialName("newDeviceAlertTriggered") val newDeviceAlertTriggered: Boolean = false,
) {
    /** The cached actor this payload describes. */
    fun toActor(): AuthActor = AuthActor(
        accountId = "",
        sessionId = sessionId,
        activeRole = activeRole,
        adminSubRole = adminSubRole,
        activeTenantId = activeTenantId,
        planTier = planTier,
        permissions = permissions,
        moderatorVehicleId = moderatorVehicleId,
        moderatorTripId = moderatorTripId,
    )
}

/**
 * Converts a procedure's `session` payload into the persisted record (contract `toSessionRecord`, T2).
 *
 * `accessTokenExpiresAt` is computed at receipt: `nowMs + accessTokenExpiresInSeconds * 1000`.
 * `sessionMaxExpiresAt` is taken verbatim from the response and only converted to epoch millis.
 * When the ISO string cannot be parsed, the fallback is the access-token expiry, which keeps the
 * record usable and lets the next refresh replace it with a server value.
 *
 * [accountId] comes from the caller because `signIn`/`verifyOtp` return it beside the session, not
 * inside it.
 */
fun toSessionRecord(
    payload: SessionTokenPayload,
    accountId: String,
    nowMs: Long,
): SessionRecord {
    val accessTokenExpiresAt = nowMs + payload.accessTokenExpiresInSeconds * 1_000L
    val sessionMaxExpiresAt = AuthInstant.parseIsoUtc(payload.sessionMaxExpiresAt)
        ?: accessTokenExpiresAt
    return SessionRecord(
        accessToken = payload.accessToken,
        refreshToken = payload.refreshToken,
        accessTokenExpiresAt = accessTokenExpiresAt,
        sessionMaxExpiresAt = sessionMaxExpiresAt,
        actor = payload.toActor().copy(accountId = accountId),
    )
}
