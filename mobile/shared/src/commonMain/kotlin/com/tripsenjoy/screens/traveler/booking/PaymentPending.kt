package com.tripsenjoy.screens.traveler.booking

import androidx.compose.runtime.Composable
import com.tripsenjoy.screens.moderator.common.icon
import com.tripsenjoy.screens.traveler.common.AmountPlaceholder
import com.tripsenjoy.screens.traveler.common.LabelValue
import com.tripsenjoy.screens.traveler.common.ReplaceScreenButton
import com.tripsenjoy.screens.traveler.common.ScreenNote
import com.tripsenjoy.screens.traveler.common.ScreenPage
import com.tripsenjoy.screens.traveler.common.ScreenSection
import com.tripsenjoy.ui.components.BadgeTone
import com.tripsenjoy.ui.components.IconName
import com.tripsenjoy.ui.components.TeBadge
import com.tripsenjoy.ui.components.TeButtonVariant

// SCR-TRV-07. Shown as "confirming payment" when the gateway does not answer within 30 seconds (D-30).
// Confirmed only after a verified callback (FR-PAY-01). Unresolved after 15 minutes goes to admin.
// The two outcome buttons stand in for the gateway callback, which this screen does not receive yet.
@Composable
fun PaymentPending() {
    ScreenPage(title = "Payment pending") {
        TeBadge(label = "Confirming payment", tone = BadgeTone.Warning, icon = IconName.Clock)
        ScreenSection(header = "Booking") {
            LabelValue(label = "Booking reference", value = "Booking reference")
            AmountPlaceholder(label = "Amount")
        }
        ScreenSection(header = "What happens next") {
            ScreenNote(text = "We confirm your booking as soon as the payment provider confirms the payment.")
            ScreenNote(text = "If the payment provider is slow, the booking stays in payment pending while we check.")
        }
        // Confirmed replaces this screen, so Back from the booking never returns to the payment.
        ReplaceScreenButton(text = "Check status", screenId = "SCR-TRV-09")
        ReplaceScreenButton(text = "Payment was not completed", screenId = "SCR-TRV-08", variant = TeButtonVariant.Secondary)
    }
}
