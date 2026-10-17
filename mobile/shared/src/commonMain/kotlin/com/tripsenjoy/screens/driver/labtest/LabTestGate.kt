package com.tripsenjoy.screens.driver.labtest

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.driver.DriverRoutes
import com.tripsenjoy.screens.driver.common.DriverSampleData
import com.tripsenjoy.screens.driver.common.DrvField
import com.tripsenjoy.screens.driver.common.DrvLabStatusBadge
import com.tripsenjoy.screens.driver.common.DrvNote
import com.tripsenjoy.screens.driver.common.DrvScreen
import com.tripsenjoy.screens.driver.common.LocalDriverSession
import com.tripsenjoy.screens.driver.common.tone
import com.tripsenjoy.ui.components.AlertTone
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeInlineAlert

// SCR-DRV-02 Lab-test gate. While a lab test is pending the app opens here and offers four actions only:
// book lab test, upload result, contact support and sign out (FR-DRV-03).
@Composable
fun LabTestGate() {
    val nav = LocalScreenNavigator.current
    val session = LocalDriverSession.current
    var supportNote by remember { mutableStateOf(false) }
    DrvScreen(title = "Lab-test gate", description = "A lab test is pending. Only four actions are open until it is done.") {
        TeInlineAlert(
            tone = AlertTone.Warning,
            title = "Lab test pending",
            message = "Deadline: ${DriverSampleData.LAB_DEADLINE}. Upcoming trips return to the organizers, who must reassign them.",
        )
        TeCard(header = "Test state") {
            DrvLabStatusBadge(uploaded = session.labResultUploaded)
            session.labBooking?.let { booking -> DrvField(label = "Booked", value = "${booking.lab}, ${booking.slot}") }
            DrvNote("The admin sets the deadline: 1 to 7 days from the request, 3 days by default.")
        }
        TeButton(text = "Book lab test", onClick = { nav.open(DriverRoutes.BOOK_LAB_TEST) })
        TeButton(
            text = "Upload result",
            onClick = { nav.open(DriverRoutes.UPLOAD_LAB_RESULT) },
            variant = TeButtonVariant.Secondary,
        )
        TeButton(text = "Contact support", onClick = { supportNote = true }, variant = TeButtonVariant.Ghost)
        if (supportNote) {
            DrvNote("Support is reached through the contact channel the platform sets up (proposed D-110).")
        }
        TeButton(text = "Sign out", onClick = {}, variant = TeButtonVariant.Ghost)
    }
}
