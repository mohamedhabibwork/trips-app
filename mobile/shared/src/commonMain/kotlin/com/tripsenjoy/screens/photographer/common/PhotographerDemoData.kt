package com.tripsenjoy.screens.photographer.common

import com.tripsenjoy.screens.shared.common.PLACEHOLDER_AMOUNT_MINOR
import com.tripsenjoy.ui.components.OfferStatus
import com.tripsenjoy.ui.components.TeDate

// Placeholder data for the photographer gallery. The docs give no sample names, amounts or counts.
// Replace these with API data when a screen is wired to a service.
const val DEMO_PORTFOLIO_IMAGES = 8
const val DEMO_BOOKINGS_USED = 7
const val DEMO_COUPONS_USED = 0
const val DEMO_ALBUMS_ON_COMPLETED_TRIP = 1

// Whether the trip in the assigned brief has finished. Album upload stays locked until it has.
const val DEMO_BRIEF_TRIP_COMPLETED = false

// Offers expire 72 hours after the last counter-offer (D-14).
const val OFFER_EXPIRY_TEXT = "Expires 72 hours after the last counter-offer"

// The month the availability calendar opens on.
val DEMO_CALENDAR_MONTH = TeDate(year = 2026, month = 10, day = 1)

data class DealOffer(
    val id: String,
    val tripName: String,
    val route: String,
    val date: String,
    val organization: String,
    val amountMinor: Long,
    val status: OfferStatus,
)

val DEMO_DEAL_OFFERS: List<DealOffer> = listOf(
    DealOffer(
        id = "offer-1",
        tripName = "Trip name",
        route = "Route",
        date = "Departure date",
        organization = "Organization name",
        amountMinor = PLACEHOLDER_AMOUNT_MINOR,
        status = OfferStatus.Open,
    ),
    DealOffer(
        id = "offer-2",
        tripName = "Second trip name",
        route = "Route",
        date = "Departure date",
        organization = "Organization name",
        amountMinor = PLACEHOLDER_AMOUNT_MINOR,
        status = OfferStatus.Countered,
    ),
)
