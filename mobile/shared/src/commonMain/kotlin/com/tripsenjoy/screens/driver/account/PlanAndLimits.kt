package com.tripsenjoy.screens.driver.account

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.screens.driver.common.DrvErrorBlock
import com.tripsenjoy.screens.driver.common.DrvField
import com.tripsenjoy.screens.driver.common.DrvLoadingBlock
import com.tripsenjoy.screens.driver.common.DrvNote
import com.tripsenjoy.screens.driver.common.DrvPlan
import com.tripsenjoy.screens.driver.common.DrvPlanChange
import com.tripsenjoy.screens.driver.common.DrvScreen
import com.tripsenjoy.screens.driver.common.LocalDriverSession
import com.tripsenjoy.screens.driver.common.StatePreview
import com.tripsenjoy.screens.driver.common.limitWord
import com.tripsenjoy.screens.driver.common.tone
import com.tripsenjoy.screens.photographer.common.includes
import com.tripsenjoy.ui.components.AlertTone
import com.tripsenjoy.ui.components.ErrorKind
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeInlineAlert

// SCR-DRV-11 Plan and limits. Upgrades wait for payment; downgrades take effect at the end of the cycle.
@Composable
fun PlanAndLimits() {
    DrvScreen(
        title = "Plan and limits",
        description = "Your plan and its limits. Downgrades take effect at the end of the billing cycle.",
    ) {
        StatePreview(
            main = { PlanMain() },
            loading = { DrvLoadingBlock("Loading your plan") },
            error = { DrvErrorBlock(ErrorKind.Server) },
        )
    }
}

@Composable
private fun PlanMain() {
    val session = LocalDriverSession.current
    var choice by remember { mutableStateOf(session.plan) }
    TeCard(header = "Current plan") {
        DrvField(label = "Plan", value = session.plan.label)
        DrvField(
            label = "Active bookings this month",
            value = "${session.activeBookings} of ${limitWord(session.plan.bookingLimit)}",
        )
        DrvField(label = "Coupons", value = "${session.coupons.size} of ${limitWord(session.plan.couponLimit)}")
    }
    PlanChangeStatus(session.planChange)
    TeCard(header = "Choose a plan") {
        DrvPlan.entries.forEach { plan ->
            TeButton(
                text = plan.label,
                onClick = { choice = plan },
                variant = if (plan == choice) TeButtonVariant.Primary else TeButtonVariant.Secondary,
            )
        }
        TeButton(
            text = "Change plan",
            enabled = choice != session.plan,
            onClick = { session.requestPlanChange(choice) },
        )
    }
    TeCard(header = "What each plan includes") {
        DrvNote("Basic: 3 active bookings, 3 coupons, standard listing.")
        DrvNote("Professional: 10 active bookings, 10 coupons, featured listing and verified badge.")
        DrvNote("Premium: unlimited bookings and coupons, top placement, verified badge and export.")
    }
}

@Composable
private fun PlanChangeStatus(change: DrvPlanChange?) {
    if (change == null) return
    if (change.upgrade) {
        TeInlineAlert(
            tone = AlertTone.Info,
            title = "Upgrade awaiting payment",
            message = "${change.target.label} starts after payment is confirmed. Payment is not handled in this app yet.",
        )
    } else {
        TeInlineAlert(
            tone = AlertTone.Warning,
            title = "Downgrade scheduled",
            message = "${change.target.label} starts at the end of this billing cycle.",
        )
    }
}
