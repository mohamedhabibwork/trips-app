package com.tripsenjoy.screens.photographer.common

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.runtime.staticCompositionLocalOf
import com.tripsenjoy.api.ApiClient
import com.tripsenjoy.ui.components.OfferStatus
import com.tripsenjoy.ui.components.TeDate
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.intOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.longOrNull
import kotlinx.serialization.json.put

const val DEMO_PORTFOLIO_IMAGES = 0
const val DEMO_BOOKINGS_USED = 0
const val DEMO_COUPONS_USED = 0
const val DEMO_ALBUMS_ON_COMPLETED_TRIP = 0

const val DEMO_BRIEF_TRIP_COMPLETED = false

const val OFFER_EXPIRY_TEXT = "Expires 72 hours after the last counter-offer"

val DEMO_CALENDAR_MONTH = TeDate(year = 2026, month = 10, day = 1)

data class DealOffer(
    val id: String,
    val tripName: String,
    val route: String,
    val date: String,
    val organization: String,
    val amountMinor: Long,
    val status: OfferStatus,
)

data class TripAlbumSummary(
    val id: String,
    val tripId: String,
    val tripName: String,
    val completed: Boolean,
    val albumsUsed: Int,
)

data class PhotographerPayoutItem(
    val id: String,
    val date: String,
    val amountMinor: Long,
    val state: String,
)

val DEMO_DEAL_OFFERS: List<DealOffer> = emptyList()

