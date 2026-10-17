package com.tripsenjoy.screens.photographer.studio

import androidx.compose.runtime.Composable
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.ScreenNavigator
import com.tripsenjoy.screens.moderator.common.icon
import com.tripsenjoy.screens.photographer.common.CURRENT_PLAN
import com.tripsenjoy.screens.photographer.common.DEMO_BOOKINGS_USED
import com.tripsenjoy.screens.photographer.common.DEMO_DEAL_OFFERS
import com.tripsenjoy.screens.photographer.common.PhotoScreenId
import com.tripsenjoy.screens.photographer.common.StatePreview
import com.tripsenjoy.screens.photographer.common.usageText
import com.tripsenjoy.screens.shared.common.ScreenBody
import com.tripsenjoy.screens.shared.common.ScreenNote
import com.tripsenjoy.screens.shared.common.SharedScreenId
import com.tripsenjoy.screens.shared.common.StateEmptyCard
import com.tripsenjoy.screens.shared.common.StateErrorBlock
import com.tripsenjoy.screens.shared.common.StateLoadingCard
import com.tripsenjoy.ui.components.BadgeTone
import com.tripsenjoy.ui.components.IconName
import com.tripsenjoy.ui.components.TeAssignmentCard
import com.tripsenjoy.ui.components.TeBadge
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeKpiTile
import com.tripsenjoy.ui.components.TePageHeader
import com.tripsenjoy.ui.components.TeRoleBadge
import com.tripsenjoy.ui.components.UserRole

// SCR-PHO-01 Studio home: open deal requests, the current assignment, active bookings against the plan,
// unavailable dates and profile visibility. Gate: active bookings a month (Basic 3, Studio 10, Pro unlimited).
@Composable
fun StudioHome() {
    val nav = LocalScreenNavigator.current
    ScreenBody {
        TePageHeader(title = "Studio home", description = "Your work, deal requests and plan position")
        StatePreview(
            ariaLabel = "Studio home states",
            main = { StudioHomeContent(nav = nav) },
            loading = { StateLoadingCard(subject = "your studio") },
            empty = {
                StateEmptyCard(header = "Deal requests", message = "No invitations yet. Deal requests appear here.")
            },
            error = { StateErrorBlock(retryMessage = "We could not load your studio. Your work is safe.") },
        )
    }
}

@Composable
private fun StudioHomeContent(nav: ScreenNavigator) {
    TeRoleBadge(role = UserRole.Photographer)
    TeKpiTile(label = "Open deal requests", value = DEMO_DEAL_OFFERS.size.toString())
    TeKpiTile(
        label = "Active bookings this month",
        value = usageText(DEMO_BOOKINGS_USED, CURRENT_PLAN.bookingsPerMonth),
        hint = "${CURRENT_PLAN.label} plan limit",
    )
    TeCard(header = "Assignments") {
        TeAssignmentCard(
            tripName = "Trip name",
            route = "Route",
            departure = "Departure date",
            vehicle = "Vehicle",
            actionLabel = "Open brief",
            onAction = { nav.open(PhotoScreenId.TRIP_BRIEF) },
        )
    }
    TeCard(header = "Next unavailable dates") {
        ScreenNote(text = "No unavailable dates set")
    }
    TeCard(header = "Profile visibility") {
        TeBadge(label = "Standard", tone = BadgeTone.Neutral, icon = IconName.Check)
    }
    TeCard(header = "Manage your studio") {
        TeButton(
            text = "Open deal requests",
            onClick = { nav.open(PhotoScreenId.DEAL_REQUESTS) },
        )
        StudioLinkButton(label = "Assigned trip brief", target = PhotoScreenId.TRIP_BRIEF, nav = nav)
        StudioLinkButton(label = "Trip albums", target = PhotoScreenId.TRIP_ALBUMS, nav = nav)
        StudioLinkButton(label = "Portfolio manager", target = PhotoScreenId.PORTFOLIO, nav = nav)
        StudioLinkButton(label = "Profile and visibility", target = PhotoScreenId.PROFILE_VISIBILITY, nav = nav)
        StudioLinkButton(label = "Rates and availability", target = PhotoScreenId.RATES_AVAILABILITY, nav = nav)
        StudioLinkButton(label = "Watermark settings", target = PhotoScreenId.WATERMARK, nav = nav)
        StudioLinkButton(label = "Earnings and payouts", target = PhotoScreenId.EARNINGS, nav = nav)
        StudioLinkButton(label = "Coupons (own bookings)", target = PhotoScreenId.COUPONS, nav = nav)
    }
    TeCard(header = "Shared screens") {
        ScreenNote(text = "Plan limits, errors, banners and shared tools open from any screen. These links preview them.")
        SHARED_EXAMPLE_LINKS.forEach { link ->
            StudioLinkButton(label = link.label, target = link.target, nav = nav)
        }
    }
}

private data class ExampleLink(val label: String, val target: String)

private val SHARED_EXAMPLE_LINKS = listOf(
    ExampleLink("Plan-limit upgrade prompt", SharedScreenId.PLAN_LIMIT_PROMPT),
    ExampleLink("Permission denied (403)", SharedScreenId.PERMISSION_DENIED),
    ExampleLink("Unauthorized (401)", SharedScreenId.UNAUTHORIZED),
    ExampleLink("Not found (404)", SharedScreenId.NOT_FOUND),
    ExampleLink("Server error (500)", SharedScreenId.SERVER_ERROR),
    ExampleLink("Service unavailable (503)", SharedScreenId.SERVICE_UNAVAILABLE),
    ExampleLink("Maintenance page", SharedScreenId.MAINTENANCE),
    ExampleLink("Offline banner", SharedScreenId.OFFLINE_BANNER),
    ExampleLink("Confirmation dialog", SharedScreenId.CONFIRMATION_DIALOG),
    ExampleLink("Language switch and RTL", SharedScreenId.LANGUAGE_RTL),
    ExampleLink("Notification centre", SharedScreenId.NOTIFICATION_CENTRE),
    ExampleLink("Receipt and invoice view", SharedScreenId.RECEIPT_INVOICE),
    ExampleLink("Role and organization switcher", SharedScreenId.ROLE_ORG_SWITCHER),
    ExampleLink("OTP entry", SharedScreenId.OTP_ENTRY),
    ExampleLink("Seat map", SharedScreenId.SEAT_MAP),
    ExampleLink("Document and photo upload", SharedScreenId.DOCUMENT_UPLOAD),
)

@Composable
private fun StudioLinkButton(label: String, target: String, nav: ScreenNavigator) {
    TeButton(
        text = label,
        onClick = { nav.open(target) },
        variant = TeButtonVariant.Secondary,
    )
}
