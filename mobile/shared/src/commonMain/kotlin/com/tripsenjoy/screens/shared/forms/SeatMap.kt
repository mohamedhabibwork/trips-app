package com.tripsenjoy.screens.shared.forms

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.moderator.common.icon
import com.tripsenjoy.screens.photographer.common.StatePreview
import com.tripsenjoy.screens.shared.common.ScreenBody
import com.tripsenjoy.screens.shared.common.StateErrorBlock
import com.tripsenjoy.screens.shared.common.StateLoadingCard
import com.tripsenjoy.ui.components.SeatState
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TePageHeader
import com.tripsenjoy.ui.components.TeSeat
import com.tripsenjoy.ui.components.TeSeatMap
import com.tripsenjoy.ui.components.TeSeatRow

private val SAMPLE_SEAT_ROWS = listOf(
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
            TeSeat(id = "2A", label = "2A", state = SeatState.Blocked),
            TeSeat(id = "2B", label = "2B", state = SeatState.Available),
            TeSeat(id = "2C", label = "2C", state = SeatState.Available),
        ),
    ),
)

// Marks the chosen seat as Selected in a copy of the rows. The source rows stay unchanged.
private fun List<TeSeatRow>.withSelection(seatId: String?): List<TeSeatRow> = map { row ->
    row.copy(
        seats = row.seats.map { seat ->
            if (seat.id == seatId) seat.copy(state = SeatState.Selected) else seat
        },
    )
}

// SCR-SHR-15 Seat map. Traveler self-select (FR-SEAT-02). Each seat shows its state as a word and icon, and the map
// has a list alternative for screen readers (NFR-A11Y-03). Confirm returns to the booking that opened the map.
@Composable
fun SeatMap() {
    val nav = LocalScreenNavigator.current
    var selectedSeat by remember { mutableStateOf<String?>(null) }
    ScreenBody {
        TePageHeader(title = "Seat map", description = "Choose a seat on this vehicle")
        StatePreview(
            ariaLabel = "Seat map states",
            main = {
                TeSeatMap(
                    rows = SAMPLE_SEAT_ROWS.withSelection(selectedSeat),
                    onSelect = { selectedSeat = it },
                    ariaLabel = "Seat map for this vehicle",
                )
                TeButton(
                    text = "Confirm seat",
                    onClick = { nav.back() },
                    enabled = selectedSeat != null,
                )
            },
            loading = { StateLoadingCard(subject = "the seat map") },
            error = { StateErrorBlock(retryMessage = "The seat map did not load. Retry to see live seats.") },
        )
    }
}