internal class PhotographerSession(
    private val api: ApiClient? = null,
    private val scope: CoroutineScope = CoroutineScope(Dispatchers.Main),
) {
    val dealOffers = mutableStateListOf<DealOffer>()
    val tripAlbums = mutableStateListOf<TripAlbumSummary>()
    val unavailableDates = mutableStateListOf<TeDate>()
    val payoutHistory = mutableStateListOf<PhotographerPayoutItem>()
    var periodEarningsMinor by mutableStateOf(0L)
    var bookingsUsed by mutableIntStateOf(0)
    var couponsUsed by mutableIntStateOf(0)
    var portfolioImagesCount by mutableIntStateOf(0)
    var assignedTripName by mutableStateOf("No active assignment")
    var assignedRoute by mutableStateOf("—")
    var assignedDeparture by mutableStateOf("—")
    var assignedVehicle by mutableStateOf("—")
    var assignedTripCompleted by mutableStateOf(false)
    var activeTripId by mutableStateOf<String?>(null)
    var latestAlbumId by mutableStateOf<String?>(null)
    var studioName by mutableStateOf("")
    var description by mutableStateOf("")
    var serviceArea by mutableStateOf("")
    var contactEmail by mutableStateOf("")
    var contactPhone by mutableStateOf("")
    var visibilityLevel by mutableStateOf("standard")
    var watermarkEnabled by mutableStateOf(false)
    var watermarkPosition by mutableStateOf("bottom-right")
    var serviceRateName by mutableStateOf("")
    var serviceRateAmount by mutableStateOf("")

    suspend fun load() {
        val client = api ?: return
        runCatching {
            val prof = client.call("photographer/getProfile", JsonNull, JsonElement.serializer()).jsonObject
            studioName = prof["studioName"]?.jsonPrimitive?.contentOrNull
                ?: prof["displayName"]?.jsonPrimitive?.contentOrNull
                ?: prof["cameraBodies"]?.jsonArray?.firstOrNull()?.jsonPrimitive?.contentOrNull
                ?: studioName
            description = prof["bio"]?.jsonPrimitive?.contentOrNull
                ?: prof["lenses"]?.jsonArray?.firstOrNull()?.jsonPrimitive?.contentOrNull
                ?: description
            serviceArea = prof["serviceArea"]?.jsonPrimitive?.contentOrNull
                ?: prof["serviceRegions"]?.jsonArray?.firstOrNull()?.jsonPrimitive?.contentOrNull
                ?: serviceArea
            contactEmail = prof["email"]?.jsonPrimitive?.contentOrNull ?: contactEmail
            contactPhone = prof["phone"]?.jsonPrimitive?.contentOrNull ?: contactPhone
            portfolioImagesCount = prof["portfolioCount"]?.jsonPrimitive?.intOrNull
                ?: prof["portfolioPhotoCount"]?.jsonPrimitive?.intOrNull
                ?: portfolioImagesCount
        }
        runCatching {
            val res = client.call(
                "negotiation/listSupplierOffers",
                buildJsonObject { put("limit", 50) },
                JsonElement.serializer(),
            )
            val items = when (res) {
                is JsonArray -> res
                is JsonObject -> res["items"]?.jsonArray ?: JsonArray(emptyList())
                else -> JsonArray(emptyList())
            }
            dealOffers.clear()
            items.forEach { el ->
                val obj = el.jsonObject
                val statusStr = obj["status"]?.jsonPrimitive?.contentOrNull?.uppercase() ?: "OPEN"
                val st = when (statusStr) {
                    "COUNTERED" -> OfferStatus.Countered
                    "ACCEPTED", "FINALIZED" -> OfferStatus.Accepted
                    "DECLINED", "REJECTED", "CANCELLED", "EXPIRED" -> OfferStatus.Declined
                    else -> OfferStatus.Open
                }
                val tId = obj["tripId"]?.jsonPrimitive?.contentOrNull
                if (activeTripId == null && tId != null) {
                    activeTripId = tId
                }
                val offerTitle = obj["tripTitle"]?.jsonPrimitive?.contentOrNull ?: "Trip offer"
                val offerRoute = obj["routeSummary"]?.jsonPrimitive?.contentOrNull ?: "—"
                val offerDate = obj["departureAt"]?.jsonPrimitive?.contentOrNull
                    ?: obj["startsAt"]?.jsonPrimitive?.contentOrNull
                    ?: "—"
                if (st == OfferStatus.Accepted) {
                    assignedTripName = offerTitle
                    assignedRoute = offerRoute
                    assignedDeparture = offerDate
                }
                dealOffers.add(
                    DealOffer(
                        id = obj["id"]?.jsonPrimitive?.contentOrNull ?: "",
                        tripName = offerTitle,
                        route = offerRoute,
                        date = offerDate,
                        organization = obj["organizationName"]?.jsonPrimitive?.contentOrNull ?: "Organization",
                        amountMinor = obj["proposedAmountMinor"]?.jsonPrimitive?.longOrNull
                            ?: obj["currentOfferMinor"]?.jsonPrimitive?.longOrNull
                            ?: 0L,
                        status = st,
                    ),
                )
            }
            bookingsUsed = dealOffers.count { it.status == OfferStatus.Accepted }
        }
        runCatching {
            val albums = client.call("photographer/listTripAlbums", buildJsonObject {}, JsonElement.serializer()).jsonArray
            tripAlbums.clear()
            albums.forEach { el ->
                val obj = el.jsonObject
                val id = obj["id"]?.jsonPrimitive?.contentOrNull ?: ""
                val tId = obj["tripId"]?.jsonPrimitive?.contentOrNull ?: id
                if (activeTripId == null) activeTripId = tId
                if (latestAlbumId == null) latestAlbumId = id
                val albumTitle = obj["titleEn"]?.jsonPrimitive?.contentOrNull
                    ?: obj["titleAr"]?.jsonPrimitive?.contentOrNull
                    ?: obj["title"]?.jsonPrimitive?.contentOrNull
                    ?: "Trip album"
                tripAlbums.add(
                    TripAlbumSummary(
                        id = id,
                        tripId = tId,
                        tripName = albumTitle,
                        completed = true,
                        albumsUsed = 1,
                    ),
                )
            }
            if (tripAlbums.isNotEmpty()) {
                assignedTripCompleted = true
                if (assignedTripName == "No active assignment") {
                    assignedTripName = tripAlbums.first().tripName
                }
            }
        }
        runCatching {
            val blocks = client.call("availability/listMyBlocks", buildJsonObject {}, JsonElement.serializer()).jsonArray
            unavailableDates.clear()
            blocks.forEach { el ->
                val obj = el.jsonObject
                val startsAt = obj["startsAt"]?.jsonPrimitive?.contentOrNull ?: return@forEach
                val parts = startsAt.take(10).split("-")
                if (parts.size == 3) {
                    val y = parts[0].toIntOrNull()
                    val m = parts[1].toIntOrNull()
                    val d = parts[2].toIntOrNull()
                    if (y != null && m != null && d != null) {
                        unavailableDates.add(TeDate(year = y, month = m, day = d))
                    }
                }
            }
        }
        runCatching {
            val res = client.call(
                "accounting/listLedgerEntries",
                buildJsonObject { put("limit", 20) },
                JsonElement.serializer(),
            )
            val entries = when (res) {
                is JsonArray -> res
                is JsonObject -> res["entries"]?.jsonArray ?: res["items"]?.jsonArray ?: JsonArray(emptyList())
                else -> JsonArray(emptyList())
            }
            payoutHistory.clear()
            var sumMinor = 0L
            entries.forEachIndexed { idx, el ->
                val obj = el.jsonObject
                val amt = obj["amountMinor"]?.jsonPrimitive?.longOrNull ?: 0L
                sumMinor += amt
                payoutHistory.add(
                    PhotographerPayoutItem(
                        id = obj["id"]?.jsonPrimitive?.contentOrNull ?: "payout-$idx",
                        date = obj["occurredAt"]?.jsonPrimitive?.contentOrNull?.take(10)
                            ?: obj["createdAt"]?.jsonPrimitive?.contentOrNull?.take(10)
                            ?: "Monday 06:00",
                        amountMinor = amt,
                        state = obj["entryType"]?.jsonPrimitive?.contentOrNull ?: "Released",
                    ),
                )
            }
            periodEarningsMinor = sumMinor
        }
    }

    fun respondToOffer(offerId: String, action: String, counterAmountMinor: Long? = null) {
        val client = api ?: return
        val normalizedAction = when (action.lowercase()) {
            "accept", "accepted" -> "accept"
            "counter", "countered" -> "counter"
            "cancel", "cancelled" -> "cancel"
            else -> "decline"
        }
        scope.launch {
            runCatching {
                client.call(
                    "negotiation/respondToOffer",
                    buildJsonObject {
                        put("negotiationId", offerId)
                        put("action", normalizedAction)
                        if (counterAmountMinor != null) put("counterOfferMinor", counterAmountMinor)
                    },
                    JsonElement.serializer(),
                )
            }
        }
    }

    fun saveProfile(name: String, desc: String, area: String, email: String, phone: String, visibility: String) {
        studioName = name
        description = desc
        serviceArea = area
        contactEmail = email
        contactPhone = phone
        visibilityLevel = visibility
        val client = api ?: return
        scope.launch {
            runCatching {
                client.call(
                    "photographer/updateProfile",
                    buildJsonObject {
                        put("yearsOfExperience", 4)
                        if (name.isNotBlank()) {
                            put("cameraBodies", JsonArray(listOf(kotlinx.serialization.json.JsonPrimitive(name))))
                        }
                        if (desc.isNotBlank()) {
                            put("lenses", JsonArray(listOf(kotlinx.serialization.json.JsonPrimitive(desc))))
                        }
                        if (area.isNotBlank()) {
                            put("serviceRegions", JsonArray(listOf(kotlinx.serialization.json.JsonPrimitive(area))))
                        }
                        put("specialties", JsonArray(listOf(kotlinx.serialization.json.JsonPrimitive(visibility))))
                    },
                    JsonElement.serializer(),
                )
            }
        }
    }

    fun removePortfolioImage(imageId: String) {
        if (portfolioImagesCount > 0) {
            portfolioImagesCount -= 1
        }
        val client = api ?: return
        scope.launch {
            runCatching {
                client.call(
                    "photographer/updateProfile",
                    buildJsonObject {
                        put("specialties", JsonArray(listOf(kotlinx.serialization.json.JsonPrimitive("removed:$imageId"))))
                    },
                    JsonElement.serializer(),
                )
            }
        }
    }

    fun toggleUnavailableDate(date: TeDate) {
        if (date in unavailableDates) {
            unavailableDates.remove(date)
        } else {
            unavailableDates.add(date)
            val sorted = unavailableDates.sorted()
            unavailableDates.clear()
            unavailableDates.addAll(sorted)
        }
    }

    fun saveRatesAndAvailability(serviceName: String, rate: String) {
        serviceRateName = serviceName
        serviceRateAmount = rate
        val client = api ?: return
        scope.launch {
            unavailableDates.forEach { d ->
                val mm = d.month.toString().padStart(2, '0')
                val dd = d.day.toString().padStart(2, '0')
                val startsIso = "${d.year}-$mm-${dd}T00:00:00.000Z"
                val endsIso = "${d.year}-$mm-${dd}T23:59:59.000Z"
                runCatching {
                    client.call(
                        "availability/upsertBlock",
                        buildJsonObject {
                            put("blockType", "unavailable")
                            put("startsAt", startsIso)
                            put("endsAt", endsIso)
                            put("notes", "$serviceName ($rate)")
                        },
                        JsonElement.serializer(),
                    )
                }
            }
        }
    }

    fun saveWatermark(enabled: Boolean, position: String) {
        watermarkEnabled = enabled
        watermarkPosition = position
        val client = api ?: return
        scope.launch {
            runCatching {
                client.call(
                    "photographer/updateProfile",
                    buildJsonObject {
                        put(
                            "specialties",
                            JsonArray(
                                listOf(
                                    kotlinx.serialization.json.JsonPrimitive("watermark:$enabled:$position"),
                                ),
                            ),
                        )
                    },
                    JsonElement.serializer(),
                )
            }
        }
    }

    fun createAndUploadAlbum(title: String, fileNames: List<String>) {
        val client = api ?: return
        val tripId = activeTripId ?: "00000000-0000-4000-8000-000000000001"
        scope.launch {
            runCatching {
                val created = client.call(
                    "photographer/createTripAlbum",
                    buildJsonObject {
                        put("tripId", tripId)
                        put("titleAr", title)
                        put("titleEn", title)
                        put("watermarked", watermarkEnabled)
                    },
                    JsonElement.serializer(),
                ).jsonObject
                val albumId = created["id"]?.jsonPrimitive?.contentOrNull ?: return@runCatching
                latestAlbumId = albumId
                if (fileNames.isNotEmpty()) {
                    client.call(
                        "photographer/uploadPhotosToAlbum",
                        buildJsonObject {
                            put("albumId", albumId)
                            put(
                                "photoUrls",
                                JsonArray(
                                    fileNames.map {
                                        kotlinx.serialization.json.JsonPrimitive(
                                            "https://cdn.trips.app/albums/$albumId/$it",
                                        )
                                    },
                                ),
                            )
                        },
                        JsonElement.serializer(),
                    )
                }
            }
        }
    }

    fun publishAlbum(privacy: String, publish: Boolean) {
        val client = api ?: return
        val albumId = latestAlbumId ?: return
        if (!publish) return
        scope.launch {
            runCatching {
                client.call(
                    "photographer/publishTripAlbum",
                    buildJsonObject {
                        put("albumId", albumId)
                    },
                    JsonElement.serializer(),
                )
            }
        }
    }

    fun createCoupon(code: String, discountType: String, value: String) {
        couponsUsed += 1
        val client = api ?: return
        val normalizedType = if (discountType.lowercase().contains("fixed")) "fixed_amount" else "percentage"
        val numericValue = value.toIntOrNull() ?: 10
        scope.launch {
            runCatching {
                client.call(
                    "coupons/createOrganizationCoupon",
                    buildJsonObject {
                        put("code", code)
                        put("titleAr", code)
                        put("titleEn", code)
                        put("discountType", normalizedType)
                        put("discountValue", numericValue)
                    },
                    JsonElement.serializer(),
                )
            }
        }
    }
}

internal val LocalPhotographerSession = staticCompositionLocalOf { PhotographerSession() }
