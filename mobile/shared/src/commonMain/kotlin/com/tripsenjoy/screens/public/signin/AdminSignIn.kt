package com.tripsenjoy.screens.public.signin

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.public.common.PublicBackToStart
import com.tripsenjoy.screens.public.common.PublicNote
import com.tripsenjoy.screens.public.common.PublicScreenIds
import com.tripsenjoy.screens.public.common.PublicStateCopy
import com.tripsenjoy.screens.public.common.PublicViewState
import com.tripsenjoy.screens.public.common.StatePreview
import com.tripsenjoy.screens.public.common.publicFieldsFilled
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeInput
import com.tripsenjoy.ui.components.TeKeyboardType
import com.tripsenjoy.ui.components.TePageHeader

// SCR-PUB-09 Admin sign-in. Staff only, on the separate admin route (UI-07). No public sign-up (BRL-21).
// Step one is email and password. Step two is the authenticator code (PUB-10). Admins must have an authenticator (OD-03).
// Password rules: 12 characters minimum and a breached-password check (NFR-SEC-02).
private val adminSignInCopy = PublicStateCopy(loadingMessage = "Checking your details...")

@Composable
fun AdminSignIn() {
    val nav = LocalScreenNavigator.current
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    StatePreview(
        namedStates = listOf(PublicViewState.Loading),
        copy = adminSignInCopy,
    ) {
        TePageHeader(
            title = "Admin sign-in",
            description = "Staff only. Admin accounts are created by an existing admin.",
        )
        TeInput(
            value = email,
            onValueChange = { email = it },
            label = "Email",
            keyboardType = TeKeyboardType.Email,
        )
        TeInput(
            value = password,
            onValueChange = { password = it },
            label = "Password",
            isPassword = true,
            supportingText = "At least 12 characters.",
        )
        PublicNote("Next, you enter a code from your authenticator app.")
        TeButton(
            text = "Continue",
            onClick = { nav.open(PublicScreenIds.ADMIN_AUTHENTICATOR) },
            enabled = publicFieldsFilled(email, password),
            modifier = Modifier.fillMaxWidth(),
        )
        PublicBackToStart()
    }
}
