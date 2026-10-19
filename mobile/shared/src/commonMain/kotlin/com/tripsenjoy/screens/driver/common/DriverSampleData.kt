package com.tripsenjoy.screens.driver.common

import com.tripsenjoy.ui.components.OfferStatus
import com.tripsenjoy.ui.components.TeBarValue
import com.tripsenjoy.ui.components.TeChecklistItem
import com.tripsenjoy.ui.components.TeOption
import com.tripsenjoy.ui.components.TeTimelineItem
import com.tripsenjoy.ui.components.TimelineState

// Default state and option lists for the driver screens; DriverSession loads live server data via ApiClient.
internal object DriverSampleData {
    const val CURRENCY = "USD"
    const val LAB_DEADLINE = "Pending lab schedule"
    const val WEEK_EARNINGS_MINOR = 0L
    const val ACTIVE_BOOKINGS = 0

    val plan = DrvPlan.Basic

    val offers = emptyList<DrvOffer>()

    val assignment = DrvAssignment(
        tripName = "No active assignment",
        route = "—",
        departure = "—",
        vehicle = "—",
        source = "Platform assignment",
        organization = "—",
        travelerCount = 0,
    )

    val coupons = emptyList<DrvCoupon>()

    val payouts = emptyList<DrvPayout>()

    val weeklyEarnings = emptyList<TeBarValue>()

    val documents = emptyList<DrvDocument>()

    val profile = DrvProfile(
        fullName = "",
        phone = "",
        country = "EG",
        plate = "",
        model = "",
        year = "",
        seats = "",
    )

    val countries = listOf(
        TeOption(value = "EG", label = "Egypt"),
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
