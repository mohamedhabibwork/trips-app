package com.tripsenjoy.screens.shared.states

import androidx.compose.runtime.Composable
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.shared.common.LocalSharedBannerState
import com.tripsenjoy.screens.shared.common.ScreenBody
import com.tripsenjoy.screens.shared.common.ScreenNote
import com.tripsenjoy.screens.shared.common.SharedBanner
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeMaintenanceNotice
import com.tripsenjoy.ui.components.TePageHeader

// SCR-SHR-07 Maintenance page. Shows the planned window and what still works. Retry is enabled once the window ends.
// During maintenance the notice shows as a banner over the host: the button below sets it and returns to the caller.
// Window length and notice period are proposed (D-303). The status page link waits for its address.
@Composable
fun MaintenancePage() {
    val nav = LocalScreenNavigator.current
    val banners = LocalSharedBannerState.current
    ScreenBody {
        TePageHeader(title = "Maintenance page", description = "Planned maintenance and what still works")
        TeMaintenanceNotice(
            title = "We are doing planned maintenance",
            description = "The service is paused for upgrades. Booking payments keep queueing during this time " +
                "and are applied afterwards.",
            estimatedReturn = "Planned window: start and end times in your time zone",
        )
        TeCard(header = "Still works") {
            ScreenNote(text = "Payment updates keep queueing and are applied when the service returns.")
        }
        TeButton(
            text = "Show as banner over the app",
            onClick = {
                banners.show(SharedBanner.Maintenance)
                nav.back()
            },
            variant = TeButtonVariant.Secondary,
        )
        TeButton(text = "Retry after the window ends", onClick = {}, enabled = false)
    }
}
