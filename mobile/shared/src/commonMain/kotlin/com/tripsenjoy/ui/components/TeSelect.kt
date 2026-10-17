package com.tripsenjoy.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.error
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

data class TeOption(val value: String, val label: String)

private val SelectArrowSize = 20.dp
private val SelectArrowTurnDegrees = 90f
private val SelectErrorIconSize = 16.dp

// Dropdown styled like TeInput: visible label, bordered control, and an error line with an icon and text.
// The chosen option's label is shown on the control, so the value is never carried by colour alone.
@Composable
fun TeSelect(
    label: String,
    options: List<TeOption>,
    value: String?,
    onValueChange: (String) -> Unit,
    error: String? = null,
    supportingText: String? = null,
    placeholder: String = "Select an option",
    modifier: Modifier = Modifier,
) {
    val colors = TripsEnjoyTheme.colors
    val spacing = TripsEnjoyTheme.spacing
    val radius = TripsEnjoyTheme.radius.sm
    val shape = RoundedCornerShape(radius)
    val errorText: String? = error
    val selectedLabel = options.firstOrNull { it.value == value }?.label
    var expanded by remember { mutableStateOf(false) }

    Column(modifier = modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(spacing.space2)) {
        Text(text = label, style = TripsEnjoyTheme.typography.label, color = colors.ink)
        Box(modifier = Modifier.fillMaxWidth()) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .defaultMinSize(minHeight = TeMinTouchTarget)
                    .clip(shape)
                    .background(colors.surfaceRaised, shape)
                    .border(1.dp, if (errorText != null) colors.danger else colors.controlBorder, shape)
                    .teFocusRing(radius)
                    .clickable(role = Role.DropdownList, onClick = { expanded = true })
                    .padding(horizontal = spacing.space4, vertical = spacing.space3)
                    .semantics { if (errorText != null) this.error(errorText) },
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(spacing.space2),
            ) {
                Text(
                    text = selectedLabel ?: placeholder,
                    style = TripsEnjoyTheme.typography.body,
                    color = if (selectedLabel != null) colors.ink else colors.inkMuted,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f),
                )
                TeIcon(
                    name = IconName.Arrow,
                    contentDescription = null,
                    tint = colors.inkMuted,
                    size = SelectArrowSize,
                    modifier = Modifier.rotate(SelectArrowTurnDegrees),
                )
            }
            DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
                options.forEach { option ->
                    DropdownMenuItem(
                        text = {
                            Text(
                                text = option.label,
                                style = TripsEnjoyTheme.typography.body,
                                color = colors.ink,
                            )
                        },
                        onClick = {
                            expanded = false
                            onValueChange(option.value)
                        },
                    )
                }
            }
        }
        if (errorText != null) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(spacing.space2),
            ) {
                TeIcon(
                    name = IconName.Alert,
                    contentDescription = null,
                    tint = colors.danger,
                    size = SelectErrorIconSize,
                )
                Text(text = errorText, style = TripsEnjoyTheme.typography.caption, color = colors.danger)
            }
        } else if (supportingText != null) {
            Text(text = supportingText, style = TripsEnjoyTheme.typography.caption, color = colors.inkMuted)
        }
    }
}
