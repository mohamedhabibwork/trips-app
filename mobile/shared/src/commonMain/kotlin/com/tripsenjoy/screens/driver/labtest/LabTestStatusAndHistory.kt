package com.tripsenjoy.screens.driver.labtest

import androidx.compose.runtime.Composable
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.driver.DriverRoutes
import com.tripsenjoy.screens.driver.common.DriverSampleData
import com.tripsenjoy.screens.driver.common.DrvEmptyBlock
import com.tripsenjoy.screens.driver.common.DrvField
import com.tripsenjoy.screens.driver.common.DrvLabStatusBadge
import com.tripsenjoy.screens.driver.common.DrvLoadingBlock
import com.tripsenjoy.screens.driver.common.DrvNote
import com.tripsenjoy.screens.driver.common.DrvScreen
import com.tripsenjoy.screens.driver.common.LocalDriverSession
import com.tripsenjoy.screens.driver.common.StatePreview
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeTimeline

// SCR-DRV-05 Lab test status and history: current state, deadline, consent, last result and past tests.
@Composable
fun LabTestStatusAndHistory() {
    DrvScreen(
        title = "Lab test status and history",
        description = "The current test state, your deadline, consent and past results.",
    ) {
        StatePreview(
            main = { LabStatusMain() },
            loading = { DrvLoadingBlock("Loading your lab history") },
            empty = { DrvEmptyBlock("No lab tests yet", "Your lab history appears after your first lab test.") },
        )
    }
}

@Composable
private fun LabStatusMain() {
    val nav = LocalScreenNavigator.current
    val session = LocalDriverSession.current
    TeCard(header = "Current test") {
        DrvLabStatusBadge(uploaded = session.labResultUploaded)
        DrvField(label = "Deadline", value = DriverSampleData.LAB_DEADLINE)
        session.labBooking?.let { booking -> DrvField(label = "Booked", value = "${booking.lab}, ${booking.slot}") }
        DrvField(label = "Lab consent", value = "Given 03 Aug 2026 at registration")
        DrvField(label = "Last result date", value = "03 Aug 2026")
        DrvNote("A missed deadline suspends the account. A suspension over 30 days closes it.")
    }
    if (!session.labResultUploaded) {
        TeButton(text = "Book lab test", onClick = { nav.open(DriverRoutes.BOOK_LAB_TEST) })
        TeButton(
            text = "Upload result",
            onClick = { nav.open(DriverRoutes.UPLOAD_LAB_RESULT) },
            variant = TeButtonVariant.Secondary,
        )
    }
    TeCard(header = "History") {
        TeTimeline(items = DriverSampleData.labHistory)
    }
}
