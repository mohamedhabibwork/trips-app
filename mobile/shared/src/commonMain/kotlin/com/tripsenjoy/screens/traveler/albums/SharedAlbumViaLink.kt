package com.tripsenjoy.screens.traveler.albums

import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.painter.ColorPainter
import com.tripsenjoy.screens.traveler.common.LabelValue
import com.tripsenjoy.screens.traveler.common.ScreenPage
import com.tripsenjoy.screens.traveler.common.StatePreview
import com.tripsenjoy.screens.traveler.common.TravelerScreenState
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TePhoto
import com.tripsenjoy.ui.components.TePhotoGrid
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

// SCR-TRV-17. Album opened from a share link (FR-MED-04). The link carries a 32-character token. A revoked
// or unknown link shows not found, which is handled outside this primary state.
@Composable
fun SharedAlbumViaLink() {
    ScreenPage(title = "Shared album (via link)") {
        StatePreview(listedStates = setOf(TravelerScreenState.Loading, TravelerScreenState.Error)) {
            LabelValue(label = "Trip", value = "Trip name")
            LabelValue(label = "Album", value = "Album title")
            TePhotoGrid(
                photos = listOf(
                    TePhoto(
                        id = "photo-1",
                        painter = ColorPainter(TripsEnjoyTheme.colors.surfaceRaised),
                        alt = "Photo placeholder",
                    ),
                ),
                onOpen = {},
                columns = 2,
            )
            TeButton(text = "Download photos", onClick = {})
        }
    }
}
