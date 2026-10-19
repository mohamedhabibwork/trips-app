package com.tripsenjoy.screens.traveler.bookings

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.auth.LocalAuthApiOrNull
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
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put

@Composable
fun BookingDetail() {
    val api = LocalAuthApiOrNull.current
    var tripTitle by remember { mutableStateOf("Booked trip") }
    var datesSummary by remember { mutableStateOf("Scheduled dates") }
    var travelerCount by remember { mutableStateOf("1") }
    var seatLabel by remember { mutableStateOf("Assigned seat") }
    var statusLabel by remember { mutableStateOf("Confirmed") }

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
            tripTitle = booking["bookingReference"]?.jsonPrimitive?.contentOrNull
                ?: booking["tripTitle"]?.jsonPrimitive?.contentOrNull
                ?: tripTitle
            datesSummary = booking["createdAt"]?.jsonPrimitive?.contentOrNull
                ?: booking["departureAt"]?.jsonPrimitive?.contentOrNull
                ?: datesSummary
            travelerCount = booking["passengersCount"]?.jsonPrimitive?.contentOrNull
                ?: booking["travelerCount"]?.jsonPrimitive?.contentOrNull
                ?: travelerCount
            val firstSeat = booking["seatLabels"]?.jsonArray?.firstOrNull()?.jsonPrimitive?.contentOrNull
            seatLabel = firstSeat
                ?: booking["seatLabel"]?.jsonPrimitive?.contentOrNull
                ?: seatLabel
            statusLabel = booking["status"]?.jsonPrimitive?.contentOrNull ?: statusLabel
        }
    }

    ScreenPage(title = "Booking detail") {
        StatePreview(listedStates = setOf(TravelerScreenState.Loading, TravelerScreenState.Error)) {
            TeBadge(label = statusLabel, tone = BadgeTone.Success, icon = IconName.Check)
            ScreenSection(header = "Trip") {
                LabelValue(label = "Trip", value = tripTitle)
                LabelValue(label = "Dates", value = datesSummary)
            }
            ScreenSection(header = "Travelers and programs") {
                LabelValue(label = "Travelers", value = travelerCount)
                LabelValue(label = "Programs", value = "Included programs")
            }
            ScreenSection(header = "Seat and boarding") {
                LabelValue(label = "Seat", value = seatLabel)
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
