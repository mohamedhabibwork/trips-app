package com.tripsenjoy.surfaces.photographer

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.tripsenjoy.auth.LocalAuthApiOrNull
import com.tripsenjoy.screens.ScreenHost
import com.tripsenjoy.screens.photographer.PHOTOGRAPHER_SCREENS
import com.tripsenjoy.screens.photographer.common.LocalPhotographerSession
import com.tripsenjoy.screens.photographer.common.PhotoScreenId
import com.tripsenjoy.screens.photographer.common.PhotographerSession
import com.tripsenjoy.screens.shared.SHARED_SCREENS
import com.tripsenjoy.screens.shared.common.LocalSharedBannerState
import com.tripsenjoy.screens.shared.common.SharedBannerOverlay
import com.tripsenjoy.screens.shared.common.rememberSharedBannerState
import com.tripsenjoy.surfaces.AppShell
import com.tripsenjoy.surfaces.SurfaceRole
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

// Photographer app: its own screens plus the shared screens (AppShell).
// The screen host fills the remaining height, and the banner (maintenance or offline) is drawn over it.
@Composable
fun PhotographerApp() {
    val banners = rememberSharedBannerState()
    AppShell(
        role = SurfaceRole.PHOTOGRAPHER,
        roleContent = {
            val api = LocalAuthApiOrNull.current
            val session = remember(api) { PhotographerSession(api) }
            LaunchedEffect(session) { session.load() }
            Box(modifier = Modifier.fillMaxSize()) {
                CompositionLocalProvider(
                    LocalSharedBannerState provides banners,
                    LocalPhotographerSession provides session,
                ) {
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
        },
    )
}

