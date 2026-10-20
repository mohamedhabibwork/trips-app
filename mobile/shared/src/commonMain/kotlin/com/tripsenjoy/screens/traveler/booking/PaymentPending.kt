package com.tripsenjoy.screens.traveler.booking

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import com.tripsenjoy.auth.LocalAuthApiOrNull
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.moderator.common.icon
import com.tripsenjoy.screens.traveler.bookings.TravelerBookingState
import com.tripsenjoy.screens.traveler.common.AmountPlaceholder
import com.tripsenjoy.screens.traveler.common.LabelValue
import com.tripsenjoy.screens.traveler.common.ScreenNote
import com.tripsenjoy.screens.traveler.common.ScreenPage
import com.tripsenjoy.screens.traveler.common.ScreenSection
import com.tripsenjoy.ui.components.BadgeTone
import com.tripsenjoy.ui.components.IconName
import com.tripsenjoy.ui.components.TeBadge
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put

// SCR-TRV-07. Shown as "confirming payment" when the gateway does not answer within 30 seconds (D-30).
// Confirmed only after a verified callback (FR-PAY-01). Unresolved after 15 minutes goes to admin.
// "Check status" asks the mock gateway adapter to settle the payment once (idempotent, FR-PAY-02).
// The stub section stands in for the provider page in development (NFR-SEC-12).
@Composable
fun PaymentPending() {
    val nav = LocalScreenNavigator.current
    val api = LocalAuthApiOrNull.current
    val scope = rememberCoroutineScope()
    var bookingReference by remember { mutableStateOf("Booking reference") }
    var checking by remember { mutableStateOf(false) }
    var simulating by remember { mutableStateOf(false) }
    var lastSimulatedOutcome by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(api) {
        val client = api ?: return@LaunchedEffect
        val bookingId = TravelerBookingState.selectedBookingId ?: return@LaunchedEffect
        runCatching {
            val detail = client.call(
                "booking/getBooking",
                buildJsonObject { put("bookingId", bookingId) },
                JsonElement.serializer(),
            ).jsonObject
            val booking = detail["booking"]?.jsonObject ?: detail
            bookingReference = booking["bookingReference"]?.jsonPrimitive?.contentOrNull ?: bookingReference
        }
    }

    fun checkStatus() {
        val client = api ?: return
        val paymentId = TravelerBookingState.lastPaymentId ?: run { nav.replace("SCR-TRV-08"); return }
        scope.launch {
            checking = true
            val outcome = runCatching {
                client.call(
                    "payments/confirmPayment",
                    buildJsonObject { put("paymentId", paymentId) },
                    JsonElement.serializer(),
                ).jsonObject
            }
            checking = false
            val status = outcome.getOrNull()
                ?.get("status")?.jsonPrimitive?.contentOrNull
            nav.replace(if (status == "succeeded") "SCR-TRV-09" else "SCR-TRV-08")
        }
    }

    /** Dev-only: plays the stub gateway callback (success or failure) against the pending payment. */
    fun simulateGateway(outcome: String) {
        val client = api ?: return
        val reference = TravelerBookingState.lastPaymentProviderReference ?: return
        scope.launch {
            simulating = true
            val result = runCatching {
                client.call(
                    "payments/processGatewayCallback",
                    buildJsonObject {
                        put("gateway", TravelerBookingState.lastPaymentGateway ?: "stub")
                        put("providerReference", reference)
                        put("outcome", outcome)
                    },
                    JsonElement.serializer(),
                ).jsonObject
            }
            simulating = false
            lastSimulatedOutcome = if (result.isSuccess) outcome else null
        }
    }

    ScreenPage(title = "Payment pending") {
        TeBadge(label = "Confirming payment", tone = BadgeTone.Warning, icon = IconName.Clock)
        ScreenSection(header = "Booking") {
            LabelValue(label = "Booking reference", value = bookingReference)
            AmountPlaceholder(label = "Amount")
        }
        ScreenSection(header = "What happens next") {
            ScreenNote(text = "We confirm your booking as soon as the payment provider confirms the payment.")
            ScreenNote(text = "If the payment provider is slow, the booking stays in payment pending while we check.")
        }
        TeButton(
            text = if (checking) "Checking payment status" else "Check status",
            enabled = !checking,
            onClick = { checkStatus() },
        )
        TeButton(
            text = "Payment was not completed",
            variant = TeButtonVariant.Secondary,
            onClick = { nav.replace("SCR-TRV-08") },
        )

        if (TravelerBookingState.lastPaymentGateway == "stub") {
            ScreenSection(header = "Mock gateway (dev)") {
                ScreenNote(text = "The stub gateway stands in for the payment provider in development.")
                if (lastSimulatedOutcome != null) {
                    ScreenNote(
                        text = if (lastSimulatedOutcome == "succeeded") {
                            "Callback delivered: succeeded. Check status to finish."
                        } else {
                            "Callback delivered: failed. Check status to finish."
                        },
                    )
                }
                TeButton(
                    text = "Simulate gateway success",
                    enabled = !simulating,
                    onClick = { simulateGateway("succeeded") },
                )
                TeButton(
                    text = "Simulate gateway failure",
                    variant = TeButtonVariant.Secondary,
                    enabled = !simulating,
                    onClick = { simulateGateway("failed") },
                )
            }
        }
    }
}
