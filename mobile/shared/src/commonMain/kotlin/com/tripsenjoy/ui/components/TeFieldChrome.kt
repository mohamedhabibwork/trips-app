package com.tripsenjoy.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

private val FieldErrorIconSize = 16.dp
private val FieldBorderWidth = 1.dp

// Shared chrome for TeInput and TeTextarea: a visible label, the field, then the error or supporting text.
// The error line shows an icon plus text, never colour alone, and is announced assertively.
// counterText, when set, is drawn on its own line at the end edge (for example "12 / 280").
@Composable
internal fun TeFieldColumn(
    label: String,
    errorText: String?,
    supportingText: String?,
    modifier: Modifier,
    counterText: String? = null,
    field: @Composable () -> Unit,
) {
    val colors = TripsEnjoyTheme.colors
    val spacing = TripsEnjoyTheme.spacing
    Column(modifier = modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(spacing.space2)) {
        Text(text = label, style = TripsEnjoyTheme.typography.label, color = colors.ink)
        field()
        if (errorText != null) {
            Row(
                modifier = Modifier.semantics { liveRegion = LiveRegionMode.Assertive },
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(spacing.space2),
            ) {
                TeIcon(
                    name = IconName.Alert,
                    contentDescription = null,
                    tint = colors.danger,
                    size = FieldErrorIconSize,
                )
                Text(text = errorText, style = TripsEnjoyTheme.typography.caption, color = colors.danger)
            }
        } else if (supportingText != null) {
            Text(text = supportingText, style = TripsEnjoyTheme.typography.caption, color = colors.inkMuted)
        }
        if (counterText != null) {
            Text(
                text = counterText,
                style = TripsEnjoyTheme.typography.caption,
                color = colors.inkMuted,
                textAlign = TextAlign.End,
                modifier = Modifier.fillMaxWidth(),
            )
        }
    }
}

// Fill, border and corner radius shared by every text field. Apply the focus ring and padding after this.
@Composable
internal fun Modifier.teFieldSurface(): Modifier {
    val colors = TripsEnjoyTheme.colors
    val shape = RoundedCornerShape(TripsEnjoyTheme.radius.sm)
    return this
        .clip(shape)
        .background(colors.surfaceRaised, shape)
        .border(FieldBorderWidth, colors.controlBorder, shape)
}
