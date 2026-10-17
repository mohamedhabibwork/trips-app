package com.tripsenjoy.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.tripsenjoy.ui.theme.TripsEnjoyColors
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

enum class TimelineState(val word: String) {
    Done("Done"),
    Current("Current"),
    Upcoming("Upcoming"),
    Missed("Missed"),
}

data class TeTimelineItem(val id: String, val time: String, val label: String, val state: TimelineState)

fun TimelineState.icon(): IconName = when (this) {
    TimelineState.Done -> IconName.Check
    TimelineState.Current -> IconName.Live
    TimelineState.Upcoming -> IconName.Clock
    TimelineState.Missed -> IconName.Alert
}

fun TimelineState.badgeTone(): BadgeTone = when (this) {
    TimelineState.Done -> BadgeTone.Success
    TimelineState.Current -> BadgeTone.Accent
    TimelineState.Upcoming -> BadgeTone.Neutral
    TimelineState.Missed -> BadgeTone.Danger
}

private val TimelineMarkerColumnWidth = 32.dp
private val TimelineMarkerSize = 28.dp
private val TimelineLineWidth = 2.dp
private val TimelineMarkerIconSize = 16.dp

// Ordered stops for a trip or a boarding day (SCR-PAR boarding timeline). Each stop shows its state as a
// badge with a word and an icon, so a missed stop is not shown by colour alone.
@Composable
fun TeTimeline(items: List<TeTimelineItem>, modifier: Modifier = Modifier) {
    Column(modifier = modifier.fillMaxWidth()) {
        items.forEachIndexed { index, item ->
            TeTimelineRow(item = item, isLast = index == items.lastIndex)
        }
    }
}

@Composable
private fun TeTimelineRow(item: TeTimelineItem, isLast: Boolean) {
    val colors = TripsEnjoyTheme.colors
    val spacing = TripsEnjoyTheme.spacing
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(IntrinsicSize.Min)
            .semantics(mergeDescendants = true) {},
        horizontalArrangement = Arrangement.spacedBy(spacing.space3),
    ) {
        Column(
            modifier = Modifier.width(TimelineMarkerColumnWidth).fillMaxHeight(),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Box(
                modifier = Modifier
                    .size(TimelineMarkerSize)
                    .clip(CircleShape)
                    .background(item.state.markerColor(colors), CircleShape),
                contentAlignment = Alignment.Center,
            ) {
                TeIcon(
                    name = item.state.icon(),
                    contentDescription = null,
                    tint = colors.brandNavy,
                    size = TimelineMarkerIconSize,
                )
            }
            if (!isLast) {
                Box(
                    modifier = Modifier
                        .width(TimelineLineWidth)
                        .weight(1f)
                        .background(colors.hairline),
                )
            }
        }
        Column(
            modifier = Modifier
                .weight(1f)
                .padding(bottom = if (isLast) 0.dp else spacing.space4),
            verticalArrangement = Arrangement.spacedBy(spacing.space1),
        ) {
            Text(text = item.time, style = TripsEnjoyTheme.typography.caption, color = colors.inkMuted)
            Text(text = item.label, style = TripsEnjoyTheme.typography.body, color = colors.ink)
            TeBadge(label = item.state.word, tone = item.state.badgeTone(), icon = item.state.icon())
        }
    }
}

private fun TimelineState.markerColor(colors: TripsEnjoyColors): Color = when (this) {
    TimelineState.Done -> colors.successSoft
    TimelineState.Current -> colors.accent
    TimelineState.Upcoming -> colors.surfaceRaised
    TimelineState.Missed -> colors.dangerSoft
}
