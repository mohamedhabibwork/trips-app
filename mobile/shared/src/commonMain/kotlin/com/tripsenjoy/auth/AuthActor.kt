package com.tripsenjoy.auth

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * The signed-in identity, mirroring `AuthActor` in `@trips-app/auth` and `packages/rpc`.
 *
 * Field names are identical to the TypeScript contract because the same JSON record is written by
 * every platform (PRD §7.1). Claims are read from the token for rendering only: the server remains
 * the authority (PRD §7.8 A4).
 */
@Serializable
data class AuthActor(
    @SerialName("accountId") val accountId: String,
    @SerialName("sessionId") val sessionId: String,
    @SerialName("activeRole") val activeRole: String,
    @SerialName("adminSubRole") val adminSubRole: String? = null,
    @SerialName("activeTenantId") val activeTenantId: String? = null,
    @SerialName("planTier") val planTier: String? = null,
    @SerialName("permissions") val permissions: Map<String, String>? = null,
    @SerialName("moderatorVehicleId") val moderatorVehicleId: String? = null,
    @SerialName("moderatorTripId") val moderatorTripId: String? = null,
) {
    /** True when this actor carries the given role. */
    fun hasRole(role: String): Boolean = activeRole == role

    companion object {
        /** The role a vehicle moderator holds; the only role that signs in with a staff code. */
        const val ROLE_MODERATOR: String = "moderator"

        /** The platform admin role. */
        const val ROLE_ADMIN: String = "admin"

        /** The traveler role. */
        const val ROLE_TRAVELER: String = "traveler"
    }
}
