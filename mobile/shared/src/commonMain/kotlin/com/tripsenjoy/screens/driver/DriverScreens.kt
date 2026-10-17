package com.tripsenjoy.screens.driver

import com.tripsenjoy.screens.ScreenEntry
import com.tripsenjoy.screens.driver.account.PlanAndLimits
import com.tripsenjoy.screens.driver.account.ProfileVehicleAndDocuments
import com.tripsenjoy.screens.driver.earnings.DriverCouponsOwnBookings
import com.tripsenjoy.screens.driver.earnings.EarningsPayoutsAndReports
import com.tripsenjoy.screens.driver.labtest.BookLabTest
import com.tripsenjoy.screens.driver.labtest.LabTestGate
import com.tripsenjoy.screens.driver.labtest.LabTestStatusAndHistory
import com.tripsenjoy.screens.driver.labtest.UploadLabResult
import com.tripsenjoy.screens.driver.trips.AssignmentsAndVehicleRun
import com.tripsenjoy.screens.driver.trips.DriverHome
import com.tripsenjoy.screens.driver.trips.OfferDetailAndResponse
import com.tripsenjoy.screens.driver.trips.TripOffers

// Spec ids of the driver screens (SCR-DRV-01 to SCR-DRV-12). Screens navigate with these.
internal object DriverRoutes {
    const val HOME = "SCR-DRV-01"
    const val LAB_GATE = "SCR-DRV-02"
    const val BOOK_LAB_TEST = "SCR-DRV-03"
    const val UPLOAD_LAB_RESULT = "SCR-DRV-04"
    const val LAB_STATUS_HISTORY = "SCR-DRV-05"
    const val TRIP_OFFERS = "SCR-DRV-06"
    const val OFFER_DETAIL = "SCR-DRV-07"
    const val ASSIGNMENTS = "SCR-DRV-08"
    const val EARNINGS = "SCR-DRV-09"
    const val PROFILE = "SCR-DRV-10"
    const val PLAN = "SCR-DRV-11"
    const val COUPONS = "SCR-DRV-12"
}

// Every driver screen (SCR-DRV-01 to SCR-DRV-12), in spec order. Titles are the spec headings.
val DRIVER_SCREENS: List<ScreenEntry> = listOf(
    ScreenEntry(id = DriverRoutes.HOME, title = "Driver home", content = { DriverHome() }),
    ScreenEntry(id = DriverRoutes.LAB_GATE, title = "Lab-test gate", content = { LabTestGate() }),
    ScreenEntry(id = DriverRoutes.BOOK_LAB_TEST, title = "Book lab test", content = { BookLabTest() }),
    ScreenEntry(id = DriverRoutes.UPLOAD_LAB_RESULT, title = "Upload lab result", content = { UploadLabResult() }),
    ScreenEntry(id = DriverRoutes.LAB_STATUS_HISTORY, title = "Lab test status and history", content = { LabTestStatusAndHistory() }),
    ScreenEntry(id = DriverRoutes.TRIP_OFFERS, title = "Trip offers", content = { TripOffers() }),
    ScreenEntry(id = DriverRoutes.OFFER_DETAIL, title = "Offer detail and response", content = { OfferDetailAndResponse() }),
    ScreenEntry(id = DriverRoutes.ASSIGNMENTS, title = "Assignments and vehicle run", content = { AssignmentsAndVehicleRun() }),
    ScreenEntry(id = DriverRoutes.EARNINGS, title = "Earnings, payouts and reports", content = { EarningsPayoutsAndReports() }),
    ScreenEntry(id = DriverRoutes.PROFILE, title = "Profile, vehicle and documents", content = { ProfileVehicleAndDocuments() }),
    ScreenEntry(id = DriverRoutes.PLAN, title = "Plan and limits", content = { PlanAndLimits() }),
    ScreenEntry(id = DriverRoutes.COUPONS, title = "Driver coupons (own bookings)", content = { DriverCouponsOwnBookings() }),
)

// While a lab test is pending (FR-DRV-03), only the gate and the lab screens it leads to are open.
private val DRIVER_LAB_GATE_IDS = setOf(
    DriverRoutes.LAB_GATE,
    DriverRoutes.BOOK_LAB_TEST,
    DriverRoutes.UPLOAD_LAB_RESULT,
    DriverRoutes.LAB_STATUS_HISTORY,
)

val DRIVER_LAB_GATE_SCREENS: List<ScreenEntry> = DRIVER_SCREENS.filter { it.id in DRIVER_LAB_GATE_IDS }
