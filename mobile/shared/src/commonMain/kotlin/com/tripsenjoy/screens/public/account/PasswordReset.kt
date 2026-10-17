package com.tripsenjoy.screens.public.account

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.public.common.PUBLIC_CODE_LENGTH
import com.tripsenjoy.screens.public.common.PUBLIC_PASSWORD_MIN_LENGTH
import com.tripsenjoy.screens.public.common.PublicBackToStart
import com.tripsenjoy.screens.public.common.PublicScreenIds
import com.tripsenjoy.screens.public.common.PublicStateCopy
import com.tripsenjoy.screens.public.common.PublicViewState
import com.tripsenjoy.screens.public.common.StatePreview
import com.tripsenjoy.screens.public.common.publicFieldsFilled
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeInput
import com.tripsenjoy.ui.components.TeOtpInput
import com.tripsenjoy.ui.components.TePageHeader

// SCR-PUB-13 Password reset (gap). Regains access through a verified email or phone (NFR-SEC-02, FR-AUTH-03).
// The BRD and SRS define no reset flow, so this screen needs product sign-off (proposed D-218).
// Passwords need 12 characters and must not be in breached lists; the breached-list check runs in the app.
private val passwordResetCopy = PublicStateCopy(loadingMessage = "Setting your password...")

@Composable
fun PasswordReset() {
    val nav = LocalScreenNavigator.current
    var identifier by remember { mutableStateOf("") }
    var code by remember { mutableStateOf("") }
    var newPassword by remember { mutableStateOf("") }

    val canSetPassword = publicFieldsFilled(identifier) &&
        code.length == PUBLIC_CODE_LENGTH &&
        newPassword.length >= PUBLIC_PASSWORD_MIN_LENGTH

    StatePreview(namedStates = listOf(PublicViewState.Loading), copy = passwordResetCopy) {
        TePageHeader(
            title = "Reset password",
            description = "Use your verified email or phone.",
        )
        TeInput(
            value = identifier,
            onValueChange = { identifier = it },
            label = "Email or phone",
        )
        TeOtpInput(
            value = code,
            onValueChange = { code = it },
            label = "Reset code",
            length = PUBLIC_CODE_LENGTH,
        )
        TeInput(
            value = newPassword,
            onValueChange = { newPassword = it },
            label = "New password",
            isPassword = true,
            supportingText = "At least 12 characters. Not one found in breached-password lists.",
        )
        TeButton(
            text = "Set password",
            onClick = { nav.replace(PublicScreenIds.SIGN_IN) },
            enabled = canSetPassword,
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
