package com.tripsenjoy.screens.photographer

import com.tripsenjoy.screens.ScreenEntry
import com.tripsenjoy.screens.photographer.albums.AlbumPrivacyAndSharing
import com.tripsenjoy.screens.photographer.albums.AlbumUpload
import com.tripsenjoy.screens.photographer.albums.TripAlbums
import com.tripsenjoy.screens.photographer.common.PhotoScreenId
import com.tripsenjoy.screens.photographer.earnings.CouponsOwnBookings
import com.tripsenjoy.screens.photographer.earnings.EarningsAndPayouts
import com.tripsenjoy.screens.photographer.profile.PortfolioManager
import com.tripsenjoy.screens.photographer.profile.ProfileAndVisibility
import com.tripsenjoy.screens.photographer.profile.RatesAndAvailability
import com.tripsenjoy.screens.photographer.profile.WatermarkSettings
import com.tripsenjoy.screens.photographer.studio.AssignedTripBrief
import com.tripsenjoy.screens.photographer.studio.DealRequestsAndOfferDetail
import com.tripsenjoy.screens.photographer.studio.StudioHome

// The 12 photographer studio screens (docs/screens/05-photographer-studio.md), in ID order.
// Titles are the spec headings. Each composable is named after its heading in PascalCase.
val PHOTOGRAPHER_SCREENS: List<ScreenEntry> = listOf(
    ScreenEntry(id = PhotoScreenId.STUDIO_HOME, title = "Studio home", content = { StudioHome() }),
    ScreenEntry(id = PhotoScreenId.PORTFOLIO, title = "Portfolio manager", content = { PortfolioManager() }),
    ScreenEntry(
        id = PhotoScreenId.PROFILE_VISIBILITY,
        title = "Profile and visibility",
        content = { ProfileAndVisibility() },
    ),
    ScreenEntry(
        id = PhotoScreenId.RATES_AVAILABILITY,
        title = "Rates and availability",
        content = { RatesAndAvailability() },
    ),
    ScreenEntry(
        id = PhotoScreenId.DEAL_REQUESTS,
        title = "Deal requests and offer detail",
        content = { DealRequestsAndOfferDetail() },
    ),
    ScreenEntry(id = PhotoScreenId.TRIP_BRIEF, title = "Assigned trip brief", content = { AssignedTripBrief() }),
    ScreenEntry(id = PhotoScreenId.TRIP_ALBUMS, title = "Trip albums", content = { TripAlbums() }),
    ScreenEntry(id = PhotoScreenId.ALBUM_UPLOAD, title = "Album upload", content = { AlbumUpload() }),
    ScreenEntry(
        id = PhotoScreenId.ALBUM_PRIVACY,
        title = "Album privacy and sharing",
        content = { AlbumPrivacyAndSharing() },
    ),
    ScreenEntry(
        id = PhotoScreenId.WATERMARK,
        title = "Watermark settings",
        content = { WatermarkSettings() },
    ),
    ScreenEntry(id = PhotoScreenId.EARNINGS, title = "Earnings and payouts", content = { EarningsAndPayouts() }),
    ScreenEntry(
        id = PhotoScreenId.COUPONS,
        title = "Coupons (own bookings)",
        content = { CouponsOwnBookings() },
    ),
)
