package com.tripsenjoy.screens.parent.safety

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.screens.traveler.common.BackButton
import com.tripsenjoy.screens.traveler.common.LabelValue
import com.tripsenjoy.screens.traveler.common.ScreenPage
import com.tripsenjoy.screens.traveler.common.StatePreview
import com.tripsenjoy.screens.traveler.common.TravelerScreenState
import com.tripsenjoy.ui.components.AlertTone
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeInlineAlert
import com.tripsenjoy.ui.components.TeOption
import com.tripsenjoy.ui.components.TeSelect
import com.tripsenjoy.ui.components.TeTextarea

// SCR-PAR-05. Routed to the escalation contact (FR-PAR-07). If no escalation contact is configured the
// report is blocked (D-68, still open); that state is not part of this primary view.
// Submit stays disabled until a child, a contact preference and a description are given.
private val CHILD_OPTIONS = listOf(TeOption(value = "child-1", label = "Child name"))

private val CONTACT_OPTIONS = listOf(
    TeOption(value = "phone", label = "Phone"),
    TeOption(value = "email", label = "Email"),
)

@Composable
fun ChildSafetyReport() {
    var selectedChild by remember { mutableStateOf<String?>(null) }
    var contactChoice by remember { mutableStateOf<String?>(null) }
    var description by remember { mutableStateOf("") }
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
                options = CHILD_OPTIONS,
                value = selectedChild,
                onValueChange = { selectedChild = it },
                placeholder = "Select a linked child",
            )
            LabelValue(label = "Trip", value = "Trip name")
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
            BackButton(text = "Submit report", enabled = canSubmit)
            BackButton(text = "Cancel", variant = TeButtonVariant.Ghost)
        }
    }
}
