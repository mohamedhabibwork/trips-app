package com.tripsenjoy.screens.parent.tracking

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.geometry.Offset
import com.tripsenjoy.auth.LocalAuthApiOrNull
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
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put

@Composable
fun ChildTripStatus() {
    val api = LocalAuthApiOrNull.current
    var refreshTick by remember { mutableIntStateOf(0) }
    var childName by remember { mutableStateOf("Linked child") }
    var tripName by remember { mutableStateOf("Assigned trip") }
    var vehicleLabel by remember { mutableStateOf("Assigned vehicle") }
    var seatLabel by remember { mutableStateOf("Assigned seat") }
    var programsLabel by remember { mutableStateOf("Active programs") }
    var statusLabel by remember { mutableStateOf("Checked in") }

    LaunchedEffect(api, refreshTick) {
        val client = api ?: return@LaunchedEffect
        runCatching {
            val links = client.call("parent/listLinkedChildren", JsonNull, JsonElement.serializer()).jsonArray
            val firstLink = links.firstOrNull()?.jsonObject ?: return@runCatching
            val linkId = firstLink["id"]?.jsonPrimitive?.contentOrNull ?: return@runCatching
            childName = firstLink["childFullName"]?.jsonPrimitive?.contentOrNull ?: childName
            val live = client.call(
                "parent/getChildTripLiveStatus",
                buildJsonObject { put("linkId", linkId) },
                JsonElement.serializer(),
            ).jsonObject
            val linkObj = live["link"]?.jsonObject
            val checkInObj = live["checkInRecord"]?.jsonObject
            childName = linkObj?.get("childFullName")?.jsonPrimitive?.contentOrNull ?: childName
            tripName = linkObj?.get("tripId")?.jsonPrimitive?.contentOrNull
                ?: live["tripTitle"]?.jsonPrimitive?.contentOrNull
                ?: tripName
            vehicleLabel = checkInObj?.get("vehicleId")?.jsonPrimitive?.contentOrNull
                ?: live["vehicleLabel"]?.jsonPrimitive?.contentOrNull
                ?: vehicleLabel
            seatLabel = checkInObj?.get("seatLabel")?.jsonPrimitive?.contentOrNull
                ?: live["seatLabel"]?.jsonPrimitive?.contentOrNull
                ?: seatLabel
            statusLabel = checkInObj?.get("status")?.jsonPrimitive?.contentOrNull
                ?: live["boardingStatus"]?.jsonPrimitive?.contentOrNull
                ?: statusLabel
        }
    }

    ScreenPage(title = "Child trip status") {
        StatePreview(listedStates = setOf(TravelerScreenState.Error)) {
            TeTrackingStatus(status = TrackingStatus.Boarded, label = statusLabel)
            ScreenSection(header = "Trip") {
                LabelValue(label = "Child", value = childName)
                LabelValue(label = "Trip", value = tripName)
                LabelValue(label = "Vehicle", value = vehicleLabel)
                LabelValue(label = "Seat", value = seatLabel)
                LabelValue(label = "Programs", value = programsLabel)
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
            TeButton(text = "Refresh status", onClick = { refreshTick += 1 })
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
