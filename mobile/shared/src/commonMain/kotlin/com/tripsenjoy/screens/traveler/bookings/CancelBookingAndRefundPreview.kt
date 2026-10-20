package com.tripsenjoy.screens.traveler.bookings

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import com.tripsenjoy.analytics.AnalyticsTracker
import com.tripsenjoy.auth.LocalAuthApiOrNull
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.traveler.common.AmountPlaceholder
import com.tripsenjoy.screens.traveler.common.BackButton
import com.tripsenjoy.screens.traveler.common.LabelValue
import com.tripsenjoy.screens.traveler.common.ScreenNote
import com.tripsenjoy.screens.traveler.common.ScreenPage
import com.tripsenjoy.screens.traveler.common.ScreenSection
import com.tripsenjoy.screens.traveler.common.StatePreview
import com.tripsenjoy.screens.traveler.common.TravelerScreenState
import com.tripsenjoy.ui.components.AlertTone
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeCheckbox
import com.tripsenjoy.ui.components.TeInlineAlert
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

@Composable
fun CancelBookingAndRefundPreview() {
    val nav = LocalScreenNavigator.current
    val api = LocalAuthApiOrNull.current
    val scope = rememberCoroutineScope()
    var acknowledged by remember { mutableStateOf(false) }
    ScreenPage(title = "Cancel booking and refund preview") {
        StatePreview(listedStates = setOf(TravelerScreenState.Loading, TravelerScreenState.Error)) {
            TeInlineAlert(
                tone = AlertTone.Warning,
                title = "Cancel this booking?",
                message = "Review the refund before you confirm. Cancelling cannot be undone.",
            )
            ScreenSection(header = "Refund preview") {
                LabelValue(label = "Time to departure", value = "Time left before departure")
                LabelValue(label = "Policy row applied", value = "Placeholder tier, Operations to confirm")
                AmountPlaceholder(label = "Refund amount")
                LabelValue(label = "Coupon", value = "Coupon redemption is reversed on refund")
                LabelValue(label = "Non-refundable fees", value = "Placeholder, decision D-156")
            }
            ScreenSection(header = "Refund policy (placeholder)") {
                LabelValue(label = "48 hours or more", value = "80 percent refund")
                LabelValue(label = "24 to under 48 hours", value = "50 percent refund")
                LabelValue(label = "Under 24 hours", value = "No refund")
            }
            ScreenNote(text = "The booking shows Refund Pending until the payment provider confirms the refund.")
            TeCheckbox(
                checked = acknowledged,
                onCheckedChange = { acknowledged = it },
                label = "I understand the refund shown above and that cancelling cannot be undone.",
            )
            TeButton(
                text = "Confirm cancellation",
                variant = TeButtonVariant.Destructive,
                enabled = acknowledged,
                onClick = {
                    val client = api
                    val bookingId = TravelerBookingState.selectedBookingId ?: "booking-1"
                    if (client != null) {
                        scope.launch {
                            val outcome = runCatching {
                                client.call(
                                    "booking/cancelBooking",
                                    buildJsonObject {
                                        put("bookingId", bookingId)
                                        put("reason", "Traveler requested cancellation")
                                    },
                                    JsonElement.serializer(),
                                )
                            }
                            if (outcome.isSuccess) {
                                AnalyticsTracker.trackAction("booking_cancelled", mapOf("entity_type" to "trip_booking"))
                                AnalyticsTracker.trackAction("refund_requested", mapOf("entity_type" to "trip_booking"))
                            } else {
                                AnalyticsTracker.trackAction("booking_cancel_failed", mapOf("step" to "cancellation"))
                            }
                            nav.back()
                        }
                    } else {
                        nav.back()
                    }
                },
            )
            BackButton(text = "Keep booking")
        }
    }
}
