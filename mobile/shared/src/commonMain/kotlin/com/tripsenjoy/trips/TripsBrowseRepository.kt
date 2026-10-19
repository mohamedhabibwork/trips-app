package com.tripsenjoy.trips

import com.tripsenjoy.api.ApiClient
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

/** Route point returned on public trips (`origin` and `destinations`). */
@Serializable
data class PublicTripRoutePoint(
    @SerialName("nameAr") val nameAr: String = "",
    @SerialName("nameEn") val nameEn: String = "",
    @SerialName("latitude") val latitude: Double? = null,
    @SerialName("longitude") val longitude: Double? = null,
    @SerialName("regionLookupCode") val regionLookupCode: String? = null,
)

/** Money representation returned on public trips (`basePrice`). */
@Serializable
data class PublicTripMoney(
    @SerialName("amountMinor") val amountMinor: Int = 0,
    @SerialName("currency") val currency: String = "EGP",
)

/** Public trip summary returned by `trips/browsePublicTrips` and `trips/getPublicTripDetail` (SCR-TRV-01, SCR-TRV-02). */
@Serializable
data class PublicTripSummary(
    @SerialName("id") val id: String = "",
    @SerialName("tenantId") val tenantId: String = "",
    @SerialName("organizerNameAr") val organizerNameAr: String = "",
    @SerialName("organizerNameEn") val organizerNameEn: String = "",
    @SerialName("titleAr") val titleAr: String = "",
    @SerialName("titleEn") val titleEn: String = "",
    @SerialName("descriptionAr") val descriptionAr: String = "",
    @SerialName("descriptionEn") val descriptionEn: String = "",
    @SerialName("categoryLookupCode") val categoryLookupCode: String = "",
    @SerialName("language") val language: String = "ar",
    @SerialName("coverImageUrl") val coverImageUrl: String? = null,
    @SerialName("galleryImageUrls") val galleryImageUrls: List<String> = emptyList(),
    @SerialName("startsAt") val startsAt: String? = null,
    @SerialName("endsAt") val endsAt: String? = null,
    @SerialName("timezone") val timezone: String = "Africa/Cairo",
    @SerialName("origin") val origin: PublicTripRoutePoint? = null,
    @SerialName("destinations") val destinations: List<PublicTripRoutePoint> = emptyList(),
    @SerialName("seatAssignmentMode") val seatAssignmentMode: String = "organization_assigned",
    @SerialName("basePrice") val basePrice: PublicTripMoney = PublicTripMoney(),
    @SerialName("basePriceMinor") val basePriceMinor: Int = 0,
    @SerialName("currencyCode") val currencyCode: String = "EGP",
    @SerialName("totalCapacity") val totalCapacity: Int = 0,
    @SerialName("confirmedSeatsCount") val confirmedSeatsCount: Int = 0,
    @SerialName("remainingSeatsCount") val remainingSeatsCount: Int = 0,
    @SerialName("childTrackingEnabled") val childTrackingEnabled: Boolean = false,
    @SerialName("state") val state: String = "published",
)

/** Envelope returned by `trips/browsePublicTrips`. */
@Serializable
data class BrowsePublicTripsResponse(
    @SerialName("items") val items: List<PublicTripSummary> = emptyList(),
)

/** Envelope returned by `trips/getPublicTripDetail`. */
@Serializable
data class PublicTripDetailResponse(
    @SerialName("trip") val trip: PublicTripSummary? = null,
)

/**
 * Typed client for the public trip discovery procedures (`trips/browsePublicTrips`, `trips/getPublicTripDetail`).
 *
 * Both procedures are intentionally public, while also forwarding the caller's bearer token when
 * signed in so targeted audience lists and VIP early-access windows (FR-TRIP-02) resolve for the viewer.
 */
class TripsBrowseRepository(
    private val api: ApiClient,
) {
    /** `trips/browsePublicTrips` (SCR-TRV-01, FR-TRIP-02). */
    suspend fun browsePublicTrips(
        search: String? = null,
        categoryLookupCode: String? = null,
        regionLookupCode: String? = null,
        maxPriceMinor: Int? = null,
    ): List<PublicTripSummary> {
        val input = buildJsonObject {
            if (!search.isNullOrBlank()) put("search", search.trim())
            if (!categoryLookupCode.isNullOrBlank()) put("categoryLookupCode", categoryLookupCode.trim())
            if (!regionLookupCode.isNullOrBlank()) put("regionLookupCode", regionLookupCode.trim())
            if (maxPriceMinor != null) put("maxPriceMinor", maxPriceMinor)
        }
        return api.call(PROC_BROWSE_PUBLIC_TRIPS, input, BrowsePublicTripsResponse.serializer()).items
    }

    /** `trips/getPublicTripDetail` (SCR-TRV-02, FR-TRIP-02). */
    suspend fun getPublicTripDetail(tripId: String): PublicTripSummary? {
        val input = buildJsonObject {
            put("tripId", tripId)
        }
        return api.call(PROC_GET_PUBLIC_TRIP_DETAIL, input, PublicTripDetailResponse.serializer()).trip
    }

    companion object {
        const val PROC_BROWSE_PUBLIC_TRIPS = "trips/browsePublicTrips"
        const val PROC_GET_PUBLIC_TRIP_DETAIL = "trips/getPublicTripDetail"

        /** Holds the most recently selected trip ID between SCR-TRV-01 and SCR-TRV-02. */
        var selectedTripId: String? = null
    }
}
