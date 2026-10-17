package com.tripsenjoy.screens.driver.earnings

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.driver.DriverRoutes
import com.tripsenjoy.screens.driver.common.DriverSampleData
import com.tripsenjoy.screens.driver.common.DrvCoupon
import com.tripsenjoy.screens.driver.common.DrvEmptyBlock
import com.tripsenjoy.screens.driver.common.DrvField
import com.tripsenjoy.screens.driver.common.DrvNote
import com.tripsenjoy.screens.driver.common.DrvScreen
import com.tripsenjoy.screens.driver.common.LocalDriverSession
import com.tripsenjoy.screens.driver.common.StatePreview
import com.tripsenjoy.screens.driver.common.limitWord
import com.tripsenjoy.screens.driver.common.tone
import com.tripsenjoy.screens.moderator.common.icon
import com.tripsenjoy.ui.components.AlertTone
import com.tripsenjoy.ui.components.BadgeTone
import com.tripsenjoy.ui.components.IconName
import com.tripsenjoy.ui.components.TeBadge
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeInlineAlert
import com.tripsenjoy.ui.components.TeInput
import com.tripsenjoy.ui.components.TePlanGate
import com.tripsenjoy.ui.components.TeSelect

private const val CODE_MIN_LENGTH = 4
private const val CODE_MAX_LENGTH = 12

// SCR-DRV-12 Driver coupons (own bookings). Coupons cover only bookings where this driver is assigned.
@Composable
fun DriverCouponsOwnBookings() {
    DrvScreen(
        title = "Driver coupons (own bookings)",
        description = "Coupons that apply only to bookings where you are the assigned driver.",
    ) {
        StatePreview(
            main = { CouponsMain() },
            empty = { DrvEmptyBlock("No coupons yet", "Create a coupon for one of your assigned bookings.") },
            error = {
                TeInlineAlert(
                    tone = AlertTone.Error,
                    title = "Coupons not loaded",
                    message = "Your coupons could not be loaded. Try again when you are connected.",
                )
            },
        )
    }
}

@Composable
private fun CouponsMain() {
    val session = LocalDriverSession.current
    var lastSaved by remember { mutableStateOf<String?>(null) }
    TeCard(header = "Coupon count") {
        DrvField(
            label = "Used against your ${session.plan.label} plan",
            value = "${session.coupons.size} of ${limitWord(session.plan.couponLimit)}",
        )
    }
    session.coupons.forEach { coupon -> CouponRow(coupon) }
    if (session.canCreateCoupon()) {
        CouponForm(onSaved = { code -> lastSaved = code })
    } else {
        CouponLimitGate()
    }
    lastSaved?.let { code ->
        TeInlineAlert(tone = AlertTone.Success, title = "Coupon saved", message = "$code applies to your assigned bookings.")
    }
}

@Composable
private fun CouponRow(coupon: DrvCoupon) {
    TeCard(header = coupon.code) {
        TeBadge(
            label = if (coupon.active) "Active" else "Paused",
            tone = if (coupon.active) BadgeTone.Success else BadgeTone.Neutral,
            icon = if (coupon.active) IconName.Check else IconName.Clock,
        )
        DrvNote("${coupon.discountPercent}% off. ${coupon.redemptions} redemptions.")
    }
}

@Composable
private fun CouponForm(onSaved: (String) -> Unit) {
    val session = LocalDriverSession.current
    var code by remember { mutableStateOf("") }
    var discount by remember { mutableStateOf<String?>(null) }
    val codeTaken = session.coupons.any { it.code == code }
    val validDiscount = discount?.toIntOrNull()
    val draft = if (code.length in CODE_MIN_LENGTH..CODE_MAX_LENGTH && !codeTaken && validDiscount != null) {
        DrvCoupon(code = code, discountPercent = validDiscount, active = true, redemptions = 0)
    } else {
        null
    }
    TeInput(
        value = code,
        onValueChange = { value ->
            code = value.uppercase().filter { it.isLetterOrDigit() }.take(CODE_MAX_LENGTH)
        },
        label = "Coupon code",
        supportingText = "$CODE_MIN_LENGTH to $CODE_MAX_LENGTH letters or numbers.",
        error = if (codeTaken) "You already have a coupon with this code." else null,
    )
    TeSelect(
        label = "Discount",
        options = DriverSampleData.discounts,
        value = discount,
        onValueChange = { value -> discount = value },
        placeholder = "Choose a discount",
    )
    DrvNote("Applies only to bookings where you are the assigned driver.")
    TeButton(
        text = "Create coupon",
        enabled = draft != null,
        onClick = {
            draft?.let { coupon ->
                session.addCoupon(coupon)
                code = ""
                discount = null
                onSaved(coupon.code)
            }
        },
    )
}

@Composable
private fun CouponLimitGate() {
    val nav = LocalScreenNavigator.current
    val session = LocalDriverSession.current
    TePlanGate(
        plan = session.plan.label,
        lockedLabel = "Your ${session.plan.label} plan allows ${limitWord(session.plan.couponLimit)} coupons. Upgrade to create more.",
        upgradeLabel = "Upgrade plan",
        onUpgrade = { nav.open(DriverRoutes.PLAN) },
    )
}
