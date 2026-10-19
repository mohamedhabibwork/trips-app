package com.tripsenjoy.traveler

import com.tripsenjoy.api.ApiClient
import com.tripsenjoy.auth.AuthRepository
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.buildJsonArray
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import kotlinx.serialization.json.putJsonObject

/** Traveler notification channel toggles per category (SCR-TRV-19). */
@Serializable
data class TravelerNotificationPreferences(
    @SerialName("bookingsPush") val bookingsPush: Boolean = true,
    @SerialName("bookingsSms") val bookingsSms: Boolean = true,
    @SerialName("bookingsEmail") val bookingsEmail: Boolean = true,
    @SerialName("tripUpdatesPush") val tripUpdatesPush: Boolean = true,
    @SerialName("tripUpdatesSms") val tripUpdatesSms: Boolean = true,
    @SerialName("tripUpdatesEmail") val tripUpdatesEmail: Boolean = true,
    @SerialName("promotionsPush") val promotionsPush: Boolean = false,
    @SerialName("promotionsSms") val promotionsSms: Boolean = false,
    @SerialName("promotionsEmail") val promotionsEmail: Boolean = false,
    @SerialName("quietHoursNotice") val quietHoursNotice: String = "",
)

/** Traveler profile returned by `traveler/getProfile` and `traveler/updateProfile` (SCR-TRV-19, D-20). */
@Serializable
data class TravelerProfile(
    @SerialName("accountId") val accountId: String = "",
    @SerialName("fullName") val fullName: String = "",
    @SerialName("email") val email: String? = null,
    @SerialName("phoneE164") val phoneE164: String? = null,
    @SerialName("countryCode") val countryCode: String = "EG",
    @SerialName("preferredLanguage") val preferredLanguage: String = "ar",
    @SerialName("avatarUrl") val avatarUrl: String? = null,
    @SerialName("travelerPlanTier") val travelerPlanTier: String = "free",
    @SerialName("notificationPreferences")
    val notificationPreferences: TravelerNotificationPreferences = TravelerNotificationPreferences(),
    @SerialName("quietHoursNotice") val quietHoursNotice: String = "",
)

/** Traveler plan catalog entry returned by `traveler/getPlanOverview` (SCR-TRV-18). */
@Serializable
data class TravelerPlanCatalogEntry(
    @SerialName("id") val id: String = "",
    @SerialName("role") val role: String = "traveler",
    @SerialName("tier") val tier: String = "free",
    @SerialName("nameEn") val nameEn: String = "",
    @SerialName("nameAr") val nameAr: String = "",
    @SerialName("monthlyPriceMinor") val monthlyPriceMinor: Int = 0,
    @SerialName("annualPriceMinor") val annualPriceMinor: Int = 0,
    @SerialName("currencyCode") val currencyCode: String = "EGP",
    @SerialName("annualDiscountBps") val annualDiscountBps: Int = 1500,
)

/** Traveler plan overview returned by `traveler/getPlanOverview` (SCR-TRV-18). */
@Serializable
data class TravelerPlanOverview(
    @SerialName("currentPlanTier") val currentPlanTier: String = "free",
    @SerialName("annualDiscountBps") val annualDiscountBps: Int = 1500,
    @SerialName("plans") val plans: List<TravelerPlanCatalogEntry> = emptyList(),
)

/** Privacy request record returned by `traveler/requestPrivacyAction` (SCR-TRV-20, D-38). */
@Serializable
data class TravelerPrivacyRequest(
    @SerialName("id") val id: String = "",
    @SerialName("accountId") val accountId: String = "",
    @SerialName("requestType") val requestType: String = "",
    @SerialName("status") val status: String = "",
    @SerialName("reason") val reason: String? = null,
    @SerialName("downloadUrl") val downloadUrl: String? = null,
    @SerialName("scheduledPurgeAt") val scheduledPurgeAt: String? = null,
    @SerialName("completedAt") val completedAt: String? = null,
    @SerialName("createdAt") val createdAt: String? = null,
)

/**
 * Typed client for the `traveler` oRPC procedures (SCR-TRV-18, SCR-TRV-19, SCR-TRV-20).
 *
 * When [auth] is supplied, each authenticated procedure is wrapped in `auth.authed(procedure)` so
 * proactive/reactive token refresh (R1/R2/R3) applies automatically.
 */
