package com.tripsenjoy.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

private val TripCardImageHeight = 160.dp
private val TripCardElevation = 2.dp

// The unit of every trip list. The image is optional; pass imageDescription when the photo conveys information.
// The status slot holds a TeTrackingStatus or TeBadge. Pass onClick to make the whole card tappable.
@Composable
fun TeTripCard(
    title: String,
    meta: String,
    modifier: Modifier = Modifier,
    image: Painter? = null,
    imageDescription: String? = null,
    status: (@Composable () -> Unit)? = null,
    onClick: (() -> Unit)? = null,
) {
    val colors = TripsEnjoyTheme.colors
    val spacing = TripsEnjoyTheme.spacing
    val radius = TripsEnjoyTheme.radius.md
    val shape = RoundedCornerShape(radius)
    val tappable = if (onClick != null) {
        Modifier.clickable(role = Role.Button, onClick = onClick)
    } else {
        Modifier
    }

    Column(
        modifier = modifier
            .fillMaxWidth()
            .shadow(TripCardElevation, shape, ambientColor = colors.cardShadow, spotColor = colors.cardShadow)
            .clip(shape)
            .background(colors.surfaceRaised, shape)
            .then(tappable)
            .teFocusRing(radius),
    ) {
        if (image != null) {
            Image(
                painter = image,
                contentDescription = imageDescription,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxWidth().height(TripCardImageHeight),
            )
        }
        Column(modifier = Modifier.padding(spacing.space4), verticalArrangement = Arrangement.spacedBy(spacing.space1)) {
            Text(text = title, style = TripsEnjoyTheme.typography.h3, color = colors.ink)
            Text(text = meta, style = TripsEnjoyTheme.typography.caption, color = colors.inkMuted)
            if (status != null) {
                Spacer(Modifier.height(spacing.space2))
                status()
            }
        }
    }
}
