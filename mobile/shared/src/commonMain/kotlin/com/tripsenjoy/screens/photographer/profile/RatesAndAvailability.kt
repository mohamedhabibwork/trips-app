package com.tripsenjoy.screens.photographer.profile

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.ScreenNavigator
import com.tripsenjoy.screens.photographer.common.DEMO_CALENDAR_MONTH
import com.tripsenjoy.screens.photographer.common.LocalPhotographerSession
import com.tripsenjoy.screens.photographer.common.StatePreview
import com.tripsenjoy.screens.shared.common.PLACEHOLDER_CURRENCY
import com.tripsenjoy.screens.shared.common.ScreenBody
import com.tripsenjoy.screens.shared.common.ScreenNote
import com.tripsenjoy.screens.shared.common.StateErrorBlock
import com.tripsenjoy.screens.shared.common.StateLoadingCard
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeCalendar
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeColumn
import com.tripsenjoy.ui.components.TeDataTable
import com.tripsenjoy.ui.components.TeDate
import com.tripsenjoy.ui.components.TeInput
import com.tripsenjoy.ui.components.TeKeyboardType
import com.tripsenjoy.ui.components.TePageHeader
import com.tripsenjoy.ui.components.dayDescription

private data class RateForm(val serviceName: String = "", val rate: String = "")

// SCR-PHO-04 Rates and availability: a rate per service in the account currency, and dates marked unavailable.
// Tapping a date in the calendar marks it unavailable; tapping it again clears it. A deal request on an unavailable
// date is refused (BR-PHO-01).
@Composable
fun RatesAndAvailability() {
    val nav = LocalScreenNavigator.current
    ScreenBody {
        TePageHeader(title = "Rates and availability", description = "Set rates and mark dates unavailable")
        StatePreview(
            ariaLabel = "Rates and availability states",
            main = { RatesContent(nav = nav) },
            loading = { StateLoadingCard(subject = "your rates and calendar") },
            error = { StateErrorBlock(retryMessage = "Your rates did not load. Retry to see the calendar.") },
        )
    }
}

@Composable
private fun RatesContent(nav: ScreenNavigator) {
    val session = LocalPhotographerSession.current
    var form by remember(session.serviceRateName, session.serviceRateAmount) {
        mutableStateOf(RateForm(serviceName = session.serviceRateName, rate = session.serviceRateAmount))
    }
    var month by remember { mutableStateOf(DEMO_CALENDAR_MONTH) }
    val dateColumn = TeColumn<TeDate>(
        key = "date",
        header = "Date",
        render = { dayDescription(date = it, selected = false) },
    )
    TeCard(header = "Rate per service") {
        TeInput(
            value = form.serviceName,
            onValueChange = { form = form.copy(serviceName = it) },
            label = "Service name",
        )
        TeInput(
            value = form.rate,
            onValueChange = { form = form.copy(rate = it) },
            label = "Rate",
            keyboardType = TeKeyboardType.Number,
            supportingText = "Currency: $PLACEHOLDER_CURRENCY",
        )
    }
    TeCard(header = "Unavailable dates") {
        TeCalendar(
            label = "Pick dates to mark unavailable",
            selected = null,
            onSelect = { session.toggleUnavailableDate(it) },
            visibleMonth = month,
            onMonthChange = { month = it },
        )
        TeDataTable(
            columns = listOf(dateColumn),
            rows = session.unavailableDates.toList(),
            rowKey = { it },
            caption = "Unavailable dates",
            emptyTitle = "No unavailable dates",
            emptyDescription = "Dates you mark appear here.",
        )
    }
    ScreenNote(text = "Bulk edit is pending product sign-off (D-89).")
    TeButton(text = "Bulk edit", onClick = {}, variant = TeButtonVariant.Ghost, enabled = false)
    TeButton(
        text = "Save rates",
        onClick = {
            session.saveRatesAndAvailability(form.serviceName, form.rate)
            nav.back()
        },
        enabled = form.serviceName.isNotBlank() && form.rate.isNotBlank(),
    )
}
