package com.tripsenjoy.screens.traveler.booking

import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import com.tripsenjoy.auth.LocalAuthApiOrNull
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.moderator.common.icon
import com.tripsenjoy.screens.traveler.bookings.TravelerBookingState
import com.tripsenjoy.screens.traveler.common.AmountPlaceholder
import com.tripsenjoy.screens.traveler.common.BackButton
import com.tripsenjoy.screens.traveler.common.BookingStepper
import com.tripsenjoy.screens.traveler.common.LabelValue
import com.tripsenjoy.screens.traveler.common.ScreenNote
import com.tripsenjoy.screens.traveler.common.ScreenPage
import com.tripsenjoy.screens.traveler.common.ScreenSection
import com.tripsenjoy.screens.traveler.common.StatePreview
import com.tripsenjoy.screens.traveler.common.TravelerScreenState
import com.tripsenjoy.trips.TripsBrowseRepository
import com.tripsenjoy.ui.components.BadgeTone
import com.tripsenjoy.ui.components.IconName
import com.tripsenjoy.ui.components.TeBadge
import com.tripsenjoy.ui.components.TeButton
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonArray
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put

@Composable
fun BookingStep4PaymentHandoff() {
    val nav = LocalScreenNavigator.current
    val api = LocalAuthApiOrNull.current
    val scope = rememberCoroutineScope()
    ScreenPage(title = "Booking step 4: payment handoff") {
        BookingStepper(currentId = "payment", completedIds = setOf("travelers", "seats", "summary"))
        StatePreview(listedStates = setOf(TravelerScreenState.Loading, TravelerScreenState.Error)) {
            TeBadge(label = "Hold active", tone = BadgeTone.Info, icon = IconName.Clock)
            ScreenSection(header = "Amount due") {
                AmountPlaceholder(label = "Amount due")
                LabelValue(label = "Hold time left", value = "15:00")
            }
            ScreenSection(header = "Payment methods") {
                LabelValue(label = "International cards and wallets", value = "Stripe")
                LabelValue(label = "Local cards", value = "Paymob or Tap")
                LabelValue(label = "Cash in Egypt", value = "Fawry")
            }
            ScreenNote(text = "You pay on the payment provider's page. Trips Enjoy never receives card details.")
            TeButton(
                text = "Pay on the payment page",
                onClick = {
                    val client = api
                    val tripId = TripsBrowseRepository.selectedTripId ?: "00000000-0000-0000-0000-000000000001"
                    if (client != null) {
                        scope.launch {
                            runCatching {
                                val res = client.call(
                                    "booking/createBooking",
                                    buildJsonObject {
                                        put("tripId", tripId)
                                        put(
                                            "passengers",
                                            buildJsonArray {
                                                add(
                                                    buildJsonObject {
                                                        put("id", "p-1")
                                                        put("fullName", TravelerBookingState.leadPassengerName)
                                                        put("isChild", false)
                                                        put("seatLabel", TravelerBookingState.selectedSeatLabel)
                                                    },
                                                )
                                            },
                                        )
                                        put(
                                            "selectedProgramIds",
                                            buildJsonArray {
                                                TravelerBookingState.selectedProgramIds.forEach { add(JsonPrimitive(it)) }
                                            },
                                        )
                                        put(
                                            "seatLabels",
                                            buildJsonArray {
                                                add(JsonPrimitive(TravelerBookingState.selectedSeatLabel))
                                            },
                                        )
                                        TravelerBookingState.couponCode?.let { put("couponCode", it) }
                                        put("paymentGateway", "paymob")
                                    },
                                    JsonElement.serializer(),
                                ).jsonObject
                                val bookingObj = res["booking"]?.jsonObject ?: res
                                val bookingId = bookingObj["id"]?.jsonPrimitive?.contentOrNull
                                if (bookingId != null) {
                                    TravelerBookingState.selectedBookingId = bookingId
                                    val payment = client.call(
                                        "payments/createPaymentIntent",
                                        buildJsonObject {
                                            put("bookingId", bookingId)
                                            put("purpose", "trip_booking")
                                            put("gateway", "paymob")
                                        },
                                        JsonElement.serializer(),
                                    ).jsonObject
                                    TravelerBookingState.lastPaymentId = payment["id"]?.jsonPrimitive?.contentOrNull
                                }
                            }
                            nav.replace("SCR-TRV-07")
                        }
                    } else {
                        nav.replace("SCR-TRV-07")
                    }
                },
            )
            BackButton()
        }
    }
}
