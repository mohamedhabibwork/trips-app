package com.tripsenjoy.screens.traveler.booking

import androidx.compose.runtime.Composable
import com.tripsenjoy.screens.traveler.common.AmountPlaceholder
import com.tripsenjoy.screens.traveler.common.LabelValue
import com.tripsenjoy.screens.traveler.common.ReplaceScreenButton
import com.tripsenjoy.screens.traveler.common.ScreenPage
import com.tripsenjoy.screens.traveler.common.ScreenSection
import com.tripsenjoy.screens.traveler.common.StatePreview
import com.tripsenjoy.screens.traveler.common.TravelerScreenState
import com.tripsenjoy.ui.components.AlertTone
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeInlineAlert

// SCR-TRV-08. Generic failure reason, hold still active, cart kept (FR-BKG-03, BRL-08).
// Retry keeps the cart within the 15-minute window; when the hold expires the seat is checked again.
// Retry replaces this screen with the payment handoff, so the failed attempt is not in the back stack.
@Composable
fun PaymentFailedRetry() {
    ScreenPage(title = "Payment failed (retry)") {
        StatePreview(listedStates = setOf(TravelerScreenState.Error)) {
            TeInlineAlert(
                tone = AlertTone.Error,
                title = "Payment failed",
                message = "The payment was not completed. Your seats are still held.",
            )
            ScreenSection(header = "Your booking") {
                LabelValue(label = "Time left on hold", value = "Countdown timer")
                LabelValue(label = "Booking reference", value = "Booking reference")
                AmountPlaceholder(label = "Amount")
            }
            ReplaceScreenButton(text = "Retry payment", screenId = "SCR-TRV-06")
            ReplaceScreenButton(
                text = "Change payment method",
                screenId = "SCR-TRV-06",
                variant = TeButtonVariant.Secondary,
            )
        }
    }
}
