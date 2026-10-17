package com.tripsenjoy.screens.traveler

import com.tripsenjoy.screens.ScreenEntry
import com.tripsenjoy.screens.traveler.account.PlansAndUpgradeTraveler
import com.tripsenjoy.screens.traveler.account.PrivacyDataCopyAndAccountDeletion
import com.tripsenjoy.screens.traveler.account.ProfileLanguageAndNotifications
import com.tripsenjoy.screens.traveler.account.SupplierApplicationEntry
import com.tripsenjoy.screens.traveler.albums.AlbumViewer
import com.tripsenjoy.screens.traveler.albums.SharedAlbumViaLink
import com.tripsenjoy.screens.traveler.albums.TripHistoryAndAlbums
import com.tripsenjoy.screens.traveler.booking.BookingConfirmed
import com.tripsenjoy.screens.traveler.booking.BookingStep1TravelersAndPrograms
import com.tripsenjoy.screens.traveler.booking.BookingStep2SeatSelection
import com.tripsenjoy.screens.traveler.booking.BookingStep3CouponAndOrderSummary
import com.tripsenjoy.screens.traveler.booking.BookingStep4PaymentHandoff
import com.tripsenjoy.screens.traveler.booking.PaymentFailedRetry
import com.tripsenjoy.screens.traveler.booking.PaymentPending
import com.tripsenjoy.screens.traveler.bookings.BookingDetail
import com.tripsenjoy.screens.traveler.bookings.CancelBookingAndRefundPreview
import com.tripsenjoy.screens.traveler.bookings.MyBookings
import com.tripsenjoy.screens.traveler.bookings.ReceiptsAndInvoices
import com.tripsenjoy.screens.traveler.bookings.TripDay
import com.tripsenjoy.screens.traveler.browse.TripBrowseHome
import com.tripsenjoy.screens.traveler.browse.TripDetail

// Every traveler screen in spec order (docs/screens/01-traveler-app.md, SCR-TRV-01 to SCR-TRV-21).
val TRAVELER_SCREENS: List<ScreenEntry> = listOf(
    ScreenEntry(id = "SCR-TRV-01", title = "Trip browse (home)", content = { TripBrowseHome() }),
    ScreenEntry(id = "SCR-TRV-02", title = "Trip detail", content = { TripDetail() }),
    ScreenEntry(id = "SCR-TRV-03", title = "Booking step 1: travelers and programs", content = { BookingStep1TravelersAndPrograms() }),
    ScreenEntry(id = "SCR-TRV-04", title = "Booking step 2: seat selection", content = { BookingStep2SeatSelection() }),
    ScreenEntry(id = "SCR-TRV-05", title = "Booking step 3: coupon and order summary", content = { BookingStep3CouponAndOrderSummary() }),
    ScreenEntry(id = "SCR-TRV-06", title = "Booking step 4: payment handoff", content = { BookingStep4PaymentHandoff() }),
    ScreenEntry(id = "SCR-TRV-07", title = "Payment pending", content = { PaymentPending() }),
    ScreenEntry(id = "SCR-TRV-08", title = "Payment failed (retry)", content = { PaymentFailedRetry() }),
    ScreenEntry(id = "SCR-TRV-09", title = "Booking confirmed", content = { BookingConfirmed() }),
    ScreenEntry(id = "SCR-TRV-10", title = "My bookings", content = { MyBookings() }),
    ScreenEntry(id = "SCR-TRV-11", title = "Booking detail", content = { BookingDetail() }),
    ScreenEntry(id = "SCR-TRV-12", title = "Cancel booking and refund preview", content = { CancelBookingAndRefundPreview() }),
    ScreenEntry(id = "SCR-TRV-13", title = "Trip day", content = { TripDay() }),
    ScreenEntry(id = "SCR-TRV-14", title = "Receipts and invoices", content = { ReceiptsAndInvoices() }),
    ScreenEntry(id = "SCR-TRV-15", title = "Trip history and albums", content = { TripHistoryAndAlbums() }),
    ScreenEntry(id = "SCR-TRV-16", title = "Album viewer", content = { AlbumViewer() }),
    ScreenEntry(id = "SCR-TRV-17", title = "Shared album (via link)", content = { SharedAlbumViaLink() }),
    ScreenEntry(id = "SCR-TRV-18", title = "Plans and upgrade (traveler)", content = { PlansAndUpgradeTraveler() }),
    ScreenEntry(id = "SCR-TRV-19", title = "Profile, language and notifications", content = { ProfileLanguageAndNotifications() }),
    ScreenEntry(id = "SCR-TRV-20", title = "Privacy: data copy and account deletion", content = { PrivacyDataCopyAndAccountDeletion() }),
    ScreenEntry(id = "SCR-TRV-21", title = "Supplier application entry", content = { SupplierApplicationEntry() }),
)
