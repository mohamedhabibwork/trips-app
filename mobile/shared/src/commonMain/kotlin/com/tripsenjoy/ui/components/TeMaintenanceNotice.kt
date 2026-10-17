package com.tripsenjoy.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

private val MaintenanceIconSize = 20.dp

// Planned-maintenance page content (SCR-SHR-07). Pass the window in the caller's words and time zone,
// for example "Back by 18:00 on 18 October". The return time is optional, but when shown it carries a clock icon.
@Composable
fun TeMaintenanceNotice(
    title: String,
    description: String,
    estimatedReturn: String? = null,
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
            .border(1.dp, colors.hairline, shape)
            .padding(spacing.space4),
        verticalArrangement = Arrangement.spacedBy(spacing.space2),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(spacing.space2)) {
            TeIcon(name = IconName.Info, contentDescription = null, tint = colors.warning, size = MaintenanceIconSize)
            Text(
                text = title,
                style = TripsEnjoyTheme.typography.h3,
                color = colors.ink,
                modifier = Modifier.semantics { heading() },
            )
        }
        Text(text = description, style = TripsEnjoyTheme.typography.body, color = colors.inkMuted)
        if (estimatedReturn != null) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(spacing.space2)) {
                TeIcon(name = IconName.Clock, contentDescription = null, tint = colors.ink, size = MaintenanceIconSize)
                Text(text = estimatedReturn, style = TripsEnjoyTheme.typography.label, color = colors.ink)
            }
        }
    }
}
