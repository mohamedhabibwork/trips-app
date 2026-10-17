package com.tripsenjoy.screens.traveler.booking

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.screens.traveler.common.AmountPlaceholder
import com.tripsenjoy.screens.traveler.common.BackButton
import com.tripsenjoy.screens.traveler.common.BookingStepper
import com.tripsenjoy.screens.traveler.common.LabelValue
import com.tripsenjoy.screens.traveler.common.OpenScreenButton
import com.tripsenjoy.screens.traveler.common.ScreenPage
import com.tripsenjoy.screens.traveler.common.ScreenSection
import com.tripsenjoy.screens.traveler.common.StatePreview
import com.tripsenjoy.screens.traveler.common.TravelerScreenState
import com.tripsenjoy.ui.components.AlertTone
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeInlineAlert
import com.tripsenjoy.ui.components.TeInput

// SCR-TRV-05. Order lines, one coupon (FR-CPN-01 to FR-CPN-04), live totals. A coupon rejected by the
// server shows its first failing reason at this field; another creator's coupon shows the generic message.
// Nothing is sent from this screen: the coupon is checked when the traveler continues to payment.
@Composable
fun BookingStep3CouponAndOrderSummary() {
    var couponCode by remember { mutableStateOf("") }
    var couponEntered by remember { mutableStateOf(false) }
    ScreenPage(title = "Booking step 3: coupon and order summary") {
        BookingStepper(currentId = "summary", completedIds = setOf("travelers", "seats"))
        StatePreview(listedStates = setOf(TravelerScreenState.Error)) {
            ScreenSection(header = "Order") {
                LabelValue(label = "Trip", value = "Trip name")
                LabelValue(label = "Travelers", value = "Traveler count")
                LabelValue(label = "Programs", value = "Selected programs")
                LabelValue(label = "Seat", value = "Seat label, or organization-assigned")
                LabelValue(label = "Plan discount", value = "Discount line")
                AmountPlaceholder(label = "Total")
            }
            ScreenSection(header = "Coupon") {
                TeInput(
                    value = couponCode,
                    onValueChange = { typed ->
                        couponCode = typed
                        couponEntered = false
                    },
                    label = "Coupon code",
                    supportingText = "One coupon per booking",
                )
                TeButton(
                    text = "Apply coupon",
                    onClick = { couponEntered = true },
                    variant = TeButtonVariant.Secondary,
                    enabled = couponCode.isNotBlank(),
                )
                if (couponEntered) {
                    TeInlineAlert(
                        tone = AlertTone.Info,
                        title = "Coupon code entered",
                        message = "The server checks this code when you continue to payment.",
                    )
                }
            }
            OpenScreenButton(text = "Continue to payment", screenId = "SCR-TRV-06")
            BackButton()
        }
    }
}
