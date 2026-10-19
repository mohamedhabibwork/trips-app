package com.tripsenjoy.screens.traveler.booking

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.auth.LocalAuthApiOrNull
import com.tripsenjoy.screens.traveler.bookings.TravelerBookingState
import com.tripsenjoy.screens.traveler.common.AmountPlaceholder
import com.tripsenjoy.screens.traveler.common.LabelValue
import com.tripsenjoy.screens.traveler.common.OpenScreenButton
import com.tripsenjoy.screens.traveler.common.ScreenPage
import com.tripsenjoy.screens.traveler.common.ScreenSection
import com.tripsenjoy.ui.components.AlertTone
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeInlineAlert
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put

// SCR-TRV-09. Confirmed booking with reference and documents. Seat shows "the organization will assign
// your seat" when self-select is off (FR-BKG-05, BR-BKG-05). Confirmation is also sent on the traveler's channels.
// This screen replaces the payment step, so Back does not return to payment.
@Composable
fun BookingConfirmed() {
    val api = LocalAuthApiOrNull.current
    var reference by remember { mutableStateOf("Booking reference") }
    var tripName by remember { mutableStateOf("Trip name") }
    var datesSummary by remember { mutableStateOf("Dates and route summary") }
    var travelerCount by remember { mutableStateOf("Traveler count") }
    var seatLabel by remember { mutableStateOf("Seat label, or the organization will assign your seat") }

    LaunchedEffect(api) {
        val client = api ?: return@LaunchedEffect
        TravelerBookingState.lastPaymentId?.let { paymentId ->
            runCatching {
                client.call(
                    "payments/confirmPayment",
                    buildJsonObject { put("paymentId", paymentId) },
                    JsonElement.serializer(),
                )
            }
        }
        val bookingId = TravelerBookingState.selectedBookingId ?: return@LaunchedEffect
        runCatching {
            val detail = client.call(
                "booking/getBooking",
                buildJsonObject { put("bookingId", bookingId) },
                JsonElement.serializer(),
            ).jsonObject
            val booking = detail["booking"]?.jsonObject ?: detail
            reference = booking["bookingReference"]?.jsonPrimitive?.contentOrNull ?: reference
            tripName = booking["tripId"]?.jsonPrimitive?.contentOrNull ?: tripName
            datesSummary = booking["createdAt"]?.jsonPrimitive?.contentOrNull ?: datesSummary
            travelerCount = booking["passengersCount"]?.jsonPrimitive?.contentOrNull ?: travelerCount
            val firstSeat = booking["seatLabels"]?.jsonArray?.firstOrNull()?.jsonPrimitive?.contentOrNull
            if (firstSeat != null) {
                seatLabel = firstSeat
            }
        }
    }

    ScreenPage(title = "Booking confirmed") {
        TeInlineAlert(
            tone = AlertTone.Success,
            title = "Booking confirmed",
            message = "Your confirmation is on your channels.",
        )
        ScreenSection(header = "Booking reference") {
            LabelValue(label = "Reference", value = reference)
        }
        ScreenSection(header = "Trip") {
            LabelValue(label = "Trip", value = tripName)
            LabelValue(label = "Dates", value = datesSummary)
        }
        ScreenSection(header = "Travelers and programs") {
            LabelValue(label = "Travelers", value = travelerCount)
            LabelValue(label = "Programs", value = "Selected programs")
        }
        ScreenSection(header = "Seat") {
            LabelValue(label = "Seat", value = seatLabel)
        }
        ScreenSection(header = "Payment") {
            AmountPlaceholder(label = "Total paid")
        }
        OpenScreenButton(text = "View booking", screenId = "SCR-TRV-11")
        OpenScreenButton(text = "Receipts and invoices", screenId = "SCR-TRV-14", variant = TeButtonVariant.Secondary)
    }
}
