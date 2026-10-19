package com.tripsenjoy.screens.traveler.account

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.auth.LocalAuthApiOrNull
import com.tripsenjoy.auth.LocalAuthSessionOrNull
import com.tripsenjoy.screens.moderator.common.icon
import com.tripsenjoy.screens.traveler.common.BackButton
import com.tripsenjoy.screens.traveler.common.LabelValue
import com.tripsenjoy.screens.traveler.common.OpenScreenButton
import com.tripsenjoy.screens.traveler.common.ScreenPage
import com.tripsenjoy.screens.traveler.common.ScreenSection
import com.tripsenjoy.screens.traveler.common.StatePreview
import com.tripsenjoy.screens.traveler.common.TravelerScreenState
import com.tripsenjoy.traveler.TravelerRepository
import com.tripsenjoy.ui.components.BadgeTone
import com.tripsenjoy.ui.components.IconName
import com.tripsenjoy.ui.components.TeBadge
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeColumn
import com.tripsenjoy.ui.components.TeDataTable
import kotlin.coroutines.cancellation.CancellationException

// SCR-TRV-18. Compare Free, Explorer and VIP. Upgrade is immediate and prorated; downgrade takes effect at the
// end of the cycle. Annual discount is a placeholder of 15 percent for Finance to set (D-16).
// Ad-free has no requirement in the SRS (gap); its cells stay as placeholders.
// Upgrade opens the payment handoff, the same step a booking uses.
private data class PlanRow(
    val id: String,
    val feature: String,
    val free: String,
    val explorer: String,
    val vip: String,
)

private val PLAN_COLUMNS = listOf(
    TeColumn<PlanRow>(key = "feature", header = "Feature", render = { it.feature }),
    TeColumn<PlanRow>(key = "free", header = "Free", render = { it.free }),
    TeColumn<PlanRow>(key = "explorer", header = "Explorer", render = { it.explorer }),
    TeColumn<PlanRow>(key = "vip", header = "VIP", render = { it.vip }),
)

private val PLAN_ROWS = listOf(
    PlanRow("discount", "Program discount", "Not included", "5 percent", "10 percent"),
    PlanRow("early", "Early access", "Not included", "Not included", "Included"),
    PlanRow("seat", "Seat priority window", "Not included", "Included", "Included"),
    PlanRow("child", "Child tracking", "Not included", "Included", "Included"),
    PlanRow("receipts", "Receipt export", "Not included", "Not included", "Included"),
    PlanRow("adfree", "Ad-free", "To be confirmed", "To be confirmed", "To be confirmed"),
)

@Composable
fun PlansAndUpgradeTraveler() {
    val session = LocalAuthSessionOrNull.current
    val api = LocalAuthApiOrNull.current
    val repository = remember(api, session) {
        if (api != null) TravelerRepository(api = api, auth = session?.repository) else null
    }
    var planName by remember { mutableStateOf("Plan name") }
    var annualBillingText by remember { mutableStateOf("15 percent off the monthly total (placeholder)") }

    LaunchedEffect(repository, session) {
        if (repository == null || session == null || !session.repository.hasStoredSession()) return@LaunchedEffect
        try {
            val overview = repository.getPlanOverview()
            val matched = overview.plans.firstOrNull { it.tier == overview.currentPlanTier }
            planName = matched?.nameEn?.ifBlank { overview.currentPlanTier.uppercase() }
                ?: overview.currentPlanTier.replaceFirstChar { it.uppercase() }
            val discountPercent = overview.annualDiscountBps / 100
            annualBillingText = "$discountPercent percent off the monthly total (placeholder)"
        } catch (caught: CancellationException) {
            throw caught
        } catch (_: Throwable) {
            // Keep default preview copy
        }
    }

    ScreenPage(title = "Plans and upgrade (traveler)") {
        StatePreview(listedStates = setOf(TravelerScreenState.Loading, TravelerScreenState.Error)) {
            TeBadge(label = "Current plan", tone = BadgeTone.Accent, icon = IconName.Check)
            LabelValue(label = "Plan", value = planName)
            TeDataTable(
                columns = PLAN_COLUMNS,
                rows = PLAN_ROWS,
                rowKey = { it.id },
                caption = "Plan comparison",
                emptyTitle = "No plans to compare",
            )
            ScreenSection(header = "Billing") {
                LabelValue(label = "Annual billing", value = annualBillingText)
                LabelValue(label = "Upgrade", value = "Takes effect now, prorated")
                LabelValue(label = "Downgrade", value = "Takes effect at the end of the billing cycle")
            }
            OpenScreenButton(text = "Upgrade to VIP", screenId = "SCR-TRV-06")
            TeButton(text = "Downgrade at end of cycle", onClick = {}, variant = TeButtonVariant.Secondary)
            BackButton()
        }
    }
}

