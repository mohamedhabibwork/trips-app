package com.tripsenjoy.screens.traveler.booking

import androidx.compose.runtime.Composable
import com.tripsenjoy.screens.moderator.common.icon
import com.tripsenjoy.screens.traveler.common.AmountPlaceholder
import com.tripsenjoy.screens.traveler.common.BackButton
import com.tripsenjoy.screens.traveler.common.BookingStepper
import com.tripsenjoy.screens.traveler.common.LabelValue
import com.tripsenjoy.screens.traveler.common.ReplaceScreenButton
import com.tripsenjoy.screens.traveler.common.ScreenNote
import com.tripsenjoy.screens.traveler.common.ScreenPage
import com.tripsenjoy.screens.traveler.common.ScreenSection
import com.tripsenjoy.screens.traveler.common.StatePreview
import com.tripsenjoy.screens.traveler.common.TravelerScreenState
import com.tripsenjoy.ui.components.BadgeTone
import com.tripsenjoy.ui.components.IconName
import com.tripsenjoy.ui.components.TeBadge

// SCR-TRV-06. The traveler pays on the gateway's page. This screen holds no card fields: the platform never
// receives card data (NFR-SEC-12, FR-PAY-07). Methods per market; the gateway per market is set in D-12.
@Composable
fun BookingStep4PaymentHandoff() {
    ScreenPage(title = "Booking step 4: payment handoff") {
        BookingStepper(currentId = "payment", completedIds = setOf("travelers", "seats", "summary"))
        StatePreview(listedStates = setOf(TravelerScreenState.Loading, TravelerScreenState.Error)) {
            TeBadge(label = "Hold active", tone = BadgeTone.Info, icon = IconName.Clock)
            ScreenSection(header = "Amount due") {
                AmountPlaceholder(label = "Amount due")
                LabelValue(label = "Hold time left", value = "Countdown timer")
            }
            ScreenSection(header = "Payment methods") {
                LabelValue(label = "International cards and wallets", value = "Stripe")
                LabelValue(label = "Local cards", value = "Paymob or Tap")
                LabelValue(label = "Cash in Egypt", value = "Fawry")
            }
            ScreenNote(text = "You pay on the payment provider's page. Trips Enjoy never receives card details.")
            // Replaces this step: the payment result takes its place, so Back from the result never returns here.
            ReplaceScreenButton(text = "Pay on the payment page", screenId = "SCR-TRV-07")
            BackButton()
        }
    }
}
