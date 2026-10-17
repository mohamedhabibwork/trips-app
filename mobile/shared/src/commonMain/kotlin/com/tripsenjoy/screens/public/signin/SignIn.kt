package com.tripsenjoy.screens.public.signin

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.public.common.PublicBackToStart
import com.tripsenjoy.screens.public.common.PublicScreenIds
import com.tripsenjoy.screens.public.common.PublicStateCopy
import com.tripsenjoy.screens.public.common.PublicViewState
import com.tripsenjoy.screens.public.common.StatePreview
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeChip
import com.tripsenjoy.ui.components.TeInput
import com.tripsenjoy.ui.components.TePageHeader
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

// SCR-PUB-08 Sign-in for travelers and approved suppliers (FR-AUTH-04, FR-AUTH-10).
// Sign-in is by one-time code or password (BR-AUTH-04). The sign-in itself runs in the app (auth/), so this step only shows the form.
// Suspended, deletion and expiry states go to PUB-15, PUB-16 and PUB-14 from the app. Pending suppliers see the approval message (FR-ONB-01).
private val signInCopy = PublicStateCopy(loadingMessage = "Signing you in...")

@Composable
fun SignIn() {
    val nav = LocalScreenNavigator.current
    val spacing = TripsEnjoyTheme.spacing
    var identifier by remember { mutableStateOf("") }
    var usesPassword by remember { mutableStateOf(false) }
    var password by remember { mutableStateOf("") }

    val canSignIn = identifier.isNotBlank() && (!usesPassword || password.isNotBlank())

    StatePreview(namedStates = listOf(PublicViewState.Loading), copy = signInCopy) {
        TePageHeader(
            title = "Sign in",
            description = "For travelers and approved suppliers.",
        )
        TeInput(
            value = identifier,
            onValueChange = { identifier = it },
            label = "Email or phone",
        )
        Row(horizontalArrangement = Arrangement.spacedBy(spacing.space2)) {
            TeChip(label = "One-time code", selected = !usesPassword, onClick = { usesPassword = false })
            TeChip(label = "Password", selected = usesPassword, onClick = { usesPassword = true })
        }
        if (usesPassword) {
            TeInput(
                value = password,
                onValueChange = { password = it },
                label = "Password",
                isPassword = true,
            )
        }
        // The app performs the sign-in and routes to the traveler home. No navigation here.
        TeButton(
            text = "Sign in",
            onClick = {},
            enabled = canSignIn,
            modifier = Modifier.fillMaxWidth(),
        )
        TeButton(
            text = "Forgot password?",
            onClick = { nav.open(PublicScreenIds.PASSWORD_RESET) },
            variant = TeButtonVariant.Ghost,
            modifier = Modifier.fillMaxWidth(),
        )
        TeButton(
            text = "Create an account",
            onClick = { nav.open(PublicScreenIds.SIGN_UP_CHOOSER) },
            variant = TeButtonVariant.Ghost,
            modifier = Modifier.fillMaxWidth(),
        )
        PublicBackToStart()
    }
}
