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
import com.tripsenjoy.ui.components.AlertTone
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeInlineAlert
import com.tripsenjoy.ui.components.TeInput
import com.tripsenjoy.ui.components.TeKeyboardType
import com.tripsenjoy.ui.components.TeOtpInput
import com.tripsenjoy.ui.components.TePageHeader

// SCR-PUB-12 Staff code set-up (first sign-in). Sets the second factor before the workspace opens (FR-EMP-06, NFR-SEC-04).
// The user chooses a text message or an authenticator app, then confirms with a code. Confirming opens the workspace (ORG-01), in the app.
@Composable
fun StaffCodeSetup() {
    var method by remember { mutableStateOf(PublicCodeMethod.Sms) }
    var mobile by remember { mutableStateOf("") }
    var code by remember { mutableStateOf("") }

    val mobileReady = method != PublicCodeMethod.Sms || mobile.isNotBlank()
    val canConfirm = code.length == PUBLIC_CODE_LENGTH && mobileReady

    PublicScreenColumn {
        TePageHeader(
            title = "Set up your sign-in code",
            description = "Required before the workspace opens.",
        )
        PublicCodeMethodChips(method = method, onSelect = { method = it })
        if (method == PublicCodeMethod.Sms) {
            TeInput(
                value = mobile,
                onValueChange = { mobile = it },
                label = "Mobile number",
                keyboardType = TeKeyboardType.Phone,
            )
        } else {
            PublicNote("Add Trips Enjoy in your authenticator app, then enter the code it shows.")
        }
        TeOtpInput(
            value = code,
            onValueChange = { code = it },
            label = "Confirmation code",
            length = PUBLIC_CODE_LENGTH,
        )
        TeInlineAlert(
            tone = AlertTone.Info,
            title = "The workspace opens after setup",
            message = "You cannot open the workspace until this step is complete.",
        )
        TeButton(
            text = "Confirm",
            onClick = {},
            enabled = canConfirm,
            modifier = Modifier.fillMaxWidth(),
        )
        TeButton(
            text = "Send a new code",
            onClick = {},
            variant = TeButtonVariant.Ghost,
            enabled = method == PublicCodeMethod.Sms && mobile.isNotBlank(),
            modifier = Modifier.fillMaxWidth(),
        )
        PublicBackToStart()
    }
}
