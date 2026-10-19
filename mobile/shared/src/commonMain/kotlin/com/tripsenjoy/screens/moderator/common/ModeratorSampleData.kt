package com.tripsenjoy.screens.moderator.common

import com.tripsenjoy.ui.components.TeChecklistItem
import com.tripsenjoy.ui.components.TeOption

// Default state and option lists for the moderator screens; ModeratorSession loads live server data via ApiClient.
internal object ModeratorSampleData {
    const val MAX_NOTE_LENGTH = 500

    val vehicle = ModVehicle(
        label = "Assigned vehicle",
        seats = 40,
        trip = "Assigned trip",
        departure = "—",
        stops = emptyList(),
    )

    val travelers = emptyList<ModTraveler>()

    val queuedEvents = emptyList<ModQueuedEvent>()

    val otherVehicleCodes: Map<String, Int> = emptyMap()

    val refusedCodes: Map<String, String> = emptyMap()

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
