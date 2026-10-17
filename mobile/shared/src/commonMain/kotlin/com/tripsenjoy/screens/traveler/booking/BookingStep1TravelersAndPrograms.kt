package com.tripsenjoy.screens.traveler.booking

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.traveler.common.AmountPlaceholder
import com.tripsenjoy.screens.traveler.common.BackButton
import com.tripsenjoy.screens.traveler.common.BookingStepper
import com.tripsenjoy.screens.traveler.common.LabelValue
import com.tripsenjoy.screens.traveler.common.OpenScreenButton
import com.tripsenjoy.screens.traveler.common.ScreenPage
import com.tripsenjoy.screens.traveler.common.ScreenSection
import com.tripsenjoy.screens.traveler.common.StatePreview
import com.tripsenjoy.screens.traveler.common.TravelerScreenState
import com.tripsenjoy.ui.components.TeCheckbox
import com.tripsenjoy.ui.components.TeInput
import com.tripsenjoy.ui.components.TeKeyboardType
import com.tripsenjoy.ui.components.TePlanGate

private const val MIN_TRAVELERS = 1

// SCR-TRV-03. Traveler count and optional programs with a live total. Trip base price is not discounted
// by plan (FR-TRV-04). VIP-only programs show locked with an upgrade prompt for other plans.
// Continue stays disabled until the traveler count is a whole number of at least MIN_TRAVELERS.
@Composable
fun BookingStep1TravelersAndPrograms() {
    val nav = LocalScreenNavigator.current
    var travelerCount by remember { mutableStateOf("") }
    var programChosen by remember { mutableStateOf(false) }
    val countValid = travelerCount.toIntOrNull()?.let { it >= MIN_TRAVELERS } == true
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
                    label = "Program name",
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
