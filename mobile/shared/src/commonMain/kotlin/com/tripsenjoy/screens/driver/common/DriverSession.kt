package com.tripsenjoy.screens.driver.common

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.runtime.staticCompositionLocalOf
import com.tripsenjoy.api.ApiClient
import com.tripsenjoy.ui.components.OfferStatus
import com.tripsenjoy.ui.components.TeBarValue
import com.tripsenjoy.ui.components.TeTimelineItem
import com.tripsenjoy.ui.components.TimelineState
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

internal class DriverSession(
    private val api: ApiClient? = null,
    private val scope: CoroutineScope = CoroutineScope(Dispatchers.Main),
) {
    val offers = mutableStateListOf<DrvOffer>().apply { addAll(DriverSampleData.offers) }
    val coupons = mutableStateListOf<DrvCoupon>().apply { addAll(DriverSampleData.coupons) }
    val payouts = mutableStateListOf<DrvPayout>().apply { addAll(DriverSampleData.payouts) }
    val weeklyEarnings = mutableStateListOf<TeBarValue>().apply { addAll(DriverSampleData.weeklyEarnings) }
    val documents = mutableStateListOf<DrvDocument>().apply { addAll(DriverSampleData.documents) }
    val labHistory = mutableStateListOf<TeTimelineItem>().apply { addAll(DriverSampleData.labHistory) }

    var assignment: DrvAssignment by mutableStateOf(DriverSampleData.assignment)
    var activeTripId: String? by mutableStateOf(null)
    var activeVehicleId: String? by mutableStateOf(null)
    var latestLabTestId: String? by mutableStateOf(null)
    var selectedOfferId: String? by mutableStateOf(null)
    var plan: DrvPlan by mutableStateOf(DriverSampleData.plan)
    var planChange: DrvPlanChange? by mutableStateOf(null)
    var profile: DrvProfile by mutableStateOf(DriverSampleData.profile)
    var labBooking: DrvLabBooking? by mutableStateOf(null)
    var labResultUploaded: Boolean by mutableStateOf(false)
    var runState: DrvRunState by mutableStateOf(DrvRunState.Assigned)
    var stopsReached: Int by mutableIntStateOf(0)
    var activeBookings: Int by mutableIntStateOf(DriverSampleData.ACTIVE_BOOKINGS)
    var weekEarningsMinor: Long by mutableStateOf(DriverSampleData.WEEK_EARNINGS_MINOR)

    suspend fun load() {
        val client = api ?: return
        runCatching {
            val prof = client.call("driver/getProfile", JsonNull, JsonElement.serializer()).jsonObject
            profile = DrvProfile(
                fullName = prof["fullName"]?.jsonPrimitive?.contentOrNull ?: profile.fullName,
                phone = prof["phone"]?.jsonPrimitive?.contentOrNull ?: profile.phone,
                country = prof["countryCode"]?.jsonPrimitive?.contentOrNull
                    ?: prof["serviceAreas"]?.jsonArray?.firstOrNull()?.jsonPrimitive?.contentOrNull
                    ?: profile.country,
                plate = prof["vehiclePlateNumber"]?.jsonPrimitive?.contentOrNull ?: profile.plate,
                model = prof["vehicleMakeModel"]?.jsonPrimitive?.contentOrNull
                    ?: prof["vehicleModel"]?.jsonPrimitive?.contentOrNull
                    ?: profile.model,
                year = prof["vehicleYear"]?.jsonPrimitive?.contentOrNull ?: profile.year,
                seats = prof["vehicleSeatCapacity"]?.jsonPrimitive?.contentOrNull ?: profile.seats,
            )
        }
        runCatching {
            val assigned = client.call("driver/listAssignedTrips", JsonNull, JsonElement.serializer()).jsonArray
            activeBookings = assigned.size
            val first = assigned.firstOrNull()?.jsonObject
            if (first != null) {
                activeTripId = first["tripId"]?.jsonPrimitive?.contentOrNull
                activeVehicleId = first["vehicleId"]?.jsonPrimitive?.contentOrNull
                assignment = DrvAssignment(
                    tripName = first["tripTitle"]?.jsonPrimitive?.contentOrNull
                        ?: first["titleEn"]?.jsonPrimitive?.contentOrNull
                        ?: "Assigned trip",
                    route = first["routeSummary"]?.jsonPrimitive?.contentOrNull ?: "Scheduled route",
                    departure = first["departureAt"]?.jsonPrimitive?.contentOrNull
                        ?: first["startsAt"]?.jsonPrimitive?.contentOrNull
                        ?: "Scheduled",
                    vehicle = first["vehicleLabel"]?.jsonPrimitive?.contentOrNull ?: "Assigned vehicle",
                    source = first["assignmentSource"]?.jsonPrimitive?.contentOrNull ?: "Platform deal",
                    organization = first["organizationName"]?.jsonPrimitive?.contentOrNull ?: "Organizer",
                    travelerCount = first["passengerCount"]?.jsonPrimitive?.intOrNull ?: 0,
                )
            }
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
            offers.clear()
            items.forEach { el ->
                val obj = el.jsonObject
                val statusStr = obj["status"]?.jsonPrimitive?.contentOrNull ?: "OPEN"
                val mappedStatus = when (statusStr.uppercase()) {
                    "COUNTERED" -> OfferStatus.Countered
                    "ACCEPTED", "FINALIZED" -> OfferStatus.Accepted
                    "DECLINED", "REJECTED", "CANCELLED", "EXPIRED" -> OfferStatus.Declined
                    else -> OfferStatus.Open
                }
                offers.add(
                    DrvOffer(
                        id = obj["id"]?.jsonPrimitive?.contentOrNull ?: "",
                        tripName = obj["tripTitle"]?.jsonPrimitive?.contentOrNull ?: "Trip offer",
                        route = obj["routeSummary"]?.jsonPrimitive?.contentOrNull ?: "Scheduled route",
                        date = obj["departureAt"]?.jsonPrimitive?.contentOrNull ?: "",
                        organization = obj["organizationName"]?.jsonPrimitive?.contentOrNull ?: "Organization",
                        amountMinor = obj["proposedAmountMinor"]?.jsonPrimitive?.longOrNull
                            ?: obj["currentOfferMinor"]?.jsonPrimitive?.longOrNull
                            ?: 0L,
                        currencyCode = obj["currencyCode"]?.jsonPrimitive?.contentOrNull
                            ?: obj["currency"]?.jsonPrimitive?.contentOrNull
                            ?: DriverSampleData.CURRENCY,
                        status = mappedStatus,
                        expires = obj["expiresAt"]?.jsonPrimitive?.contentOrNull ?: "72h window",
                        receivedAt = obj["createdAt"]?.jsonPrimitive?.contentOrNull ?: "",
                        counterMinor = obj["counterOfferMinor"]?.jsonPrimitive?.longOrNull
                            ?: obj["counterAmountMinor"]?.jsonPrimitive?.longOrNull,
                    ),
                )
            }
        }
        runCatching {
            val labs = client.call("driver/getLabTestStatus", JsonNull, JsonElement.serializer()).jsonArray
            if (labs.isNotEmpty()) {
                labHistory.clear()
                labs.forEachIndexed { idx, el ->
                    val obj = el.jsonObject
                    val id = obj["id"]?.jsonPrimitive?.contentOrNull ?: "LAB-$idx"
                    if (latestLabTestId == null) latestLabTestId = id
                    val st = obj["status"]?.jsonPrimitive?.contentOrNull ?: "REQUESTED"
                    labHistory.add(
                        TeTimelineItem(
                            id = id,
                            time = obj["dueAt"]?.jsonPrimitive?.contentOrNull
                                ?: obj["requestedAt"]?.jsonPrimitive?.contentOrNull
                                ?: "",
                            label = "Lab test: $st",
                            state = if (st.uppercase() == "PASSED" || st.uppercase() == "APPROVED" || st.uppercase() == "VERIFIED") {
                                TimelineState.Done
                            } else {
                                TimelineState.Current
                            },
                        ),
                    )
                }
            }
        }
        runCatching {
            val sub = client.call("plans/getMySubscription", JsonNull, JsonElement.serializer())
            if (sub is JsonObject) {
                val tier = (
                    sub["planCode"]?.jsonPrimitive?.contentOrNull
                        ?: sub["planId"]?.jsonPrimitive?.contentOrNull
                        ?: sub["tier"]?.jsonPrimitive?.contentOrNull
                        ?: ""
                    ).uppercase()
                plan = when {
                    tier.contains("PREMIUM") -> DrvPlan.Premium
                    tier.contains("PRO") -> DrvPlan.Professional
                    else -> DrvPlan.Basic
                }
            }
        }
    }

    fun selectedOffer(): DrvOffer? = offers.firstOrNull { it.id == selectedOfferId }

    fun canAcceptOffer(): Boolean = plan.bookingLimit?.let { activeBookings < it } ?: true

    fun canCreateCoupon(): Boolean = plan.couponLimit?.let { coupons.size < it } ?: true

    fun openOfferCount(): Int = offers.count { it.status == OfferStatus.Open }

    fun answerOffer(id: String, status: OfferStatus, counterMinor: Long? = null) {
        val index = offers.indexOfFirst { it.id == id }
        if (index >= 0) {
            val counter = if (status == OfferStatus.Countered) counterMinor else null
            offers[index] = offers[index].copy(status = status, counterMinor = counter)
        }
        val client = api ?: return
        scope.launch {
            runCatching {
                val action = when (status) {
                    OfferStatus.Accepted -> "accept"
                    OfferStatus.Countered -> "counter"
                    OfferStatus.Declined -> "decline"
                    else -> "decline"
                }
                client.call(
                    "negotiation/respondToOffer",
                    buildJsonObject {
                        put("negotiationId", id)
                        put("action", action)
                        if (counterMinor != null) put("counterOfferMinor", counterMinor)
                    },
                    JsonElement.serializer(),
                )
            }
        }
    }

    fun addCoupon(coupon: DrvCoupon) {
        coupons.add(coupon)
        val client = api ?: return
        scope.launch {
            runCatching {
                client.call(
                    "coupons/createOrganizationCoupon",
                    buildJsonObject {
                        put("code", coupon.code)
                        put("titleAr", coupon.code)
                        put("titleEn", coupon.code)
                        put("discountType", "percentage")
                        put("discountValue", coupon.discountPercent)
                    },
                    JsonElement.serializer(),
                )
            }
        }
    }

    fun bookLab(booking: DrvLabBooking) {
        labBooking = booking
        val client = api ?: return
        val testId = latestLabTestId ?: "00000000-0000-4000-8000-000000000001"
        scope.launch {
            runCatching {
                client.call(
                    "driver/bookLabTest",
                    buildJsonObject {
                        put("labTestId", testId)
                        put("labCenterName", booking.lab)
                        put("appointmentAt", "2026-10-20T09:00:00.000Z")
                    },
                    JsonElement.serializer(),
                )
            }
        }
    }

    fun uploadLabResult() {
        labResultUploaded = true
        val client = api ?: return
        val testId = latestLabTestId ?: "00000000-0000-4000-8000-000000000001"
        scope.launch {
            runCatching {
                client.call(
                    "driver/uploadLabTestResult",
                    buildJsonObject {
                        put("labTestId", testId)
                        put("resultDocumentUrl", "https://cdn.trips.app/driver/lab-result.pdf")
                    },
                    JsonElement.serializer(),
                )
            }
        }
    }

    fun saveProfile(updated: DrvProfile) {
        profile = updated
        val client = api ?: return
        scope.launch {
            runCatching {
                client.call(
                    "driver/updateProfile",
                    buildJsonObject {
                        put("yearsOfExperience", 5)
                        if (updated.country.isNotBlank()) {
                            put(
                                "serviceAreas",
                                JsonArray(listOf(kotlinx.serialization.json.JsonPrimitive(updated.country))),
                            )
                        }
                        put("hasOwnVehicle", true)
                        put("vehiclePlateNumber", updated.plate)
                        put("vehicleMakeModel", updated.model)
                        updated.year.toIntOrNull()?.let { put("vehicleYear", it) }
                        updated.seats.toIntOrNull()?.let { put("vehicleSeatCapacity", it) }
                    },
                    JsonElement.serializer(),
                )
            }
        }
    }

    fun requestPlanChange(target: DrvPlan) {
        planChange = if (target == plan) null else DrvPlanChange(target = target, upgrade = target > plan)
        val client = api ?: return
        if (target != plan) {
            scope.launch {
                runCatching {
                    client.call(
                        "plans/changeAccountPlan",
                        buildJsonObject {
                            put("planId", target.name.lowercase())
                            put("billingCycle", "monthly")
                        },
                        JsonElement.serializer(),
                    )
                }
            }
        }
    }

    fun startTrip() {
        if (runState == DrvRunState.Assigned) {
            runState = DrvRunState.InProgress
            postTrackingPing("TRIP_STARTED")
        }
    }

    fun reachStop() {
        if (runState == DrvRunState.InProgress) {
            stopsReached += 1
            postTrackingPing("STOP_REACHED")
        }
    }

    fun endTrip() {
        if (runState == DrvRunState.InProgress) {
            runState = DrvRunState.Ended
            postTrackingPing("TRIP_ENDED")
        }
    }

    private fun postTrackingPing(eventNote: String) {
        val client = api ?: return
        val tripId = activeTripId ?: return
        val vehicleId = activeVehicleId ?: "00000000-0000-4000-8000-000000000002"
        scope.launch {
            runCatching {
                client.call(
                    "tracking/recordGpsPing",
                    buildJsonObject {
                        put("tripId", tripId)
                        put("vehicleId", vehicleId)
                        put(
                            "coordinates",
                            buildJsonObject {
                                put("lat", 30.0444)
                                put("lng", 31.2357)
                                put("recordedAt", "2026-10-18T12:00:00.000Z")
                            },
                        )
                    },
                    JsonElement.serializer(),
                )
            }
        }
    }
}

internal val LocalDriverSession = staticCompositionLocalOf<DriverSession> {
    error("DriverSession not provided. Wrap the driver screens in DriverApp.")
}
