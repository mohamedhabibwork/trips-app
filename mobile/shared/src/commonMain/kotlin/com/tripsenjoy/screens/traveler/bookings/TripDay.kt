package com.tripsenjoy.screens.traveler.bookings

import androidx.compose.runtime.Composable
import com.tripsenjoy.screens.traveler.common.BackButton
import com.tripsenjoy.screens.traveler.common.LabelValue
import com.tripsenjoy.screens.traveler.common.ScreenPage
import com.tripsenjoy.screens.traveler.common.ScreenSection
import com.tripsenjoy.screens.traveler.common.StatePreview
import com.tripsenjoy.screens.traveler.common.TravelerScreenState
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeTimeline
import com.tripsenjoy.ui.components.TeTimelineItem
import com.tripsenjoy.ui.components.TeTrackingStatus
import com.tripsenjoy.ui.components.TimelineState
import com.tripsenjoy.ui.components.TrackingStatus

// SCR-TRV-13. The traveler's own vehicle, seat and boarding state. Other travelers are never shown (BRL-01).
// Notices: trip reminder 24 hours before departure (D-27), boarding, trip started, stop reached, trip ended.
@Composable
fun TripDay() {
    ScreenPage(title = "Trip day") {
        StatePreview(listedStates = setOf(TravelerScreenState.Error)) {
            TeTrackingStatus(status = TrackingStatus.NotBoarded, label = "Not boarded")
            ScreenSection(header = "Your trip") {
                LabelValue(label = "Vehicle", value = "Vehicle label")
                LabelValue(label = "Seat", value = "Seat label")
                LabelValue(label = "Trip status", value = "Upcoming")
            }
            ScreenSection(header = "Notices and progress") {
                TeTimeline(items = TRIP_DAY_ITEMS)
            }
            TeButton(text = "Refresh trip status", onClick = {}, variant = TeButtonVariant.Primary)
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
