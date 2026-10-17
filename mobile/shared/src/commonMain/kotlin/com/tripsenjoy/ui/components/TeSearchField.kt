package com.tripsenjoy.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextDirection
import androidx.compose.ui.unit.dp
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

// Search input with a leading search icon and a clear control that appears once there is text.
// The label is the accessible name of the field. The placeholder is visible only while the field is empty.
@Composable
fun TeSearchField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    placeholder: String? = null,
    clearLabel: String = "Clear",
    modifier: Modifier = Modifier,
) {
    val colors = TripsEnjoyTheme.colors
    val spacing = TripsEnjoyTheme.spacing
    val radius = TripsEnjoyTheme.radius.sm
    val shape = RoundedCornerShape(radius)

    Row(
        modifier = modifier
            .fillMaxWidth()
            .defaultMinSize(minHeight = TeMinTouchTarget)
            .clip(shape)
            .background(colors.surfaceRaised, shape)
            .border(1.dp, colors.controlBorder, shape)
            .teFocusRing(radius)
            .padding(start = spacing.space3, end = spacing.space1, top = spacing.space1, bottom = spacing.space1),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(spacing.space2),
    ) {
        TeIcon(name = IconName.Search, contentDescription = null, tint = colors.inkMuted)
        Box(modifier = Modifier.weight(1f)) {
            BasicTextField(
                value = value,
                onValueChange = onValueChange,
                singleLine = true,
                textStyle = TripsEnjoyTheme.typography.body.copy(
                    color = colors.ink,
                    textDirection = TextDirection.Content,
                ),
                cursorBrush = SolidColor(colors.primaryText),
                modifier = Modifier
                    .fillMaxWidth()
                    .semantics { contentDescription = label },
                decorationBox = { inner ->
                    if (value.isEmpty() && placeholder != null) {
                        Text(
                            text = placeholder,
                            style = TripsEnjoyTheme.typography.body,
                            color = colors.inkMuted,
                        )
                    }
                    inner()
                },
            )
        }
        if (value.isNotEmpty()) {
            Box(
                modifier = Modifier
                    .defaultMinSize(minWidth = TeMinTouchTarget, minHeight = TeMinTouchTarget)
                    .clickable(role = Role.Button, onClick = { onValueChange("") }),
                contentAlignment = Alignment.Center,
            ) {
                TeIcon(name = IconName.Close, contentDescription = clearLabel, tint = colors.ink)
            }
        }
    }
}
