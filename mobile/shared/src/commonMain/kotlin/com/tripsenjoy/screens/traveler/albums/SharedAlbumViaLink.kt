package com.tripsenjoy.screens.traveler.albums

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.graphics.painter.ColorPainter
import com.tripsenjoy.auth.LocalAuthApiOrNull
import com.tripsenjoy.screens.traveler.common.LabelValue
import com.tripsenjoy.screens.traveler.common.ScreenPage
import com.tripsenjoy.screens.traveler.common.StatePreview
import com.tripsenjoy.screens.traveler.common.TravelerScreenState
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TePhoto
import com.tripsenjoy.ui.components.TePhotoGrid
import com.tripsenjoy.ui.theme.TripsEnjoyTheme
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

// SCR-TRV-17. Album opened from a share link (FR-MED-04). The link carries a 32-character token. A revoked
// or unknown link shows not found, which is handled outside this primary state.
@Composable
fun SharedAlbumViaLink() {
    val api = LocalAuthApiOrNull.current
    var tripName by remember { mutableStateOf("Trip name") }
    var albumTitle by remember { mutableStateOf("Album title") }

    LaunchedEffect(api) {
        val client = api ?: return@LaunchedEffect
        runCatching {
            val arr = client.call("photographer/listTripAlbums", buildJsonObject {}, JsonElement.serializer()).jsonArray
            val first = arr.firstOrNull()?.jsonObject ?: return@runCatching
            tripName = first["tripId"]?.jsonPrimitive?.contentOrNull ?: tripName
            albumTitle = first["titleEn"]?.jsonPrimitive?.contentOrNull
                ?: first["titleAr"]?.jsonPrimitive?.contentOrNull
                ?: first["title"]?.jsonPrimitive?.contentOrNull
                ?: albumTitle
        }
    }

    ScreenPage(title = "Shared album (via link)") {
        StatePreview(listedStates = setOf(TravelerScreenState.Loading, TravelerScreenState.Error)) {
            LabelValue(label = "Trip", value = tripName)
            LabelValue(label = "Album", value = albumTitle)
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
