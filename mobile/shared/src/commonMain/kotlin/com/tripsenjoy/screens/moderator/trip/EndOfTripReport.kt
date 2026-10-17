package com.tripsenjoy.screens.moderator.trip

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.moderator.common.LocalModeratorSession
import com.tripsenjoy.screens.moderator.common.ModField
import com.tripsenjoy.screens.moderator.common.ModLoadingBlock
import com.tripsenjoy.screens.moderator.common.ModNote
import com.tripsenjoy.screens.moderator.common.ModScreen
import com.tripsenjoy.screens.moderator.common.ModeratorSampleData
import com.tripsenjoy.screens.moderator.common.StatePreview
import com.tripsenjoy.screens.moderator.common.tone
import com.tripsenjoy.ui.components.AlertTone
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeChecklist
import com.tripsenjoy.ui.components.TeInlineAlert
import com.tripsenjoy.ui.components.TeInput
import com.tripsenjoy.ui.components.TeKeyboardType
import com.tripsenjoy.ui.components.TeSelect
import com.tripsenjoy.ui.components.TeTextarea

private const val HEADCOUNT_MAX_DIGITS = 3

// SCR-MOD-08 End-of-trip report: final headcount against the system check-ins. A difference needs a reason.
@Composable
fun EndOfTripReport() {
    ModScreen(title = "End-of-trip report", description = "Close the vehicle's trip report with the final headcount.") {
        StatePreview(
            main = { ReportMain() },
            loading = { ModLoadingBlock("Submitting report") },
            error = {
                TeInlineAlert(
                    tone = AlertTone.Error,
                    title = "Report not submitted",
                    message = "Check the connection and submit again. Your entries are kept.",
                )
            },
        )
    }
}

@Composable
private fun ReportMain() {
    val nav = LocalScreenNavigator.current
    val session = LocalModeratorSession.current
    if (session.endOfTripSubmitted) {
        SubmittedSummary()
    } else {
        ReportForm()
    }
    if (session.endOfTripSubmitted) {
        TeButton(
            text = "Back to vehicle home",
            onClick = { nav.back() },
            variant = TeButtonVariant.Secondary,
        )
    }
}

@Composable
private fun ReportForm() {
    val session = LocalModeratorSession.current
    var headcountText by remember { mutableStateOf("") }
    var reason by remember { mutableStateOf<String?>(null) }
    var notes by remember { mutableStateOf("") }
    var checklist by remember { mutableStateOf(ModeratorSampleData.closeOutChecklist) }
    val headcount = headcountText.toIntOrNull()
    val mismatch = headcount != null && headcount != session.checkedInCount
    val canSubmit = session.tripEnded && headcount != null && (!mismatch || reason != null)
    if (!session.tripEnded) {
        TeInlineAlert(
            tone = AlertTone.Info,
            title = "Report opens when the trip ends",
            message = "Mark the vehicle departed, then check out every traveler on board.",
        )
    }
    ModField(label = "Checked in (system)", value = session.checkedInCount.toString())
    TeInput(
        value = headcountText,
        onValueChange = { value -> headcountText = value.filter(Char::isDigit).take(HEADCOUNT_MAX_DIGITS) },
        label = "Final headcount",
        supportingText = "Count every traveler on board.",
        keyboardType = TeKeyboardType.Number,
    )
    if (mismatch) {
        TeSelect(
            label = "Reason for the difference",
            options = ModeratorSampleData.differenceReasons,
            value = reason,
            onValueChange = { value -> reason = value },
            supportingText = "Required when the headcount and the check-ins differ.",
        )
    }
    TeTextarea(
        value = notes,
        onValueChange = { value -> notes = value.take(ModeratorSampleData.MAX_NOTE_LENGTH) },
        label = "Notes (optional)",
        minLines = 3,
        maxLength = ModeratorSampleData.MAX_NOTE_LENGTH,
    )
    TeChecklist(
        items = checklist,
        onToggle = { id ->
            checklist = checklist.map { item -> if (item.id == id) item.copy(checked = !item.checked) else item }
        },
        label = "Close-out checklist",
    )
    if (mismatch && reason == null) {
        ModNote("Choose a reason to submit.")
    }
    TeButton(
        text = "Submit report",
        enabled = canSubmit,
        onClick = { session.submitEndOfTrip() },
    )
}

@Composable
private fun SubmittedSummary() {
    val session = LocalModeratorSession.current
    TeInlineAlert(
        tone = AlertTone.Success,
        title = "Report submitted",
        message = "Read only. The organization can add a note.",
    )
    ModField(label = "Checked in (system)", value = session.checkedInCount.toString())
    ModField(label = "Trip status", value = session.tripStatus.word)
}
