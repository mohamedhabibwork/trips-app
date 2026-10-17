package com.tripsenjoy.screens.public.signin

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
import com.tripsenjoy.screens.public.common.PublicScreenColumn
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeOtpInput
import com.tripsenjoy.ui.components.TePageHeader

// SCR-PUB-10 Admin authenticator set-up and code. Enforces the second factor on every admin sign-in (FR-ADM-02, OD-03).
// Later sign-ins show code entry only. Locked for 15 minutes after 5 wrong codes (FR-AUTH-05).
// The check runs in the app; success opens the admin console (ADM-01), which is outside this module.
@Composable
fun AdminAuthenticatorSetUpAndCode() {
    val nav = LocalScreenNavigator.current
    var code by remember { mutableStateOf("") }

    PublicScreenColumn {
        TePageHeader(
            title = "Authenticator code",
            description = "Enter the 6-digit code from your authenticator app.",
        )
        TeOtpInput(
            value = code,
            onValueChange = { code = it },
            label = "Authenticator code",
            length = PUBLIC_CODE_LENGTH,
        )
        PublicNote("The admin console opens after this step.")
        TeButton(
            text = "Verify",
            onClick = {},
            enabled = code.length == PUBLIC_CODE_LENGTH,
            modifier = Modifier.fillMaxWidth(),
        )
        TeButton(
            text = "Back to sign-in",
            onClick = { nav.back() },
            variant = TeButtonVariant.Ghost,
            modifier = Modifier.fillMaxWidth(),
        )
        PublicBackToStart()
    }
}
