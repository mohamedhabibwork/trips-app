package com.tripsenjoy.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

// Passing confirmation or a failed background action. Presentational only: no timers, the caller decides when to hide it.
// Glass capsule, announced politely. The dismiss label is a parameter so it can be localised.
@Composable
fun TeToast(
    message: String,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier,
    dismissLabel: String = "Dismiss",
    reduceTransparency: Boolean = false,
) {
    val colors = TripsEnjoyTheme.colors
    val spacing = TripsEnjoyTheme.spacing
    TeGlassSurface(
        modifier = modifier
            .fillMaxWidth()
            .semantics { liveRegion = LiveRegionMode.Polite },
        reduceTransparency = reduceTransparency,
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = spacing.space4, vertical = spacing.space2),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = message,
                style = TripsEnjoyTheme.typography.bodyMedium,
                color = colors.ink,
                modifier = Modifier.weight(1f),
            )
            Box(
                modifier = Modifier
                    .defaultMinSize(minWidth = TeMinTouchTarget, minHeight = TeMinTouchTarget)
                    .clickable(role = Role.Button, onClick = onDismiss)
                    .teFocusRing(TripsEnjoyTheme.radius.pill)
                    .padding(horizontal = spacing.space3),
                contentAlignment = Alignment.Center,
            ) {
                Text(text = dismissLabel, style = TripsEnjoyTheme.typography.label, color = colors.primaryText)
            }
        }
    }
}
