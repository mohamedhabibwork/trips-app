package com.tripsenjoy.screens.moderator.checkin

import androidx.compose.runtime.Composable
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.moderator.ModeratorRoutes
import com.tripsenjoy.screens.moderator.common.LocalModeratorSession
import com.tripsenjoy.screens.moderator.common.ModCheckInResult
import com.tripsenjoy.screens.moderator.common.ModEmptyBlock
import com.tripsenjoy.screens.moderator.common.ModScreen
import com.tripsenjoy.screens.moderator.common.StatePreview
import com.tripsenjoy.screens.moderator.common.tone
import com.tripsenjoy.ui.components.AlertTone
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeInlineAlert

// SCR-MOD-04 Check-in result: accepted, redirected, refused, duplicate. A redirect names the vehicle number only.
@Composable
fun CheckInResult() {
    ModScreen(title = "Check-in result", description = "The result of the last check-in attempt.") {
        StatePreview(
            main = { ResultMain() },
            error = {
                TeInlineAlert(
                    tone = AlertTone.Error,
                    title = "Check-in not recorded",
                    message = "The check-in could not be saved. Scan the code again. Nothing was recorded.",
                )
            },
        )
    }
}

@Composable
private fun ResultMain() {
    val nav = LocalScreenNavigator.current
    val session = LocalModeratorSession.current
    ResultAlert(session.lastResult)
    TeButton(text = "Next traveler", onClick = { nav.back() }, enabled = nav.canGoBack)
    TeButton(
        text = "Traveler manifest",
        onClick = { nav.replace(ModeratorRoutes.MANIFEST) },
        variant = TeButtonVariant.Secondary,
    )
}

@Composable
private fun ResultAlert(result: ModCheckInResult?) {
    when (result) {
        null -> ModEmptyBlock("No check-in yet", "Scan or enter a booking code first.")
        is ModCheckInResult.Accepted -> TeInlineAlert(
            tone = AlertTone.Success,
            title = "Boarded: ${result.name}",
            message = "Seat ${result.seat}. The time and location are recorded.",
        )
        is ModCheckInResult.Queued -> TeInlineAlert(
            tone = AlertTone.Info,
            title = "Saved on this device: ${result.name}",
            message = "Seat ${result.seat}. It sends in order when the connection returns.",
        )
        is ModCheckInResult.Redirect -> TeInlineAlert(
            tone = AlertTone.Warning,
            title = "Belongs to vehicle ${result.vehicleNumber}",
            message = "Send the traveler to vehicle ${result.vehicleNumber}. No other details are shown.",
        )
        is ModCheckInResult.Refused -> TeInlineAlert(
            tone = AlertTone.Error,
            title = "Check-in refused",
            message = result.reason,
        )
        is ModCheckInResult.Duplicate -> TeInlineAlert(
            tone = AlertTone.Warning,
            title = "Already checked in",
            message = "${result.name} is already checked in to this vehicle.",
        )
        ModCheckInResult.Invalid -> TeInlineAlert(
            tone = AlertTone.Error,
            title = "Code not recognised",
            message = "Check the code and try again.",
        )
    }
}
