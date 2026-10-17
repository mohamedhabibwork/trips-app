package com.tripsenjoy.screens.shared.common

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.painter.ColorPainter
import androidx.compose.ui.graphics.painter.Painter
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

// Placeholder values for the screen gallery. The docs give no sample amounts, names or counts,
// so these are neutral stand-ins. Replace them with real data when a screen is wired to an API.
const val PLACEHOLDER_CURRENCY = "SAR"
const val PLACEHOLDER_AMOUNT_MINOR = 0L

// Stand-in photo: a flat colour square. Real photos come from the media service.
fun placeholderPhoto(color: Color): Painter = ColorPainter(color)

// Scrollable body for a screen, with the theme spacing between blocks.
@Composable
fun ScreenBody(content: @Composable ColumnScope.() -> Unit) {
    Column(
        modifier = Modifier.fillMaxWidth().verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(TripsEnjoyTheme.spacing.space4),
        content = content,
    )
}

// Body copy for a screen, in the theme's body style.
@Composable
fun ScreenNote(text: String, modifier: Modifier = Modifier) {
    Text(
        text = text,
        style = TripsEnjoyTheme.typography.body,
        color = TripsEnjoyTheme.colors.ink,
        modifier = modifier,
    )
}
