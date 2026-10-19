package com.tripsenjoy.screens.driver.earnings

import androidx.compose.runtime.Composable
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.driver.DriverRoutes
import com.tripsenjoy.screens.driver.common.DriverSampleData
import com.tripsenjoy.screens.driver.common.DrvEmptyBlock
import com.tripsenjoy.screens.driver.common.DrvErrorBlock
import com.tripsenjoy.screens.driver.common.DrvField
import com.tripsenjoy.screens.driver.common.DrvLoadingBlock
import com.tripsenjoy.screens.driver.common.DrvNote
import com.tripsenjoy.screens.driver.common.DrvPlan
import com.tripsenjoy.screens.driver.common.DrvScreen
import com.tripsenjoy.screens.driver.common.LocalDriverSession
import com.tripsenjoy.screens.driver.common.StatePreview
import com.tripsenjoy.ui.components.ErrorKind
import com.tripsenjoy.ui.components.TeBarChart
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeKpiTile
import com.tripsenjoy.ui.components.TePlanGate
import com.tripsenjoy.ui.components.formatMoney

// SCR-DRV-09 Earnings, payouts and reports. The earnings view and the export depend on the plan.
@Composable
fun EarningsPayoutsAndReports() {
    DrvScreen(
        title = "Earnings, payouts and reports",
        description = "Earnings, weekly payouts and booking reports for your plan.",
    ) {
        StatePreview(
            main = { EarningsMain() },
            loading = { DrvLoadingBlock("Loading earnings") },
            empty = { DrvEmptyBlock("No payouts yet", "Your first payout appears after your first completed trip.") },
            error = { DrvErrorBlock(ErrorKind.Server) },
        )
    }
}

@Composable
private fun EarningsMain() {
    val nav = LocalScreenNavigator.current
    val session = LocalDriverSession.current
    val currency = DriverSampleData.CURRENCY
    val isBasic = session.plan == DrvPlan.Basic
    TeKpiTile(
        label = "Earned this week",
        value = formatMoney(session.weekEarningsMinor, currency),
        hint = if (isBasic) "Basic earnings view. Upgrade for the advanced view." else "Advanced earnings view.",
    )
    TeBarChart(
        data = session.weeklyEarnings,
        caption = "Earnings by week, last 4 weeks",
        formatValue = { value -> value.toLong().toString() },
    )
    TeCard(header = "Payouts") {
        session.payouts.forEach { payout ->
            DrvField(
                label = payout.date,
                value = "${formatMoney(payout.amountMinor, currency)}, ${if (payout.paid) "paid" else "scheduled"}",
            )
        }
        DrvNote("Payouts are weekly, on Monday at 06:00.")
    }
    TeCard(header = "Booking history report") {
        DrvNote(reportLevel(session.plan))
        if (session.plan == DrvPlan.Premium) {
            DrvNote("Export is included in your plan.")
        } else {
            TePlanGate(
                plan = session.plan.label,
                lockedLabel = "Export is available on the Premium plan.",
                upgradeLabel = "Upgrade plan",
                onUpgrade = { nav.open(DriverRoutes.PLAN) },
            )
        }
    }
}

private fun reportLevel(plan: DrvPlan): String = when (plan) {
    DrvPlan.Basic -> "Basic report: your bookings and totals."
    DrvPlan.Professional -> "Full report: bookings, fees and totals."
    DrvPlan.Premium -> "Full report with export."
}
