package com.tripsenjoy.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.semantics.Role
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

// Parent-app card for one child: photo or initials, the child's name, the trip, and the tracking status.
// The whole card is tappable when onOpen is given. Status is always word plus icon (TeTrackingStatus).
@Composable
fun TeChildCard(
    name: String,
    tripName: String,
    status: TrackingStatus,
    onOpen: (() -> Unit)? = null,
    photoPainter: Painter? = null,
    modifier: Modifier = Modifier,
) {
    val colors = TripsEnjoyTheme.colors
    val spacing = TripsEnjoyTheme.spacing
    val radius = TripsEnjoyTheme.radius.md
    val shape = RoundedCornerShape(radius)
    val tappable = if (onOpen != null) {
        Modifier.clickable(role = Role.Button, onClick = onOpen)
    } else {
        Modifier
    }
    Row(
        modifier = modifier
            .fillMaxWidth()
            .clip(shape)
            .background(colors.surfaceRaised, shape)
            .then(tappable)
            .teFocusRing(radius)
            .padding(spacing.space4),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(spacing.space3),
    ) {
        TeAvatar(name = name, size = AvatarSize.Medium, imagePainter = photoPainter)
        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(spacing.space1)) {
            Text(text = name, style = TripsEnjoyTheme.typography.h3, color = colors.ink)
            Text(text = tripName, style = TripsEnjoyTheme.typography.caption, color = colors.inkMuted)
            TeTrackingStatus(status = status)
        }
    }
}
