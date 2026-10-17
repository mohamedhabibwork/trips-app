package com.tripsenjoy.screens.photographer.studio

import androidx.compose.runtime.Composable
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.ScreenNavigator
import com.tripsenjoy.screens.moderator.common.icon
import com.tripsenjoy.screens.photographer.common.DEMO_BRIEF_TRIP_COMPLETED
import com.tripsenjoy.screens.photographer.common.PhotoScreenId
import com.tripsenjoy.screens.photographer.common.StatePreview
import com.tripsenjoy.screens.shared.common.ScreenBody
import com.tripsenjoy.screens.shared.common.ScreenNote
import com.tripsenjoy.screens.shared.common.StateErrorBlock
import com.tripsenjoy.screens.shared.common.StateLoadingCard
import com.tripsenjoy.ui.components.BadgeTone
import com.tripsenjoy.ui.components.IconName
import com.tripsenjoy.ui.components.TeAssignmentCard
import com.tripsenjoy.ui.components.TeBadge
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TePageHeader
import com.tripsenjoy.ui.components.TeTimeline
import com.tripsenjoy.ui.components.TeTimelineItem
import com.tripsenjoy.ui.components.TimelineState

// SCR-PHO-06 Assigned trip brief: schedule, programs, scope and the album upload window.
// Album upload stays locked until the trip is Completed (FR-MED-01). The brief is read-only.
@Composable
fun AssignedTripBrief() {
    val nav = LocalScreenNavigator.current
    ScreenBody {
        TePageHeader(title = "Assigned trip brief", description = "Schedule, programs and scope for this assignment")
        StatePreview(
            ariaLabel = "Assigned trip brief states",
            main = { BriefContent(nav = nav) },
            loading = { StateLoadingCard(subject = "your trip brief") },
            error = { StateErrorBlock(retryMessage = "The trip brief did not load. Retry to see the schedule.") },
        )
    }
}

@Composable
private fun BriefContent(nav: ScreenNavigator) {
    TeBadge(label = "Assigned", tone = BadgeTone.Info, icon = IconName.Check)
    TeAssignmentCard(
        tripName = "Trip name",
        route = "Route",
        departure = "Departure time",
        vehicle = "Vehicle",
        actionLabel = "Open trip albums",
        onAction = { nav.open(PhotoScreenId.TRIP_ALBUMS) },
    )
    TeCard(header = "Schedule") {
        TeTimeline(
            items = listOf(
                TeTimelineItem(id = "stop-1", time = "Time", label = "Program name", state = TimelineState.Current),
                TeTimelineItem(id = "stop-2", time = "Time", label = "Program name", state = TimelineState.Upcoming),
                TeTimelineItem(id = "stop-3", time = "Time", label = "Program name", state = TimelineState.Upcoming),
            ),
        )
    }
    TeCard(header = "Scope notes") {
        ScreenNote(text = "Scope notes from the organization appear here.")
    }
    TeCard(header = "Album upload window") {
        ScreenNote(text = "Opens when the trip is completed.")
    }
    TeCard(header = "Organization contact") {
        ScreenNote(text = "Organization name and contact details")
    }
    TeButton(
        text = "Upload album",
        onClick = { nav.open(PhotoScreenId.ALBUM_UPLOAD) },
        variant = TeButtonVariant.Secondary,
        enabled = DEMO_BRIEF_TRIP_COMPLETED,
    )
    if (!DEMO_BRIEF_TRIP_COMPLETED) {
        ScreenNote(text = "Album upload unlocks when the trip is completed.")
    }
}
