package com.tripsenjoy.surfaces

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeContentPadding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import com.tripsenjoy.ui.TripsApp
import com.tripsenjoy.ui.TripsSideGutter

// Shared screen frame for every surface app, on Android, iOS and web.
// Applies the Trips theme and the 16 dp side gutter (UI-04).
@Composable
fun SurfaceScreen(
    title: String,
    subtitle: String,
    rtl: Boolean = false,
    content: @Composable ColumnScope.() -> Unit = {},
) {
    TripsApp(rtl = rtl) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .safeContentPadding()
                .padding(horizontal = TripsSideGutter),
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.SemiBold,
            )
            Text(text = subtitle, style = MaterialTheme.typography.bodyLarge)
            content()
        }
    }
}
