package com.tripsenjoy.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.tripsenjoy.ui.theme.TripsEnjoyColors
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

enum class SeatState(val word: String) {
    Available("Available"),
    Selected("Selected"),
    Held("Held"),
    Reserved("Reserved"),
    CheckedIn("Checked in"),
    CheckedOut("Checked out"),
    Cancelled("Cancelled"),
    Taken("Taken"),
    Blocked("Blocked"),
}

data class TeSeat(val id: String, val label: String, val state: SeatState)

data class TeSeatRow(val id: String, val seats: List<TeSeat>)

// Only an available seat can be chosen. Every other state is shown but cannot be tapped.
fun SeatState.isSelectable(): Boolean = this == SeatState.Available || this == SeatState.Selected

// Spoken name for a seat, for example "Seat 1B, Checked in". The state word is what makes it readable without colour.
fun TeSeat.accessibleDescription(): String = "Seat $label, ${state.word}"

fun SeatState.icon(): IconName = when (this) {
    SeatState.Available -> IconName.Seat
    SeatState.Selected -> IconName.Check
    SeatState.Held -> IconName.Clock
    SeatState.Reserved -> IconName.Ticket
    SeatState.CheckedIn -> IconName.Check
    SeatState.CheckedOut -> IconName.Pin
    SeatState.Cancelled -> IconName.Close
    SeatState.Taken -> IconName.User
    SeatState.Blocked -> IconName.Lock
}

private val SeatSize = 48.dp
private val SeatIconSize = 12.dp
private val SeatBorderWidth = 1.dp
private val SeatRowSpacing = 8.dp

// Seat layout for one vehicle. Each seat is a button whose state is in its semantics, and it shows an icon plus
// the seat label, so state is not carried by colour alone. onSelect is null when the map is read-only.
// The legend lists every state as a word.
@Composable
fun TeSeatMap(
    rows: List<TeSeatRow>,
    onSelect: ((String) -> Unit)?,
    ariaLabel: String,
    modifier: Modifier = Modifier,
) {
    val spacing = TripsEnjoyTheme.spacing
    Column(
        modifier = modifier
            .fillMaxWidth()
            .semantics { contentDescription = ariaLabel },
        verticalArrangement = Arrangement.spacedBy(SeatRowSpacing),
    ) {
        rows.forEach { row ->
            Row(
                modifier = Modifier.horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(SeatRowSpacing),
            ) {
                row.seats.forEach { seat ->
                    TeSeatButton(
                        seat = seat,
                        enabled = onSelect != null && seat.state.isSelectable(),
                        onClick = { onSelect?.invoke(seat.id) },
                    )
                }
            }
        }
        TeSeatLegend(modifier = Modifier.padding(top = spacing.space2))
    }
}

@Composable
private fun TeSeatButton(seat: TeSeat, enabled: Boolean, onClick: () -> Unit) {
    val colors = TripsEnjoyTheme.colors
    val radius = TripsEnjoyTheme.radius.sm
    val shape = RoundedCornerShape(radius)
    val contentColor = seat.state.contentColor(colors)
    Box(
        modifier = Modifier
            .size(SeatSize)
            .clip(shape)
            .background(seat.state.containerColor(colors), shape)
            .border(SeatBorderWidth, seat.state.borderColor(colors), shape)
            .clickable(enabled = enabled, role = Role.Button, onClick = onClick)
            .semantics { contentDescription = seat.accessibleDescription() }
            .teFocusRing(radius),
        contentAlignment = Alignment.Center,
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            TeIcon(
                name = seat.state.icon(),
                contentDescription = null,
                tint = contentColor,
                size = SeatIconSize,
            )
            Text(
                text = seat.label,
                style = TripsEnjoyTheme.typography.caption,
                color = contentColor,
            )
        }
    }
}

@Composable
private fun TeSeatLegend(modifier: Modifier = Modifier) {
    val colors = TripsEnjoyTheme.colors
    Row(
        modifier = modifier.horizontalScroll(rememberScrollState()),
        horizontalArrangement = Arrangement.spacedBy(TripsEnjoyTheme.spacing.space3),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        SeatState.entries.forEach { state ->
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(TripsEnjoyTheme.spacing.space1),
            ) {
                TeIcon(name = state.icon(), contentDescription = null, tint = colors.ink, size = SeatIconSize)
                Text(text = state.word, style = TripsEnjoyTheme.typography.caption, color = colors.ink)
            }
        }
    }
}

private fun SeatState.containerColor(colors: TripsEnjoyColors): Color = when (this) {
    SeatState.Available -> colors.surfaceRaised
    SeatState.Selected -> colors.accent
    SeatState.Held -> colors.warningSoft
    SeatState.Reserved -> colors.infoSoft
    SeatState.CheckedIn -> colors.successSoft
    SeatState.CheckedOut, SeatState.Cancelled, SeatState.Taken, SeatState.Blocked -> colors.hairline
}

private fun SeatState.contentColor(colors: TripsEnjoyColors): Color = when (this) {
    SeatState.Available, SeatState.Held, SeatState.Reserved, SeatState.CheckedIn -> colors.ink
    SeatState.Selected -> colors.brandNavy
    SeatState.CheckedOut, SeatState.Cancelled, SeatState.Taken, SeatState.Blocked -> colors.inkMuted
}

private fun SeatState.borderColor(colors: TripsEnjoyColors): Color = when (this) {
    SeatState.Selected -> colors.brandNavy
    SeatState.Available, SeatState.Held, SeatState.Reserved, SeatState.CheckedIn,
    SeatState.CheckedOut, SeatState.Cancelled, SeatState.Taken, SeatState.Blocked -> colors.controlBorder
}
