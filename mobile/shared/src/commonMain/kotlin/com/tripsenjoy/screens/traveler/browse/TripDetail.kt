package com.tripsenjoy.screens.traveler.browse

import androidx.compose.runtime.Composable
import com.tripsenjoy.screens.moderator.common.icon
import com.tripsenjoy.screens.traveler.common.AmountPlaceholder
import com.tripsenjoy.screens.traveler.common.BackButton
import com.tripsenjoy.screens.traveler.common.LabelValue
import com.tripsenjoy.screens.traveler.common.OpenScreenButton
import com.tripsenjoy.screens.traveler.common.ScreenPage
import com.tripsenjoy.screens.traveler.common.ScreenSection
import com.tripsenjoy.screens.traveler.common.StatePreview
import com.tripsenjoy.screens.traveler.common.TravelerScreenState
import com.tripsenjoy.ui.components.BadgeTone
import com.tripsenjoy.ui.components.IconName
import com.tripsenjoy.ui.components.TeBadge
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant

// SCR-TRV-02. Full trip so the viewer can decide to book. Bookable in Published, Ready and Filling Up.
// Primary is book for a signed-in traveler; an anonymous visitor sees sign in to book instead.
@Composable
fun TripDetail() {
    ScreenPage(title = "Trip detail") {
        StatePreview(listedStates = setOf(TravelerScreenState.Loading, TravelerScreenState.Error)) {
            TeBadge(label = "Bookable", tone = BadgeTone.Success, icon = IconName.Check)
            ScreenSection(header = "Schedule") {
                LabelValue(label = "Departure", value = "Date and time in the trip time zone")
                LabelValue(label = "Route", value = "Route summary")
                LabelValue(label = "Stops", value = "Stops in order")
            }
            ScreenSection(header = "Vehicle and seats") {
                LabelValue(label = "Vehicle type", value = "Vehicle type")
                LabelValue(label = "Seat mode", value = "Self-select or organization-assigned")
                LabelValue(label = "Capacity", value = "Capacity status")
                LabelValue(label = "Child tracking", value = "On for this trip")
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
