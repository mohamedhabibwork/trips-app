package com.tripsenjoy.screens.traveler.booking

import androidx.compose.runtime.Composable
import com.tripsenjoy.screens.traveler.common.AmountPlaceholder
import com.tripsenjoy.screens.traveler.common.LabelValue
import com.tripsenjoy.screens.traveler.common.OpenScreenButton
import com.tripsenjoy.screens.traveler.common.ScreenPage
import com.tripsenjoy.screens.traveler.common.ScreenSection
import com.tripsenjoy.ui.components.AlertTone
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeInlineAlert

// SCR-TRV-09. Confirmed booking with reference and documents. Seat shows "the organization will assign
// your seat" when self-select is off (FR-BKG-05, BR-BKG-05). Confirmation is also sent on the traveler's channels.
// This screen replaces the payment step, so Back does not return to payment.
@Composable
fun BookingConfirmed() {
    ScreenPage(title = "Booking confirmed") {
        TeInlineAlert(
            tone = AlertTone.Success,
            title = "Booking confirmed",
            message = "Your confirmation is on your channels.",
        )
        ScreenSection(header = "Booking reference") {
            LabelValue(label = "Reference", value = "Booking reference")
        }
        ScreenSection(header = "Trip") {
            LabelValue(label = "Trip", value = "Trip name")
            LabelValue(label = "Dates", value = "Dates and route summary")
        }
        ScreenSection(header = "Travelers and programs") {
            LabelValue(label = "Travelers", value = "Traveler count")
            LabelValue(label = "Programs", value = "Selected programs")
        }
        ScreenSection(header = "Seat") {
            LabelValue(label = "Seat", value = "Seat label, or the organization will assign your seat")
        }
        ScreenSection(header = "Payment") {
            AmountPlaceholder(label = "Total paid")
        }
        OpenScreenButton(text = "View booking", screenId = "SCR-TRV-11")
        OpenScreenButton(text = "Receipts and invoices", screenId = "SCR-TRV-14", variant = TeButtonVariant.Secondary)
    }
}
