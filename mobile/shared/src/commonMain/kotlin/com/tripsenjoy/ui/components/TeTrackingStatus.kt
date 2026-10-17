package com.tripsenjoy.ui.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

enum class TrackingStatus { OnTime, Delayed, Boarded, NotBoarded, Arrived }

// Parent-app tracking status. Always word plus icon. Pass label to localise the word.
@Composable
fun TeTrackingStatus(
    status: TrackingStatus,
    modifier: Modifier = Modifier,
    label: String = status.defaultLabel(),
) {
    TeBadge(
        label = label,
        tone = status.badgeTone(),
        modifier = modifier,
        icon = status.icon(),
    )
}

fun TrackingStatus.badgeTone(): BadgeTone = when (this) {
    TrackingStatus.OnTime -> BadgeTone.Success
    TrackingStatus.Delayed -> BadgeTone.Warning
    TrackingStatus.Boarded -> BadgeTone.Success
    TrackingStatus.NotBoarded -> BadgeTone.Danger
    TrackingStatus.Arrived -> BadgeTone.Success
}

fun TrackingStatus.icon(): IconName = when (this) {
    TrackingStatus.OnTime -> IconName.Check
    TrackingStatus.Delayed -> IconName.Clock
    TrackingStatus.Boarded -> IconName.Bus
    TrackingStatus.NotBoarded -> IconName.Alert
    TrackingStatus.Arrived -> IconName.Shield
}

fun TrackingStatus.defaultLabel(): String = when (this) {
    TrackingStatus.OnTime -> "On time"
    TrackingStatus.Delayed -> "Delayed"
    TrackingStatus.Boarded -> "Boarded"
    TrackingStatus.NotBoarded -> "Not boarded"
    TrackingStatus.Arrived -> "Arrived"
}
