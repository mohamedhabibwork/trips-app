package com.tripsenjoy.screens.shared.common

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.Modifier
import com.tripsenjoy.ui.components.AlertTone
import com.tripsenjoy.ui.components.TeInlineAlert
import com.tripsenjoy.ui.components.TeOfflineBanner

enum class SharedBanner { None, Offline, Maintenance }

// Which app-wide banner is showing. The surface that hosts the screens owns one and draws it over the current screen.
class SharedBannerState {
    var banner: SharedBanner by mutableStateOf(SharedBanner.None)
        private set

    fun show(banner: SharedBanner) {
        this.banner = banner
    }

    fun clear() {
        banner = SharedBanner.None
    }
}

// Provided by the surface above its ScreenHost. Without a provider no banner is drawn, so the lookup never fails.
val LocalSharedBannerState = staticCompositionLocalOf { SharedBannerState() }

@Composable
fun rememberSharedBannerState(): SharedBannerState = remember { SharedBannerState() }

// Banner over the host (SCR-SHR-07, SCR-SHR-08). Offline shows the connection message with retry, which clears it.
// Maintenance shows the planned window as a warning. Nothing is drawn when no banner is active.
@Composable
fun SharedBannerOverlay(state: SharedBannerState, modifier: Modifier = Modifier) {
    when (state.banner) {
        SharedBanner.None -> Unit
        SharedBanner.Offline -> TeOfflineBanner(
            message = "You are offline. Saving and sending are unavailable until the connection returns.",
            retryLabel = "Retry",
            onRetry = { state.clear() },
            modifier = modifier,
        )
        SharedBanner.Maintenance -> TeInlineAlert(
            tone = AlertTone.Warning,
            title = "Planned maintenance",
            message = "Some actions are paused. Payment updates keep queueing and are applied afterwards.",
            modifier = modifier,
        )
    }
}
