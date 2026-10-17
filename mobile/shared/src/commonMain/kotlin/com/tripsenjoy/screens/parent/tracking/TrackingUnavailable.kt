package com.tripsenjoy.screens.parent.tracking

import androidx.compose.runtime.Composable
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.traveler.common.BackButton
import com.tripsenjoy.screens.traveler.common.ScreenNote
import com.tripsenjoy.screens.traveler.common.ScreenPage
import com.tripsenjoy.screens.traveler.common.ScreenSection
import com.tripsenjoy.screens.traveler.common.StatePreview
import com.tripsenjoy.screens.traveler.common.TravelerScreenState
import com.tripsenjoy.ui.components.TePlanGate

// SCR-PAR-04. Plan-blocked state: the parent's own plan is Free, so the upgrade goes to SCR-TRV-18.
// Organization-blocked (organization on Starter, or child tracking off for this trip) shows the reason
// and asks the parent to contact the organization; no upgrade is offered to the parent in that case.
@Composable
fun TrackingUnavailable() {
    val nav = LocalScreenNavigator.current
    ScreenPage(title = "Tracking unavailable") {
        StatePreview(listedStates = setOf(TravelerScreenState.Error)) {
            TePlanGate(
                plan = "Explorer",
                lockedLabel = "Child tracking needs the Explorer plan or VIP.",
                upgradeLabel = "View plans",
                onUpgrade = { nav.open("SCR-TRV-18") },
            )
            ScreenSection(header = "Organization setting") {
                ScreenNote(text = "Child tracking is off for this trip. Contact the organization to turn it on.")
            }
            BackButton()
        }
    }
}
