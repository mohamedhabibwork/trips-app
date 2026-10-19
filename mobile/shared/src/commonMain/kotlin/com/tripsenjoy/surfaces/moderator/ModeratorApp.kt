package com.tripsenjoy.surfaces.moderator

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import com.tripsenjoy.auth.LocalAuthApiOrNull
import com.tripsenjoy.screens.ScreenHost
import com.tripsenjoy.screens.moderator.MODERATOR_ACCESS_ENDED_SCREENS
import com.tripsenjoy.screens.moderator.MODERATOR_SCREENS
import com.tripsenjoy.screens.moderator.ModeratorRoutes
import com.tripsenjoy.screens.moderator.common.LocalModeratorSession
import com.tripsenjoy.screens.moderator.common.ModeratorSession
import com.tripsenjoy.screens.shared.SHARED_SCREENS
import com.tripsenjoy.surfaces.AppShell
import com.tripsenjoy.surfaces.SurfaceRole

// Moderator app: the moderator screens hosted by ScreenHost, plus the traveler surface (AppShell).
// firstLaunch opens the install screen first. accessEnded replaces the vehicle home with the access notice.
@Composable
fun ModeratorApp(firstLaunch: Boolean = false, accessEnded: Boolean = false) {
    val startId = when {
        accessEnded -> ModeratorRoutes.ACCESS_ENDED
        firstLaunch -> ModeratorRoutes.INSTALL
        else -> ModeratorRoutes.VEHICLE_HOME
    }
    val screens = if (accessEnded) MODERATOR_ACCESS_ENDED_SCREENS else MODERATOR_SCREENS + SHARED_SCREENS
    AppShell(
        role = SurfaceRole.MODERATOR,
        roleContent = {
            val api = LocalAuthApiOrNull.current
            val session = remember(api) { ModeratorSession(api) }
            LaunchedEffect(session) { session.load() }
            Box(modifier = Modifier.fillMaxSize()) {
                CompositionLocalProvider(LocalModeratorSession provides session) {
                    ScreenHost(startId = startId, screens = screens, modifier = Modifier.fillMaxSize())
                }
            }
        },
    )
}

