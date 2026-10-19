package com.tripsenjoy.screens.parent.tracking

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import com.tripsenjoy.auth.LocalAuthApiOrNull
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.traveler.bookings.TravelerBookingState
import com.tripsenjoy.screens.traveler.common.BackButton
import com.tripsenjoy.screens.traveler.common.ScreenPage
import com.tripsenjoy.screens.traveler.common.StatePreview
import com.tripsenjoy.screens.traveler.common.TravelerScreenState
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeInput
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

@Composable
fun LinkChildToBooking() {
    val nav = LocalScreenNavigator.current
    val api = LocalAuthApiOrNull.current
    val scope = rememberCoroutineScope()
    var bookingReference by remember { mutableStateOf("") }
    var childName by remember { mutableStateOf("") }
    val canLink = bookingReference.isNotBlank() && childName.isNotBlank()
    ScreenPage(title = "Link child to booking") {
        StatePreview(listedStates = setOf(TravelerScreenState.Error)) {
            TeInput(
                value = bookingReference,
                onValueChange = { bookingReference = it },
                label = "Booking reference",
                supportingText = "The reference from the booking confirmation",
            )
            TeInput(
                value = childName,
                onValueChange = { childName = it },
                label = "Child full name",
                supportingText = "Child details to be confirmed (D-125)",
            )
            TeButton(
                text = "Link child",
                enabled = canLink,
                onClick = {
                    val client = api
                    if (client != null) {
                        scope.launch {
                            runCatching {
                                client.call(
                                    "parent/linkChildToParent",
                                    buildJsonObject {
                                        put("bookingId", TravelerBookingState.selectedBookingId ?: bookingReference.trim())
                                        put("childPassengerId", "p-child-1")
                                        put("childFullName", childName.trim())
                                        put("relationship", "guardian")
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
            BackButton(text = "Cancel", variant = TeButtonVariant.Ghost)
        }
    }
}
