package com.tripsenjoy.screens.photographer.albums

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.analytics.AnalyticsTracker
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.ScreenNavigator
import com.tripsenjoy.screens.moderator.common.icon
import com.tripsenjoy.screens.photographer.common.LocalPhotographerSession
import com.tripsenjoy.screens.photographer.common.PhotoScreenId
import com.tripsenjoy.screens.photographer.common.StatePreview
import com.tripsenjoy.screens.shared.common.ScreenBody
import com.tripsenjoy.screens.shared.common.ScreenNote
import com.tripsenjoy.screens.shared.common.StateErrorBlock
import com.tripsenjoy.ui.components.BadgeTone
import com.tripsenjoy.ui.components.IconName
import com.tripsenjoy.ui.components.TeBadge
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeCheckbox
import com.tripsenjoy.ui.components.TeFileUpload
import com.tripsenjoy.ui.components.TeInput
import com.tripsenjoy.ui.components.TeKpiTile
import com.tripsenjoy.ui.components.TePageHeader
import com.tripsenjoy.ui.components.TeUploadFile
import com.tripsenjoy.ui.components.UploadStatus

// SCR-PHO-08 Album upload: album title, batch of photos, watermark state. Saving moves to the privacy screen
// (SCR-PHO-09), which replaces this one so Back returns to the trip albums. Files are stripped of EXIF (FR-MED-02).
@Composable
fun AlbumUpload() {
    val nav = LocalScreenNavigator.current
    ScreenBody {
        TePageHeader(title = "Album upload", description = "Create an album and upload photos in batches")
        StatePreview(
            ariaLabel = "Album upload states",
            main = { AlbumUploadContent(nav = nav) },
            error = { StateErrorBlock(retryMessage = "The album did not save. Your photos are still in this batch.") },
        )
    }
}

@Composable
private fun AlbumUploadContent(nav: ScreenNavigator) {
    val session = LocalPhotographerSession.current
    var albumTitle by remember { mutableStateOf("") }
    var files by remember { mutableStateOf<List<TeUploadFile>>(emptyList()) }
    var pickedCount by remember { mutableStateOf(0) }
    var rightsConfirmed by remember { mutableStateOf(false) }
    TeInput(
        value = albumTitle,
        onValueChange = { albumTitle = it },
        label = "Album title",
        supportingText = "Albums can be created only after the trip is completed.",
    )
    TeBadge(label = "Watermark off", tone = BadgeTone.Neutral, icon = IconName.Shield)
    TeButton(
        text = "Watermark settings",
        onClick = { nav.open(PhotoScreenId.WATERMARK) },
        variant = TeButtonVariant.Secondary,
    )
    TeKpiTile(label = "Photos in this batch", value = files.size.toString())
    TeFileUpload(
        label = "Add photos",
        onPick = {
            pickedCount += 1
            files = files + TeUploadFile(
                name = "photo-$pickedCount.jpg",
                status = UploadStatus.Pending,
                message = "Ready to upload",
            )
        },
        files = files,
        onRemove = { name -> files = files.filterNot { it.name == name } },
        hint = "Location data (EXIF) is removed from every photo before it is stored. Interrupted uploads resume.",
    )
    ScreenNote(text = "Finished photos are kept if the upload is interrupted.")
    TeCheckbox(
        checked = rightsConfirmed,
        onCheckedChange = { rightsConfirmed = it },
        label = "I have the rights to publish these photos",
    )
    TeButton(
        text = "Save album and set privacy",
        onClick = {
            AnalyticsTracker.trackAction(
                "album_uploaded",
                mapOf("entity_type" to "photo_album", "batch_size" to files.size.toString()),
            )
            session.createAndUploadAlbum(albumTitle, files.map { it.name })
            nav.replace(PhotoScreenId.ALBUM_PRIVACY)
        },
        enabled = albumTitle.isNotBlank() && files.isNotEmpty() && rightsConfirmed,
    )
    TeButton(text = "Back to trip albums", onClick = { nav.back() }, variant = TeButtonVariant.Ghost)
}
