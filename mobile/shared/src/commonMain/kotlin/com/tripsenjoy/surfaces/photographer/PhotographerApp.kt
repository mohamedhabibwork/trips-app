package com.tripsenjoy.surfaces.photographer

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.tripsenjoy.screens.ScreenHost
import com.tripsenjoy.screens.photographer.PHOTOGRAPHER_SCREENS
import com.tripsenjoy.screens.photographer.common.PhotoScreenId
import com.tripsenjoy.screens.shared.SHARED_SCREENS
import com.tripsenjoy.screens.shared.common.LocalSharedBannerState
import com.tripsenjoy.screens.shared.common.SharedBannerOverlay
import com.tripsenjoy.screens.shared.common.rememberSharedBannerState
import com.tripsenjoy.surfaces.AppShell
import com.tripsenjoy.surfaces.SurfaceRole
import com.tripsenjoy.ui.components.TePageHeader
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

// Photographer app: its own screens plus the shared screens (AppShell).
// The role header stays on top. The screen host fills the remaining height, and the banner (maintenance or offline)
// is drawn over it.
@Composable
fun PhotographerApp() {
    val banners = rememberSharedBannerState()
    AppShell(
        role = SurfaceRole.PHOTOGRAPHER,
        roleContent = {
            Column(modifier = Modifier.fillMaxSize()) {
                TePageHeader(
                    title = SurfaceRole.PHOTOGRAPHER.title,
                    description = SurfaceRole.PHOTOGRAPHER.subtitle,
                )
                Box(modifier = Modifier.weight(1f).fillMaxSize()) {
                    CompositionLocalProvider(LocalSharedBannerState provides banners) {
                        ScreenHost(
                            startId = PhotoScreenId.STUDIO_HOME,
                            screens = PHOTOGRAPHER_SCREENS + SHARED_SCREENS,
                            modifier = Modifier.fillMaxSize(),
                        )
                    }
                    SharedBannerOverlay(
                        state = banners,
                        modifier = Modifier
                            .align(Alignment.TopCenter)
                            .padding(TripsEnjoyTheme.spacing.space4),
                    )
                }
            }
        },
    )
}
