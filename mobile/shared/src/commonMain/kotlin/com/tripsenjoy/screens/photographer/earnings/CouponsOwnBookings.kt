package com.tripsenjoy.screens.photographer.earnings

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.ScreenNavigator
import com.tripsenjoy.screens.moderator.common.icon
import com.tripsenjoy.screens.photographer.common.CURRENT_PLAN
import com.tripsenjoy.screens.photographer.common.DEMO_COUPONS_USED
import com.tripsenjoy.screens.photographer.common.StatePreview
import com.tripsenjoy.screens.photographer.common.isWithinAllowance
import com.tripsenjoy.screens.photographer.common.usageText
import com.tripsenjoy.screens.shared.common.ScreenBody
import com.tripsenjoy.screens.shared.common.SharedScreenId
import com.tripsenjoy.screens.shared.common.StateEmptyCard
import com.tripsenjoy.screens.shared.common.StateErrorBlock
import com.tripsenjoy.ui.components.BadgeTone
import com.tripsenjoy.ui.components.IconName
import com.tripsenjoy.ui.components.TeBadge
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeColumn
import com.tripsenjoy.ui.components.TeColumnAlign
import com.tripsenjoy.ui.components.TeDataTable
import com.tripsenjoy.ui.components.TeInput
import com.tripsenjoy.ui.components.TeKeyboardType
import com.tripsenjoy.ui.components.TeKpiTile
import com.tripsenjoy.ui.components.TeOption
import com.tripsenjoy.ui.components.TePageHeader
import com.tripsenjoy.ui.components.TePlanGate
import com.tripsenjoy.ui.components.TeSelect

private data class CouponRow(val id: String, val code: String, val status: String, val redemptions: String)

private data class CouponForm(val code: String = "", val discountType: String? = null, val value: String = "")

private val DISCOUNT_TYPES = listOf(
    TeOption(value = "percentage", label = "Percentage"),
    TeOption(value = "fixed", label = "Fixed amount"),
)

// SCR-PHO-12 Coupons for own bookings. The scope is fixed to bookings where this photographer is assigned (SHR-03).
// Coupon count is checked against the plan (Basic 3, Studio 10, Pro unlimited). A full plan shows the upgrade gate.
@Composable
fun CouponsOwnBookings() {
    val nav = LocalScreenNavigator.current
    ScreenBody {
        TePageHeader(title = "Coupons (own bookings)", description = "Coupons for bookings where you are assigned")
        StatePreview(
            ariaLabel = "Coupon states",
            main = { CouponsContent(nav = nav) },
            empty = {
                StateEmptyCard(
                    header = "Coupons",
                    message = "No coupons yet. Create a coupon for a booking you are assigned to.",
                )
            },
            error = { StateErrorBlock(retryMessage = "Coupons did not load. Retry to see your coupons.") },
        )
    }
}

@Composable
private fun CouponsContent(nav: ScreenNavigator) {
    var form by remember { mutableStateOf(CouponForm()) }
    val couponColumns = listOf(
        TeColumn<CouponRow>(key = "code", header = "Code", render = { it.code }),
        TeColumn<CouponRow>(key = "status", header = "Status", render = { it.status }),
        TeColumn<CouponRow>(
            key = "redemptions",
            header = "Redemptions",
            align = TeColumnAlign.End,
            render = { it.redemptions },
        ),
    )
    val withinLimit = isWithinAllowance(DEMO_COUPONS_USED, CURRENT_PLAN.coupons)
    TeBadge(label = "Scope: your assigned bookings", tone = BadgeTone.Info, icon = IconName.Lock)
    TeKpiTile(
        label = "Coupons created",
        value = usageText(DEMO_COUPONS_USED, CURRENT_PLAN.coupons),
        hint = "${CURRENT_PLAN.label} plan limit",
    )
    TeCard(header = "Coupons") {
        TeDataTable(
            columns = couponColumns,
            rows = emptyList<CouponRow>(),
            rowKey = { row: CouponRow -> row.id },
            caption = "Coupons",
            emptyTitle = "No coupons yet",
            emptyDescription = "Create a coupon for a booking you are assigned to.",
        )
    }
    if (withinLimit) {
        TeCard(header = "New coupon") {
            TeInput(
                value = form.code,
                onValueChange = { form = form.copy(code = it) },
                label = "Coupon code",
            )
            TeSelect(
                label = "Discount type",
                options = DISCOUNT_TYPES,
                value = form.discountType,
                onValueChange = { form = form.copy(discountType = it) },
            )
            TeInput(
                value = form.value,
                onValueChange = { form = form.copy(value = it.filter { ch -> ch.isDigit() }) },
                label = "Discount value",
                keyboardType = TeKeyboardType.Number,
            )
        }
        TeButton(
            text = "Create coupon",
            onClick = { nav.back() },
            enabled = form.code.isNotBlank() && form.discountType != null && form.value.isNotBlank(),
        )
    } else {
        TeCard(header = "New coupon") {
            TePlanGate(
                plan = "Pro",
                lockedLabel = "You have used all coupons on your plan. Upgrade to create more.",
                upgradeLabel = "Upgrade plan",
                onUpgrade = { nav.open(SharedScreenId.PLAN_LIMIT_PROMPT) },
            )
        }
    }
}
