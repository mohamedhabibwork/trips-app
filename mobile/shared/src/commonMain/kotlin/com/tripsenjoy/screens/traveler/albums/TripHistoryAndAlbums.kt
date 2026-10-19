package com.tripsenjoy.screens.traveler.albums

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.auth.LocalAuthApiOrNull
import com.tripsenjoy.screens.moderator.common.icon
import com.tripsenjoy.screens.traveler.bookings.TravelerBookingState
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
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

@Composable
fun TripHistoryAndAlbums() {
    val api = LocalAuthApiOrNull.current
    var albumTitle by remember { mutableStateOf("Completed trip") }
    var albumDate by remember { mutableStateOf("—") }
    var albumCount by remember { mutableStateOf("1") }

    LaunchedEffect(api) {
        val client = api ?: return@LaunchedEffect
        runCatching {
            val arr = client.call("photographer/listTripAlbums", buildJsonObject {}, JsonElement.serializer()).jsonArray
            albumCount = arr.size.toString()
            val first = arr.firstOrNull()?.jsonObject
            if (first != null) {
                TravelerBookingState.selectedAlbumId = first["id"]?.jsonPrimitive?.contentOrNull
                albumTitle = first["titleEn"]?.jsonPrimitive?.contentOrNull
                    ?: first["titleAr"]?.jsonPrimitive?.contentOrNull
                    ?: first["title"]?.jsonPrimitive?.contentOrNull
                    ?: albumTitle
                albumDate = first["publishedAt"]?.jsonPrimitive?.contentOrNull ?: albumDate
            }
        }
    }

    ScreenPage(title = "Trip history and albums") {
        StatePreview(
            listedStates = setOf(TravelerScreenState.Loading, TravelerScreenState.Empty, TravelerScreenState.Error),
            emptyTitle = "No completed trips yet",
            emptyMessage = "Completed trips and their albums appear here.",
        ) {
            TeCard(header = albumTitle) {
                LabelValue(label = "Completed", value = albumDate)
                LabelValue(label = "Albums", value = albumCount)
                TeBadge(label = "Album available", tone = BadgeTone.Success, icon = IconName.Image)
                OpenScreenButton(text = "Open album", screenId = "SCR-TRV-16")
            }
            BackButton()
        }
    }
}
