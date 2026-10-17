package com.tripsenjoy.screens.moderator.common

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.runtime.staticCompositionLocalOf
import com.tripsenjoy.auth.platformNowMillis

private const val MILLIS_PER_MINUTE = 60_000L
private const val MINUTES_PER_DAY = 1_440L
private const val MINUTES_PER_HOUR = 60

// This device's state for one vehicle on one trip: travelers, check-ins and check-outs, the offline queue,
// incidents and the end-of-trip report. Screens reach it through LocalModeratorSession. Nothing calls a server.
internal class ModeratorSession {
    val vehicle: ModVehicle = ModeratorSampleData.vehicle
    val travelers = mutableStateListOf<ModTraveler>().apply { addAll(ModeratorSampleData.travelers) }
    val queue = mutableStateListOf<ModQueuedEvent>().apply { addAll(ModeratorSampleData.queuedEvents) }
    var online: Boolean by mutableStateOf(true)
    var departed: Boolean by mutableStateOf(false)
    var endOfTripSubmitted: Boolean by mutableStateOf(false)
    var lastResult: ModCheckInResult? by mutableStateOf(null)
    var lastCheckedInName: String? by mutableStateOf(null)
    var prefilledCode: String by mutableStateOf("")
    var lastSyncFailed: Boolean by mutableStateOf(false)
    var syncedCount: Int by mutableIntStateOf(0)

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
    }

    // Checks a booking code in. Only this vehicle's travelers are accepted; others get a redirect, a refusal or invalid.
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
        return submit(ModEventKind.CheckOut, "Check-out: ${traveler.name} at $stop")
    }

    fun reportIncident(category: String): ModSubmitStatus = submit(ModEventKind.Incident, "Incident: $category")

    fun submitEndOfTrip(): ModSubmitStatus {
        val status = submit(ModEventKind.EndOfTrip, "End-of-trip report for ${vehicle.label}")
        endOfTripSubmitted = true
        return status
    }

    // Sends the queue in original order. Offline, the attempt fails and the events stay on the device.
    fun syncQueue(): Boolean {
        if (!online) {
            lastSyncFailed = true
            return false
        }
        syncedCount += queue.size
        queue.clear()
        lastSyncFailed = false
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
        val status = submit(ModEventKind.CheckIn, "Check-in: ${traveler.name}")
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

    private fun submit(kind: ModEventKind, summary: String): ModSubmitStatus {
        if (online) return ModSubmitStatus.Sent
        val now = platformNowMillis()
        queue.add(ModQueuedEvent(id = "EV-$now-${queue.size}", kind = kind, summary = summary, time = utcClockLabel(now)))
        return ModSubmitStatus.Saved
    }
}

// HH:MM in UTC, from epoch milliseconds.
private fun utcClockLabel(epochMillis: Long): String {
    val minutes = (epochMillis / MILLIS_PER_MINUTE % MINUTES_PER_DAY).toInt()
    return "${twoDigits(minutes / MINUTES_PER_HOUR)}:${twoDigits(minutes % MINUTES_PER_HOUR)} UTC"
}

private fun twoDigits(value: Int): String = if (value < 10) "0$value" else value.toString()

internal val LocalModeratorSession = staticCompositionLocalOf<ModeratorSession> {
    error("ModeratorSession not provided. Wrap the moderator screens in ModeratorApp.")
}
