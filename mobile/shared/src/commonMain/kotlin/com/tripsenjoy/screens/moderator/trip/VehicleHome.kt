package com.tripsenjoy.screens.moderator.trip

import androidx.compose.runtime.Composable
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.moderator.ModeratorRoutes
import com.tripsenjoy.screens.moderator.common.LocalModeratorSession
import com.tripsenjoy.screens.moderator.common.ModErrorBlock
import com.tripsenjoy.screens.moderator.common.ModField
import com.tripsenjoy.screens.moderator.common.ModLoadingBlock
import com.tripsenjoy.screens.moderator.common.ModNote
import com.tripsenjoy.screens.moderator.common.ModScreen
import com.tripsenjoy.screens.moderator.common.ModTripStatusBadge
import com.tripsenjoy.screens.moderator.common.StatePreview
import com.tripsenjoy.ui.components.ErrorKind
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeOfflineBanner

// SCR-MOD-01 Vehicle home: the assigned vehicle, its trip, occupancy and the actions for the trip.
@Composable
fun VehicleHome() {
    ModScreen(title = "Vehicle home", description = "The vehicle you are assigned to, its trip and its occupancy.") {
        StatePreview(
            main = { VehicleMain() },
            loading = { ModLoadingBlock("Loading your vehicle") },
            error = { ModErrorBlock(ErrorKind.Unavailable) },
        )
    }
}

@Composable
private fun VehicleMain() {
    val nav = LocalScreenNavigator.current
    val session = LocalModeratorSession.current
    val vehicle = session.vehicle
    if (!session.online) {
        TeOfflineBanner(
            message = "Connection lost. Check-ins are saved on this device and sent in order when the connection returns.",
            retryLabel = "Open queue",
            onRetry = { nav.open(ModeratorRoutes.OFFLINE_QUEUE) },
        )
    }
    TeCard(header = vehicle.label) {
        ModField(label = "Trip", value = "${vehicle.trip}, departs ${vehicle.departure}")
        ModTripStatusBadge(status = session.tripStatus)
        ModField(
            label = "Checked in",
            value = "${session.checkedInCount} of ${session.travelers.size} assigned travelers",
        )
        ModField(label = "Seats on the vehicle", value = vehicle.seats.toString())
    }
    TeButton(text = "Scan or enter code", onClick = { nav.open(ModeratorRoutes.CHECK_IN) })
    TeButton(
        text = "Traveler manifest",
        onClick = { nav.open(ModeratorRoutes.MANIFEST) },
        variant = TeButtonVariant.Secondary,
    )
    if (session.queue.isNotEmpty()) {
        TeButton(
            text = "Offline queue: ${session.queue.size} waiting",
            onClick = { nav.open(ModeratorRoutes.OFFLINE_QUEUE) },
            variant = TeButtonVariant.Secondary,
        )
    }
    TeButton(
        text = "Incident report",
        onClick = { nav.open(ModeratorRoutes.INCIDENT) },
        variant = TeButtonVariant.Secondary,
    )
    if (!session.departed) {
        TeButton(
            text = "Mark vehicle departed",
            onClick = { session.markDeparted() },
            variant = TeButtonVariant.Secondary,
        )
    }
    TeButton(
        text = "End-of-trip report",
        enabled = session.tripEnded,
        onClick = { nav.open(ModeratorRoutes.END_OF_TRIP) },
        variant = TeButtonVariant.Secondary,
    )
    if (!session.tripEnded) {
        ModNote("The end-of-trip report opens when the trip has ended.")
    }
}
