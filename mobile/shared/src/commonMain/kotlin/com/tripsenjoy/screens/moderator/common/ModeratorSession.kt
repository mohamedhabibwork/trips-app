package com.tripsenjoy.screens.moderator.common

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.runtime.staticCompositionLocalOf
import com.tripsenjoy.api.ApiClient
import com.tripsenjoy.auth.platformNowMillis
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.intOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put

private const val MILLIS_PER_MINUTE = 60_000L
private const val MINUTES_PER_DAY = 1_440L
private const val MINUTES_PER_HOUR = 60

internal class ModeratorSession(
    private val api: ApiClient? = null,
    private val scope: CoroutineScope = CoroutineScope(Dispatchers.Main),
) {
    var vehicle: ModVehicle by mutableStateOf(ModeratorSampleData.vehicle)
    val travelers = mutableStateListOf<ModTraveler>().apply { addAll(ModeratorSampleData.travelers) }
    val queue = mutableStateListOf<ModQueuedEvent>().apply { addAll(ModeratorSampleData.queuedEvents) }
    private val checkInRecordIds = mutableMapOf<String, String>()
    var online: Boolean by mutableStateOf(true)
    var departed: Boolean by mutableStateOf(false)
    var endOfTripSubmitted: Boolean by mutableStateOf(false)
    var lastResult: ModCheckInResult? by mutableStateOf(null)
    var lastCheckedInName: String? by mutableStateOf(null)
    var prefilledCode: String by mutableStateOf("")
    var lastSyncFailed: Boolean by mutableStateOf(false)
    var syncedCount: Int by mutableIntStateOf(0)

    suspend fun load() {
        val client = api ?: return
        runCatching {
            val assign = client.call("moderator/getActiveAssignment", JsonNull, JsonElement.serializer()).jsonObject
            val stopsList = assign["stops"]?.jsonArray?.mapNotNull { it.jsonPrimitive.contentOrNull } ?: vehicle.stops
            vehicle = ModVehicle(
                label = assign["vehicleLabel"]?.jsonPrimitive?.contentOrNull
                    ?: assign["vehicleId"]?.jsonPrimitive?.contentOrNull
                    ?: vehicle.label,
                seats = assign["totalPassengers"]?.jsonPrimitive?.intOrNull
                    ?: assign["seatCapacity"]?.jsonPrimitive?.intOrNull
                    ?: vehicle.seats,
                trip = assign["tripTitleEn"]?.jsonPrimitive?.contentOrNull
                    ?: assign["tripTitleAr"]?.jsonPrimitive?.contentOrNull
                    ?: assign["tripTitle"]?.jsonPrimitive?.contentOrNull
                    ?: vehicle.trip,
                departure = assign["departureAt"]?.jsonPrimitive?.contentOrNull ?: vehicle.departure,
                stops = stopsList,
            )
        }
        runCatching {
            val manifest = client.call("moderator/getVehicleManifest", JsonNull, JsonElement.serializer()).jsonArray
            travelers.clear()
            checkInRecordIds.clear()
            manifest.forEach { el ->
                val obj = el.jsonObject
                val recordId = obj["id"]?.jsonPrimitive?.contentOrNull
                val passengerId = obj["passengerId"]?.jsonPrimitive?.contentOrNull
                    ?: obj["bookingId"]?.jsonPrimitive?.contentOrNull
                    ?: recordId
                    ?: ""
                if (recordId != null && passengerId.isNotEmpty()) {
                    checkInRecordIds[passengerId] = recordId
                }
                val statusStr = (
                    obj["status"]?.jsonPrimitive?.contentOrNull
                        ?: obj["boardingStatus"]?.jsonPrimitive?.contentOrNull
                        ?: "PENDING"
                    ).uppercase()
                val seatState = when (statusStr) {
                    "CHECKED_IN", "BOARDED" -> ModSeatState.CheckedIn
                    "CHECKED_OUT", "DISEMBARKED", "NO_SHOW" -> ModSeatState.CheckedOut
                    else -> ModSeatState.Reserved
                }
                travelers.add(
                    ModTraveler(
                        id = passengerId,
                        name = obj["passengerName"]?.jsonPrimitive?.contentOrNull
                            ?: obj["travelerName"]?.jsonPrimitive?.contentOrNull
                            ?: "Passenger",
                        bookingCode = obj["qrCodeToken"]?.jsonPrimitive?.contentOrNull
                            ?: obj["bookingReference"]?.jsonPrimitive?.contentOrNull
                            ?: obj["qrToken"]?.jsonPrimitive?.contentOrNull
                            ?: "",
                        seat = obj["seatLabel"]?.jsonPrimitive?.contentOrNull ?: "—",
                        state = seatState,
                    ),
                )
            }
        }
    }

    val checkedInCount: Int get() = travelers.count { it.state == ModSeatState.CheckedIn }

    val checkedOutCount: Int get() = travelers.count { it.state == ModSeatState.CheckedOut }

    val tripEnded: Boolean get() = departed && checkedOutCount > 0 && checkedInCount == 0

    val tripStatus: ModTripStatus
        get() = when {
            endOfTripSubmitted || tripEnded -> ModTripStatus.Completed
            departed && checkedOutCount > 0 -> ModTripStatus.PartiallyCompleted
            departed -> ModTripStatus.InTransit
            checkedInCount > 0 -> ModTripStatus.Boarding
            else -> ModTripStatus.NotStarted
        }

    val syncState: ModSyncState
        get() = when {
            queue.isEmpty() -> ModSyncState.Synced
            lastSyncFailed && !online -> ModSyncState.Failed
            online -> ModSyncState.ReadyToSync
            else -> ModSyncState.WaitingForConnection
        }

    fun markDeparted() {
        departed = true
        val client = api ?: return
        scope.launch {
            runCatching {
                client.call(
                    "moderator/recordHeadcount",
                    buildJsonObject {
                        put("countedPassengers", checkedInCount)
                        put("notes", "DEPARTURE")
                    },
                    JsonElement.serializer(),
                )
            }
        }
    }

    fun checkIn(rawCode: String): ModCheckInResult {
        val code = rawCode.trim().uppercase()
        val traveler = travelers.firstOrNull { it.bookingCode == code }
        val result = when {
            traveler == null -> codeNotOnThisVehicle(code)
            traveler.state == ModSeatState.CheckedIn -> ModCheckInResult.Duplicate(traveler.name)
            else -> markCheckedIn(traveler)
        }
        lastResult = result
        return result
    }

    fun checkOut(travelerId: String, stop: String): ModSubmitStatus? {
        val traveler = travelers.firstOrNull { it.id == travelerId && it.state == ModSeatState.CheckedIn } ?: return null
        replaceTraveler(traveler.copy(state = ModSeatState.CheckedOut))
        val recordId = checkInRecordIds[traveler.id] ?: "00000000-0000-4000-8000-000000000001"
        return submit(
            kind = ModEventKind.CheckOut,
            summary = "Check-out: ${traveler.name} at $stop",
            remoteCall = { client ->
                client.call(
                    "moderator/recordBoardingCheckIn",
                    buildJsonObject {
                        put("checkInRecordId", recordId)
                        put("status", "checked_in")
                        put("notes", "Check-out at $stop")
                    },
                    JsonElement.serializer(),
                )
            },
        )
    }

    fun reportIncident(category: String): ModSubmitStatus = submit(
        kind = ModEventKind.Incident,
        summary = "Incident: $category",
        remoteCall = { client ->
            client.call(
                "moderator/raiseSafetyAlert",
                buildJsonObject {
                    put("severity", "warning")
                    put("messageAr", "Incident: $category")
                    put("messageEn", "Moderator incident report: $category")
                },
                JsonElement.serializer(),
            )
        },
    )

    fun submitEndOfTrip(): ModSubmitStatus {
        val status = submit(
            kind = ModEventKind.EndOfTrip,
            summary = "End-of-trip report for ${vehicle.label}",
            remoteCall = { client ->
                client.call(
                    "moderator/recordHeadcount",
                    buildJsonObject {
                        put("countedPassengers", checkedOutCount)
                        put("notes", "END_OF_TRIP")
                    },
                    JsonElement.serializer(),
                )
            },
        )
        endOfTripSubmitted = true
        return status
    }

    fun syncQueue(): Boolean {
        if (!online) {
            lastSyncFailed = true
            return false
        }
        val pending = queue.toList()
        syncedCount += pending.size
        queue.clear()
        lastSyncFailed = false
        val client = api
        if (client != null && pending.isNotEmpty()) {
            scope.launch {
                pending.forEach { ev ->
                    runCatching {
                        client.call(
                            "moderator/recordHeadcount",
                            buildJsonObject {
                                put("countedPassengers", checkedInCount)
                                put("notes", ev.summary)
                            },
                            JsonElement.serializer(),
                        )
                    }
                }
            }
        }
        return true
    }

    private fun codeNotOnThisVehicle(code: String): ModCheckInResult {
        val otherVehicle = ModeratorSampleData.otherVehicleCodes[code]
        val refusal = ModeratorSampleData.refusedCodes[code]
        return when {
            otherVehicle != null -> ModCheckInResult.Redirect(otherVehicle)
            refusal != null -> ModCheckInResult.Refused(refusal)
            else -> ModCheckInResult.Invalid
        }
    }

    private fun markCheckedIn(traveler: ModTraveler): ModCheckInResult {
        replaceTraveler(traveler.copy(state = ModSeatState.CheckedIn))
        lastCheckedInName = traveler.name
        val recordId = checkInRecordIds[traveler.id] ?: "00000000-0000-4000-8000-000000000001"
        val status = submit(
            kind = ModEventKind.CheckIn,
            summary = "Check-in: ${traveler.name}",
            remoteCall = { client ->
                client.call(
                    "moderator/recordBoardingCheckIn",
                    buildJsonObject {
                        put("checkInRecordId", recordId)
                        put("status", "checked_in")
                        put("notes", "Check-in: ${traveler.bookingCode}")
                    },
                    JsonElement.serializer(),
                )
            },
        )
        return if (status == ModSubmitStatus.Sent) {
            ModCheckInResult.Accepted(traveler.name, traveler.seat)
        } else {
            ModCheckInResult.Queued(traveler.name, traveler.seat)
        }
    }

    private fun replaceTraveler(updated: ModTraveler) {
        val index = travelers.indexOfFirst { it.id == updated.id }
        if (index >= 0) travelers[index] = updated
    }

    private fun submit(
        kind: ModEventKind,
        summary: String,
        remoteCall: (suspend (ApiClient) -> Unit)? = null,
    ): ModSubmitStatus {
        if (online) {
            val client = api
            if (client != null && remoteCall != null) {
                scope.launch { runCatching { remoteCall(client) } }
            }
            return ModSubmitStatus.Sent
        }
        val now = platformNowMillis()
        queue.add(ModQueuedEvent(id = "EV-$now-${queue.size}", kind = kind, summary = summary, time = utcClockLabel(now)))
        return ModSubmitStatus.Saved
    }
}

private fun utcClockLabel(epochMillis: Long): String {
    val minutes = (epochMillis / MILLIS_PER_MINUTE % MINUTES_PER_DAY).toInt()
    return "${twoDigits(minutes / MINUTES_PER_HOUR)}:${twoDigits(minutes % MINUTES_PER_HOUR)} UTC"
}

private fun twoDigits(value: Int): String = if (value < 10) "0$value" else value.toString()

internal val LocalModeratorSession = staticCompositionLocalOf<ModeratorSession> {
    error("ModeratorSession not provided. Wrap the moderator screens in ModeratorApp.")
}
