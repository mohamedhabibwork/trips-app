package com.tripsenjoy.screens.moderator

import com.tripsenjoy.screens.ScreenEntry
import com.tripsenjoy.screens.moderator.access.AccessEndedOrVehicleReassigned
import com.tripsenjoy.screens.moderator.access.InstallAndFirstOpen
import com.tripsenjoy.screens.moderator.access.OfflineQueueAndSync
import com.tripsenjoy.screens.moderator.checkin.CheckInResult
import com.tripsenjoy.screens.moderator.checkin.CheckInScanOrEnterCode
import com.tripsenjoy.screens.moderator.checkin.TravelerManifest
import com.tripsenjoy.screens.moderator.trip.CheckOutAtStop
import com.tripsenjoy.screens.moderator.trip.EndOfTripReport
import com.tripsenjoy.screens.moderator.trip.IncidentReport
import com.tripsenjoy.screens.moderator.trip.VehicleHome

// Spec ids of the moderator screens (SCR-MOD-01 to SCR-MOD-10). Screens navigate with these.
internal object ModeratorRoutes {
    const val VEHICLE_HOME = "SCR-MOD-01"
    const val MANIFEST = "SCR-MOD-02"
    const val CHECK_IN = "SCR-MOD-03"
    const val CHECK_IN_RESULT = "SCR-MOD-04"
    const val CHECK_OUT = "SCR-MOD-05"
    const val OFFLINE_QUEUE = "SCR-MOD-06"
    const val INCIDENT = "SCR-MOD-07"
    const val END_OF_TRIP = "SCR-MOD-08"
    const val ACCESS_ENDED = "SCR-MOD-09"
    const val INSTALL = "SCR-MOD-10"
}

// Every moderator screen (SCR-MOD-01 to SCR-MOD-10), in spec order. Titles are the spec headings.
val MODERATOR_SCREENS: List<ScreenEntry> = listOf(
    ScreenEntry(id = ModeratorRoutes.VEHICLE_HOME, title = "Vehicle home", content = { VehicleHome() }),
    ScreenEntry(id = ModeratorRoutes.MANIFEST, title = "Traveler manifest", content = { TravelerManifest() }),
    ScreenEntry(id = ModeratorRoutes.CHECK_IN, title = "Check-in: scan or enter code", content = { CheckInScanOrEnterCode() }),
    ScreenEntry(id = ModeratorRoutes.CHECK_IN_RESULT, title = "Check-in result", content = { CheckInResult() }),
    ScreenEntry(id = ModeratorRoutes.CHECK_OUT, title = "Check-out at stop", content = { CheckOutAtStop() }),
    ScreenEntry(id = ModeratorRoutes.OFFLINE_QUEUE, title = "Offline queue and sync", content = { OfflineQueueAndSync() }),
    ScreenEntry(id = ModeratorRoutes.INCIDENT, title = "Incident report", content = { IncidentReport() }),
    ScreenEntry(id = ModeratorRoutes.END_OF_TRIP, title = "End-of-trip report", content = { EndOfTripReport() }),
    ScreenEntry(
        id = ModeratorRoutes.ACCESS_ENDED,
        title = "Access ended or vehicle reassigned",
        content = { AccessEndedOrVehicleReassigned() },
    ),
    ScreenEntry(id = ModeratorRoutes.INSTALL, title = "Install and first open", content = { InstallAndFirstOpen() }),
)

// When access ends (FR-MOD-03), the notice replaces the vehicle home: no other moderator screen is open.
val MODERATOR_ACCESS_ENDED_SCREENS: List<ScreenEntry> =
    MODERATOR_SCREENS.filter { it.id == ModeratorRoutes.ACCESS_ENDED }
