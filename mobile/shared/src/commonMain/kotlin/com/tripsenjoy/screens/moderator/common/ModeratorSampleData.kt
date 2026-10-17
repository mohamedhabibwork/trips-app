package com.tripsenjoy.screens.moderator.common

import com.tripsenjoy.ui.components.TeChecklistItem
import com.tripsenjoy.ui.components.TeOption

// Placeholder data for the moderator screens. The docs define no live source yet; ModeratorSession holds the changes.
internal object ModeratorSampleData {
    const val MAX_NOTE_LENGTH = 500

    val vehicle = ModVehicle(
        label = "Bus 4",
        seats = 40,
        trip = "Coastal route, day 2",
        departure = "17 Oct 2026, 07:30",
        stops = listOf("Old town", "Harbour", "Airport"),
    )

    val travelers = listOf(
        ModTraveler(id = "T1", name = "Amina Rahman", bookingCode = "TRV-2041", seat = "3A", state = ModSeatState.CheckedIn),
        ModTraveler(id = "T2", name = "Omar Haddad", bookingCode = "TRV-2042", seat = "3B", state = ModSeatState.Reserved),
        ModTraveler(id = "T3", name = "Lena Costa", bookingCode = "TRV-2043", seat = "4A", state = ModSeatState.Reserved),
        ModTraveler(id = "T4", name = "Yusuf Demir", bookingCode = "TRV-2044", seat = "4B", state = ModSeatState.Reserved),
        ModTraveler(id = "T5", name = "Mei Tanaka", bookingCode = "TRV-2045", seat = "5A", state = ModSeatState.Reserved),
        ModTraveler(id = "T6", name = "Noah Brandt", bookingCode = "TRV-2046", seat = "5B", state = ModSeatState.Reserved),
    )

    // Events saved while the connection was lost. They wait in the queue until the device syncs.
    val queuedEvents = listOf(
        ModQueuedEvent(id = "EV-1", kind = ModEventKind.CheckIn, summary = "Check-in: Amina Rahman", time = "07:12 UTC"),
        ModQueuedEvent(id = "EV-2", kind = ModEventKind.Incident, summary = "Incident: late departure", time = "07:18 UTC"),
    )

    // Codes for travelers on another vehicle. The moderator sees the vehicle number only.
    val otherVehicleCodes: Map<String, Int> = mapOf("TRV-3301" to 7, "TRV-3302" to 7)

    val refusedCodes: Map<String, String> = mapOf(
        "TRV-9001" to "This booking was cancelled and refunded.",
        "TRV-8800" to "This booking is for a different trip.",
        "TRV-7700" to "This seat is already checked in on another vehicle.",
    )

    val incidentCategories = listOf(
        TeOption(value = "medical", label = "Medical"),
        TeOption(value = "safety", label = "Safety concern"),
        TeOption(value = "vehicle", label = "Vehicle fault"),
        TeOption(value = "missing", label = "Traveler missing"),
        TeOption(value = "other", label = "Other"),
    )

    val differenceReasons = listOf(
        TeOption(value = "left-at-stop", label = "Traveler left at a stop"),
        TeOption(value = "seat-error", label = "Seat count error"),
        TeOption(value = "other", label = "Other"),
    )

    val closeOutChecklist = listOf(
        TeChecklistItem(id = "items", label = "Checked the seats for items left behind", checked = false),
        TeChecklistItem(id = "equipment", label = "Returned keys and equipment", checked = false),
        TeChecklistItem(id = "incidents", label = "Filed all incident reports", checked = false),
    )
}
