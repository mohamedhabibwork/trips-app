package com.tripsenjoy.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

enum class AvatarSize(val diameter: Dp) {
    Small(32.dp),
    Medium(40.dp),
    Large(64.dp),
}

// Initials from the first letters of up to two words. An empty name gives "?".
fun avatarInitials(name: String): String {
    val initials = name
        .trim()
        .split(Regex("\\s+"))
        .filter { it.isNotEmpty() }
        .take(MaxInitialWords)
        .map { it.first().uppercaseChar() }
    return if (initials.isEmpty()) UnknownInitials else initials.joinToString(separator = "")
}

private const val MaxInitialWords = 2
private const val UnknownInitials = "?"

// Person's photo, or initials when there is no photo. The name is the accessible label for the whole avatar.
@Composable
fun TeAvatar(
    name: String,
    size: AvatarSize = AvatarSize.Medium,
    imagePainter: Painter? = null,
    modifier: Modifier = Modifier,
) {
    val colors = TripsEnjoyTheme.colors
    val initialsStyle = if (size == AvatarSize.Large) {
        TripsEnjoyTheme.typography.h3
    } else {
        TripsEnjoyTheme.typography.label
    }
    Box(
        modifier = modifier
            .size(size.diameter)
            .clip(CircleShape)
            .background(colors.infoSoft, CircleShape)
            .semantics(mergeDescendants = true) { contentDescription = name },
        contentAlignment = Alignment.Center,
    ) {
        if (imagePainter != null) {
            Image(
                painter = imagePainter,
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize(),
            )
        } else {
            Text(text = avatarInitials(name), style = initialsStyle, color = colors.ink)
        }
    }
}
