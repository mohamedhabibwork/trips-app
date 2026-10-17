package com.tripsenjoy.screens.driver.trips

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.driver.DriverRoutes
import com.tripsenjoy.screens.driver.common.DrvEmptyBlock
import com.tripsenjoy.screens.driver.common.DrvErrorBlock
import com.tripsenjoy.screens.driver.common.DrvField
import com.tripsenjoy.screens.driver.common.DrvLoadingBlock
import com.tripsenjoy.screens.driver.common.DrvNote
import com.tripsenjoy.screens.driver.common.DrvOffer
import com.tripsenjoy.screens.driver.common.DrvScreen
import com.tripsenjoy.screens.driver.common.LocalDriverSession
import com.tripsenjoy.screens.driver.common.StatePreview
import com.tripsenjoy.screens.driver.common.limitWord
import com.tripsenjoy.ui.components.ErrorKind
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeChip
import com.tripsenjoy.ui.components.TeOfferCard
import com.tripsenjoy.ui.components.TePlanGate
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

// SCR-DRV-06 Trip offers (platform drivers). Each offer opens its detail and response screen (SCR-DRV-07).
@Composable
fun TripOffers() {
    DrvScreen(
        title = "Trip offers",
        description = "Open offers from organizations. Trip, route, date and pay show before you respond.",
    ) {
        StatePreview(
            main = { OffersMain() },
            loading = { DrvLoadingBlock("Loading trip offers") },
            empty = { DrvEmptyBlock("No open offers", "New offers from organizations appear here.") },
            error = { DrvErrorBlock(ErrorKind.Server) },
        )
    }
}

@Composable
private fun OffersMain() {
    val nav = LocalScreenNavigator.current
    val session = LocalDriverSession.current
    var sortByPay by remember { mutableStateOf(false) }
    val offers = if (sortByPay) session.offers.sortedByDescending { it.amountMinor } else session.offers.toList()
    TeCard(header = "Active bookings this month") {
        DrvField(
            label = "Used against your ${session.plan.label} plan",
            value = "${session.activeBookings} of ${limitWord(session.plan.bookingLimit)}",
        )
        if (!session.canAcceptOffer()) {
            TePlanGate(
                plan = session.plan.label,
                lockedLabel = "You have used all active bookings for this month. Accepting is blocked until next month or an upgrade.",
                upgradeLabel = "Upgrade plan",
                onUpgrade = { nav.open(DriverRoutes.PLAN) },
            )
        }
    }
    Row(horizontalArrangement = Arrangement.spacedBy(TripsEnjoyTheme.spacing.space2)) {
        TeChip(label = "Soonest", selected = !sortByPay, onClick = { sortByPay = false })
        TeChip(label = "Highest pay", selected = sortByPay, onClick = { sortByPay = true })
    }
    offers.forEach { offer -> OfferRow(offer) }
}

@Composable
private fun OfferRow(offer: DrvOffer) {
    val nav = LocalScreenNavigator.current
    val session = LocalDriverSession.current
    TeOfferCard(
        title = offer.tripName,
        amountMinor = offer.amountMinor,
        currencyCode = offer.currencyCode,
        status = offer.status,
        expires = offer.expires,
        onRespond = {
            session.selectedOfferId = offer.id
            nav.open(DriverRoutes.OFFER_DETAIL)
        },
        respondLabel = "View offer",
    )
    DrvNote("${offer.route}. ${offer.date}. ${offer.organization}.")
}
