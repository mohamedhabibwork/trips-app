package com.tripsenjoy.screens.photographer.albums

import androidx.compose.runtime.Composable
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.ScreenNavigator
import com.tripsenjoy.screens.moderator.common.icon
import com.tripsenjoy.screens.photographer.common.CURRENT_PLAN
import com.tripsenjoy.screens.photographer.common.DEMO_ALBUMS_ON_COMPLETED_TRIP
import com.tripsenjoy.screens.photographer.common.PhotoScreenId
import com.tripsenjoy.screens.photographer.common.StatePreview
import com.tripsenjoy.screens.photographer.common.isWithinAllowance
import com.tripsenjoy.screens.photographer.common.usageText
import com.tripsenjoy.screens.shared.common.ScreenBody
import com.tripsenjoy.screens.shared.common.ScreenNote
import com.tripsenjoy.screens.shared.common.SharedScreenId
import com.tripsenjoy.screens.shared.common.StateEmptyCard
import com.tripsenjoy.screens.shared.common.StateErrorBlock
import com.tripsenjoy.ui.components.BadgeTone
import com.tripsenjoy.ui.components.IconName
import com.tripsenjoy.ui.components.TeBadge
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TePageHeader

private data class TripAlbumRow(
    val id: String,
    val tripName: String,
    val completed: Boolean,
    val albumsUsed: Int,
)

private val DEMO_TRIP_ALBUMS = listOf(
    TripAlbumRow(id = "trip-1", tripName = "Trip name", completed = true, albumsUsed = DEMO_ALBUMS_ON_COMPLETED_TRIP),
    TripAlbumRow(id = "trip-2", tripName = "Second trip name", completed = false, albumsUsed = 0),
)

// SCR-PHO-07 Trip albums: one card per trip covered. Albums are created only after the trip is Completed (FR-MED-01).
// Album count is checked against the plan (Basic 1, Studio 5, Pro unlimited) and opens the plan prompt when full.
@Composable
fun TripAlbums() {
    val nav = LocalScreenNavigator.current
    ScreenBody {
        TePageHeader(title = "Trip albums", description = "Albums for each trip you cover")
        StatePreview(
            ariaLabel = "Trip albums states",
            main = { AlbumsContent(nav = nav) },
            empty = {
                StateEmptyCard(
                    header = "Trip albums",
                    message = "No trips yet. Albums appear here after a trip you cover is completed.",
                )
            },
            error = { StateErrorBlock(retryMessage = "Your albums did not load. Retry to see your trips.") },
        )
    }
}

@Composable
private fun AlbumsContent(nav: ScreenNavigator) {
    DEMO_TRIP_ALBUMS.forEach { trip ->
        TeCard(header = trip.tripName) {
            if (trip.completed) {
                TeBadge(label = "Completed", tone = BadgeTone.Success, icon = IconName.Check)
                ScreenNote(
                    text = "Albums used: ${usageText(trip.albumsUsed, CURRENT_PLAN.albumsPerTrip)}. " +
                        "${CURRENT_PLAN.label} plan limit.",
                )
                TripAlbumActions(nav = nav, albumsUsed = trip.albumsUsed)
            } else {
                TeBadge(label = "In progress", tone = BadgeTone.Warning, icon = IconName.Clock)
                ScreenNote(text = "Albums can be created after the trip is completed.")
                TeButton(text = "Create album", onClick = {}, enabled = false)
            }
        }
    }
}

@Composable
private fun TripAlbumActions(nav: ScreenNavigator, albumsUsed: Int) {
    val createTarget = if (isWithinAllowance(albumsUsed, CURRENT_PLAN.albumsPerTrip)) {
        PhotoScreenId.ALBUM_UPLOAD
    } else {
        SharedScreenId.PLAN_LIMIT_PROMPT
    }
    TeButton(text = "Create album", onClick = { nav.open(createTarget) })
    TeButton(
        text = "Album privacy and sharing",
        onClick = { nav.open(PhotoScreenId.ALBUM_PRIVACY) },
        variant = TeButtonVariant.Secondary,
    )
}
