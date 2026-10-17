package com.tripsenjoy.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.selection.toggleable
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

private val SwitchTrackWidth = 52.dp
private val SwitchTrackHeight = 32.dp
private val SwitchThumbSize = 24.dp
private val SwitchTrackBorderWidth = 2.dp
private val SwitchTrackPadding = 4.dp
private const val SwitchDisabledAlpha = 0.38f

// On/off setting. The whole row toggles and the switch role carries the checked state.
// The label is always shown, so the setting is never identified by the track colour alone.
@Composable
fun TeSwitch(
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    label: String,
    enabled: Boolean = true,
    modifier: Modifier = Modifier,
) {
    val colors = TripsEnjoyTheme.colors
    val spacing = TripsEnjoyTheme.spacing
    val trackShape = RoundedCornerShape(TripsEnjoyTheme.radius.pill)
    val trackColor = if (checked) colors.accent else colors.controlBorder
    val thumbAlignment = if (checked) Alignment.CenterEnd else Alignment.CenterStart

    Row(
        modifier = modifier
            .fillMaxWidth()
            .defaultMinSize(minHeight = TeMinTouchTarget)
            .alpha(if (enabled) 1f else SwitchDisabledAlpha)
            .toggleable(
                value = checked,
                enabled = enabled,
                role = Role.Switch,
                onValueChange = onCheckedChange,
            )
            .teFocusRing(TripsEnjoyTheme.radius.sm),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(spacing.space3),
    ) {
        Text(
            text = label,
            style = TripsEnjoyTheme.typography.body,
            color = colors.ink,
            modifier = Modifier.weight(1f),
        )
        Box(
            modifier = Modifier
                .size(SwitchTrackWidth, SwitchTrackHeight)
                .clip(trackShape)
                .background(trackColor, trackShape)
                .border(SwitchTrackBorderWidth, trackColor, trackShape)
                .padding(SwitchTrackPadding),
            contentAlignment = thumbAlignment,
        ) {
            Box(
                modifier = Modifier
                    .size(SwitchThumbSize)
                    .clip(CircleShape)
                    .background(colors.surfaceRaised, CircleShape),
            )
        }
    }
}
