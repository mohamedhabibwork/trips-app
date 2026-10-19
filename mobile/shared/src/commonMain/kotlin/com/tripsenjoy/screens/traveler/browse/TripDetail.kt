package com.tripsenjoy.screens.traveler.browse

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
import com.tripsenjoy.screens.traveler.common.ScreenPage
import com.tripsenjoy.screens.traveler.common.ScreenSection
import com.tripsenjoy.screens.traveler.common.StatePreview
import com.tripsenjoy.screens.traveler.common.TravelerScreenState
import com.tripsenjoy.trips.PublicTripSummary
import com.tripsenjoy.trips.TripsBrowseRepository
import com.tripsenjoy.ui.components.BadgeTone
import com.tripsenjoy.ui.components.IconName
import com.tripsenjoy.ui.components.TeBadge
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import kotlin.coroutines.cancellation.CancellationException

// SCR-TRV-02. Full trip so the viewer can decide to book. Bookable in Published, Ready and Filling Up.
// Primary is book for a signed-in traveler; an anonymous visitor sees sign in to book instead.
@Composable
fun TripDetail() {
    val api = LocalAuthApiOrNull.current
    val repository = remember(api) { api?.let(::TripsBrowseRepository) }
    var trip by remember { mutableStateOf<PublicTripSummary?>(null) }

    LaunchedEffect(repository) {
        if (repository == null) return@LaunchedEffect
        try {
            val targetId = TripsBrowseRepository.selectedTripId
                ?: repository.browsePublicTrips().firstOrNull()?.id
                ?: return@LaunchedEffect
            trip = repository.getPublicTripDetail(targetId)
        } catch (caught: CancellationException) {
            throw caught
        } catch (_: Throwable) {
            // Keep default preview values when offline
        }
    }

    val departureValue = trip?.startsAt?.let { "${it.take(16).replace('T', ' ')} (${trip?.timezone.orEmpty()})" }
        ?: "Date and time in the trip time zone"
    val routeValue = trip?.let { detail ->
        listOfNotNull(
            detail.origin?.nameEn?.takeIf { it.isNotBlank() },
            detail.destinations.firstOrNull()?.nameEn?.takeIf { it.isNotBlank() },
        ).joinToString(" → ").ifBlank { null }
    } ?: "Route summary"
    val stopsValue = trip?.destinations
        ?.mapNotNull { it.nameEn.takeIf(String::isNotBlank) }
        ?.joinToString(", ")
        ?.ifBlank { null }
        ?: "Stops in order"
    val seatModeValue = trip?.let {
        if (it.seatAssignmentMode == "traveler_choice") "Self-select" else "Organization-assigned"
    } ?: "Self-select or organization-assigned"
    val capacityValue = trip?.let { "${it.remainingSeatsCount} of ${it.totalCapacity} available" }
        ?: "Capacity status"
    val childTrackingValue = trip?.let { if (it.childTrackingEnabled) "On for this trip" else "Off for this trip" }
        ?: "On for this trip"

    ScreenPage(title = "Trip detail") {
        StatePreview(listedStates = setOf(TravelerScreenState.Loading, TravelerScreenState.Error)) {
            TeBadge(label = "Bookable", tone = BadgeTone.Success, icon = IconName.Check)
            ScreenSection(header = "Schedule") {
                LabelValue(label = "Departure", value = departureValue)
                LabelValue(label = "Route", value = routeValue)
                LabelValue(label = "Stops", value = stopsValue)
            }
            ScreenSection(header = "Vehicle and seats") {
                LabelValue(label = "Vehicle type", value = "Vehicle type")
                LabelValue(label = "Seat mode", value = seatModeValue)
                LabelValue(label = "Capacity", value = capacityValue)
                LabelValue(label = "Child tracking", value = childTrackingValue)
            }
            ScreenSection(header = "Programs") {
                LabelValue(label = "Program name", value = "Pricing model")
                AmountPlaceholder(label = "Program price")
            }
            OpenScreenButton(text = "Book this trip", screenId = "SCR-TRV-03")
            TeButton(text = "Share", onClick = {}, variant = TeButtonVariant.Secondary)
            BackButton()
        }
    }
}

