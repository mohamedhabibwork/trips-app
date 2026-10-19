package com.tripsenjoy.screens.traveler.bookings

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.auth.LocalAuthApiOrNull
import com.tripsenjoy.screens.traveler.common.BackButton
import com.tripsenjoy.screens.traveler.common.LabelValue
import com.tripsenjoy.screens.traveler.common.ScreenPage
import com.tripsenjoy.screens.traveler.common.ScreenSection
import com.tripsenjoy.screens.traveler.common.StatePreview
import com.tripsenjoy.screens.traveler.common.TravelerScreenState
import com.tripsenjoy.trips.TripsBrowseRepository
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeTimeline
import com.tripsenjoy.ui.components.TeTimelineItem
import com.tripsenjoy.ui.components.TeTrackingStatus
import com.tripsenjoy.ui.components.TimelineState
import com.tripsenjoy.ui.components.TrackingStatus
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put

@Composable
fun TripDay() {
    val api = LocalAuthApiOrNull.current
    var refreshTick by remember { mutableIntStateOf(0) }
    var vehicleLabel by remember { mutableStateOf("Assigned vehicle") }
    var seatLabel by remember { mutableStateOf("Assigned seat") }
    var tripStatus by remember { mutableStateOf("Upcoming") }

    LaunchedEffect(api, refreshTick) {
        val client = api ?: return@LaunchedEffect
        val tripId = TripsBrowseRepository.selectedTripId ?: return@LaunchedEffect
        runCatching {
            val live = client.call(
                "tracking/getTripLiveTracking",
                buildJsonObject { put("tripId", tripId) },
                JsonElement.serializer(),
            ).jsonObject
            vehicleLabel = live["vehicleLabel"]?.jsonPrimitive?.contentOrNull ?: vehicleLabel
            tripStatus = live["tripState"]?.jsonPrimitive?.contentOrNull ?: tripStatus
        }
    }

    ScreenPage(title = "Trip day") {
        StatePreview(listedStates = setOf(TravelerScreenState.Error)) {
            TeTrackingStatus(status = TrackingStatus.NotBoarded, label = "Not boarded")
            ScreenSection(header = "Your trip") {
                LabelValue(label = "Vehicle", value = vehicleLabel)
                LabelValue(label = "Seat", value = seatLabel)
                LabelValue(label = "Trip status", value = tripStatus)
            }
            ScreenSection(header = "Notices and progress") {
                TeTimeline(items = TRIP_DAY_ITEMS)
            }
            TeButton(text = "Refresh trip status", onClick = { refreshTick += 1 }, variant = TeButtonVariant.Primary)
            BackButton()
        }
    }
}

private val TRIP_DAY_ITEMS = listOf(
    TeTimelineItem(
        id = "reminder",
        time = "24 hours before departure",
        label = "Trip reminder",
        state = TimelineState.Done,
    ),
    TeTimelineItem(
        id = "boarding",
        time = "Boarding",
        label = "Boarding confirmed",
        state = TimelineState.Current,
    ),
    TeTimelineItem(
        id = "start",
        time = "Departure",
        label = "Trip started",
        state = TimelineState.Upcoming,
    ),
    TeTimelineItem(
        id = "stop",
        time = "At each stop",
        label = "Stop reached",
        state = TimelineState.Upcoming,
    ),
    TeTimelineItem(
        id = "end",
        time = "Arrival",
        label = "Trip ended",
        state = TimelineState.Upcoming,
    ),
)
