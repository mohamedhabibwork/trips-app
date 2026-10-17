package com.tripsenjoy.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.selection.toggleable
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

private val CheckboxBoxSize = 24.dp
private val CheckboxCorner = 6.dp
private val CheckboxBorderWidth = 2.dp
private val CheckboxIconSize = 16.dp
private const val CheckboxDisabledAlpha = 0.38f

// Checkbox for one option. The checked state is set on the Checkbox role. Check mark plus filled box,
// so checked is not shown by colour alone. Optional description explains the option.
@Composable
fun TeCheckbox(
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    label: String,
    enabled: Boolean = true,
    description: String? = null,
    modifier: Modifier = Modifier,
) {
    val colors = TripsEnjoyTheme.colors
    val spacing = TripsEnjoyTheme.spacing
    val boxShape = RoundedCornerShape(CheckboxCorner)
    val fill = if (checked) colors.accent else colors.surfaceRaised
    val borderColor = if (checked) colors.accent else colors.controlBorder

    Row(
        modifier = modifier
            .fillMaxWidth()
            .defaultMinSize(minHeight = TeMinTouchTarget)
            .alpha(if (enabled) 1f else CheckboxDisabledAlpha)
            .toggleable(
                value = checked,
                enabled = enabled,
                role = Role.Checkbox,
                onValueChange = onCheckedChange,
            )
            .teFocusRing(TripsEnjoyTheme.radius.sm),
        verticalAlignment = Alignment.Top,
        horizontalArrangement = Arrangement.spacedBy(spacing.space3),
    ) {
        Box(
            modifier = Modifier
                .size(CheckboxBoxSize)
                .clip(boxShape)
                .background(fill, boxShape)
                .border(CheckboxBorderWidth, borderColor, boxShape),
            contentAlignment = Alignment.Center,
        ) {
            if (checked) {
                TeIcon(
                    name = IconName.Check,
                    contentDescription = null,
                    tint = colors.brandNavy,
                    size = CheckboxIconSize,
                )
            }
        }
        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(spacing.space1)) {
            Text(text = label, style = TripsEnjoyTheme.typography.body, color = colors.ink)
            if (description != null) {
                Text(text = description, style = TripsEnjoyTheme.typography.caption, color = colors.inkMuted)
            }
        }
    }
}
