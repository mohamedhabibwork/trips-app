package com.tripsenjoy.screens.traveler.booking

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.auth.LocalAuthApiOrNull
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.traveler.bookings.TravelerBookingState
import com.tripsenjoy.screens.traveler.common.AmountPlaceholder
import com.tripsenjoy.screens.traveler.common.BackButton
import com.tripsenjoy.screens.traveler.common.BookingStepper
import com.tripsenjoy.screens.traveler.common.LabelValue
import com.tripsenjoy.screens.traveler.common.OpenScreenButton
import com.tripsenjoy.screens.traveler.common.ScreenPage
import com.tripsenjoy.screens.traveler.common.ScreenSection
import com.tripsenjoy.screens.traveler.common.StatePreview
import com.tripsenjoy.screens.traveler.common.TravelerScreenState
import com.tripsenjoy.trips.TripsBrowseRepository
import com.tripsenjoy.ui.components.TeCheckbox
import com.tripsenjoy.ui.components.TeInput
import com.tripsenjoy.ui.components.TeKeyboardType
import com.tripsenjoy.ui.components.TePlanGate
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put

private const val MIN_TRAVELERS = 1

// SCR-TRV-03. Traveler count and optional programs with a live total. Trip base price is not discounted
// by plan (FR-TRV-04). VIP-only programs show locked with an upgrade prompt for other plans.
// Continue stays disabled until the traveler count is a whole number of at least MIN_TRAVELERS.
@Composable
fun BookingStep1TravelersAndPrograms() {
    val nav = LocalScreenNavigator.current
    val api = LocalAuthApiOrNull.current
    var travelerCount by remember { mutableStateOf("") }
    var programChosen by remember { mutableStateOf(false) }
    var optionalProgramLabel by remember { mutableStateOf("Program name") }

    LaunchedEffect(api) {
        val client = api ?: return@LaunchedEffect
        val tripId = TripsBrowseRepository.selectedTripId ?: return@LaunchedEffect
        runCatching {
            val detail = client.call(
                "trips/getPublishedTrip",
                buildJsonObject { put("tripId", tripId) },
                JsonElement.serializer(),
            ).jsonObject
            optionalProgramLabel = detail["titleEn"]?.jsonPrimitive?.contentOrNull
                ?.let { "$it — Optional program" }
                ?: optionalProgramLabel
        }
    }

    val countInt = travelerCount.toIntOrNull()
    val countValid = countInt != null && countInt >= MIN_TRAVELERS
    if (countValid && countInt != null) {
        TravelerBookingState.passengerCount = countInt
    }
    val countError = if (travelerCount.isNotEmpty() && !countValid) {
        "Enter a whole number, $MIN_TRAVELERS or more."
    } else {
        null
    }
    ScreenPage(title = "Booking step 1: travelers and programs") {
        BookingStepper(currentId = "travelers", completedIds = emptySet())
        StatePreview(listedStates = setOf(TravelerScreenState.Loading, TravelerScreenState.Error)) {
            ScreenSection(header = "Travelers") {
                TeInput(
                    value = travelerCount,
                    onValueChange = { travelerCount = it },
                    label = "Number of travelers",
                    supportingText = "Traveler count",
                    error = countError,
                    keyboardType = TeKeyboardType.Number,
                )
            }
            ScreenSection(header = "Programs") {
                TeCheckbox(
                    checked = programChosen,
                    onCheckedChange = { programChosen = it },
                    label = optionalProgramLabel,
                    description = "Optional. Pricing model placeholder.",
                )
                TeCheckbox(
                    checked = true,
                    onCheckedChange = {},
                    label = "Pre-required program",
                    description = "Added for this trip. Cannot be removed.",
                    enabled = false,
                )
                TePlanGate(
                    plan = "VIP",
                    lockedLabel = "VIP-only program",
                    upgradeLabel = "Upgrade to VIP",
                    onUpgrade = { nav.open("SCR-TRV-18") },
                )
            }
            ScreenSection(header = "Total") {
                LabelValue(label = "Plan discount", value = "5 percent (Explorer) or 10 percent (VIP) on programs only")
                AmountPlaceholder(label = "Total, updates as you choose")
            }
            OpenScreenButton(text = "Continue", screenId = "SCR-TRV-04", enabled = countValid)
            BackButton()
        }
    }
}
