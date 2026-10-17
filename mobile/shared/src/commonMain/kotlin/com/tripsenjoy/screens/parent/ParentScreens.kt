package com.tripsenjoy.screens.parent

import com.tripsenjoy.screens.ScreenEntry
import com.tripsenjoy.screens.parent.safety.ChildSafetyReport
import com.tripsenjoy.screens.parent.tracking.ChildTripStatus
import com.tripsenjoy.screens.parent.tracking.LinkChildToBooking
import com.tripsenjoy.screens.parent.tracking.TrackerHome
import com.tripsenjoy.screens.parent.tracking.TrackingUnavailable

// Every parent tracker screen in spec order (docs/screens/07-parent-tracker.md, SCR-PAR-01 to SCR-PAR-05).
// Reached only from the traveler home (SCR-TRV-01), through its "Child tracker" button.
val PARENT_SCREENS: List<ScreenEntry> = listOf(
    ScreenEntry(id = "SCR-PAR-01", title = "Tracker home", content = { TrackerHome() }),
    ScreenEntry(id = "SCR-PAR-02", title = "Link child to booking", content = { LinkChildToBooking() }),
    ScreenEntry(id = "SCR-PAR-03", title = "Child trip status", content = { ChildTripStatus() }),
    ScreenEntry(id = "SCR-PAR-04", title = "Tracking unavailable", content = { TrackingUnavailable() }),
    ScreenEntry(id = "SCR-PAR-05", title = "Child-safety report", content = { ChildSafetyReport() }),
)
