package com.tripsenjoy.screens.driver.trips

import androidx.compose.runtime.Composable
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.driver.DriverRoutes
import com.tripsenjoy.screens.driver.common.DriverSampleData
import com.tripsenjoy.screens.driver.common.DrvEmptyBlock
import com.tripsenjoy.screens.driver.common.DrvErrorBlock
import com.tripsenjoy.screens.driver.common.DrvLoadingBlock
import com.tripsenjoy.screens.driver.common.DrvNote
import com.tripsenjoy.screens.driver.common.DrvScreen
import com.tripsenjoy.screens.driver.common.LocalDriverSession
import com.tripsenjoy.screens.driver.common.StatePreview
import com.tripsenjoy.screens.driver.common.tone
import com.tripsenjoy.ui.components.BadgeTone
import com.tripsenjoy.ui.components.ErrorKind
import com.tripsenjoy.ui.components.IconName
import com.tripsenjoy.ui.components.TeAssignmentCard
import com.tripsenjoy.ui.components.TeBadge
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeKpiTile

// SCR-DRV-01 Driver home: status, next assignment, open offers and the links to the other driver screens.
// While a lab test is pending the app opens on the lab-test gate instead (see DriverApp).
@Composable
fun DriverHome() {
    DrvScreen(title = "Driver home", description = "Your status, next assignment and open offers.") {
        StatePreview(
            main = { DriverHomeMain() },
            loading = { DrvLoadingBlock("Loading your driver home") },
            empty = { DrvEmptyBlock("No assignments", "You have no assigned trips yet. New offers appear under Trip offers.") },
            error = { DrvErrorBlock(ErrorKind.Server) },
        )
    }
}

@Composable
private fun DriverHomeMain() {
    val nav = LocalScreenNavigator.current
    val session = LocalDriverSession.current
    val assignment = session.assignment
    TeBadge(label = "Active", tone = BadgeTone.Success, icon = IconName.Check)
    TeAssignmentCard(
        tripName = assignment.tripName,
        route = assignment.route,
        departure = assignment.departure,
        vehicle = assignment.vehicle,
        actionLabel = "Open assignment",
        onAction = { nav.open(DriverRoutes.ASSIGNMENTS) },
    )
    TeKpiTile(
        label = "Open trip offers",
        value = session.openOfferCount().toString(),
        hint = "Offers expire 72 hours after the last counter-offer.",
    )
    TeButton(text = "Trip offers", onClick = { nav.open(DriverRoutes.TRIP_OFFERS) })
    TeCard(header = "Profile") {
        DrvNote(
            if (session.profile.isComplete()) {
                "Profile complete. You can respond to trip offers."
            } else {
                "Profile incomplete. Finish it before you accept trips."
            },
        )
        TeButton(
            text = "Profile, vehicle and documents",
            onClick = { nav.open(DriverRoutes.PROFILE) },
            variant = TeButtonVariant.Secondary,
        )
    }
    TeButton(
        text = "Lab test status and history",
        onClick = { nav.open(DriverRoutes.LAB_STATUS_HISTORY) },
        variant = TeButtonVariant.Secondary,
    )
    TeButton(
        text = "Earnings, payouts and reports",
        onClick = { nav.open(DriverRoutes.EARNINGS) },
        variant = TeButtonVariant.Secondary,
    )
    TeButton(text = "Plan and limits", onClick = { nav.open(DriverRoutes.PLAN) }, variant = TeButtonVariant.Secondary)
    TeButton(
        text = "Driver coupons (own bookings)",
        onClick = { nav.open(DriverRoutes.COUPONS) },
        variant = TeButtonVariant.Secondary,
    )
}
