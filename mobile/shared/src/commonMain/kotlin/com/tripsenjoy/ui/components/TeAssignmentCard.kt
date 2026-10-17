package com.tripsenjoy.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
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

private val AssignmentIconSize = 20.dp

// Driver's view of one trip assignment: trip name, route, departure time and vehicle.
// Each line has an icon and its own words. The optional action is the single primary action on the card.
@Composable
fun TeAssignmentCard(
    tripName: String,
    route: String,
    departure: String,
    vehicle: String,
    actionLabel: String? = null,
    onAction: (() -> Unit)? = null,
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
        verticalArrangement = Arrangement.spacedBy(spacing.space3),
    ) {
        Text(
            text = tripName,
            style = TripsEnjoyTheme.typography.h3,
            color = colors.ink,
            modifier = Modifier.semantics { heading() },
        )
        AssignmentLine(icon = IconName.Route, text = route)
        AssignmentLine(icon = IconName.Clock, text = departure)
        AssignmentLine(icon = IconName.Bus, text = vehicle)
        if (actionLabel != null && onAction != null) {
            TeButton(text = actionLabel, onClick = onAction, modifier = Modifier.fillMaxWidth())
        }
    }
}

@Composable
private fun AssignmentLine(icon: IconName, text: String) {
    val colors = TripsEnjoyTheme.colors
    Row(
        verticalAlignment = Alignment.Top,
        horizontalArrangement = Arrangement.spacedBy(TripsEnjoyTheme.spacing.space2),
    ) {
        TeIcon(
            name = icon,
            contentDescription = null,
            tint = colors.inkMuted,
            size = AssignmentIconSize,
        )
        Text(text = text, style = TripsEnjoyTheme.typography.body, color = colors.ink)
    }
}
