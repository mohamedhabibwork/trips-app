package com.tripsenjoy.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

// Connection that will recover on its own. Warning strip with a retry action.
// The retry action is disabled while retrying, and its label changes so the state is not conveyed by colour alone.
@Composable
fun TeRetryBanner(
    message: String,
    onRetry: () -> Unit,
    retrying: Boolean,
    modifier: Modifier = Modifier,
    retryLabel: String = "Retry",
    retryingLabel: String = "Retrying",
) {
    val colors = TripsEnjoyTheme.colors
    val spacing = TripsEnjoyTheme.spacing
    val radius = TripsEnjoyTheme.radius.md
    Row(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(radius))
            .background(colors.warningSoft, RoundedCornerShape(radius))
            .semantics { liveRegion = LiveRegionMode.Polite }
            .padding(horizontal = spacing.space4, vertical = spacing.space3),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(spacing.space3),
    ) {
        TeIcon(name = IconName.Clock, contentDescription = null, tint = colors.warning)
        Text(
            text = message,
            style = TripsEnjoyTheme.typography.body,
            color = colors.ink,
            modifier = Modifier.weight(1f),
        )
        Box(
            modifier = Modifier
                .defaultMinSize(minWidth = TeMinTouchTarget, minHeight = TeMinTouchTarget)
                .clickable(enabled = !retrying, role = Role.Button, onClick = onRetry)
                .teFocusRing(radius)
                .padding(horizontal = spacing.space2),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                text = if (retrying) retryingLabel else retryLabel,
                style = TripsEnjoyTheme.typography.label,
                color = colors.warning,
            )
        }
    }
}
