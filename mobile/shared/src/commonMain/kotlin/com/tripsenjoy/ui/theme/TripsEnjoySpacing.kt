package com.tripsenjoy.ui.theme

import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

// Spacing and radius tokens from the Trips Enjoy design tokens (derived 4px scale).
// The token file defines space-1, 2, 3, 4, 6, 8 and 12 only. There is no space-5, 7 or 9 to 11.
// radius-icon (22%) is the app-icon shape and is not used for UI components.

object TripsEnjoySpacing {
    val space1: Dp = 4.dp
    val space2: Dp = 8.dp
    val space3: Dp = 12.dp
    val space4: Dp = 16.dp
    val space6: Dp = 24.dp
    val space8: Dp = 32.dp
    val space12: Dp = 48.dp
}

object TripsEnjoyRadius {
    val sm: Dp = 8.dp
    val md: Dp = 12.dp
    val lg: Dp = 20.dp
    val pill: Dp = 999.dp
}
