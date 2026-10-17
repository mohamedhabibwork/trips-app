package com.tripsenjoy.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

// Selectable chip for activities and filters. The selected state uses the accent colour.
@Composable
fun TeChip(
    label: String,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
) {
    val colors = TripsEnjoyTheme.colors
    val radius = TripsEnjoyTheme.radius.sm
    val shape = RoundedCornerShape(radius)
    val container = if (selected) colors.accent else colors.surfaceRaised
    val borderColor = if (selected) colors.accent else colors.controlBorder
    val labelColor = if (selected) colors.brandNavy else colors.ink

    Box(
        modifier = modifier
            .defaultMinSize(minHeight = TeMinTouchTarget)
            .clip(shape)
            .background(container, shape)
            .border(1.dp, borderColor, shape)
            .selectable(selected = selected, enabled = enabled, role = Role.Checkbox, onClick = onClick)
            .teFocusRing(radius)
            .padding(horizontal = TripsEnjoyTheme.spacing.space4, vertical = TripsEnjoyTheme.spacing.space2),
        contentAlignment = Alignment.Center,
    ) {
        Text(text = label, style = TripsEnjoyTheme.typography.label, color = labelColor)
    }
}
