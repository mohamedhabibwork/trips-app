package com.tripsenjoy.surfaces

import androidx.compose.ui.window.ComposeUIViewController
import com.tripsenjoy.surfaces.driver.DriverApp
import com.tripsenjoy.surfaces.moderator.ModeratorApp
import com.tripsenjoy.surfaces.photographer.PhotographerApp

// One entry point per iOS app. Swift calls these through the "Shared" framework.
fun DriverViewController() = ComposeUIViewController { DriverApp() }

fun PhotographerViewController() = ComposeUIViewController { PhotographerApp() }

fun ModeratorViewController() = ComposeUIViewController { ModeratorApp() }
