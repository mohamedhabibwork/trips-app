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

// SCR-PUB-16 Deletion grace period. The account has a deletion request inside its 30-day grace period (FR-AUTH-09, BRL-15).
// Signing in restores the account and cancels the request. After day 30 sign-in is refused and the account is purged (D-38).
// Future bookings are cancelled and refunded when deletion becomes permanent (SHR-06, user flows 08).
// Continue restores the account in the app. Placeholder: grace end date is 16 Nov 2026.
@Composable
fun DeletionGracePeriod() {
    PublicScreenColumn {
        TePageHeader(
            title = "Account scheduled for deletion",
            description = "Signing in restores your account.",
        )
        TeInlineAlert(
            tone = AlertTone.Warning,
            title = "Deletion requested",
            message = "Your account is in the 30-day grace period and is deleted on 16 Nov 2026 unless you sign in before then.",
        )
        TeButton(
            text = "Continue to app home",
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
