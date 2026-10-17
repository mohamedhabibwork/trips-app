package com.tripsenjoy.screens.shared.prompts

import androidx.compose.runtime.Composable
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.shared.common.PLACEHOLDER_AMOUNT_MINOR
import com.tripsenjoy.screens.shared.common.PLACEHOLDER_CURRENCY
import com.tripsenjoy.screens.shared.common.ScreenBody
import com.tripsenjoy.screens.shared.common.ScreenNote
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeMoney
import com.tripsenjoy.ui.components.TePageHeader
import com.tripsenjoy.ui.components.TePlanGate

// SCR-SHR-01 Plan-limit upgrade prompt. Shown in place of the blocked action, from any locked control.
// Closing it (cancel) or finishing the upgrade returns to the caller with nav.back(). Upgrades are immediate and
// prorated (BRL-13). The payment itself is not wired here; the price is in the account currency.
@Composable
fun PlanLimitUpgradePrompt() {
    val nav = LocalScreenNavigator.current
    ScreenBody {
        TePageHeader(title = "Plan-limit upgrade prompt", description = "Shown in place of the blocked action")
        TePlanGate(
            plan = "Studio",
            lockedLabel = "You have used 10 of 10 active bookings this month. Upgrade to Pro for unlimited bookings.",
            upgradeLabel = "Upgrade to Pro",
            onUpgrade = { nav.back() },
        )
        TeCard(header = "Limit details") {
            ScreenNote(text = "Limit: active bookings this month")
            ScreenNote(text = "Current: 10 of 10. Allowance: 10 on Studio.")
            ScreenNote(text = "Lifted by: Pro, which has no monthly limit.")
            TeMoney(amountMinor = PLACEHOLDER_AMOUNT_MINOR, currencyCode = PLACEHOLDER_CURRENCY, label = "Upgrade price")
        }
        TeButton(text = "Cancel", onClick = { nav.back() }, variant = TeButtonVariant.Secondary)
    }
}
