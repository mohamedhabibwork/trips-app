package com.tripsenjoy.screens.parent.tracking

import androidx.compose.runtime.Composable
import androidx.compose.ui.geometry.Offset
import com.tripsenjoy.screens.traveler.common.BackButton
import com.tripsenjoy.screens.traveler.common.LabelValue
import com.tripsenjoy.screens.traveler.common.OpenScreenButton
import com.tripsenjoy.screens.traveler.common.ScreenNote
import com.tripsenjoy.screens.traveler.common.ScreenPage
import com.tripsenjoy.screens.traveler.common.ScreenSection
import com.tripsenjoy.screens.traveler.common.StatePreview
import com.tripsenjoy.screens.traveler.common.TravelerScreenState
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeLiveMap
import com.tripsenjoy.ui.components.TeTrackingStatus
import com.tripsenjoy.ui.components.TrackingStatus

// SCR-PAR-03. One child only. Live position appears only while the trip is In Progress and child tracking
// is on (D-34), updating every 5 to 10 seconds. Route points are layout placeholders.
// Notification settings opens the traveler profile (SCR-TRV-19); the concern link opens SCR-PAR-05.
@Composable
fun ChildTripStatus() {
    ScreenPage(title = "Child trip status") {
        StatePreview(listedStates = setOf(TravelerScreenState.Error)) {
            TeTrackingStatus(status = TrackingStatus.Boarded, label = "Checked in")
            ScreenSection(header = "Trip") {
                LabelValue(label = "Child", value = "Child name")
                LabelValue(label = "Trip", value = "Trip name")
                LabelValue(label = "Vehicle", value = "Vehicle label")
                LabelValue(label = "Seat", value = "Seat label")
                LabelValue(label = "Programs", value = "Enrolled programs")
            }
            ScreenSection(header = "Live position") {
                TeLiveMap(
                    route = ROUTE_POINTS,
                    busPosition = Offset(x = 0.5f, y = 0.5f),
                    statusText = "Trip in progress. Position updates every 5 to 10 seconds.",
                    contentDescription = "Map showing the vehicle on its route",
                )
            }
            ScreenNote(text = "Notifications and quiet hours are set in your profile.")
            TeButton(text = "Refresh status", onClick = {})
            OpenScreenButton(text = "Notification settings", screenId = "SCR-TRV-19", variant = TeButtonVariant.Secondary)
            OpenScreenButton(text = "Why tracking is unavailable", screenId = "SCR-PAR-04", variant = TeButtonVariant.Secondary)
            OpenScreenButton(text = "Report a child-safety concern", screenId = "SCR-PAR-05", variant = TeButtonVariant.Ghost)
            BackButton()
        }
    }
}

private val ROUTE_POINTS = listOf(
    Offset(x = 0.1f, y = 0.8f),
    Offset(x = 0.5f, y = 0.5f),
    Offset(x = 0.9f, y = 0.2f),
)
