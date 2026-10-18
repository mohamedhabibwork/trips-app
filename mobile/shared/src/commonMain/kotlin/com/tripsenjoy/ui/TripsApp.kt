package com.tripsenjoy.ui

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.LocalContentColor
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

// Side gutter for every screen at phone width (UI-04).
val TripsSideGutter: Dp = 16.dp

// Shared shell for every Trips Enjoy app and surface on Android, iOS and web.
// Applies the Trips Enjoy theme (light or dark, following the system), the text direction (UI-02)
// and the theme's ink as the default text and icon colour. It paints nothing, so it can be nested.
@Composable
fun TripsApp(rtl: Boolean = false, content: @Composable () -> Unit) {
    val direction = if (rtl) LayoutDirection.Rtl else LayoutDirection.Ltr
    CompositionLocalProvider(LocalLayoutDirection provides direction) {
        TripsEnjoyTheme {
            CompositionLocalProvider(LocalContentColor provides TripsEnjoyTheme.colors.ink, content = content)
        }
    }
}

// Root of every app entry point: TripsApp plus the theme surface painted behind the whole window,
// so no screen shows the platform's default white background or black text.
@Composable
fun TripsAppRoot(rtl: Boolean = false, content: @Composable () -> Unit) {
    TripsApp(rtl = rtl) {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = TripsEnjoyTheme.colors.surface,
            contentColor = TripsEnjoyTheme.colors.ink,
            content = content,
        )
    }
}
