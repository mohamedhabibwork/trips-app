package com.tripsenjoy.screens.shared.prompts

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import com.tripsenjoy.auth.LocalAuthApiOrNull
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
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put

// SCR-SHR-01 Plan-limit upgrade prompt. Shown in place of the blocked action, from any locked control.
// Closing it (cancel) or finishing the upgrade returns to the caller with nav.back(). Upgrades are immediate and
// prorated (BRL-13).
@Composable
fun PlanLimitUpgradePrompt() {
    val nav = LocalScreenNavigator.current
    val api = LocalAuthApiOrNull.current
    val scope = rememberCoroutineScope()
    var currentPlan by remember { mutableStateOf("Studio") }

    LaunchedEffect(api) {
        val client = api ?: return@LaunchedEffect
        runCatching {
            val sub = client.call(
                "plans/getActiveSubscription",
                buildJsonObject {},
                JsonElement.serializer(),
            ).jsonObject
            currentPlan = sub["tier"]?.jsonPrimitive?.contentOrNull ?: currentPlan
        }
    }

    ScreenBody {
        TePageHeader(title = "Plan-limit upgrade prompt", description = "Shown in place of the blocked action")
        TePlanGate(
            plan = currentPlan,
            lockedLabel = "You have used 10 of 10 active bookings this month. Upgrade to Pro for unlimited bookings.",
            upgradeLabel = "Upgrade to Pro",
            onUpgrade = {
                val client = api
                if (client != null) {
                    scope.launch {
                        runCatching {
                            client.call(
                                "plans/changeSubscription",
                                buildJsonObject {
                                    put("planId", "photographer-pro")
                                    put("billingCycle", "monthly")
                                },
                                JsonElement.serializer(),
                            )
                        }
                        nav.back()
                    }
                } else {
                    nav.back()
                }
            },
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
