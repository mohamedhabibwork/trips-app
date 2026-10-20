package com.tripsenjoy.screens.driver.trips

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.analytics.AnalyticsTracker
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.driver.DriverRoutes
import com.tripsenjoy.screens.driver.common.DrvErrorBlock
import com.tripsenjoy.screens.driver.common.DrvField
import com.tripsenjoy.screens.driver.common.DrvNote
import com.tripsenjoy.screens.driver.common.DrvOffer
import com.tripsenjoy.screens.driver.common.DrvScreen
import com.tripsenjoy.screens.driver.common.LocalDriverSession
import com.tripsenjoy.screens.driver.common.StatePreview
import com.tripsenjoy.screens.driver.common.tone
import com.tripsenjoy.ui.components.ErrorKind
import com.tripsenjoy.ui.components.OfferStatus
import com.tripsenjoy.ui.components.TeBadge
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeDialog
import com.tripsenjoy.ui.components.TeInput
import com.tripsenjoy.ui.components.TeKeyboardType
import com.tripsenjoy.ui.components.TeMoney
import com.tripsenjoy.ui.components.TePlanGate
import com.tripsenjoy.ui.components.TeTimeline
import com.tripsenjoy.ui.components.TeTimelineItem
import com.tripsenjoy.ui.components.TimelineState
import com.tripsenjoy.ui.components.formatMoney
import com.tripsenjoy.ui.components.icon
import com.tripsenjoy.ui.components.tone

private const val MINOR_UNITS_PER_WHOLE = 100L

// SCR-DRV-07 Offer detail and response. Accept, counter or reject the offer selected on Trip offers.
@Composable
fun OfferDetailAndResponse() {
    DrvScreen(
        title = "Offer detail and response",
        description = "Accept, counter or reject this offer. Trip, route, date and pay come first.",
    ) {
        StatePreview(
            main = { OfferDetailMain() },
            error = { DrvErrorBlock(ErrorKind.Server) },
        )
    }
}

@Composable
private fun OfferDetailMain() {
    val nav = LocalScreenNavigator.current
    val session = LocalDriverSession.current
    val offer = session.selectedOffer()
    if (offer == null) {
        TeCard(header = "No offer selected") {
            DrvNote("Open an offer from Trip offers to see its details.")
            TeButton(
                text = "Trip offers",
                onClick = { nav.open(DriverRoutes.TRIP_OFFERS) },
                variant = TeButtonVariant.Secondary,
            )
        }
    } else {
        OfferSummary(offer)
        OfferResponse(offer)
    }
}

@Composable
private fun OfferSummary(offer: DrvOffer) {
    TeCard(header = offer.tripName) {
        DrvField(label = "Route", value = offer.route)
        DrvField(label = "Date", value = offer.date)
        DrvField(label = "Organization", value = offer.organization)
        TeMoney(amountMinor = offer.amountMinor, currencyCode = offer.currencyCode, label = "Pay offered")
        TeBadge(label = offer.status.word, tone = offer.status.tone(), icon = offer.status.icon())
        DrvNote(offer.expires)
    }
    TeCard(header = "Offer history") {
        TeTimeline(items = offerHistory(offer))
    }
}

@Composable
private fun OfferResponse(offer: DrvOffer) {
    val nav = LocalScreenNavigator.current
    val session = LocalDriverSession.current
    var counterText by remember(offer.id) { mutableStateOf("") }
    var confirmReject by remember(offer.id) { mutableStateOf(false) }
    val counterMinor = counterText.toLongOrNull()?.let { it * MINOR_UNITS_PER_WHOLE }
    val isOpen = offer.status == OfferStatus.Open
    val isAccepted = offer.status == OfferStatus.Accepted
    val isCountered = offer.status == OfferStatus.Countered
    val canAccept = isOpen && session.canAcceptOffer()
    val canCounter = (isOpen || isAccepted) && counterMinor != null && counterMinor > 0L && counterMinor != offer.amountMinor
    val canReject = isOpen || isAccepted || isCountered

    if (!session.canAcceptOffer() && isOpen) {
        TePlanGate(
            plan = session.plan.label,
            lockedLabel = "Your plan limit is reached. Accepting is blocked until next month or an upgrade.",
            upgradeLabel = "Upgrade plan",
            onUpgrade = { nav.open(DriverRoutes.PLAN) },
        )
    }
    StatusNote(offer.status)
    if (isOpen || isAccepted) {
        TeInput(
            value = counterText,
            onValueChange = { value -> counterText = value.filter(Char::isDigit).take(MAX_COUNTER_DIGITS) },
            label = "Counter amount in ${offer.currencyCode}, whole units",
            supportingText = "A counter-offer applies to the whole vehicle. It cancels any acceptance.",
            keyboardType = TeKeyboardType.Number,
        )
    }
    TeButton(
        text = "Accept offer",
        enabled = canAccept,
        onClick = {
            AnalyticsTracker.trackAction("offer_accepted", mapOf("entity_type" to "driver_offer"))
            session.answerOffer(offer.id, OfferStatus.Accepted)
        },
    )
    TeButton(
        text = "Send counter-offer",
        enabled = canCounter,
        onClick = {
            AnalyticsTracker.trackAction("offer_countered", mapOf("entity_type" to "driver_offer"))
            session.answerOffer(offer.id, OfferStatus.Countered, counterMinor)
            nav.back()
        },
        variant = TeButtonVariant.Secondary,
    )
    TeButton(
        text = "Reject offer",
        enabled = canReject,
        onClick = { confirmReject = true },
        variant = TeButtonVariant.Destructive,
    )
    TeDialog(
        visible = confirmReject,
        onDismiss = { confirmReject = false },
        title = "Reject this offer?",
        primaryLabel = "Reject offer",
        onPrimary = {
            AnalyticsTracker.trackAction("offer_rejected", mapOf("entity_type" to "driver_offer"))
            session.answerOffer(offer.id, OfferStatus.Declined)
            confirmReject = false
            nav.back()
        },
        secondaryLabel = "Keep offer",
        danger = true,
        description = "The offer ends. The organization can offer the trip to another driver.",
    )
}

@Composable
private fun StatusNote(status: OfferStatus) {
    when (status) {
        OfferStatus.Open -> DrvNote("Respond before the offer expires.")
        OfferStatus.Accepted -> DrvNote("Waiting for the organization to confirm. A counter-offer cancels your acceptance.")
        OfferStatus.Countered -> DrvNote("Your counter-offer is with the organization. You can reject the offer while you wait.")
        OfferStatus.Declined -> DrvNote("This offer has ended.")
    }
}

private fun offerHistory(offer: DrvOffer): List<TeTimelineItem> = buildList {
    add(
        TeTimelineItem(
            id = "received",
            time = offer.receivedAt,
            label = "Offer received from ${offer.organization}",
            state = TimelineState.Done,
        ),
    )
    offer.counterMinor?.let { counter ->
        add(
            TeTimelineItem(
                id = "counter",
                time = "Latest",
                label = "Counter-offer ${formatMoney(counter, offer.currencyCode)}",
                state = if (offer.status == OfferStatus.Countered) TimelineState.Current else TimelineState.Done,
            ),
        )
    }
    if (offer.status == OfferStatus.Accepted) {
        add(TeTimelineItem(id = "accepted", time = "Latest", label = "Accepted by you", state = TimelineState.Current))
    }
    if (offer.status == OfferStatus.Declined) {
        add(TeTimelineItem(id = "declined", time = "Latest", label = "Rejected by you", state = TimelineState.Done))
    }
}

private const val MAX_COUNTER_DIGITS = 7
