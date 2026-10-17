package com.tripsenjoy.screens.public.account

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.public.common.PublicBackToStart
import com.tripsenjoy.screens.public.common.PublicScreenColumn
import com.tripsenjoy.screens.public.common.PublicScreenIds
import com.tripsenjoy.ui.components.AlertTone
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeInlineAlert
import com.tripsenjoy.ui.components.TePageHeader

// SCR-PUB-14 Session expired. Shown after 12 hours of web use or after a refused token (BRL-22, FR-AUTH-10).
// Unsaved drafts are kept. Sign-in returns the user to the same app (proposed D-333), so the notice is replaced, not stacked.
@Composable
fun SessionExpired() {
    val nav = LocalScreenNavigator.current
    PublicScreenColumn {
        TePageHeader(
            title = "Your session ended",
            description = "Sign in again to continue where you left off.",
        )
        TeInlineAlert(
            tone = AlertTone.Warning,
            title = "Your session expired",
            message = "Your unsaved drafts are kept. You return to the same page after you sign in.",
        )
        TeButton(
            text = "Sign in",
            onClick = { nav.replace(PublicScreenIds.SIGN_IN) },
            modifier = Modifier.fillMaxWidth(),
        )
        PublicBackToStart()
    }
}
