package com.tripsenjoy.screens.public.signup

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.public.common.PUBLIC_PASSWORD_MIN_LENGTH
import com.tripsenjoy.screens.public.common.PublicBackToStart
import com.tripsenjoy.screens.public.common.PublicCountryOptions
import com.tripsenjoy.screens.public.common.PublicLanguageOptions
import com.tripsenjoy.screens.public.common.PublicScreenIds
import com.tripsenjoy.screens.public.common.PublicStateCopy
import com.tripsenjoy.screens.public.common.PublicViewState
import com.tripsenjoy.screens.public.common.StatePreview
import com.tripsenjoy.screens.public.common.publicFieldsFilled
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeInput
import com.tripsenjoy.ui.components.TeKeyboardType
import com.tripsenjoy.ui.components.TePageHeader
import com.tripsenjoy.ui.components.TeSelect
import com.tripsenjoy.ui.components.TeSwitch

// SCR-PUB-03 Traveler sign-up. Creates a Free plan traveler account, then goes to verification (PUB-07).
// At least one of email or phone is required (D-20). Country is required (FR-AUTH-02). No documents.
private val travelerCopy = PublicStateCopy(loadingMessage = "Creating your account...")

@Composable
fun TravelerSignUp() {
    val nav = LocalScreenNavigator.current
    var fullName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var country by remember { mutableStateOf<String?>(null) }
    var language by remember { mutableStateOf<String?>("en") }
    var usesPassword by remember { mutableStateOf(false) }
    var password by remember { mutableStateOf("") }

    val contactGiven = email.isNotBlank() || phone.isNotBlank()
    val passwordReady = !usesPassword || password.length >= PUBLIC_PASSWORD_MIN_LENGTH
    val canSubmit = publicFieldsFilled(fullName, country) && contactGiven && passwordReady

    StatePreview(namedStates = listOf(PublicViewState.Loading), copy = travelerCopy) {
        TePageHeader(
            title = "Create traveler account",
            description = "Free plan. You verify your email or phone next.",
        )
        TeInput(value = fullName, onValueChange = { fullName = it }, label = "Full name")
        TeInput(
            value = email,
            onValueChange = { email = it },
            label = "Email",
            keyboardType = TeKeyboardType.Email,
            supportingText = "Add an email or a phone number. You need at least one.",
        )
        TeInput(
            value = phone,
            onValueChange = { phone = it },
            label = "Phone",
            keyboardType = TeKeyboardType.Phone,
        )
        TeSelect(
            label = "Country",
            options = PublicCountryOptions,
            value = country,
            onValueChange = { country = it },
            supportingText = "Required",
        )
        TeSelect(
            label = "Language",
            options = PublicLanguageOptions,
            value = language,
            onValueChange = { language = it },
        )
        TeSwitch(
            checked = usesPassword,
            onCheckedChange = { usesPassword = it },
            label = "Sign in with a password",
        )
        if (usesPassword) {
            TeInput(
                value = password,
                onValueChange = { password = it },
                label = "Password",
                isPassword = true,
                supportingText = "At least 12 characters. Otherwise you sign in with a one-time code.",
            )
        }
        TeButton(
            text = "Create account",
            onClick = { nav.open(PublicScreenIds.VERIFICATION) },
            enabled = canSubmit,
            modifier = Modifier.fillMaxWidth(),
        )
        TeButton(
            text = "Already have an account? Sign in",
            onClick = { nav.open(PublicScreenIds.SIGN_IN) },
            variant = TeButtonVariant.Ghost,
            modifier = Modifier.fillMaxWidth(),
        )
        PublicBackToStart()
    }
}
