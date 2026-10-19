package com.tripsenjoy.screens.parent.tracking

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.auth.LocalAuthApiOrNull
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.traveler.common.BackButton
import com.tripsenjoy.screens.traveler.common.LabelValue
import com.tripsenjoy.screens.traveler.common.OpenScreenButton
import com.tripsenjoy.screens.traveler.common.ScreenPage
import com.tripsenjoy.screens.traveler.common.StatePreview
import com.tripsenjoy.screens.traveler.common.TravelerScreenState
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeChildCard
import com.tripsenjoy.ui.components.TrackingStatus
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

private data class LinkedChildSummary(
    val id: String,
    val childName: String,
    val tripName: String,
    val vehicleLabel: String,
    val seatLabel: String,
    val programsLabel: String,
)

@Composable
fun TrackerHome() {
    val nav = LocalScreenNavigator.current
    val api = LocalAuthApiOrNull.current
    var children by remember { mutableStateOf<List<LinkedChildSummary>>(emptyList()) }
    LaunchedEffect(api) {
        val client = api ?: return@LaunchedEffect
        runCatching {
            val arr = client.call("parent/listLinkedChildren", JsonNull, JsonElement.serializer()).jsonArray
            children = arr.map { el ->
                val obj = el.jsonObject
                LinkedChildSummary(
                    id = obj["id"]?.jsonPrimitive?.contentOrNull ?: "",
                    childName = obj["childFullName"]?.jsonPrimitive?.contentOrNull ?: "Child",
                    tripName = obj["tripTitle"]?.jsonPrimitive?.contentOrNull ?: "Assigned trip",
                    vehicleLabel = obj["vehicleLabel"]?.jsonPrimitive?.contentOrNull ?: "Assigned vehicle",
                    seatLabel = obj["seatLabel"]?.jsonPrimitive?.contentOrNull ?: "Assigned seat",
                    programsLabel = obj["enrolledPrograms"]?.jsonPrimitive?.contentOrNull ?: "Active programs",
                )
            }
        }
    }
    val primary = children.firstOrNull()
    ScreenPage(title = "Tracker home") {
        StatePreview(
            listedStates = setOf(TravelerScreenState.Loading, TravelerScreenState.Empty, TravelerScreenState.Error),
            emptyTitle = "No linked children",
            emptyMessage = "Link a child to a booking to follow the child's trip.",
            emptyAction = {
                OpenScreenButton(text = "Link a child", screenId = "SCR-PAR-02", variant = TeButtonVariant.Secondary)
            },
        ) {
            TeChildCard(
                name = primary?.childName ?: "Linked child",
                tripName = primary?.tripName ?: "Assigned trip",
                status = TrackingStatus.Boarded,
                onOpen = { nav.open("SCR-PAR-03") },
            )
            LabelValue(label = "Vehicle", value = primary?.vehicleLabel ?: "—")
            LabelValue(label = "Seat", value = primary?.seatLabel ?: "—")
            LabelValue(label = "Programs", value = primary?.programsLabel ?: "—")
            OpenScreenButton(text = "Link a child", screenId = "SCR-PAR-02", variant = TeButtonVariant.Secondary)
            BackButton()
        }
    }
}
