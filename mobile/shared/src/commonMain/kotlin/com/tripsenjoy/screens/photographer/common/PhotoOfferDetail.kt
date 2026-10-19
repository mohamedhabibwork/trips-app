package com.tripsenjoy.screens.photographer.common

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.screens.ScreenNavigator
import com.tripsenjoy.screens.shared.common.PLACEHOLDER_CURRENCY
import com.tripsenjoy.screens.shared.common.ScreenNote
import com.tripsenjoy.screens.shared.common.SharedScreenId
import com.tripsenjoy.ui.components.AlertTone
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeInlineAlert
import com.tripsenjoy.ui.components.TeInput
import com.tripsenjoy.ui.components.TeKeyboardType
import com.tripsenjoy.ui.components.TeMoney
import com.tripsenjoy.ui.components.TeOfferCard
import com.tripsenjoy.ui.components.TeTimeline
import com.tripsenjoy.ui.components.TeTimelineItem
import com.tripsenjoy.ui.components.TimelineState

// Offer detail inside SCR-PHO-05. Trip, route, date and pay show before any control is enabled.
// Counter needs an amount. Accept finalizes the deal, so it either opens the brief or the plan prompt (SCR-SHR-01).
@Composable
internal fun OfferDetailContent(
    offer: DealOffer,
    nav: ScreenNavigator,
    onBack: () -> Unit,
    onReject: () -> Unit,
) {
    val session = LocalPhotographerSession.current
    var counterAmount by remember(offer.id) { mutableStateOf("") }
    var countered by remember(offer.id) { mutableStateOf(false) }
    TeButton(text = "Back to deal requests", onClick = onBack, variant = TeButtonVariant.Ghost)
    TeOfferCard(
        title = offer.tripName,
        amountMinor = offer.amountMinor,
        currencyCode = PLACEHOLDER_CURRENCY,
        status = offer.status,
        expires = OFFER_EXPIRY_TEXT,
    )
    TeCard(header = "Trip details") {
        ScreenNote(text = "Route: ${offer.route}")
        ScreenNote(text = "Date: ${offer.date}")
        ScreenNote(text = "Organization: ${offer.organization}")
        TeMoney(amountMinor = offer.amountMinor, currencyCode = PLACEHOLDER_CURRENCY, label = "Pay")
    }
    TeCard(header = "Offer history") {
        TeTimeline(items = offerHistory(offer.id, countered))
    }
    if (countered) {
        TeInlineAlert(
            tone = AlertTone.Info,
            title = "Counter sent",
            message = "Waiting on the organization. A counter voids any earlier acceptance.",
        )
    }
    TeInput(
        value = counterAmount,
        onValueChange = { counterAmount = it.filter { ch -> ch.isDigit() } },
        label = "Counter amount",
        keyboardType = TeKeyboardType.Number,
        supportingText = "Currency: $PLACEHOLDER_CURRENCY",
    )
    TeButton(
        text = "Accept",
        onClick = {
            session.respondToOffer(offer.id, "accept")
            nav.open(acceptTarget(session.bookingsUsed))
        },
    )
    TeButton(
        text = "Counter",
        onClick = {
            session.respondToOffer(offer.id, "counter", counterAmount.toLongOrNull())
            countered = true
        },
        variant = TeButtonVariant.Secondary,
        enabled = counterAmount.isNotBlank(),
    )
    TeButton(text = "Reject", onClick = onReject, variant = TeButtonVariant.Ghost)
    ScreenNote(text = "Rejecting ends this offer. The organization can offer the trip to another photographer.")
}

// Accepting finalizes the assignment. A full plan blocks it and shows the upgrade prompt instead.
private fun acceptTarget(bookingsUsed: Int): String =
    if (isWithinAllowance(bookingsUsed, CURRENT_PLAN.bookingsPerMonth)) {
        PhotoScreenId.TRIP_BRIEF
    } else {
        SharedScreenId.PLAN_LIMIT_PROMPT
    }

private fun offerHistory(offerId: String, countered: Boolean): List<TeTimelineItem> = listOf(
    TeTimelineItem(
        id = "$offerId-received",
        time = "Time",
        label = "Offer received",
        state = TimelineState.Done,
    ),
    TeTimelineItem(
        id = "$offerId-latest",
        time = "Time",
        label = if (countered) "Counter sent, waiting on the organization" else "Awaiting your response",
        state = TimelineState.Current,
    ),
)
