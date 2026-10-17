package com.tripsenjoy.screens.driver.labtest

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.driver.DriverRoutes
import com.tripsenjoy.screens.driver.common.DriverSampleData
import com.tripsenjoy.screens.driver.common.DrvEmptyBlock
import com.tripsenjoy.screens.driver.common.DrvErrorBlock
import com.tripsenjoy.screens.driver.common.DrvField
import com.tripsenjoy.screens.driver.common.DrvLabBooking
import com.tripsenjoy.screens.driver.common.DrvLoadingBlock
import com.tripsenjoy.screens.driver.common.DrvNote
import com.tripsenjoy.screens.driver.common.DrvScreen
import com.tripsenjoy.screens.driver.common.LocalDriverSession
import com.tripsenjoy.screens.driver.common.StatePreview
import com.tripsenjoy.ui.components.ErrorKind
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeSelect

// SCR-DRV-03 Book lab test. Booking leads to the lab-test status screen (SCR-DRV-05).
@Composable
fun BookLabTest() {
    DrvScreen(
        title = "Book lab test",
        description = "Book a partner lab visit before the deadline. Tests are free at partner labs.",
    ) {
        StatePreview(
            main = { BookLabForm() },
            loading = { DrvLoadingBlock("Loading partner labs and slots") },
            empty = { DrvEmptyBlock("No slots left", "This lab has no open slot before your deadline. Choose another lab.") },
            error = { DrvErrorBlock(ErrorKind.Unavailable) },
        )
    }
}

@Composable
private fun BookLabForm() {
    val nav = LocalScreenNavigator.current
    val session = LocalDriverSession.current
    var labId by remember { mutableStateOf<String?>(null) }
    var slotId by remember { mutableStateOf<String?>(null) }
    val lab = DriverSampleData.labs.firstOrNull { it.value == labId }
    val slot = DriverSampleData.labSlots.firstOrNull { it.value == slotId }
    val booking = if (lab != null && slot != null) DrvLabBooking(lab = lab.label, slot = slot.label) else null
    DrvField(label = "Deadline", value = "${DriverSampleData.LAB_DEADLINE}, 3 days from the request")
    TeSelect(
        label = "Partner lab",
        options = DriverSampleData.labs,
        value = labId,
        onValueChange = { value ->
            labId = value
            slotId = null
        },
        supportingText = "Partner labs for your market.",
    )
    if (lab != null) {
        TeSelect(
            label = "Available slot",
            options = DriverSampleData.labSlots,
            value = slotId,
            onValueChange = { value -> slotId = value },
            supportingText = "Pick a time before the deadline.",
        )
    }
    TeButton(
        text = "Book lab test",
        enabled = booking != null,
        onClick = {
            booking?.let { confirmed ->
                session.bookLab(confirmed)
                nav.replace(DriverRoutes.LAB_STATUS_HISTORY)
            }
        },
    )
    DrvNote("Tests are free at partner labs. Your booking shows in lab test status and history.")
}
