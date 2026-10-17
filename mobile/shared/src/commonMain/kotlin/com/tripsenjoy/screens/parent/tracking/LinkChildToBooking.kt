package com.tripsenjoy.screens.parent.tracking

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.screens.traveler.common.BackButton
import com.tripsenjoy.screens.traveler.common.ScreenPage
import com.tripsenjoy.screens.traveler.common.StatePreview
import com.tripsenjoy.screens.traveler.common.TravelerScreenState
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeInput

// SCR-PAR-02. Link a child to one booking. An invalid reference gets a generic refusal with no booking
// details (FR-PAR-01). Child details are proposed D-125 and still to be confirmed.
// Link stays disabled until both fields are filled, and a successful link returns to the tracker home.
@Composable
fun LinkChildToBooking() {
    var bookingReference by remember { mutableStateOf("") }
    var childName by remember { mutableStateOf("") }
    val canLink = bookingReference.isNotBlank() && childName.isNotBlank()
    ScreenPage(title = "Link child to booking") {
        StatePreview(listedStates = setOf(TravelerScreenState.Error)) {
            TeInput(
                value = bookingReference,
                onValueChange = { bookingReference = it },
                label = "Booking reference",
                supportingText = "The reference from the booking confirmation",
            )
            TeInput(
                value = childName,
                onValueChange = { childName = it },
                label = "Child full name",
                supportingText = "Child details to be confirmed (D-125)",
            )
            BackButton(text = "Link child", enabled = canLink)
            BackButton(text = "Cancel", variant = TeButtonVariant.Ghost)
        }
    }
}
