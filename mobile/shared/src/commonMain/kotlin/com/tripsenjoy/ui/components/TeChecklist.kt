package com.tripsenjoy.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

data class TeChecklistItem(
    val id: String,
    val label: String,
    val checked: Boolean,
    val note: String? = null,
)

// Word shown for a checklist row, so the state is not carried by the checkbox alone.
fun checklistStateWord(checked: Boolean): String = if (checked) "Checked" else "Not yet"

// Passenger or equipment checklist (driver app). Each row is a checkbox. The state word and the note are
// read as the checkbox description, for example "Checked. Bring a torch".
@Composable
fun TeChecklist(
    items: List<TeChecklistItem>,
    onToggle: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
) {
    val colors = TripsEnjoyTheme.colors
    val spacing = TripsEnjoyTheme.spacing
    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(spacing.space3),
    ) {
        Text(
            text = label,
            style = TripsEnjoyTheme.typography.h3,
            color = colors.ink,
            modifier = Modifier.semantics { heading() },
        )
        items.forEach { item ->
            TeCheckbox(
                checked = item.checked,
                onCheckedChange = { onToggle(item.id) },
                label = item.label,
                description = listOfNotNull(checklistStateWord(item.checked), item.note).joinToString(separator = ". "),
            )
        }
    }
}
