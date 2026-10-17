package com.tripsenjoy.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import com.tripsenjoy.ui.theme.TripsEnjoyColors
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

enum class AlertTone { Error, Warning, Info, Success }

// Section or form problem. Icon plus title, with an optional message. Errors are announced assertively, the rest politely.
// The icon sits beside the title text, so it is decorative (contentDescription = null).
@Composable
fun TeInlineAlert(
    tone: AlertTone,
    title: String,
    modifier: Modifier = Modifier,
    message: String? = null,
) {
    val colors = TripsEnjoyTheme.colors
    val spacing = TripsEnjoyTheme.spacing
    val content = tone.contentColor(colors)
    Row(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(TripsEnjoyTheme.radius.md))
            .background(tone.containerColor(colors))
            .semantics { liveRegion = tone.liveRegion() }
            .padding(spacing.space4),
        verticalAlignment = Alignment.Top,
    ) {
        TeIcon(name = tone.icon(), contentDescription = null, tint = content)
        Spacer(Modifier.width(spacing.space3))
        Column {
            Text(text = title, style = TripsEnjoyTheme.typography.label, color = content)
            if (message != null) {
                Text(text = message, style = TripsEnjoyTheme.typography.body, color = colors.ink)
            }
        }
    }
}

fun AlertTone.icon(): IconName = when (this) {
    AlertTone.Error -> IconName.Alert
    AlertTone.Warning -> IconName.Alert
    AlertTone.Info -> IconName.Info
    AlertTone.Success -> IconName.Check
}

fun AlertTone.liveRegion(): LiveRegionMode = when (this) {
    AlertTone.Error -> LiveRegionMode.Assertive
    AlertTone.Warning -> LiveRegionMode.Polite
    AlertTone.Info -> LiveRegionMode.Polite
    AlertTone.Success -> LiveRegionMode.Polite
}

private fun AlertTone.containerColor(colors: TripsEnjoyColors): Color = when (this) {
    AlertTone.Error -> colors.dangerSoft
    AlertTone.Warning -> colors.warningSoft
    AlertTone.Info -> colors.infoSoft
    AlertTone.Success -> colors.successSoft
}

private fun AlertTone.contentColor(colors: TripsEnjoyColors): Color = when (this) {
    AlertTone.Error -> colors.danger
    AlertTone.Warning -> colors.warning
    AlertTone.Info -> colors.ink
    AlertTone.Success -> colors.success
}
