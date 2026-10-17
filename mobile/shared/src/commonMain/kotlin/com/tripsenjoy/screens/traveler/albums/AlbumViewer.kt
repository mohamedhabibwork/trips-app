package com.tripsenjoy.screens.traveler.albums

import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.painter.ColorPainter
import com.tripsenjoy.screens.traveler.common.BackButton
import com.tripsenjoy.screens.traveler.common.LabelValue
import com.tripsenjoy.screens.traveler.common.ScreenPage
import com.tripsenjoy.screens.traveler.common.StatePreview
import com.tripsenjoy.screens.traveler.common.TravelerScreenState
import com.tripsenjoy.ui.components.AlertTone
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeInlineAlert
import com.tripsenjoy.ui.components.TePhoto
import com.tripsenjoy.ui.components.TePhotoGrid
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

// SCR-TRV-16. Downloads are watermarked copies; originals are unchanged (FR-MED-06). Swipe and arrow
// direction follow RTL when Arabic is selected. Download and share appear only where the album allows them.
@Composable
fun AlbumViewer() {
    ScreenPage(title = "Album viewer") {
        StatePreview(
            listedStates = setOf(TravelerScreenState.Loading, TravelerScreenState.Empty, TravelerScreenState.Error),
            emptyTitle = "This album is empty",
            emptyMessage = "Photos appear here after the photographer uploads them.",
        ) {
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
            TeInlineAlert(
                tone = AlertTone.Info,
                title = "Watermarked copies",
                message = "Downloads are watermarked copies. Originals are unchanged.",
            )
            TeButton(text = "Download", onClick = {})
            TeButton(text = "Share", onClick = {}, variant = TeButtonVariant.Secondary)
            BackButton()
        }
    }
}
