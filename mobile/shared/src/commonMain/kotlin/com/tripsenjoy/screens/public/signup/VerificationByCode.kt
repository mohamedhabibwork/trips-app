package com.tripsenjoy.screens.public.signup

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.public.common.PUBLIC_CODE_LENGTH
import com.tripsenjoy.screens.public.common.PublicBackToStart
import com.tripsenjoy.screens.public.common.PublicNote
import com.tripsenjoy.screens.public.common.PublicScreenIds
import com.tripsenjoy.screens.public.common.PublicStateCopy
import com.tripsenjoy.screens.public.common.PublicViewState
import com.tripsenjoy.screens.public.common.StatePreview
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeOtpInput
import com.tripsenjoy.ui.components.TePageHeader

// SCR-PUB-07 Verification by code. Confirms email or phone before the account can act (FR-AUTH-03, BRL-20).
// The code expires after 5 minutes, and resend unlocks after a 45 to 60 second countdown (A1).
// The spec does not say which next screen applies to each role, and screens take no parameters. So both next steps are offered.
private val verificationCopy = PublicStateCopy(loadingMessage = "Checking your code...")

@Composable
fun VerificationByCode() {
    val nav = LocalScreenNavigator.current
    var code by remember { mutableStateOf("") }

    StatePreview(namedStates = listOf(PublicViewState.Loading), copy = verificationCopy) {
        TePageHeader(
            title = "Verify your account",
            description = "Enter the 6-digit code sent to m***@trips-enjoy.com.",
        )
        TeOtpInput(
            value = code,
            onValueChange = { code = it },
            label = "Verification code",
            length = PUBLIC_CODE_LENGTH,
        )
        PublicNote("The code expires after 5 minutes.")
        TeButton(
            text = "Verify",
            onClick = { nav.replace(PublicScreenIds.SIGN_IN) },
            enabled = code.length == PUBLIC_CODE_LENGTH,
            modifier = Modifier.fillMaxWidth(),
        )
        PublicNote("Travelers sign in next. Providers and organizations check their application status instead.")
        TeButton(
            text = "View application status",
            onClick = { nav.replace(PublicScreenIds.APPLICATION_STATUS) },
            variant = TeButtonVariant.Secondary,
            modifier = Modifier.fillMaxWidth(),
        )
        TeButton(
            text = "Resend code in 60 seconds",
            onClick = {},
            variant = TeButtonVariant.Secondary,
            enabled = false,
            modifier = Modifier.fillMaxWidth(),
        )
        TeButton(
            text = "Change email or phone",
            onClick = { nav.back() },
            variant = TeButtonVariant.Ghost,
            modifier = Modifier.fillMaxWidth(),
        )
        PublicBackToStart()
    }
}
