package com.tripsenjoy.screens.photographer.studio

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.photographer.common.DEMO_DEAL_OFFERS
import com.tripsenjoy.screens.photographer.common.DealOffer
import com.tripsenjoy.screens.photographer.common.OFFER_EXPIRY_TEXT
import com.tripsenjoy.screens.photographer.common.OfferDetailContent
import com.tripsenjoy.screens.photographer.common.StatePreview
import com.tripsenjoy.screens.shared.common.PLACEHOLDER_CURRENCY
import com.tripsenjoy.screens.shared.common.ScreenBody
import com.tripsenjoy.screens.shared.common.ScreenNote
import com.tripsenjoy.screens.shared.common.StateErrorBlock
import com.tripsenjoy.ui.components.OfferStatus
import com.tripsenjoy.ui.components.TeOfferCard
import com.tripsenjoy.ui.components.TePageHeader

// SCR-PHO-05 Deal requests and offer detail. The list shows each offer. Opening one shows its detail in this screen.
// Accepting finalizes the deal and opens the assigned trip brief (SCR-PHO-06), unless the plan limit blocks it.
@Composable
fun DealRequestsAndOfferDetail() {
    val nav = LocalScreenNavigator.current
    var selectedId by remember { mutableStateOf<String?>(null) }
    var rejectedIds by remember { mutableStateOf<Set<String>>(emptySet()) }
    ScreenBody {
        TePageHeader(title = "Deal requests and offer detail", description = "Review each offer, then accept, counter or reject")
        StatePreview(
            ariaLabel = "Deal request states",
            main = {
                val offer = DEMO_DEAL_OFFERS.firstOrNull { it.id == selectedId }
                if (offer == null) {
                    DealListContent(
                        offers = DEMO_DEAL_OFFERS,
                        rejectedIds = rejectedIds,
                        onOpen = { selectedId = it },
                    )
                } else {
                    OfferDetailContent(
                        offer = offer,
                        nav = nav,
                        onBack = { selectedId = null },
                        onReject = {
                            rejectedIds = rejectedIds + offer.id
                            selectedId = null
                        },
                    )
                }
            },
            error = { StateErrorBlock(retryMessage = "Deal requests did not load. Retry to see your offers.") },
        )
    }
}

@Composable
private fun DealListContent(
    offers: List<DealOffer>,
    rejectedIds: Set<String>,
    onOpen: (String) -> Unit,
) {
    offers.forEach { offer ->
        TeOfferCard(
            title = offer.tripName,
            amountMinor = offer.amountMinor,
            currencyCode = PLACEHOLDER_CURRENCY,
            status = if (offer.id in rejectedIds) OfferStatus.Declined else offer.status,
            expires = OFFER_EXPIRY_TEXT,
            onRespond = { onOpen(offer.id) },
            respondLabel = "Open offer",
        )
    }
    ScreenNote(text = "Each offer expires 72 hours after the last counter-offer.")
}

