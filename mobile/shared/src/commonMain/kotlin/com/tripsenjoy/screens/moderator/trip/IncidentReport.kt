package com.tripsenjoy.screens.moderator.trip

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.analytics.AnalyticsTracker
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.moderator.common.LocalModeratorSession
import com.tripsenjoy.screens.moderator.common.ModField
import com.tripsenjoy.screens.moderator.common.ModLoadingBlock
import com.tripsenjoy.screens.moderator.common.ModScreen
import com.tripsenjoy.screens.moderator.common.ModSubmitStatus
import com.tripsenjoy.screens.moderator.common.ModeratorSampleData
import com.tripsenjoy.screens.moderator.common.StatePreview
import com.tripsenjoy.screens.moderator.common.tone
import com.tripsenjoy.screens.moderator.common.withPlaceholderFile
import com.tripsenjoy.ui.components.AlertTone
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeCheckbox
import com.tripsenjoy.ui.components.TeFileUpload
import com.tripsenjoy.ui.components.TeInlineAlert
import com.tripsenjoy.ui.components.TeSelect
import com.tripsenjoy.ui.components.TeTextarea
import com.tripsenjoy.ui.components.TeUploadFile

// SCR-MOD-07 Incident report: category, note, time (automatic), location where permitted and an optional photo.
@Composable
fun IncidentReport() {
    ModScreen(
        title = "Incident report",
        description = "Report an incident during the trip. Operations is notified and the report goes to the audit log.",
    ) {
        StatePreview(
            main = { IncidentForm() },
            loading = { ModLoadingBlock("Sending incident") },
            error = {
                TeInlineAlert(
                    tone = AlertTone.Error,
                    title = "Incident not sent",
                    message = "Check the connection and send again. Your note is kept.",
                )
            },
        )
    }
}

@Composable
private fun IncidentForm() {
    val nav = LocalScreenNavigator.current
    val session = LocalModeratorSession.current
    var category by remember { mutableStateOf<String?>(null) }
    var note by remember { mutableStateOf("") }
    var withLocation by remember { mutableStateOf(true) }
    var photos by remember { mutableStateOf(listOf<TeUploadFile>()) }
    var status by remember { mutableStateOf<ModSubmitStatus?>(null) }
    val categoryLabel = ModeratorSampleData.incidentCategories.firstOrNull { it.value == category }?.label
    TeSelect(
        label = "Incident category",
        options = ModeratorSampleData.incidentCategories,
        value = category,
        onValueChange = { value -> category = value },
    )
    TeTextarea(
        value = note,
        onValueChange = { value -> note = value.take(ModeratorSampleData.MAX_NOTE_LENGTH) },
        label = "What happened",
        minLines = 4,
        maxLength = ModeratorSampleData.MAX_NOTE_LENGTH,
        supportingText = "Say what you saw and what you did.",
    )
    ModField(label = "Time", value = "Recorded when you send")
    TeCheckbox(
        checked = withLocation,
        onCheckedChange = { value -> withLocation = value },
        label = "Share my location",
        description = "Only when location permission is on.",
    )
    TeFileUpload(
        label = "Add photo (optional)",
        onPick = { photos = photos.withPlaceholderFile(prefix = "incident-photo") },
        files = photos,
        onRemove = { name -> photos = photos.filterNot { it.name == name } },
        hint = "Optional. Photos are kept with the incident.",
    )
    TeButton(
        text = "Send incident",
        enabled = categoryLabel != null && note.isNotBlank(),
        onClick = {
            categoryLabel?.let { label ->
                status = session.reportIncident(label)
                // The category and delivery outcome only; the note text is never logged.
                AnalyticsTracker.trackAction(
                    "incident_reported",
                    mapOf(
                        "outcome" to if (status == ModSubmitStatus.Sent) "sent" else "queued_offline",
                        "entity_type" to "incident",
                    ),
                )
            }
        },
    )
    status?.let { result -> IncidentResult(result) }
    if (status != null) {
        TeButton(text = "Back to vehicle home", onClick = { nav.back() }, variant = TeButtonVariant.Secondary)
    }
}

@Composable
private fun IncidentResult(result: ModSubmitStatus) {
    if (result == ModSubmitStatus.Sent) {
        TeInlineAlert(
            tone = AlertTone.Success,
            title = "Incident sent",
            message = "Operations has been notified. The report is recorded in the audit log.",
        )
    } else {
        TeInlineAlert(
            tone = AlertTone.Info,
            title = "Incident saved on this device",
            message = "It sends in order when the connection returns.",
        )
    }
}
