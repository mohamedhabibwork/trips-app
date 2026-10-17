package com.tripsenjoy.screens.public.account

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.tripsenjoy.screens.public.common.PublicBackToStart
import com.tripsenjoy.screens.public.common.PublicScreenColumn
import com.tripsenjoy.ui.components.AlertTone
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeInlineAlert
import com.tripsenjoy.ui.components.TePageHeader

// SCR-PUB-15 Account suspended. Shown at sign-in when an admin has suspended the account (FR-AUTH-08, BR-AUTH-07).
// States that access is stopped and no data is deleted (DAT-07). No data is shown and there is no retry (proposed D-234).
// Support contact and sign-out are handled by the app. Placeholder: the reason text is the reason from the admin notice.
@Composable
fun AccountSuspended() {
    PublicScreenColumn {
        TePageHeader(
            title = "Account suspended",
            description = "Your access is stopped.",
        )
        TeInlineAlert(
            tone = AlertTone.Error,
            title = "Your account is suspended",
            message = "Reason: the reason from the admin notice appears here. No data is deleted.",
        )
        TeButton(
            text = "Contact support",
            onClick = {},
            modifier = Modifier.fillMaxWidth(),
        )
        TeButton(
            text = "Sign out",
            onClick = {},
            variant = TeButtonVariant.Ghost,
            modifier = Modifier.fillMaxWidth(),
        )
        PublicBackToStart()
    }
}
