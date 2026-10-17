package com.tripsenjoy.screens.parent.tracking

import androidx.compose.runtime.Composable
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.traveler.common.BackButton
import com.tripsenjoy.screens.traveler.common.LabelValue
import com.tripsenjoy.screens.traveler.common.OpenScreenButton
import com.tripsenjoy.screens.traveler.common.ScreenPage
import com.tripsenjoy.screens.traveler.common.StatePreview
import com.tripsenjoy.screens.traveler.common.TravelerScreenState
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeChildCard
import com.tripsenjoy.ui.components.TrackingStatus

// SCR-PAR-01. Linked children only (BR-PAR-01, BRL-10). Other participants are never shown.
// Free plan shows an upgrade prompt and no status; tracking off for a trip shows a message instead.
// Reached only from the traveler home. A child card opens SCR-PAR-03; link a child opens SCR-PAR-02.
@Composable
fun TrackerHome() {
    val nav = LocalScreenNavigator.current
    ScreenPage(title = "Tracker home") {
        StatePreview(
            listedStates = setOf(TravelerScreenState.Loading, TravelerScreenState.Empty, TravelerScreenState.Error),
            emptyTitle = "No linked children",
            emptyMessage = "Link a child to a booking to follow the child's trip.",
            emptyAction = {
                OpenScreenButton(text = "Link a child", screenId = "SCR-PAR-02", variant = TeButtonVariant.Secondary)
            },
        ) {
            TeChildCard(
                name = "Child name",
                tripName = "Trip name",
                status = TrackingStatus.Boarded,
                onOpen = { nav.open("SCR-PAR-03") },
            )
            LabelValue(label = "Vehicle", value = "Vehicle label")
            LabelValue(label = "Seat", value = "Seat label")
            LabelValue(label = "Programs", value = "Enrolled programs")
            OpenScreenButton(text = "Link a child", screenId = "SCR-PAR-02", variant = TeButtonVariant.Secondary)
            BackButton()
        }
    }
}
