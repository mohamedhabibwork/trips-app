package com.tripsenjoy.screens.moderator.common

import com.tripsenjoy.ui.components.BadgeTone
import com.tripsenjoy.ui.components.IconName

internal enum class ModSeatState(val word: String) {
    Reserved("Reserved"),
    CheckedIn("Checked in"),
    CheckedOut("Checked out"),
}

internal fun ModSeatState.tone(): BadgeTone = when (this) {
    ModSeatState.Reserved -> BadgeTone.Neutral
    ModSeatState.CheckedIn -> BadgeTone.Success
    ModSeatState.CheckedOut -> BadgeTone.Info
}

internal fun ModSeatState.icon(): IconName = when (this) {
    ModSeatState.Reserved -> IconName.Ticket
    ModSeatState.CheckedIn -> IconName.Check
    ModSeatState.CheckedOut -> IconName.Pin
}

internal enum class ModTripStatus(val word: String) {
    NotStarted("Not started"),
    Boarding("Boarding"),
    InTransit("In transit"),
    PartiallyCompleted("Partially completed"),
    Completed("Completed"),
}

internal fun ModTripStatus.tone(): BadgeTone = when (this) {
    ModTripStatus.NotStarted -> BadgeTone.Neutral
    ModTripStatus.Boarding -> BadgeTone.Accent
    ModTripStatus.InTransit -> BadgeTone.Highlight
    ModTripStatus.PartiallyCompleted -> BadgeTone.Warning
    ModTripStatus.Completed -> BadgeTone.Success
}

internal fun ModTripStatus.icon(): IconName = when (this) {
    ModTripStatus.NotStarted -> IconName.Clock
    ModTripStatus.Boarding -> IconName.Ticket
    ModTripStatus.InTransit -> IconName.Bus
    ModTripStatus.PartiallyCompleted -> IconName.Pin
    ModTripStatus.Completed -> IconName.Check
}

internal data class ModTraveler(
    val id: String,
    val name: String,
    val bookingCode: String,
    val seat: String,
    val state: ModSeatState,
)

internal data class ModVehicle(
    val label: String,
    val seats: Int,
    val trip: String,
    val departure: String,
    val stops: List<String>,
)

internal enum class ModEventKind(val word: String) {
    CheckIn("Check-in"),
    CheckOut("Check-out"),
    Incident("Incident"),
    EndOfTrip("End-of-trip report"),
}

internal data class ModQueuedEvent(
    val id: String,
    val kind: ModEventKind,
    val summary: String,
    val time: String,
)

internal enum class ModSyncState(val word: String) {
    WaitingForConnection("Waiting for connection"),
    ReadyToSync("Ready to sync"),
    Synced("Synced in original order"),
    Failed("Sync failed. Retry when connected"),
}

// Whether an action reached operations now, or was saved on this device to send later in order.
internal enum class ModSubmitStatus(val word: String) {
    Sent("Sent to operations"),
    Saved("Saved on this device, sends in order"),
}

internal sealed interface ModCheckInResult {
    data class Accepted(val name: String, val seat: String) : ModCheckInResult
    data class Queued(val name: String, val seat: String) : ModCheckInResult
    data class Redirect(val vehicleNumber: Int) : ModCheckInResult
    data class Refused(val reason: String) : ModCheckInResult
    data class Duplicate(val name: String) : ModCheckInResult
    object Invalid : ModCheckInResult
}
