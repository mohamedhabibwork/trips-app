package com.tripsenjoy.screens.moderator.access

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.moderator.ModeratorRoutes
import com.tripsenjoy.screens.moderator.common.ModEmptyBlock
import com.tripsenjoy.screens.moderator.common.ModNote
import com.tripsenjoy.screens.moderator.common.ModScreen
import com.tripsenjoy.screens.moderator.common.StatePreview
import com.tripsenjoy.screens.moderator.common.tone
import com.tripsenjoy.ui.components.AlertTone
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeInlineAlert
import com.tripsenjoy.ui.components.TeOtpInput
import com.tripsenjoy.ui.components.TeTab
import com.tripsenjoy.ui.components.TeTabs

private const val PLATFORM_ANDROID = "android"
private const val PLATFORM_IOS = "ios"
private const val STAFF_CODE_LENGTH = 6

// SCR-MOD-10 Install and first open: add to home screen, enter the staff code, then open the vehicle view.
@Composable
fun InstallAndFirstOpen() {
    ModScreen(
        title = "Install and first open",
        description = "Add the app to your home screen, enter your staff code, then open the vehicle view.",
    ) {
        StatePreview(
            main = { InstallMain() },
            empty = {
                ModEmptyBlock(
                    "No vehicle assigned",
                    "The organization has not assigned you a vehicle yet. Your vehicle appears here after assignment.",
                )
            },
            error = {
                TeInlineAlert(
                    tone = AlertTone.Error,
                    title = "Install steps not loaded",
                    message = "Check the connection and open this page again.",
                )
            },
        )
    }
}

@Composable
private fun InstallMain() {
    val nav = LocalScreenNavigator.current
    var platform by remember { mutableStateOf(PLATFORM_ANDROID) }
    var staffCode by remember { mutableStateOf("") }
    TeTabs(
        tabs = listOf(TeTab(id = PLATFORM_ANDROID, label = "Android"), TeTab(id = PLATFORM_IOS, label = "iOS")),
        activeId = platform,
        onSelect = { id -> platform = id },
        ariaLabel = "Install steps for",
    )
    TeCard(header = "Add to home screen") {
        if (platform == PLATFORM_ANDROID) {
            ModNote("1. Open the app link in Chrome.")
            ModNote("2. Tap the menu, then Install app or Add to Home screen.")
        } else {
            ModNote("1. Open the app link in Safari.")
            ModNote("2. Tap Share, then Add to Home Screen.")
        }
        ModNote("Not installed? You can keep using the app in the browser. Mobile data is needed during the trip.")
    }
    TeCard(header = "Confirm your staff code") {
        TeOtpInput(
            value = staffCode,
            onValueChange = { value -> staffCode = value.filter(Char::isDigit).take(STAFF_CODE_LENGTH) },
            label = "Staff code",
            length = STAFF_CODE_LENGTH,
        )
        ModNote("Enter the 6-digit code from SMS or your authenticator app.")
    }
    TeButton(
        text = "Open vehicle view",
        enabled = staffCode.length == STAFF_CODE_LENGTH,
        onClick = { nav.replace(ModeratorRoutes.VEHICLE_HOME) },
    )
}
