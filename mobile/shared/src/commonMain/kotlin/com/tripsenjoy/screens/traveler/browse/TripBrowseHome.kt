package com.tripsenjoy.screens.traveler.browse

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.rememberScrollState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.tripsenjoy.auth.LocalAuthApiOrNull
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.moderator.common.icon
import com.tripsenjoy.screens.traveler.common.OpenScreenButton
import com.tripsenjoy.screens.traveler.common.ScreenPage
import com.tripsenjoy.screens.traveler.common.StatePreview
import com.tripsenjoy.screens.traveler.common.TravelerScreenState
import com.tripsenjoy.trips.PublicTripSummary
import com.tripsenjoy.trips.TripsBrowseRepository
import com.tripsenjoy.ui.components.BadgeTone
import com.tripsenjoy.ui.components.IconName
import com.tripsenjoy.ui.components.TeBadge
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeChip
import com.tripsenjoy.ui.components.TeSearchField
import com.tripsenjoy.ui.components.TeTripCard
import com.tripsenjoy.ui.theme.TripsEnjoyTheme
import kotlin.coroutines.cancellation.CancellationException

// SCR-TRV-01. Trips the viewer may see. Draft and untargeted trips are never listed (FR-TRIP-02).
// VIP early-access trips appear only to VIP until the window closes. The links open the account areas.
@Composable
fun TripBrowseHome() {
    val nav = LocalScreenNavigator.current
    val api = LocalAuthApiOrNull.current
    val repository = remember(api) { api?.let(::TripsBrowseRepository) }
    var query by remember { mutableStateOf("") }
    var trips by remember { mutableStateOf<List<PublicTripSummary>>(emptyList()) }

    LaunchedEffect(repository, query) {
        if (repository == null) return@LaunchedEffect
        try {
            trips = repository.browsePublicTrips(search = query.takeIf { it.isNotBlank() })
        } catch (caught: CancellationException) {
            throw caught
        } catch (_: Throwable) {
            // Keep default preview card when offline or running in screen catalog
        }
    }

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
            if (trips.isNotEmpty()) {
                for (trip in trips) {
                    val routeSummary = listOfNotNull(
                        trip.origin?.nameEn?.takeIf { it.isNotBlank() },
                        trip.destinations.firstOrNull()?.nameEn?.takeIf { it.isNotBlank() },
                    ).joinToString(" → ")
                    val seatModeLabel = if (trip.seatAssignmentMode == "traveler_choice") {
                        "Self-select"
                    } else {
                        "Organization-assigned"
                    }
                    val metaParts = listOfNotNull(
                        trip.startsAt?.take(10),
                        routeSummary.takeIf { it.isNotBlank() },
                        seatModeLabel,
                        trip.organizerNameEn.takeIf { it.isNotBlank() },
                    )
                    TeTripCard(
                        title = trip.titleEn.ifBlank { trip.titleAr.ifBlank { "Trip name" } },
                        meta = metaParts.joinToString(". ").ifBlank {
                            "Dates. Route summary. Seat mode. Organization name."
                        },
                        status = {
                            TeBadge(
                                label = if (trip.state == "filling_up") "Filling up" else "Published",
                                tone = if (trip.state == "filling_up") BadgeTone.Warning else BadgeTone.Info,
                                icon = IconName.Clock,
                            )
                        },
                        onClick = {
                            TripsBrowseRepository.selectedTripId = trip.id
                            nav.open("SCR-TRV-02")
                        },
                    )
                }
            } else {
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

