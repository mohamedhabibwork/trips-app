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
import com.tripsenjoy.screens.traveler.common.BackButton
import com.tripsenjoy.screens.traveler.common.BookingStepper
import com.tripsenjoy.screens.traveler.common.LabelValue
import com.tripsenjoy.screens.traveler.common.OpenScreenButton
import com.tripsenjoy.screens.traveler.common.ScreenNote
import com.tripsenjoy.screens.traveler.common.ScreenPage
import com.tripsenjoy.screens.traveler.common.ScreenSection
import com.tripsenjoy.screens.traveler.common.StatePreview
import com.tripsenjoy.screens.traveler.common.TravelerScreenState
import com.tripsenjoy.trips.TripsBrowseRepository
import com.tripsenjoy.ui.components.BadgeTone
import com.tripsenjoy.ui.components.IconName
import com.tripsenjoy.ui.components.SeatState
import com.tripsenjoy.ui.components.TeBadge
import com.tripsenjoy.ui.components.TeSeat
import com.tripsenjoy.ui.components.TeSeatMap
import com.tripsenjoy.ui.components.TeSeatRow
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

// SCR-TRV-04. Live seat map with a 15-minute hold (BRL-08). Seat labels are layout placeholders.
// Screen readers get the seat list alongside the map (NFR-A11Y-03). Hold and continue needs a chosen seat.
@Composable
fun BookingStep2SeatSelection() {
    val api = LocalAuthApiOrNull.current
    var selectedSeat by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(api) {
        val client = api ?: return@LaunchedEffect
        val tripId = TripsBrowseRepository.selectedTripId ?: return@LaunchedEffect
        runCatching {
            client.call(
                "seats/getSeatMap",
                buildJsonObject { put("tripId", tripId) },
                JsonElement.serializer(),
            )
        }
    }

    ScreenPage(title = "Booking step 2: seat selection") {
        BookingStepper(currentId = "seats", completedIds = setOf("travelers"))
        StatePreview(listedStates = setOf(TravelerScreenState.Loading, TravelerScreenState.Error)) {
            TeBadge(label = "Hold active", tone = BadgeTone.Info, icon = IconName.Clock)
            ScreenNote(text = "Seats are held for 15 minutes.")
            TeSeatMap(
                rows = seatRowsFor(selectedSeat),
                onSelect = { seatId ->
                    selectedSeat = seatId
                    TravelerBookingState.selectedSeatLabel = seatId
                },
                ariaLabel = "Seat map. Choose a seat, or use the seat list.",
            )
            ScreenSection(header = "Selected seats") {
                LabelValue(label = "Seat", value = selectedSeat ?: "No seat selected")
            }
            OpenScreenButton(
                text = "Hold seats and continue",
                screenId = "SCR-TRV-05",
                enabled = selectedSeat != null,
            )
            BackButton()
        }
    }
}

// Seat rows with the chosen seat marked as selected.
private fun seatRowsFor(selectedId: String?): List<TeSeatRow> = SEAT_LAYOUT.map { row ->
    row.copy(
        seats = row.seats.map { seat ->
            if (seat.id == selectedId) seat.copy(state = SeatState.Selected) else seat
        },
    )
}

private val SEAT_LAYOUT = listOf(
    TeSeatRow(
        id = "row-1",
        seats = listOf(
            TeSeat(id = "1A", label = "1A", state = SeatState.Available),
            TeSeat(id = "1B", label = "1B", state = SeatState.Available),
            TeSeat(id = "1C", label = "1C", state = SeatState.Taken),
        ),
    ),
    TeSeatRow(
        id = "row-2",
        seats = listOf(
            TeSeat(id = "2A", label = "2A", state = SeatState.Available),
            TeSeat(id = "2B", label = "2B", state = SeatState.Blocked),
            TeSeat(id = "2C", label = "2C", state = SeatState.Available),
        ),
    ),
)
