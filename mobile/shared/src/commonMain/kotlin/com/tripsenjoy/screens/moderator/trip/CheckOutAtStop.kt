package com.tripsenjoy.screens.moderator.trip

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.screens.moderator.common.LocalModeratorSession
import com.tripsenjoy.screens.moderator.common.ModEmptyBlock
import com.tripsenjoy.screens.moderator.common.ModField
import com.tripsenjoy.screens.moderator.common.ModScreen
import com.tripsenjoy.screens.moderator.common.ModSeatBadge
import com.tripsenjoy.screens.moderator.common.ModSeatState
import com.tripsenjoy.screens.moderator.common.ModSubmitStatus
import com.tripsenjoy.screens.moderator.common.tone
import com.tripsenjoy.ui.components.AlertTone
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeInlineAlert
import com.tripsenjoy.ui.components.TeOption
import com.tripsenjoy.ui.components.TeSelect

// SCR-MOD-05 Check-out at stop: check checked-in travelers off at the chosen stop or at the destination.
@Composable
fun CheckOutAtStop() {
    ModScreen(title = "Check-out at stop", description = "Check travelers off at a stop or at the destination.") {
        CheckOutMain()
    }
}

@Composable
private fun CheckOutMain() {
    val session = LocalModeratorSession.current
    var stop by remember { mutableStateOf<String?>(null) }
    var status by remember { mutableStateOf<ModSubmitStatus?>(null) }
    val onBoard = session.travelers.filter { it.state == ModSeatState.CheckedIn }
    val checkedOut = session.travelers.filter { it.state == ModSeatState.CheckedOut }
    TeSelect(
        label = "Stop",
        options = session.vehicle.stops.map { stopName -> TeOption(value = stopName, label = stopName) },
        value = stop,
        onValueChange = { value ->
            stop = value
            status = null
        },
        supportingText = "Stops come from this trip's route.",
    )
    status?.let { result -> CheckOutResult(result) }
    if (onBoard.isEmpty()) {
        ModEmptyBlock("No travelers to check out", "Only checked-in travelers appear here. Check travelers in first.")
    }
    onBoard.forEach { traveler ->
        TeCard(header = traveler.name) {
            ModField(label = "Seat", value = traveler.seat)
            ModSeatBadge(state = traveler.state)
            TeButton(
                text = "Check out at ${stop ?: "a stop"}",
                enabled = stop != null,
                onClick = {
                    stop?.let { selectedStop ->
                        status = session.checkOut(traveler.id, selectedStop)
                    }
                },
            )
        }
    }
    if (checkedOut.isNotEmpty()) {
        TeCard(header = "Checked out") {
            checkedOut.forEach { traveler -> ModField(label = traveler.name, value = "Seat ${traveler.seat}") }
        }
    }
}

@Composable
private fun CheckOutResult(result: ModSubmitStatus) {
    if (result == ModSubmitStatus.Sent) {
        TeInlineAlert(tone = AlertTone.Success, title = "Checked out", message = "The check-out is recorded.")
    } else {
        TeInlineAlert(
            tone = AlertTone.Info,
            title = "Checked out, saved on this device",
            message = "It sends in order when the connection returns.",
        )
    }
}
