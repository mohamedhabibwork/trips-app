package com.tripsenjoy.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.tripsenjoy.ui.theme.TripsEnjoyColors
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

enum class TeButtonVariant { Primary, Secondary, Ghost, Destructive }

enum class TeButtonSize { Default, Large }

internal val TeMinTouchTarget: Dp = 44.dp
private val LargeButtonMinHeight: Dp = 52.dp
private const val DisabledAlpha = 0.38f

// One primary button per view (README: Actions). Labels use on-primary on the primary fill.
// Destructive is for irreversible actions such as delete; the consequence must also be written out in the text.
@Composable
fun TeButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    variant: TeButtonVariant = TeButtonVariant.Primary,
    size: TeButtonSize = TeButtonSize.Default,
    enabled: Boolean = true,
) {
    val colors = TripsEnjoyTheme.colors
    val radius = TripsEnjoyTheme.radius.md
    val spacing = TripsEnjoyTheme.spacing
    val shape = RoundedCornerShape(radius)
    val large = size == TeButtonSize.Large
    val container = variant.containerColor(colors)
    val border = variant.borderColor(colors)

    Box(
        modifier = modifier
            .defaultMinSize(minHeight = if (large) LargeButtonMinHeight else TeMinTouchTarget)
            .alpha(if (enabled) 1f else DisabledAlpha)
            .clip(shape)
            .background(container, shape)
            .then(if (border != null) Modifier.border(1.dp, border, shape) else Modifier)
            .clickable(enabled = enabled, role = Role.Button, onClick = onClick)
            .teFocusRing(radius)
            .padding(
                horizontal = if (large) spacing.space6 else spacing.space4,
                vertical = if (large) spacing.space4 else spacing.space3,
            ),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = text,
            style = if (large) TripsEnjoyTheme.typography.bodyMedium else TripsEnjoyTheme.typography.label,
            color = variant.labelColor(colors),
        )
    }
}

private fun TeButtonVariant.containerColor(colors: TripsEnjoyColors): Color = when (this) {
    TeButtonVariant.Primary -> colors.primary
    TeButtonVariant.Secondary -> colors.surfaceRaised
    TeButtonVariant.Ghost -> Color.Transparent
    TeButtonVariant.Destructive -> colors.danger
}

private fun TeButtonVariant.borderColor(colors: TripsEnjoyColors): Color? = when (this) {
    TeButtonVariant.Primary -> null
    TeButtonVariant.Secondary -> colors.controlBorder
    TeButtonVariant.Ghost -> null
    TeButtonVariant.Destructive -> null
}

private fun TeButtonVariant.labelColor(colors: TripsEnjoyColors): Color = when (this) {
    TeButtonVariant.Primary -> colors.onPrimary
    TeButtonVariant.Secondary -> colors.ink
    TeButtonVariant.Ghost -> colors.primaryText
    TeButtonVariant.Destructive -> colors.onDanger
}
