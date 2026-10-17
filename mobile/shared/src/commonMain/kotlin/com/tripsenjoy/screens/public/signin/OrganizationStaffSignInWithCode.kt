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
import com.tripsenjoy.screens.public.common.PublicCodeMethod
import com.tripsenjoy.screens.public.common.PublicCodeMethodChips
import com.tripsenjoy.screens.public.common.PublicNote
import com.tripsenjoy.screens.public.common.PublicScreenColumn
import com.tripsenjoy.screens.public.common.PublicScreenIds
import com.tripsenjoy.screens.public.common.PublicStateCopy
import com.tripsenjoy.screens.public.common.publicFieldsFilled
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeInput
import com.tripsenjoy.ui.components.TeKeyboardType
import com.tripsenjoy.ui.components.TeOtpInput
import com.tripsenjoy.ui.components.TePageHeader

// SCR-PUB-11 Organization staff sign-in with a code. Sign-in always needs the second-factor code (FR-AUTH-04).
// The code arrives by text message or from an authenticator app (BR-AUTH-04). If the email is linked to several
// organizations, a picker follows (FR-AUTH-07). The sign-in itself runs in the app.
private val staffSignInCopy = PublicStateCopy(loadingMessage = "Signing you in...")

@Composable
fun OrganizationStaffSignInWithCode() {
    val nav = LocalScreenNavigator.current
    var identifier by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var method by remember { mutableStateOf(PublicCodeMethod.Sms) }
    var code by remember { mutableStateOf("") }

    val canSignIn = publicFieldsFilled(identifier, password) && code.length == PUBLIC_CODE_LENGTH

    PublicScreenColumn {
        TePageHeader(
            title = "Staff sign-in",
            description = "Sign in with your work email or phone and a code.",
        )
        TeInput(
            value = identifier,
            onValueChange = { identifier = it },
            label = "Work email or phone",
            keyboardType = TeKeyboardType.Email,
        )
        TeInput(
            value = password,
            onValueChange = { password = it },
            label = "Password",
            isPassword = true,
        )
        PublicCodeMethodChips(method = method, onSelect = { method = it })
        TeOtpInput(
            value = code,
            onValueChange = { code = it },
            label = "Sign-in code",
            length = PUBLIC_CODE_LENGTH,
        )
        PublicNote("You cannot sign in without the code.")
        // The app performs the sign-in and opens the workspace or the organization picker. No navigation here.
        TeButton(
            text = "Sign in",
            onClick = {},
            enabled = canSignIn,
            modifier = Modifier.fillMaxWidth(),
        )
        TeButton(
            text = "First time? Set up your sign-in code",
            onClick = { nav.open(PublicScreenIds.STAFF_CODE_SETUP) },
            variant = TeButtonVariant.Ghost,
            modifier = Modifier.fillMaxWidth(),
        )
        PublicBackToStart()
    }
}
