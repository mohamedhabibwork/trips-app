package com.tripsenjoy.screens.parent.safety

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import com.tripsenjoy.auth.LocalAuthApiOrNull
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.traveler.common.BackButton
import com.tripsenjoy.screens.traveler.common.LabelValue
import com.tripsenjoy.screens.traveler.common.ScreenPage
import com.tripsenjoy.screens.traveler.common.StatePreview
import com.tripsenjoy.screens.traveler.common.TravelerScreenState
import com.tripsenjoy.ui.components.AlertTone
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeInlineAlert
import com.tripsenjoy.ui.components.TeOption
import com.tripsenjoy.ui.components.TeSelect
import com.tripsenjoy.ui.components.TeTextarea
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put

private val DEFAULT_CHILD_OPTIONS = listOf(TeOption(value = "child-1", label = "Linked child"))

private val CONTACT_OPTIONS = listOf(
    TeOption(value = "phone", label = "Phone"),
    TeOption(value = "email", label = "Email"),
)

@Composable
fun ChildSafetyReport() {
    val nav = LocalScreenNavigator.current
    val api = LocalAuthApiOrNull.current
    val scope = rememberCoroutineScope()
    var childOptions by remember { mutableStateOf(DEFAULT_CHILD_OPTIONS) }
    var tripId by remember { mutableStateOf("trip-1") }
    var tripName by remember { mutableStateOf("Assigned trip") }
    var selectedChild by remember { mutableStateOf<String?>(null) }
    var contactChoice by remember { mutableStateOf<String?>(null) }
    var description by remember { mutableStateOf("") }

    LaunchedEffect(api) {
        val client = api ?: return@LaunchedEffect
        runCatching {
            val links = client.call("parent/listLinkedChildren", JsonNull, JsonElement.serializer()).jsonArray
            if (links.isNotEmpty()) {
                childOptions = links.mapNotNull { el ->
                    val obj = el.jsonObject
                    val passengerId = obj["childPassengerId"]?.jsonPrimitive?.contentOrNull
                        ?: obj["id"]?.jsonPrimitive?.contentOrNull
                        ?: return@mapNotNull null
                    val name = obj["childFullName"]?.jsonPrimitive?.contentOrNull ?: "Child"
                    TeOption(value = passengerId, label = name)
                }
                val first = links.first().jsonObject
                tripId = first["tripId"]?.jsonPrimitive?.contentOrNull ?: tripId
                tripName = first["tripTitle"]?.jsonPrimitive?.contentOrNull ?: tripName
            }
        }
    }

    val canSubmit = selectedChild != null && contactChoice != null && description.isNotBlank()
    ScreenPage(title = "Child-safety report") {
        StatePreview(listedStates = setOf(TravelerScreenState.Error)) {
            TeInlineAlert(
                tone = AlertTone.Info,
                title = "Your report goes to the escalation contact",
                message = "If a child is in immediate danger, contact emergency services first.",
            )
            TeSelect(
                label = "Child",
                options = childOptions,
                value = selectedChild,
                onValueChange = { selectedChild = it },
                placeholder = "Select a linked child",
            )
            LabelValue(label = "Trip", value = tripName)
            TeTextarea(
                value = description,
                onValueChange = { description = it },
                label = "Describe the concern",
                supportingText = "Describe what happened. Do not include details about other children.",
            )
            TeSelect(
                label = "Contact preference",
                options = CONTACT_OPTIONS,
                value = contactChoice,
                onValueChange = { contactChoice = it },
                placeholder = "Select how we should contact you",
            )
            TeButton(
                text = "Submit report",
                enabled = canSubmit,
                onClick = {
                    val client = api
                    if (client != null) {
                        scope.launch {
                            runCatching {
                                client.call(
                                    "tracking/recordChildSafetyEvent",
                                    buildJsonObject {
                                        put("tripId", tripId)
                                        put("childPassengerId", selectedChild ?: "child-1")
                                        put("eventType", "child_boarded")
                                        put("messageAr", description.trim())
                                        put("messageEn", "${description.trim()} (contact: ${contactChoice ?: "phone"})")
                                    },
                                    JsonElement.serializer(),
                                )
                            }
                            nav.back()
                        }
                    } else {
                        nav.back()
                    }
                },
            )
            BackButton(text = "Cancel", variant = TeButtonVariant.Ghost)
        }
    }
}
