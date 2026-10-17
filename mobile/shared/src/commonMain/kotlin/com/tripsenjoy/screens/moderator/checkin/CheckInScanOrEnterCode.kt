package com.tripsenjoy.screens.moderator.checkin

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.moderator.ModeratorRoutes
import com.tripsenjoy.screens.moderator.common.LocalModeratorSession
import com.tripsenjoy.screens.moderator.common.ModCheckInResult
import com.tripsenjoy.screens.moderator.common.ModField
import com.tripsenjoy.screens.moderator.common.ModNote
import com.tripsenjoy.screens.moderator.common.ModScreen
import com.tripsenjoy.screens.moderator.common.icon
import com.tripsenjoy.screens.moderator.common.tone
import com.tripsenjoy.ui.components.BadgeTone
import com.tripsenjoy.ui.components.IconName
import com.tripsenjoy.ui.components.TeBadge
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeIcon
import com.tripsenjoy.ui.components.TeInput

// SCR-MOD-03 Check-in: scan the traveler's code with the camera, or enter it by hand.
// An invalid code is reported at the field; any other result opens SCR-MOD-04.
@Composable
fun CheckInScanOrEnterCode() {
    ModScreen(
        title = "Check-in: scan or enter code",
        description = "Check one traveler onto this vehicle. Each check-in records the time and location.",
    ) {
        CheckInForm()
    }
}

@Composable
private fun CheckInForm() {
    val nav = LocalScreenNavigator.current
    val session = LocalModeratorSession.current
    var code by remember { mutableStateOf(session.prefilledCode) }
    var codeError by remember { mutableStateOf<String?>(null) }
    var scannerRequested by remember { mutableStateOf(false) }
    TeCard(header = "Camera scanner") {
        TeIcon(name = IconName.Camera, contentDescription = null)
        ModNote("Point the camera at the traveler's code.")
        TeButton(
            text = "Start scanner",
            onClick = { scannerRequested = true },
            variant = TeButtonVariant.Secondary,
        )
        if (scannerRequested) {
            ModNote("The camera scanner runs on the device. If it cannot read the code, enter it below.")
        }
    }
    TeInput(
        value = code,
        onValueChange = { value ->
            code = value
            codeError = null
        },
        label = "Booking code",
        supportingText = "Enter the code printed on the booking.",
        error = codeError,
    )
    TeBadge(label = "Location not shared", tone = BadgeTone.Neutral, icon = IconName.Pin)
    ModNote("If location permission is denied, the check-in is still recorded without location.")
    ModField(label = "Last check-in", value = session.lastCheckedInName ?: "None yet")
    TeButton(
        text = "Check in",
        enabled = code.isNotBlank(),
        onClick = {
            session.prefilledCode = ""
            val result = session.checkIn(code)
            if (result == ModCheckInResult.Invalid) {
                codeError = "This code does not match a booking for this trip."
            } else {
                nav.open(ModeratorRoutes.CHECK_IN_RESULT)
            }
        },
    )
}
