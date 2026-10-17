package com.tripsenjoy.screens.public.signin

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.tripsenjoy.screens.public.common.PUBLIC_CODE_LENGTH
import com.tripsenjoy.screens.public.common.PublicBackToStart
import com.tripsenjoy.screens.public.common.PublicCodeMethod
import com.tripsenjoy.screens.public.common.PublicCodeMethodChips
import com.tripsenjoy.screens.public.common.PublicNote
import com.tripsenjoy.screens.public.common.PublicScreenColumn
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeInput
import com.tripsenjoy.ui.components.TeOtpInput
import com.tripsenjoy.ui.components.TePageHeader

// SCR-PUB-19 Moderator sign-in with a staff code. Reached from the moderator app link (FR-MOD-05, FR-MOD-01).
// The staff code arrives by text message or from an authenticator app (BR-AUTH-04). After sign-in the app opens only the
// assigned vehicle (FR-MOD-03). Without an assignment the app shows a message and no vehicle.
@Composable
fun ModeratorSignInWithStaffCode() {
    var identifier by remember { mutableStateOf("") }
    var method by remember { mutableStateOf(PublicCodeMethod.Sms) }
    var code by remember { mutableStateOf("") }

    val canSignIn = identifier.isNotBlank() && code.length == PUBLIC_CODE_LENGTH

    PublicScreenColumn {
        TePageHeader(
            title = "Moderator sign-in",
            description = "You see only the vehicle you are assigned to.",
        )
        TeInput(
            value = identifier,
            onValueChange = { identifier = it },
            label = "Moderator ID or email",
        )
        PublicCodeMethodChips(method = method, onSelect = { method = it })
        TeOtpInput(
            value = code,
            onValueChange = { code = it },
            label = "Staff code",
            length = PUBLIC_CODE_LENGTH,
        )
        PublicNote("If you have no vehicle assignment, you see a message and no vehicle.")
        // The app performs the sign-in and opens the assigned vehicle (MOD-01). No navigation here.
        TeButton(
            text = "Sign in",
            onClick = {},
            enabled = canSignIn,
            modifier = Modifier.fillMaxWidth(),
        )
        PublicBackToStart()
    }
}
