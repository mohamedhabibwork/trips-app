package com.tripsenjoy.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.semantics.Role
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

data class TePhoto(val id: String, val painter: Painter, val alt: String)

// Grid of photos for a portfolio or album. Every photo needs alt text (the parameter is not optional).
// Photos are square crops. When onOpen is given, each photo is a button that passes its id.
@Composable
fun TePhotoGrid(
    photos: List<TePhoto>,
    onOpen: ((String) -> Unit)? = null,
    columns: Int = 2,
    modifier: Modifier = Modifier,
) {
    require(columns >= 1) { "columns must be at least 1" }
    val spacing = TripsEnjoyTheme.spacing
    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(spacing.space2),
    ) {
        photos.chunked(columns).forEach { rowPhotos ->
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(spacing.space2),
            ) {
                rowPhotos.forEach { photo ->
                    TePhotoCell(photo = photo, onOpen = onOpen, modifier = Modifier.weight(1f))
                }
                repeat(columns - rowPhotos.size) {
                    Spacer(Modifier.weight(1f))
                }
            }
        }
    }
}

@Composable
private fun TePhotoCell(
    photo: TePhoto,
    onOpen: ((String) -> Unit)?,
    modifier: Modifier = Modifier,
) {
    val radius = TripsEnjoyTheme.radius.md
    val shape = RoundedCornerShape(radius)
    val open = onOpen
    val tappable = if (open != null) {
        Modifier.clickable(role = Role.Button, onClick = { open(photo.id) })
    } else {
        Modifier
    }
    Image(
        painter = photo.painter,
        contentDescription = photo.alt,
        contentScale = ContentScale.Crop,
        modifier = modifier
            .aspectRatio(1f)
            .clip(shape)
            .then(tappable)
            .teFocusRing(radius),
    )
}
