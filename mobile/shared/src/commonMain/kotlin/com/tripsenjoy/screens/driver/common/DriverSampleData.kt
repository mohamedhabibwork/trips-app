package com.tripsenjoy.screens.driver.common

import com.tripsenjoy.ui.components.OfferStatus
import com.tripsenjoy.ui.components.TeBarValue
import com.tripsenjoy.ui.components.TeChecklistItem
import com.tripsenjoy.ui.components.TeOption
import com.tripsenjoy.ui.components.TeTimelineItem
import com.tripsenjoy.ui.components.TimelineState

// Placeholder data for the driver screens. The docs define no live source yet; DriverSession holds the changes.
internal object DriverSampleData {
    const val CURRENCY = "USD"
    const val LAB_DEADLINE = "17 Oct 2026, 23:59"
    const val WEEK_EARNINGS_MINOR = 41_250L
    const val ACTIVE_BOOKINGS = 2

    val plan = DrvPlan.Basic

    val offers = listOf(
        DrvOffer(
            id = "OFR-101",
            tripName = "Airport transfer, group of 24",
            route = "City centre to airport, zone B",
            date = "24 Oct 2026, 07:30",
            organization = "Northline Tours",
            amountMinor = 45_000L,
            currencyCode = CURRENCY,
            status = OfferStatus.Open,
            expires = "Expires 72 hours after the last counter-offer",
            receivedAt = "15 Oct 2026, 09:10",
        ),
        DrvOffer(
            id = "OFR-102",
            tripName = "Day trip, school group",
            route = "Old town loop, 3 stops",
            date = "27 Oct 2026, 08:00",
            organization = "Riverside Academy",
            amountMinor = 62_000L,
            currencyCode = CURRENCY,
            status = OfferStatus.Countered,
            expires = "Expires 72 hours after your counter-offer",
            receivedAt = "14 Oct 2026, 16:40",
            counterMinor = 58_000L,
        ),
        DrvOffer(
            id = "OFR-103",
            tripName = "Weekend coastal run",
            route = "Coast road, 2 stops",
            date = "01 Nov 2026, 06:00",
            organization = "Bayview Travel",
            amountMinor = 80_000L,
            currencyCode = CURRENCY,
            status = OfferStatus.Accepted,
            expires = "Waiting for the organization to confirm",
            receivedAt = "13 Oct 2026, 11:05",
        ),
    )

    val assignment = DrvAssignment(
        tripName = "Coastal route, day 2",
        route = "Old town, harbour, airport",
        departure = "17 Oct 2026, 07:30",
        vehicle = "Bus 4, 40 seats",
        source = "Platform deal, finalized",
        organization = "Bayview Travel, operations desk",
        travelerCount = 6,
    )

    val coupons = listOf(DrvCoupon(code = "COAST10", discountPercent = 10, active = true, redemptions = 2))

    val payouts = listOf(
        DrvPayout(date = "Mon 12 Oct 2026, 06:00", amountMinor = 18_400L, paid = true),
        DrvPayout(date = "Mon 19 Oct 2026, 06:00", amountMinor = 21_250L, paid = false),
    )

    val weeklyEarnings = listOf(
        TeBarValue(label = "Wk 40", value = 268.0),
        TeBarValue(label = "Wk 41", value = 340.5),
        TeBarValue(label = "Wk 42", value = 412.5),
        TeBarValue(label = "Wk 43", value = 390.0),
    )

    val documents = listOf(
        DrvDocument(name = "Vehicle registration", detail = "Valid until 30 Jun 2027", expiringSoon = false),
        DrvDocument(name = "Insurance", detail = "Expires in 45 days", expiringSoon = true),
    )

    val profile = DrvProfile(
        fullName = "Samir Haddad",
        phone = "+1 555 0142",
        country = "US",
        plate = "KD 4471",
        model = "Mercedes Sprinter",
        year = "2021",
        seats = "16",
    )

    val countries = listOf(
        TeOption(value = "US", label = "United States"),
        TeOption(value = "GB", label = "United Kingdom"),
        TeOption(value = "DE", label = "Germany"),
        TeOption(value = "AE", label = "United Arab Emirates"),
    )

    val labs = listOf(
        TeOption(value = "north", label = "Northside partner lab"),
        TeOption(value = "central", label = "Central partner lab"),
    )

    val labSlots = listOf(
        TeOption(value = "slot-1", label = "Thu 22 Oct, 09:00"),
        TeOption(value = "slot-2", label = "Thu 22 Oct, 14:30"),
        TeOption(value = "slot-3", label = "Fri 23 Oct, 08:15"),
    )

    val labHistory = listOf(
        TeTimelineItem(id = "LAB-1", time = "03 Aug 2026", label = "Initial lab result passed", state = TimelineState.Done),
        TeTimelineItem(id = "LAB-2", time = "14 Oct 2026", label = "Lab test requested, deadline $LAB_DEADLINE", state = TimelineState.Current),
    )

    val departureChecklist = listOf(
        TeChecklistItem(id = "vehicle", label = "Vehicle inspected", checked = false),
        TeChecklistItem(id = "roster", label = "Roster checked against the moderator's count", checked = false),
        TeChecklistItem(id = "passengers", label = "Passengers briefed on the stops", checked = false),
    )

    val discounts = listOf(
        TeOption(value = "5", label = "5% off"),
        TeOption(value = "10", label = "10% off"),
        TeOption(value = "15", label = "15% off"),
    )
}
