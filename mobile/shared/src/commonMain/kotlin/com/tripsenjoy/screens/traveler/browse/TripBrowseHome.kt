package com.tripsenjoy.screens.traveler.browse

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.rememberScrollState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.moderator.common.icon
import com.tripsenjoy.screens.traveler.common.OpenScreenButton
import com.tripsenjoy.screens.traveler.common.ScreenPage
import com.tripsenjoy.screens.traveler.common.StatePreview
import com.tripsenjoy.screens.traveler.common.TravelerScreenState
import com.tripsenjoy.ui.components.BadgeTone
import com.tripsenjoy.ui.components.IconName
import com.tripsenjoy.ui.components.TeBadge
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeChip
import com.tripsenjoy.ui.components.TeSearchField
import com.tripsenjoy.ui.components.TeTripCard
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

// SCR-TRV-01. Trips the viewer may see. Draft and untargeted trips are never listed (FR-TRIP-02).
// VIP early-access trips appear only to VIP until the window closes. The links open the account areas.
@Composable
fun TripBrowseHome() {
    val nav = LocalScreenNavigator.current
    var query by remember { mutableStateOf("") }
    ScreenPage(title = "Trip browse (home)") {
        StatePreview(
            listedStates = setOf(TravelerScreenState.Loading, TravelerScreenState.Empty, TravelerScreenState.Error),
            emptyTitle = "No trips to show",
            emptyMessage = "Trips appear here once they are published for you.",
        ) {
            TeSearchField(
                value = query,
                onValueChange = { query = it },
                label = "Search trips",
                placeholder = "Trip name or route",
            )
            // Filters are proposed D-280.
            TeChip(label = "Filters", selected = false, onClick = {})
            HomeLinks()
            TeTripCard(
                title = "Trip name",
                meta = "Dates. Route summary. Seat mode. Organization name.",
                status = {
                    TeBadge(label = "Filling up", tone = BadgeTone.Warning, icon = IconName.Clock)
                },
                onClick = { nav.open("SCR-TRV-02") },
            )
        }
    }
}

// Links to the account areas, then the child tracker button. Each opens its screen; Back returns here.
@Composable
private fun HomeLinks() {
    val nav = LocalScreenNavigator.current
    Row(
        modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
        horizontalArrangement = Arrangement.spacedBy(TripsEnjoyTheme.spacing.space2),
    ) {
        TeChip(label = "My bookings", selected = false, onClick = { nav.open("SCR-TRV-10") })
        TeChip(label = "Albums", selected = false, onClick = { nav.open("SCR-TRV-15") })
        TeChip(label = "Plans", selected = false, onClick = { nav.open("SCR-TRV-18") })
        TeChip(label = "Profile", selected = false, onClick = { nav.open("SCR-TRV-19") })
    }
    OpenScreenButton(text = "Child tracker", screenId = "SCR-PAR-01", variant = TeButtonVariant.Secondary)
}
