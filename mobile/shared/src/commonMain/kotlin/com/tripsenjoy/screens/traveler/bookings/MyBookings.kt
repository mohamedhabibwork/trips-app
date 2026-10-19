package com.tripsenjoy.screens.traveler.bookings

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.auth.LocalAuthApiOrNull
import com.tripsenjoy.screens.moderator.common.icon
import com.tripsenjoy.screens.traveler.common.BackButton
import com.tripsenjoy.screens.traveler.common.LabelValue
import com.tripsenjoy.screens.traveler.common.OpenScreenButton
import com.tripsenjoy.screens.traveler.common.ScreenPage
import com.tripsenjoy.screens.traveler.common.StatePreview
import com.tripsenjoy.screens.traveler.common.TravelerScreenState
import com.tripsenjoy.ui.components.BadgeTone
import com.tripsenjoy.ui.components.IconName
import com.tripsenjoy.ui.components.TeBadge
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeTab
import com.tripsenjoy.ui.components.TeTabs
import com.tripsenjoy.ui.components.TeTrackingStatus
import com.tripsenjoy.ui.components.TrackingStatus
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

private const val UPCOMING_TAB = "upcoming"
private const val PAST_TAB = "past"

internal object TravelerBookingState {
    var selectedBookingId: String? = null
    var leadPassengerName: String = "Traveler"
    var passengerCount: Int = 1
    var selectedProgramIds: List<String> = emptyList()
    var selectedSeatLabel: String = "1A"
    var couponCode: String? = null
    var lastPaymentId: String? = null
    var selectedAlbumId: String? = null
}

private data class BookingCardData(
    val id: String,
    val tripTitle: String,
    val datesSummary: String,
    val status: String,
)

@Composable
fun MyBookings() {
    val api = LocalAuthApiOrNull.current
    var period by remember { mutableStateOf(UPCOMING_TAB) }
    var bookings by remember { mutableStateOf<List<BookingCardData>>(emptyList()) }

    LaunchedEffect(api) {
        val client = api ?: return@LaunchedEffect
        runCatching {
            val arr = client.call("booking/listMyBookings", JsonNull, JsonElement.serializer()).jsonArray
            bookings = arr.map { el ->
                val obj = el.jsonObject
                BookingCardData(
                    id = obj["id"]?.jsonPrimitive?.contentOrNull ?: "",
                    tripTitle = obj["bookingReference"]?.jsonPrimitive?.contentOrNull
                        ?: obj["tripTitle"]?.jsonPrimitive?.contentOrNull
                        ?: "Booked trip",
                    datesSummary = obj["createdAt"]?.jsonPrimitive?.contentOrNull
                        ?: obj["departureAt"]?.jsonPrimitive?.contentOrNull
                        ?: "Scheduled dates",
                    status = obj["status"]?.jsonPrimitive?.contentOrNull ?: "Confirmed",
                )
            }
            if (TravelerBookingState.selectedBookingId == null) {
                TravelerBookingState.selectedBookingId = bookings.firstOrNull()?.id
            }
        }
    }

    val first = bookings.firstOrNull()
    ScreenPage(title = "My bookings") {
        StatePreview(
            listedStates = setOf(TravelerScreenState.Loading, TravelerScreenState.Empty, TravelerScreenState.Error),
            emptyTitle = "No bookings yet",
            emptyMessage = "Your bookings appear here after you book a trip.",
            emptyAction = { OpenScreenButton(text = "Browse trips", screenId = "SCR-TRV-01", variant = TeButtonVariant.Secondary) },
        ) {
            TeTabs(
                tabs = listOf(
                    TeTab(id = UPCOMING_TAB, label = "Upcoming"),
                    TeTab(id = PAST_TAB, label = "Past"),
                ),
                activeId = period,
                onSelect = { period = it },
                ariaLabel = "Booking periods",
            )
            if (period == UPCOMING_TAB) UpcomingBookingCard(first) else PastBookingCard(first)
            BackButton()
        }
    }
}

@Composable
private fun UpcomingBookingCard(booking: BookingCardData?) {
    TeCard(header = booking?.tripTitle ?: "Booked trip") {
        LabelValue(label = "Dates", value = booking?.datesSummary ?: "Scheduled dates")
        TeBadge(label = booking?.status ?: "Confirmed", tone = BadgeTone.Success, icon = IconName.Check)
        TeTrackingStatus(status = TrackingStatus.NotBoarded, label = "Not boarded")
        OpenScreenButton(text = "Open booking", screenId = "SCR-TRV-11")
    }
}

@Composable
private fun PastBookingCard(booking: BookingCardData?) {
    TeCard(header = booking?.tripTitle ?: "Completed trip") {
        LabelValue(label = "Dates", value = booking?.datesSummary ?: "Completed dates")
        TeBadge(label = "Checked out", tone = BadgeTone.Neutral, icon = IconName.Check)
        OpenScreenButton(text = "Open booking", screenId = "SCR-TRV-11", variant = TeButtonVariant.Secondary)
    }
}
