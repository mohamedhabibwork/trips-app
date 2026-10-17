package com.tripsenjoy.ui

import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

// Side gutter for every screen at phone width (UI-04).
val TripsSideGutter: Dp = 16.dp

// Shared shell for every Trips Enjoy app and surface on Android, iOS and web.
// Applies the Trips Enjoy theme (light or dark, following the system) and the text direction (UI-02).
@Composable
fun TripsApp(rtl: Boolean = false, content: @Composable () -> Unit) {
    val direction = if (rtl) LayoutDirection.Rtl else LayoutDirection.Ltr
    CompositionLocalProvider(LocalLayoutDirection provides direction) {
        TripsEnjoyTheme(content = content)
    }
}
