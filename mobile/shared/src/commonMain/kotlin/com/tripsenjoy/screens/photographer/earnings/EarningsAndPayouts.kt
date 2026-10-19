package com.tripsenjoy.screens.photographer.earnings

import androidx.compose.runtime.Composable
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.ScreenNavigator
import com.tripsenjoy.screens.photographer.common.CURRENT_PLAN
import com.tripsenjoy.screens.photographer.common.LocalPhotographerSession
import com.tripsenjoy.screens.photographer.common.PhotographerPlan
import com.tripsenjoy.screens.photographer.common.StatePreview
import com.tripsenjoy.screens.photographer.common.includes
import com.tripsenjoy.screens.shared.common.PLACEHOLDER_CURRENCY
import com.tripsenjoy.screens.shared.common.ScreenBody
import com.tripsenjoy.screens.shared.common.ScreenNote
import com.tripsenjoy.screens.shared.common.SharedScreenId
import com.tripsenjoy.screens.shared.common.StateEmptyCard
import com.tripsenjoy.screens.shared.common.StateErrorBlock
import com.tripsenjoy.screens.shared.common.StateLoadingCard
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeColumn
import com.tripsenjoy.ui.components.TeColumnAlign
import com.tripsenjoy.ui.components.TeDataTable
import com.tripsenjoy.ui.components.TeKpiTile
import com.tripsenjoy.ui.components.TePageHeader
import com.tripsenjoy.ui.components.TePlanGate
import com.tripsenjoy.ui.components.formatMoney

private data class PayoutRow(val id: String, val date: String, val amount: String, val state: String)

// SCR-PHO-11 Earnings and payouts. Payouts are made weekly on Monday at 06:00 (D-28).
// The report level follows the plan; the full export is Pro only and opens the plan prompt (SCR-SHR-01) otherwise.
@Composable
fun EarningsAndPayouts() {
    val nav = LocalScreenNavigator.current
    ScreenBody {
        TePageHeader(title = "Earnings and payouts", description = "Earnings by period and payout history")
        StatePreview(
            ariaLabel = "Earnings and payouts states",
            main = { EarningsContent(nav = nav) },
            loading = { StateLoadingCard(subject = "your earnings") },
            empty = {
                StateEmptyCard(
                    header = "Payouts",
                    message = "No payouts yet. Payouts appear here once earnings are released.",
                )
            },
            error = { StateErrorBlock(retryMessage = "Earnings did not load. Retry to see your payouts.") },
        )
    }
}

@Composable
private fun EarningsContent(nav: ScreenNavigator) {
    val session = LocalPhotographerSession.current
    val amount = formatMoney(session.periodEarningsMinor, PLACEHOLDER_CURRENCY)
    val payoutColumns = listOf(
        TeColumn<PayoutRow>(key = "date", header = "Date", render = { it.date }),
        TeColumn<PayoutRow>(key = "amount", header = "Amount", align = TeColumnAlign.End, render = { it.amount }),
        TeColumn<PayoutRow>(key = "state", header = "State", render = { it.state }),
    )
    val payouts = session.payoutHistory.map {
        PayoutRow(
            id = it.id,
            date = it.date,
            amount = formatMoney(it.amountMinor, PLACEHOLDER_CURRENCY),
            state = it.state,
        )
    }
    TeKpiTile(label = "Earnings this period", value = amount, hint = "Currency: $PLACEHOLDER_CURRENCY")
    TeCard(header = "Payouts") {
        ScreenNote(text = "Payouts are made weekly, on Monday at 06:00.")
        TeDataTable(
            columns = payoutColumns,
            rows = payouts,
            rowKey = { row: PayoutRow -> row.id },
            caption = "Payouts",
            emptyTitle = "No payouts yet",
            emptyDescription = "Payouts appear here once earnings are released.",
        )
    }
    TeCard(header = "Reports") {
        ScreenNote(text = reportLevelText(CURRENT_PLAN))
        if (CURRENT_PLAN.includes(PhotographerPlan.Pro)) {
            ScreenNote(text = "Export is included on your plan.")
        } else {
            TePlanGate(
                plan = "Pro",
                lockedLabel = "Export is available on the Pro plan.",
                upgradeLabel = "Upgrade to Pro",
                onUpgrade = { nav.open(SharedScreenId.PLAN_LIMIT_PROMPT) },
            )
        }
    }
}

private fun reportLevelText(plan: PhotographerPlan): String = when (plan) {
    PhotographerPlan.Basic -> "Your plan includes the basic report."
    PhotographerPlan.Studio -> "Your plan includes the full report."
    PhotographerPlan.Pro -> "Your plan includes the full report with export."
}
