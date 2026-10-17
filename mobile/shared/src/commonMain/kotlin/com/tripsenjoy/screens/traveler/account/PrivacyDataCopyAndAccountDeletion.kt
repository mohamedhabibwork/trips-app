package com.tripsenjoy.screens.traveler.account

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.screens.traveler.common.BackButton
import com.tripsenjoy.screens.traveler.common.ScreenNote
import com.tripsenjoy.screens.traveler.common.ScreenPage
import com.tripsenjoy.screens.traveler.common.ScreenSection
import com.tripsenjoy.screens.traveler.common.StatePreview
import com.tripsenjoy.screens.traveler.common.TravelerScreenState
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeCheckbox

// SCR-TRV-20. Decision point, so the deletion request has a confirm step. Signing in during the 30-day grace
// restores the account. Future bookings are cancelled and refunded. Trip records are kept 5 years;
// the purge runs on day 31 (D-38). A data copy request appears in the admin queue with its due date.
// The deletion button stays disabled until the traveler confirms what deleting does.
@Composable
fun PrivacyDataCopyAndAccountDeletion() {
    var understood by remember { mutableStateOf(false) }
    ScreenPage(title = "Privacy: data copy and account deletion") {
        StatePreview(listedStates = setOf(TravelerScreenState.Error)) {
            ScreenSection(header = "Copy of your data") {
                ScreenNote(text = "We prepare a copy of your personal data. The due date appears after you submit.")
                TeButton(text = "Request data copy", onClick = {}, variant = TeButtonVariant.Secondary)
            }
            ScreenSection(header = "Delete your account") {
                ScreenNote(text = "You have 30 days to change your mind. Signing in during that time restores your account.")
                ScreenNote(text = "Future bookings are cancelled and refunded.")
                ScreenNote(text = "Trip records are kept for 5 years.")
                ScreenNote(text = "The account is purged on day 31.")
                TeCheckbox(
                    checked = understood,
                    onCheckedChange = { understood = it },
                    label = "I understand what deleting my account does",
                )
            }
            TeButton(
                text = "Request account deletion",
                onClick = {},
                variant = TeButtonVariant.Destructive,
                enabled = understood,
            )
            BackButton()
        }
    }
}
