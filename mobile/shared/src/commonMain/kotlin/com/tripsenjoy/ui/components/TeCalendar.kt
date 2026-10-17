package com.tripsenjoy.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.disabled
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

private val DayCellHeight = 44.dp
private val DayCellInset = 2.dp
private val NavButtonSize = 44.dp

// Month grid for picking one date. Each day is a button named with its full date ("15 October 2026, selected").
// Days outside minDate and maxDate are disabled. The caller owns the selected date and the visible month.
// previousMonthLabel and nextMonthLabel are the spoken names for the navigation buttons.
@Composable
fun TeCalendar(
    label: String,
    selected: TeDate?,
    onSelect: (TeDate) -> Unit,
    visibleMonth: TeDate,
    onMonthChange: (TeDate) -> Unit,
    minDate: TeDate? = null,
    maxDate: TeDate? = null,
    weekStartsOnSaturday: Boolean = true,
    previousMonthLabel: String = "Previous month",
    nextMonthLabel: String = "Next month",
    modifier: Modifier = Modifier,
) {
    val colors = TripsEnjoyTheme.colors
    val spacing = TripsEnjoyTheme.spacing
    val grid = buildMonthGrid(visibleMonth.year, visibleMonth.month, weekStartsOnSaturday)

    Column(modifier = modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(spacing.space3)) {
        Text(text = label, style = TripsEnjoyTheme.typography.label, color = colors.ink)
        Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            CalendarNavButton(
                description = previousMonthLabel,
                icon = IconName.Back,
                onClick = { onMonthChange(visibleMonth.shiftMonth(-1)) },
            )
            Text(
                text = "${monthName(visibleMonth.month)} ${visibleMonth.year}",
                style = TripsEnjoyTheme.typography.label,
                color = colors.ink,
                textAlign = TextAlign.Center,
                modifier = Modifier.weight(1f).semantics { heading() },
            )
            CalendarNavButton(
                description = nextMonthLabel,
                icon = IconName.Arrow,
                onClick = { onMonthChange(visibleMonth.shiftMonth(1)) },
            )
        }
        Row(modifier = Modifier.fillMaxWidth().clearAndSetSemantics { }) {
            weekdayHeaders(weekStartsOnSaturday).forEach { header ->
                Text(
                    text = header,
                    style = TripsEnjoyTheme.typography.caption,
                    color = colors.inkMuted,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.weight(1f),
                )
            }
        }
        grid.forEach { week ->
            Row(modifier = Modifier.fillMaxWidth()) {
                week.forEach { date ->
                    if (date == null) {
                        Box(modifier = Modifier.weight(1f).height(DayCellHeight))
                    } else {
                        CalendarDayCell(
                            date = date,
                            isSelected = date == selected,
                            enabled = isDateEnabled(date, minDate, maxDate),
                            onClick = { onSelect(date) },
                            modifier = Modifier.weight(1f),
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun CalendarNavButton(description: String, icon: IconName, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .size(NavButtonSize)
            .clickable(role = Role.Button, onClick = onClick)
            .semantics { contentDescription = description }
            .teFocusRing(TripsEnjoyTheme.radius.sm),
        contentAlignment = Alignment.Center,
    ) {
        TeIcon(name = icon, contentDescription = null, tint = TripsEnjoyTheme.colors.ink, flipInRtl = true)
    }
}

@Composable
private fun CalendarDayCell(
    date: TeDate,
    isSelected: Boolean,
    enabled: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val colors = TripsEnjoyTheme.colors
    val radius = TripsEnjoyTheme.radius.sm
    val shape = RoundedCornerShape(radius)
    val container = if (isSelected) colors.primary else colors.surfaceRaised
    val textColor = when {
        isSelected -> colors.onPrimary
        enabled -> colors.ink
        else -> colors.inkMuted
    }
    Box(
        modifier = modifier
            .height(DayCellHeight)
            .padding(DayCellInset)
            .clip(shape)
            .background(container, shape)
            .border(1.dp, if (isSelected) colors.primary else colors.hairline, shape)
            .clickable(enabled = enabled, role = Role.Button, onClick = onClick)
            .semantics {
                contentDescription = dayDescription(date, isSelected)
                selected = isSelected
                if (!enabled) disabled()
            }
            .teFocusRing(radius),
        contentAlignment = Alignment.Center,
    ) {
        Text(text = date.day.toString(), style = TripsEnjoyTheme.typography.body, color = textColor)
    }
}
