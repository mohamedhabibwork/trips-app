package com.tripsenjoy.screens.moderator.access

import androidx.compose.runtime.Composable
import com.tripsenjoy.screens.moderator.common.LocalModeratorSession
import com.tripsenjoy.screens.moderator.common.ModEmptyBlock
import com.tripsenjoy.screens.moderator.common.ModField
import com.tripsenjoy.screens.moderator.common.ModLoadingBlock
import com.tripsenjoy.screens.moderator.common.ModNote
import com.tripsenjoy.screens.moderator.common.ModScreen
import com.tripsenjoy.screens.moderator.common.StatePreview
import com.tripsenjoy.screens.moderator.common.icon
import com.tripsenjoy.screens.moderator.common.tone
import com.tripsenjoy.ui.components.BadgeTone
import com.tripsenjoy.ui.components.IconName
import com.tripsenjoy.ui.components.TeBadge
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeRetryBanner
import com.tripsenjoy.ui.components.TeSwitch

// SCR-MOD-06 Offline queue and sync: events saved on this device, their count, original times and the sync state.
@Composable
fun OfflineQueueAndSync() {
    ModScreen(
        title = "Offline queue and sync",
        description = "Events waiting on this device. They keep their original times and send in order.",
    ) {
        StatePreview(
            main = { QueueMain() },
            loading = { ModLoadingBlock("Syncing events in order") },
            empty = { ModEmptyBlock("Nothing waiting", "Every event is synced. New events appear here while the connection is lost.") },
            error = { QueueRetryBanner() },
        )
    }
}

@Composable
private fun QueueMain() {
    val session = LocalModeratorSession.current
    val events = session.queue.toList()
    TeCard(header = "Queue") {
        ModField(label = "Queued events", value = "${events.size} waiting")
        ModField(label = "Oldest event", value = events.firstOrNull()?.time ?: "None")
        ModField(label = "Newest event", value = events.lastOrNull()?.time ?: "None")
        ModField(label = "Sync state", value = session.syncState.word)
        ModField(label = "Synced in this session", value = "${session.syncedCount} events")
    }
    TeSwitch(
        checked = session.online,
        onCheckedChange = { value -> session.online = value },
        label = "Mobile data connected",
    )
    ModNote("Turn mobile data off to see new events queue on this device.")
    TeButton(
        text = "Sync now",
        enabled = session.online && events.isNotEmpty(),
        onClick = { session.syncQueue() },
    )
    events.forEach { event ->
        TeCard(header = event.summary) {
            ModField(label = "Original time", value = event.time)
            ModField(label = "Type", value = event.kind.word)
            TeBadge(label = "Queued", tone = BadgeTone.Neutral, icon = IconName.Clock)
        }
    }
}

@Composable
private fun QueueRetryBanner() {
    val session = LocalModeratorSession.current
    TeRetryBanner(
        message = "Sync failed. The events stay on this device. Retry when you are connected.",
        onRetry = { session.syncQueue() },
        retrying = false,
    )
}
