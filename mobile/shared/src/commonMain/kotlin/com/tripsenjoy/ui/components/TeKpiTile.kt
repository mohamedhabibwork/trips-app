package com.tripsenjoy.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.tripsenjoy.ui.theme.TripsEnjoyColors
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

enum class TrendDirection { Up, Down, Flat }

data class TeDelta(val direction: TrendDirection, val label: String)

private val DeltaIconSize = 16.dp
private const val QuarterTurnDegrees = 90f

// The arrow icon points towards the end of its viewport, so Up turns it a quarter turn anticlockwise and Down a quarter turn clockwise.
fun TrendDirection.iconName(): IconName = when (this) {
    TrendDirection.Up, TrendDirection.Down -> IconName.Arrow
    TrendDirection.Flat -> IconName.Minus
}

fun TrendDirection.rotationDegrees(): Float = when (this) {
    TrendDirection.Up -> -QuarterTurnDegrees
    TrendDirection.Down -> QuarterTurnDegrees
    TrendDirection.Flat -> 0f
}

private fun TrendDirection.tint(colors: TripsEnjoyColors): Color = when (this) {
    TrendDirection.Up -> colors.success
    TrendDirection.Down -> colors.danger
    TrendDirection.Flat -> colors.inkMuted
}

// Key figure with an optional change (arrow icon plus the words) and a hint. The tile reads as one element.
@Composable
fun TeKpiTile(
    label: String,
    value: String,
    delta: TeDelta? = null,
    hint: String? = null,
    modifier: Modifier = Modifier,
) {
    val colors = TripsEnjoyTheme.colors
    val spacing = TripsEnjoyTheme.spacing
    val shape = RoundedCornerShape(TripsEnjoyTheme.radius.md)
    Column(
        modifier = modifier
            .fillMaxWidth()
            .clip(shape)
            .background(colors.surfaceRaised, shape)
            .padding(spacing.space4)
            .semantics(mergeDescendants = true) {},
        verticalArrangement = Arrangement.spacedBy(spacing.space1),
    ) {
        Text(text = label, style = TripsEnjoyTheme.typography.caption, color = colors.inkMuted)
        Text(text = value, style = TripsEnjoyTheme.typography.h2, color = colors.ink)
        if (delta != null) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(spacing.space1),
            ) {
                TeIcon(
                    name = delta.direction.iconName(),
                    contentDescription = null,
                    tint = delta.direction.tint(colors),
                    size = DeltaIconSize,
                    modifier = Modifier.rotate(delta.direction.rotationDegrees()),
                )
                Text(text = delta.label, style = TripsEnjoyTheme.typography.caption, color = colors.ink)
            }
        }
        if (hint != null) {
            Text(text = hint, style = TripsEnjoyTheme.typography.caption, color = colors.inkMuted)
        }
    }
}