class TravelerRepository(
    private val api: ApiClient,
    private val auth: AuthRepository? = null,
) {
    private suspend fun <T> runAuthed(procedure: String, block: suspend () -> T): T {
        val repo = auth
        return if (repo != null) repo.authed(procedure, block) else block()
    }

    /** `traveler/getProfile` (SCR-TRV-19). */
    suspend fun getProfile(): TravelerProfile = runAuthed(PROC_GET_PROFILE) {
        api.call(PROC_GET_PROFILE, JsonNull, TravelerProfile.serializer())
    }

    /** `traveler/updateProfile` (SCR-TRV-19, D-20). */
    suspend fun updateProfile(
        fullName: String,
        countryCode: String,
        email: String? = null,
        phoneE164: String? = null,
        preferredLanguage: String? = null,
        avatarUrl: String? = null,
        fileIds: List<String> = emptyList(),
        notificationPreferences: TravelerNotificationPreferences? = null,
    ): TravelerProfile = runAuthed(PROC_UPDATE_PROFILE) {
        val input = buildJsonObject {
            put("fullName", fullName)
            put("countryCode", countryCode)
            if (email != null) put("email", email) else put("email", JsonNull)
            if (phoneE164 != null) put("phoneE164", phoneE164) else put("phoneE164", JsonNull)
            if (preferredLanguage != null) put("preferredLanguage", preferredLanguage)
            if (avatarUrl != null) put("avatarUrl", avatarUrl)
            if (fileIds.isNotEmpty()) {
                put(
                    "fileIds",
                    buildJsonArray {
                        for (id in fileIds) add(kotlinx.serialization.json.JsonPrimitive(id))
                    },
                )
            }
            if (notificationPreferences != null) {
                putJsonObject("notificationPreferences") {
                    put("bookingsPush", notificationPreferences.bookingsPush)
                    put("bookingsSms", notificationPreferences.bookingsSms)
                    put("bookingsEmail", notificationPreferences.bookingsEmail)
                    put("tripUpdatesPush", notificationPreferences.tripUpdatesPush)
                    put("tripUpdatesSms", notificationPreferences.tripUpdatesSms)
                    put("tripUpdatesEmail", notificationPreferences.tripUpdatesEmail)
                    put("promotionsPush", notificationPreferences.promotionsPush)
                    put("promotionsSms", notificationPreferences.promotionsSms)
                    put("promotionsEmail", notificationPreferences.promotionsEmail)
                }
            }
        }
        api.call(PROC_UPDATE_PROFILE, input, TravelerProfile.serializer())
    }

    /** `traveler/getNotificationPreferences` (SCR-TRV-19). */
    suspend fun getNotificationPreferences(): TravelerNotificationPreferences =
        runAuthed(PROC_GET_NOTIFICATION_PREFERENCES) {
            api.call(
                PROC_GET_NOTIFICATION_PREFERENCES,
                JsonNull,
                TravelerNotificationPreferences.serializer(),
            )
        }

    /** `traveler/updateNotificationPreferences` (SCR-TRV-19). */
    suspend fun updateNotificationPreferences(
        bookingsPush: Boolean? = null,
        bookingsSms: Boolean? = null,
        bookingsEmail: Boolean? = null,
        tripUpdatesPush: Boolean? = null,
        tripUpdatesSms: Boolean? = null,
        tripUpdatesEmail: Boolean? = null,
        promotionsPush: Boolean? = null,
        promotionsSms: Boolean? = null,
        promotionsEmail: Boolean? = null,
    ): TravelerNotificationPreferences = runAuthed(PROC_UPDATE_NOTIFICATION_PREFERENCES) {
        val input = buildJsonObject {
            if (bookingsPush != null) put("bookingsPush", bookingsPush)
            if (bookingsSms != null) put("bookingsSms", bookingsSms)
            if (bookingsEmail != null) put("bookingsEmail", bookingsEmail)
            if (tripUpdatesPush != null) put("tripUpdatesPush", tripUpdatesPush)
            if (tripUpdatesSms != null) put("tripUpdatesSms", tripUpdatesSms)
            if (tripUpdatesEmail != null) put("tripUpdatesEmail", tripUpdatesEmail)
            if (promotionsPush != null) put("promotionsPush", promotionsPush)
            if (promotionsSms != null) put("promotionsSms", promotionsSms)
            if (promotionsEmail != null) put("promotionsEmail", promotionsEmail)
        }
        api.call(
            PROC_UPDATE_NOTIFICATION_PREFERENCES,
            input,
            TravelerNotificationPreferences.serializer(),
        )
    }

    /** `traveler/getPlanOverview` (SCR-TRV-18). */
    suspend fun getPlanOverview(): TravelerPlanOverview = runAuthed(PROC_GET_PLAN_OVERVIEW) {
        api.call(PROC_GET_PLAN_OVERVIEW, JsonNull, TravelerPlanOverview.serializer())
    }

    /** `traveler/requestPrivacyAction` (SCR-TRV-20, D-38). */
    suspend fun requestPrivacyAction(
        requestType: String,
        confirmedUnderstood: Boolean,
        reason: String? = null,
    ): TravelerPrivacyRequest = runAuthed(PROC_REQUEST_PRIVACY_ACTION) {
        val input = buildJsonObject {
            put("requestType", requestType)
            put("confirmedUnderstood", confirmedUnderstood)
            if (reason != null) put("reason", reason)
        }
        api.call(PROC_REQUEST_PRIVACY_ACTION, input, TravelerPrivacyRequest.serializer())
    }

    companion object {
        const val PROC_GET_PROFILE = "traveler/getProfile"
        const val PROC_UPDATE_PROFILE = "traveler/updateProfile"
        const val PROC_GET_NOTIFICATION_PREFERENCES = "traveler/getNotificationPreferences"
        const val PROC_UPDATE_NOTIFICATION_PREFERENCES = "traveler/updateNotificationPreferences"
        const val PROC_GET_PLAN_OVERVIEW = "traveler/getPlanOverview"
        const val PROC_REQUEST_PRIVACY_ACTION = "traveler/requestPrivacyAction"

        const val PRIVACY_DATA_EXPORT = "data_export"
        const val PRIVACY_ACCOUNT_DELETION = "account_deletion"
    }
}
