package com.tripsenjoy.screens.traveler.booking

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.analytics.AnalyticsTracker
import com.tripsenjoy.auth.LocalAuthApiOrNull
import com.tripsenjoy.screens.traveler.bookings.TravelerBookingState
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
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put

// SCR-TRV-08. Generic failure reason, hold still active, cart kept (FR-BKG-03, BRL-08).
// Retry keeps the cart within the 15-minute window; when the hold expires the seat is checked again.
// Retry replaces this screen with the payment handoff, so the failed attempt is not in the back stack.
@Composable
fun PaymentFailedRetry() {
    val api = LocalAuthApiOrNull.current
    var bookingReference by remember { mutableStateOf("Booking reference") }

    LaunchedEffect(api) {
        val client = api ?: return@LaunchedEffect
        val bookingId = TravelerBookingState.selectedBookingId ?: return@LaunchedEffect
        // The screen itself is the failure resolution point (SCR-TRV-08); emit once per entry.
        AnalyticsTracker.trackAction("payment_failed", mapOf("entity_type" to "trip_booking"))
        runCatching {
            val detail = client.call(
                "booking/getBooking",
                buildJsonObject { put("bookingId", bookingId) },
                JsonElement.serializer(),
            ).jsonObject
            val booking = detail["booking"]?.jsonObject ?: detail
            bookingReference = booking["bookingReference"]?.jsonPrimitive?.contentOrNull ?: bookingReference
        }
    }

    ScreenPage(title = "Payment failed (retry)") {
        StatePreview(listedStates = setOf(TravelerScreenState.Error)) {
            TeInlineAlert(
                tone = AlertTone.Error,
                title = "Payment failed",
                message = "The payment was not completed. Your seats are still held.",
            )
            ScreenSection(header = "Your booking") {
                LabelValue(label = "Time left on hold", value = "Countdown timer")
                LabelValue(label = "Booking reference", value = bookingReference)
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
