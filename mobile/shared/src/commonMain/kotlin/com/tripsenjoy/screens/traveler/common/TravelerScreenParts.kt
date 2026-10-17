package com.tripsenjoy.screens.traveler.common

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TePageHeader
import com.tripsenjoy.ui.components.TeStep
import com.tripsenjoy.ui.components.TeStepper
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

// Shared frame for the traveler and parent screens. Every screen renders placeholder values only:
// the spec gives no prices, counts or names, so amounts and names are labelled placeholders.

// Screen frame: page header with the screen name, then the content, scrolling at phone width.
@Composable
internal fun ScreenPage(title: String, content: @Composable ColumnScope.() -> Unit) {
    Column(
        modifier = Modifier.fillMaxWidth().verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(TripsEnjoyTheme.spacing.space4),
    ) {
        TePageHeader(title = title)
        content()
    }
}

@Composable
internal fun ScreenSection(header: String, content: @Composable ColumnScope.() -> Unit) {
    TeCard(header = header, content = content)
}

// Label on the left, value on the right. Row order mirrors in RTL automatically.
@Composable
internal fun LabelValue(label: String, value: String) {
    val colors = TripsEnjoyTheme.colors
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Text(text = label, style = TripsEnjoyTheme.typography.caption, color = colors.inkMuted)
        Text(text = value, style = TripsEnjoyTheme.typography.body, color = colors.ink)
    }
}

// Plain supporting text in the muted ink colour, for rules a user must see.
@Composable
internal fun ScreenNote(text: String) {
    Text(text = text, style = TripsEnjoyTheme.typography.caption, color = TripsEnjoyTheme.colors.inkMuted)
}

// Money always carries its currency (UI-06). No amount is in the spec, so the value is a placeholder.
@Composable
internal fun AmountPlaceholder(label: String) {
    LabelValue(label = label, value = "Amount and currency from the server")
}

internal val BOOKING_STEPS: List<TeStep> = listOf(
    TeStep(id = "travelers", label = "Travelers and programs"),
    TeStep(id = "seats", label = "Seat selection"),
    TeStep(id = "summary", label = "Coupon and summary"),
    TeStep(id = "payment", label = "Payment"),
)

// Seat selection is skipped when the trip has self-select off (organization-assigned seats).
@Composable
internal fun BookingStepper(currentId: String, completedIds: Set<String>) {
    TeStepper(
        steps = BOOKING_STEPS,
        currentId = currentId,
        completedIds = completedIds,
        ariaLabel = "Booking steps",
    )
}

// Navigation buttons. Each one moves through the ScreenHost of this app (ScreenNavigator contract).

// Opens another screen. This screen stays on the back stack, so Back returns here.
@Composable
internal fun OpenScreenButton(
    text: String,
    screenId: String,
    variant: TeButtonVariant = TeButtonVariant.Primary,
    enabled: Boolean = true,
) {
    val nav = LocalScreenNavigator.current
    TeButton(text = text, onClick = { nav.open(screenId) }, variant = variant, enabled = enabled)
}

// Replaces this screen with another. Use it for a step that must not return here (for example, paid booking).
@Composable
internal fun ReplaceScreenButton(
    text: String,
    screenId: String,
    variant: TeButtonVariant = TeButtonVariant.Primary,
    enabled: Boolean = true,
) {
    val nav = LocalScreenNavigator.current
    TeButton(text = text, onClick = { nav.replace(screenId) }, variant = variant, enabled = enabled)
}

// Returns to the previous screen. Also used for the confirm action of a form that ends where it started.
@Composable
internal fun BackButton(
    text: String = "Back",
    variant: TeButtonVariant = TeButtonVariant.Secondary,
    enabled: Boolean = true,
) {
    val nav = LocalScreenNavigator.current
    TeButton(text = text, onClick = { nav.back() }, variant = variant, enabled = enabled)
}
