package com.tripsenjoy.screens.moderator.checkin

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.moderator.ModeratorRoutes
import com.tripsenjoy.screens.moderator.common.LocalModeratorSession
import com.tripsenjoy.screens.moderator.common.ModEmptyBlock
import com.tripsenjoy.screens.moderator.common.ModErrorBlock
import com.tripsenjoy.screens.moderator.common.ModField
import com.tripsenjoy.screens.moderator.common.ModLoadingBlock
import com.tripsenjoy.screens.moderator.common.ModNote
import com.tripsenjoy.screens.moderator.common.ModScreen
import com.tripsenjoy.screens.moderator.common.ModSeatBadge
import com.tripsenjoy.screens.moderator.common.ModSeatState
import com.tripsenjoy.screens.moderator.common.ModTraveler
import com.tripsenjoy.screens.moderator.common.StatePreview
import com.tripsenjoy.ui.components.ErrorKind
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeSearchField

// SCR-MOD-02 Traveler manifest: this vehicle's travelers and their state. Check-in and check-out open their screens.
@Composable
fun TravelerManifest() {
    ModScreen(
        title = "Traveler manifest",
        description = "Travelers assigned to this vehicle only. Travelers on other vehicles are not listed.",
    ) {
        StatePreview(
            main = { ManifestMain() },
            loading = { ModLoadingBlock("Loading the manifest") },
            empty = { ModEmptyBlock("No travelers assigned", "The organization has not assigned travelers to this vehicle yet.") },
            error = { ModErrorBlock(ErrorKind.Server) },
        )
    }
}

@Composable
private fun ManifestMain() {
    val session = LocalModeratorSession.current
    var query by remember { mutableStateOf("") }
    TeSearchField(
        value = query,
        onValueChange = { value -> query = value },
        label = "Search by name or booking code",
    )
    val matches = session.travelers.filter { traveler ->
        query.isBlank() ||
            traveler.name.contains(query, ignoreCase = true) ||
            traveler.bookingCode.contains(query, ignoreCase = true)
    }
    if (matches.isEmpty()) {
        ModNote("No traveler matches this search.")
    }
    matches.forEach { traveler -> TravelerRow(traveler) }
}

@Composable
private fun TravelerRow(traveler: ModTraveler) {
    val nav = LocalScreenNavigator.current
    val session = LocalModeratorSession.current
    TeCard(header = traveler.name) {
        ModField(label = "Booking code", value = traveler.bookingCode)
        ModField(label = "Seat", value = traveler.seat)
        ModSeatBadge(state = traveler.state)
        when (traveler.state) {
            ModSeatState.Reserved -> TeButton(
                text = "Check in",
                onClick = {
                    session.prefilledCode = traveler.bookingCode
                    nav.open(ModeratorRoutes.CHECK_IN)
                },
            )
            ModSeatState.CheckedIn -> TeButton(
                text = "Check out",
                onClick = { nav.open(ModeratorRoutes.CHECK_OUT) },
                variant = TeButtonVariant.Secondary,
            )
            ModSeatState.CheckedOut -> ModNote("Checked out. No further action.")
        }
    }
}
