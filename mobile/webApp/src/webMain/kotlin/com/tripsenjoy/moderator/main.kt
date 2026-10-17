package com.tripsenjoy.moderator

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.window.ComposeViewport
import com.tripsenjoy.surfaces.SurfaceRole
import com.tripsenjoy.surfaces.driver.DriverApp
import com.tripsenjoy.surfaces.moderator.ModeratorApp
import com.tripsenjoy.surfaces.photographer.PhotographerApp
import com.tripsenjoy.traveler.App
import com.tripsenjoy.ui.TripsApp

// Test harness for the mobile apps in a browser: pick an app to run its screens.
// Production web is apps/web, not this module.
@OptIn(ExperimentalComposeUiApi::class)
fun main() {
    ComposeViewport {
        TestHarness(SurfaceRole.MODERATOR)
    }
}

@Composable
fun TestHarness(uiSelected: SurfaceRole?) {
    var selected by remember { mutableStateOf<SurfaceRole?>(uiSelected?:SurfaceRole.MODERATOR) }

    TripsApp {
        val role = selected
        if (role == null) {
            Column(modifier = Modifier.fillMaxSize()) {
                Text("Mobile test harness")
                SurfaceRole.entries.forEach { entry ->
                    Button(onClick = { selected = entry }) { Text(entry.title) }
                }
            }
        } else {
            Column(modifier = Modifier.fillMaxSize()) {
                TextButton(onClick = { selected = null }) { Text("Back to apps") }
                Box(modifier = Modifier.fillMaxWidth().weight(1f)) {
                    when (role) {
                        SurfaceRole.TRAVELER -> App()
                        SurfaceRole.DRIVER -> DriverApp()
                        SurfaceRole.PHOTOGRAPHER -> PhotographerApp()
                        SurfaceRole.MODERATOR -> ModeratorApp()
                    }
                }
            }
        }
    }
}
