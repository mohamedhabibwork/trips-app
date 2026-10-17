package com.tripsenjoy.screens.traveler.albums

import androidx.compose.runtime.Composable
import com.tripsenjoy.screens.moderator.common.icon
import com.tripsenjoy.screens.traveler.common.BackButton
import com.tripsenjoy.screens.traveler.common.LabelValue
import com.tripsenjoy.screens.traveler.common.OpenScreenButton
import com.tripsenjoy.screens.traveler.common.ScreenPage
import com.tripsenjoy.screens.traveler.common.StatePreview
import com.tripsenjoy.screens.traveler.common.TravelerScreenState
import com.tripsenjoy.ui.components.BadgeTone
import com.tripsenjoy.ui.components.IconName
import com.tripsenjoy.ui.components.TeBadge
import com.tripsenjoy.ui.components.TeCard

// SCR-TRV-15. Completed trips the traveler attended. An album appears only when the traveler may see it
// (album privacy mode, FR-MED-05); a hidden album is not listed at all.
@Composable
fun TripHistoryAndAlbums() {
    ScreenPage(title = "Trip history and albums") {
        StatePreview(
            listedStates = setOf(TravelerScreenState.Loading, TravelerScreenState.Empty, TravelerScreenState.Error),
            emptyTitle = "No completed trips yet",
            emptyMessage = "Completed trips and their albums appear here.",
        ) {
            TeCard(header = "Trip name") {
                LabelValue(label = "Completed", value = "Trip dates")
                LabelValue(label = "Albums", value = "Album count")
                TeBadge(label = "Album available", tone = BadgeTone.Success, icon = IconName.Image)
                OpenScreenButton(text = "Open album", screenId = "SCR-TRV-16")
            }
            BackButton()
        }
    }
}
