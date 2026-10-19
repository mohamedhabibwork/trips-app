package com.tripsenjoy.screens.driver.trips

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.screens.driver.common.DriverSampleData
import com.tripsenjoy.screens.driver.common.DrvEmptyBlock
import com.tripsenjoy.screens.driver.common.DrvErrorBlock
import com.tripsenjoy.screens.driver.common.DrvField
import com.tripsenjoy.screens.driver.common.DrvNote
import com.tripsenjoy.screens.driver.common.DrvRunState
import com.tripsenjoy.screens.driver.common.DrvScreen
import com.tripsenjoy.screens.driver.common.LocalDriverSession
import com.tripsenjoy.screens.driver.common.StatePreview
import com.tripsenjoy.screens.driver.common.tone
import com.tripsenjoy.ui.components.BadgeTone
import com.tripsenjoy.ui.components.ErrorKind
import com.tripsenjoy.ui.components.IconName
import com.tripsenjoy.ui.components.TeAssignmentCard
import com.tripsenjoy.ui.components.TeBadge
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeChecklist
import com.tripsenjoy.ui.components.TeDialog
import com.tripsenjoy.ui.components.TeTimeline
import com.tripsenjoy.ui.components.TeTimelineItem
import com.tripsenjoy.ui.components.TimelineState

// SCR-DRV-08 Assignments and vehicle run. The run actions move the trip through start, stops and end.
@Composable
fun AssignmentsAndVehicleRun() {
    DrvScreen(
        title = "Assignments and vehicle run",
        description = "Your assigned trip and the vehicle you run. Organization-owned trips are auto-accepted.",
    ) {
        StatePreview(
            main = { AssignmentMain() },
            empty = { DrvEmptyBlock("No assignments", "Your organizers reassigned your trips, or none is assigned yet.") },
            error = { DrvErrorBlock(ErrorKind.Server) },
        )
    }
}

@Composable
private fun AssignmentMain() {
    val session = LocalDriverSession.current
    val assignment = session.assignment
    TeAssignmentCard(
        tripName = assignment.tripName,
        route = assignment.route,
        departure = assignment.departure,
        vehicle = assignment.vehicle,
    )
    TeCard(header = "Run status") {
        TeBadge(label = session.runState.word, tone = session.runState.tone(), icon = session.runState.icon())
        DrvField(label = "Source", value = assignment.source)
        DrvField(label = "Organization contact", value = assignment.organization)
        DrvField(
            label = "Travelers on the roster",
            value = "${assignment.travelerCount}. Check-in is handled by the moderator.",
        )
        DrvField(label = "Stops reached", value = session.stopsReached.toString())
        DrvNote("Vehicle location is shared while the trip is in progress.")
    }
    if (session.runState == DrvRunState.Assigned) {
        DepartureChecklist()
    }
    RunActions()
    TeCard(header = "Trip progress") {
        TeTimeline(items = runTimeline(session.runState, assignment.departure))
    }
}

@Composable
private fun DepartureChecklist() {
    var items by remember { mutableStateOf(DriverSampleData.departureChecklist) }
    TeChecklist(
        items = items,
        onToggle = { id ->
            items = items.map { item -> if (item.id == id) item.copy(checked = !item.checked) else item }
        },
        label = "Before departure",
    )
}

@Composable
private fun RunActions() {
    val session = LocalDriverSession.current
    when (session.runState) {
        DrvRunState.Assigned -> TeButton(text = "Start trip", onClick = { session.startTrip() })
        DrvRunState.InProgress -> {
            TeButton(
                text = "Mark stop reached",
                onClick = { session.reachStop() },
                variant = TeButtonVariant.Secondary,
            )
            EndTripButton()
        }
        DrvRunState.Ended -> DrvNote("Trip ended. Vehicle location sharing is closed.")
    }
}

@Composable
private fun EndTripButton() {
    val session = LocalDriverSession.current
    var confirmEnd by remember { mutableStateOf(false) }
    TeButton(text = "End trip", onClick = { confirmEnd = true }, variant = TeButtonVariant.Destructive)
    TeDialog(
        visible = confirmEnd,
        onDismiss = { confirmEnd = false },
        title = "End this trip?",
        primaryLabel = "End trip",
        onPrimary = {
            session.endTrip()
            confirmEnd = false
        },
        secondaryLabel = "Keep running",
        description = "Vehicle location sharing closes and the trip is marked ended.",
    )
}

private fun DrvRunState.icon(): IconName = when (this) {
    DrvRunState.Assigned -> IconName.Clock
    DrvRunState.InProgress -> IconName.Live
    DrvRunState.Ended -> IconName.Check
}

private fun runTimeline(state: DrvRunState, departure: String): List<TeTimelineItem> = listOf(
    TeTimelineItem(
        id = "start",
        time = departure,
        label = "Trip start",
        state = if (state == DrvRunState.Assigned) TimelineState.Current else TimelineState.Done,
    ),
    TeTimelineItem(
        id = "stops",
        time = "Along the route",
        label = "Stops reached",
        state = when (state) {
            DrvRunState.Assigned -> TimelineState.Upcoming
            DrvRunState.InProgress -> TimelineState.Current
            DrvRunState.Ended -> TimelineState.Done
        },
    ),
    TeTimelineItem(
        id = "end",
        time = "After the last stop",
        label = "Trip ended",
        state = if (state == DrvRunState.Ended) TimelineState.Done else TimelineState.Upcoming,
    ),
)
