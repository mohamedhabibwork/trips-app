package com.tripsenjoy.screens.traveler.booking

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import com.tripsenjoy.auth.LocalAuthApiOrNull
import com.tripsenjoy.screens.traveler.bookings.TravelerBookingState
import com.tripsenjoy.screens.traveler.common.AmountPlaceholder
import com.tripsenjoy.screens.traveler.common.BackButton
import com.tripsenjoy.screens.traveler.common.BookingStepper
import com.tripsenjoy.screens.traveler.common.LabelValue
import com.tripsenjoy.screens.traveler.common.OpenScreenButton
import com.tripsenjoy.screens.traveler.common.ScreenPage
import com.tripsenjoy.screens.traveler.common.ScreenSection
import com.tripsenjoy.screens.traveler.common.StatePreview
import com.tripsenjoy.screens.traveler.common.TravelerScreenState
import com.tripsenjoy.trips.TripsBrowseRepository
import com.tripsenjoy.ui.components.AlertTone
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeInlineAlert
import com.tripsenjoy.ui.components.TeInput
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

@Composable
fun BookingStep3CouponAndOrderSummary() {
    val api = LocalAuthApiOrNull.current
    val scope = rememberCoroutineScope()
    var couponCode by remember { mutableStateOf("") }
    var couponEntered by remember { mutableStateOf(false) }
    ScreenPage(title = "Booking step 3: coupon and order summary") {
        BookingStepper(currentId = "summary", completedIds = setOf("travelers", "seats"))
        StatePreview(listedStates = setOf(TravelerScreenState.Error)) {
            ScreenSection(header = "Order") {
                LabelValue(label = "Trip", value = "Selected trip")
                LabelValue(label = "Travelers", value = "1")
                LabelValue(label = "Programs", value = "Selected programs")
                LabelValue(label = "Seat", value = "Selected seat")
                LabelValue(label = "Plan discount", value = "Applied automatically")
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
                    onClick = {
                        couponEntered = true
                        TravelerBookingState.couponCode = couponCode.trim().takeIf { it.isNotEmpty() }
                        val client = api
                        if (client != null) {
                            scope.launch {
                                runCatching {
                                    client.call(
                                        "coupons/validateCoupon",
                                        buildJsonObject {
                                            put("code", couponCode.trim())
                                            TripsBrowseRepository.selectedTripId?.let { put("tripId", it) }
                                            put("subtotalMinor", 10000)
                                        },
                                        JsonElement.serializer(),
                                    )
                                }
                            }
                        }
                    },
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
