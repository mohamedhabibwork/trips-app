package com.tripsenjoy.screens.traveler.bookings

import androidx.compose.runtime.Composable
import com.tripsenjoy.screens.moderator.common.icon
import com.tripsenjoy.screens.traveler.common.AmountPlaceholder
import com.tripsenjoy.screens.traveler.common.BackButton
import com.tripsenjoy.screens.traveler.common.LabelValue
import com.tripsenjoy.screens.traveler.common.OpenScreenButton
import com.tripsenjoy.screens.traveler.common.ScreenNote
import com.tripsenjoy.screens.traveler.common.ScreenPage
import com.tripsenjoy.screens.traveler.common.ScreenSection
import com.tripsenjoy.screens.traveler.common.StatePreview
import com.tripsenjoy.screens.traveler.common.TravelerScreenState
import com.tripsenjoy.ui.components.BadgeTone
import com.tripsenjoy.ui.components.IconName
import com.tripsenjoy.ui.components.TeBadge
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeTrackingStatus
import com.tripsenjoy.ui.components.TrackingStatus

// SCR-TRV-11. One booking and the actions its state allows. Boarding status is read only.
// The refund tiers are placeholders (BRL-12, D-07); Operations to confirm. Receipt export is VIP only.
@Composable
fun BookingDetail() {
    ScreenPage(title = "Booking detail") {
        StatePreview(listedStates = setOf(TravelerScreenState.Loading, TravelerScreenState.Error)) {
            TeBadge(label = "Confirmed", tone = BadgeTone.Success, icon = IconName.Check)
            ScreenSection(header = "Trip") {
                LabelValue(label = "Trip", value = "Trip name")
                LabelValue(label = "Dates", value = "Dates and route summary")
            }
            ScreenSection(header = "Travelers and programs") {
                LabelValue(label = "Travelers", value = "Traveler count")
                LabelValue(label = "Programs", value = "Programs and quantities")
            }
            ScreenSection(header = "Seat and boarding") {
                LabelValue(label = "Seat", value = "Seat label")
                TeTrackingStatus(status = TrackingStatus.NotBoarded, label = "Not boarded")
            }
            ScreenSection(header = "Payment") {
                LabelValue(label = "Discount", value = "Coupon and plan discount")
                AmountPlaceholder(label = "Total")
                TeBadge(label = "Payment confirmed", tone = BadgeTone.Success, icon = IconName.Check)
            }
            ScreenSection(header = "Cancellation policy") {
                LabelValue(label = "48 hours or more", value = "80 percent refund")
                LabelValue(label = "24 to under 48 hours", value = "50 percent refund")
                LabelValue(label = "Under 24 hours", value = "No refund")
                ScreenNote(text = "Placeholder tiers. Operations to confirm.")
            }
            OpenScreenButton(text = "Trip day", screenId = "SCR-TRV-13")
            OpenScreenButton(text = "Receipts and invoices", screenId = "SCR-TRV-14", variant = TeButtonVariant.Secondary)
            OpenScreenButton(text = "Cancel booking", screenId = "SCR-TRV-12", variant = TeButtonVariant.Ghost)
            BackButton()
        }
    }
}
