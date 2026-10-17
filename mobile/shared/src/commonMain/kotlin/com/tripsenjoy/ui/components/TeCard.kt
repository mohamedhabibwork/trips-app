package com.tripsenjoy.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

private val CardElevation = 2.dp

// Surface for grouping related content: optional header, body, and optional footer.
// Sits on surface-raised with the card radius. The header is a heading for screen readers.
@Composable
fun TeCard(
    modifier: Modifier = Modifier,
    padding: Dp = 16.dp,
    header: String? = null,
    footer: @Composable (() -> Unit)? = null,
    content: @Composable ColumnScope.() -> Unit,
) {
    val colors = TripsEnjoyTheme.colors
    val spacing = TripsEnjoyTheme.spacing
    val shape = RoundedCornerShape(TripsEnjoyTheme.radius.md)
    Column(
        modifier = modifier
            .fillMaxWidth()
            .shadow(CardElevation, shape, ambientColor = colors.cardShadow, spotColor = colors.cardShadow)
            .clip(shape)
            .background(colors.surfaceRaised, shape)
            .padding(padding),
        verticalArrangement = Arrangement.spacedBy(spacing.space3),
    ) {
        if (header != null) {
            Text(
                text = header,
                style = TripsEnjoyTheme.typography.h3,
                color = colors.ink,
                modifier = Modifier.semantics { heading() },
            )
        }
        content()
        if (footer != null) {
            footer()
        }
    }
}
