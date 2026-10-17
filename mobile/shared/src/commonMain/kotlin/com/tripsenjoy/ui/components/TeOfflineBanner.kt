package com.tripsenjoy.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

// Banner over the current screen when the connection is lost (SCR-SHR-08). Says what happened in words.
// The retry action is optional and shown only when both retryLabel and onRetry are given.
// Polite live region: the message is announced without interrupting the user.
@Composable
fun TeOfflineBanner(
    message: String,
    retryLabel: String? = null,
    onRetry: (() -> Unit)? = null,
    modifier: Modifier = Modifier,
) {
    val colors = TripsEnjoyTheme.colors
    val spacing = TripsEnjoyTheme.spacing
    val shape = RoundedCornerShape(TripsEnjoyTheme.radius.md)
    Row(
        modifier = modifier
            .fillMaxWidth()
            .clip(shape)
            .background(colors.warningSoft, shape)
            .semantics { liveRegion = LiveRegionMode.Polite }
            .padding(horizontal = spacing.space4, vertical = spacing.space3),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(spacing.space3),
    ) {
        TeIcon(name = IconName.Offline, contentDescription = null, tint = colors.warning)
        Text(
            text = message,
            style = TripsEnjoyTheme.typography.body,
            color = colors.ink,
            modifier = Modifier.weight(1f),
        )
        if (retryLabel != null && onRetry != null) {
            TeButton(text = retryLabel, onClick = onRetry, variant = TeButtonVariant.Ghost)
        }
    }
}
