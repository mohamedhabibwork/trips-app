package com.tripsenjoy.screens.shared.prompts

import androidx.compose.runtime.Composable
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.moderator.common.icon
import com.tripsenjoy.screens.shared.common.LocalSharedBannerState
import com.tripsenjoy.screens.shared.common.ScreenBody
import com.tripsenjoy.screens.shared.common.ScreenNote
import com.tripsenjoy.screens.shared.common.SharedBanner
import com.tripsenjoy.ui.components.BadgeTone
import com.tripsenjoy.ui.components.IconName
import com.tripsenjoy.ui.components.TeBadge
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeOfflineBanner
import com.tripsenjoy.ui.components.TePageHeader

// SCR-SHR-08 Offline banner (gap, pending product sign-off). Shown over the current screen when the connection is lost.
// The banner names what still works and clears when the connection returns. The button below shows it over the app
// and returns to the caller; the banner's own retry clears it.
@Composable
fun OfflineBanner() {
    val nav = LocalScreenNavigator.current
    val banners = LocalSharedBannerState.current
    ScreenBody {
        TePageHeader(title = "Offline banner", description = "Shown over any screen when the connection is lost")
        TeOfflineBanner(
            message = "You are offline. Some actions are unavailable until the connection returns.",
            retryLabel = "Retry",
            onRetry = { banners.clear() },
        )
        TeBadge(label = "Offline", tone = BadgeTone.Warning, icon = IconName.Offline)
        TeCard(header = "Still available") {
            ScreenNote(text = "Information already on this screen can be read.")
        }
        TeCard(header = "Unavailable until online") {
            ScreenNote(text = "Saving changes and sending requests.")
        }
        TeButton(
            text = "Show as banner over the app",
            onClick = {
                banners.show(SharedBanner.Offline)
                nav.back()
            },
            variant = TeButtonVariant.Secondary,
        )
    }
}
