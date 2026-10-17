package com.tripsenjoy.surfaces

/** The apps of Trips Enjoy. Every role app also offers the traveler surface (see AppShell). */
enum class SurfaceRole(val title: String, val subtitle: String) {
    TRAVELER("Traveler", "Trips Enjoy traveler app"),
    DRIVER("Driver", "Trips Enjoy driver app"),
    PHOTOGRAPHER("Photographer", "Trips Enjoy photographer studio"),
    MODERATOR("Moderator", "Trips Enjoy moderator app"),
}
