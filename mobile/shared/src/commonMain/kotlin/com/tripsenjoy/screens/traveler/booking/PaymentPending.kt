package com.tripsenjoy.screens.traveler.booking

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.auth.LocalAuthApiOrNull
import com.tripsenjoy.screens.moderator.common.icon
import com.tripsenjoy.screens.traveler.bookings.TravelerBookingState
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
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put

// SCR-TRV-07. Shown as "confirming payment" when the gateway does not answer within 30 seconds (D-30).
// Confirmed only after a verified callback (FR-PAY-01). Unresolved after 15 minutes goes to admin.
// The two outcome buttons stand in for the gateway callback, which this screen does not receive yet.
@Composable
fun PaymentPending() {
    val api = LocalAuthApiOrNull.current
    var bookingReference by remember { mutableStateOf("Booking reference") }

    LaunchedEffect(api) {
        val client = api ?: return@LaunchedEffect
        val bookingId = TravelerBookingState.selectedBookingId ?: return@LaunchedEffect
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

    ScreenPage(title = "Payment pending") {
        TeBadge(label = "Confirming payment", tone = BadgeTone.Warning, icon = IconName.Clock)
        ScreenSection(header = "Booking") {
            LabelValue(label = "Booking reference", value = bookingReference)
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
