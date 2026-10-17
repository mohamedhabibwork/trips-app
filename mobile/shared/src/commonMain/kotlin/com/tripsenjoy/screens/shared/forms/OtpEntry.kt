package com.tripsenjoy.screens.shared.forms

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.shared.common.ScreenBody
import com.tripsenjoy.screens.shared.common.ScreenNote
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeOtpInput
import com.tripsenjoy.ui.components.TePageHeader

private const val OTP_LENGTH = 6
private const val RESEND_COUNTDOWN_SECONDS = 60

// SCR-SHR-14 OTP entry. Resend unlocks after the 45 to 60 second countdown (A1). The code expires after 5 minutes.
// After 5 wrong codes entry pauses for 15 minutes (BRL-20). Codes are never logged (NFR-OBS-01).
// Verify returns to the screen that asked for the code.
@Composable
fun OtpEntry() {
    val nav = LocalScreenNavigator.current
    var code by remember { mutableStateOf("") }
    ScreenBody {
        TePageHeader(title = "OTP entry", description = "Enter the $OTP_LENGTH-digit code we sent you")
        TeOtpInput(
            value = code,
            onValueChange = { typed -> code = typed.filter { it.isDigit() }.take(OTP_LENGTH) },
            label = "Verification code",
            length = OTP_LENGTH,
        )
        ScreenNote(text = "The code expires in 5 minutes.")
        TeButton(
            text = "Verify",
            onClick = { nav.back() },
            enabled = code.length == OTP_LENGTH,
        )
        TeButton(
            text = "Resend code in $RESEND_COUNTDOWN_SECONDS seconds",
            onClick = {},
            variant = TeButtonVariant.Secondary,
            enabled = false,
        )
        TeButton(text = "Change phone or email", onClick = { nav.back() }, variant = TeButtonVariant.Ghost)
    }
}
