package com.tripsenjoy.surfaces.driver

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import com.tripsenjoy.auth.LocalAuthApiOrNull
import com.tripsenjoy.screens.ScreenHost
import com.tripsenjoy.screens.driver.DRIVER_LAB_GATE_SCREENS
import com.tripsenjoy.screens.driver.DRIVER_SCREENS
import com.tripsenjoy.screens.driver.DriverRoutes
import com.tripsenjoy.screens.driver.common.DriverSession
import com.tripsenjoy.screens.driver.common.LocalDriverSession
import com.tripsenjoy.screens.shared.SHARED_SCREENS
import com.tripsenjoy.surfaces.AppShell
import com.tripsenjoy.surfaces.SurfaceRole

// Driver app: the driver screens hosted by ScreenHost, plus the traveler surface (AppShell).
// When a lab test is pending (labTestPending), the app opens on the lab-test gate and offers only the lab screens.
@Composable
fun DriverApp(labTestPending: Boolean = false) {
    val startId = if (labTestPending) DriverRoutes.LAB_GATE else DriverRoutes.HOME
    val screens = if (labTestPending) DRIVER_LAB_GATE_SCREENS else DRIVER_SCREENS + SHARED_SCREENS
    AppShell(
        role = SurfaceRole.DRIVER,
        roleContent = {
            val api = LocalAuthApiOrNull.current
            val session = remember(api) { DriverSession(api) }
            LaunchedEffect(session) { session.load() }
            Box(modifier = Modifier.fillMaxSize()) {
                CompositionLocalProvider(LocalDriverSession provides session) {
                    ScreenHost(startId = startId, screens = screens, modifier = Modifier.fillMaxSize())
                }
            }
        },
    )
}

