package com.tripsenjoy.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

private val UnreadDotSize = 10.dp
private val UnreadDotTopInset = 6.dp

// One row in the notification centre (SCR-SHR-11). An unread item shows a dot and the visible word "Unread",
// so the state is not carried by the dot colour alone. The item reads as one element for screen readers.
@Composable
fun TeNotificationItem(
    title: String,
    body: String,
    time: String,
    unread: Boolean,
    onOpen: (() -> Unit)? = null,
    modifier: Modifier = Modifier,
) {
    val colors = TripsEnjoyTheme.colors
    val spacing = TripsEnjoyTheme.spacing
    val shape = RoundedCornerShape(TripsEnjoyTheme.radius.md)
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
            .teFocusRing(TripsEnjoyTheme.radius.md)
            .padding(spacing.space4)
            .semantics(mergeDescendants = true) {},
        verticalAlignment = Alignment.Top,
        horizontalArrangement = Arrangement.spacedBy(spacing.space3),
    ) {
        if (unread) {
            Box(
                modifier = Modifier
                    .padding(top = UnreadDotTopInset)
                    .size(UnreadDotSize)
                    .clip(CircleShape)
                    .background(colors.primaryText, CircleShape),
            )
        } else {
            Spacer(Modifier.size(UnreadDotSize))
        }
        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(spacing.space1)) {
            Text(
                text = title,
                style = if (unread) TripsEnjoyTheme.typography.bodyMedium else TripsEnjoyTheme.typography.body,
                color = colors.ink,
            )
            Text(text = body, style = TripsEnjoyTheme.typography.caption, color = colors.inkMuted)
            Row(horizontalArrangement = Arrangement.spacedBy(spacing.space2)) {
                Text(text = time, style = TripsEnjoyTheme.typography.caption, color = colors.inkMuted)
                if (unread) {
                    Text(text = UNREAD_WORD, style = TripsEnjoyTheme.typography.caption, color = colors.primaryText)
                }
            }
        }
    }
}

private const val UNREAD_WORD = "Unread"
