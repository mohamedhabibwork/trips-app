package com.tripsenjoy.screens.shared.settings

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.ScreenNavigator
import com.tripsenjoy.screens.photographer.common.StatePreview
import com.tripsenjoy.screens.shared.common.ScreenBody
import com.tripsenjoy.screens.shared.common.ScreenNote
import com.tripsenjoy.screens.shared.common.StateEmptyCard
import com.tripsenjoy.screens.shared.common.StateErrorBlock
import com.tripsenjoy.screens.shared.common.StateLoadingCard
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeNotificationItem
import com.tripsenjoy.ui.components.TePageHeader

private data class NotificationRow(
    val id: String,
    val title: String,
    val body: String,
    val time: String,
    val unread: Boolean,
    val targetId: String,
)

// Sample rows. Each target is the screen the row opens. The failed row shows its retry on the row (FR-NTF-05).
private val SAMPLE_NOTIFICATIONS = listOf(
    NotificationRow(
        id = "n-1",
        title = "Deal request received",
        body = "Trip name. Respond before the offer expires.",
        time = "Time",
        unread = true,
        targetId = "SCR-PHO-05",
    ),
    NotificationRow(
        id = "n-2",
        title = "Payout sent",
        body = "Delivery by email failed. A retry is scheduled.",
        time = "Time",
        unread = true,
        targetId = "SCR-PHO-11",
    ),
    NotificationRow(
        id = "n-3",
        title = "Trip brief updated",
        body = "Delivered by push and email.",
        time = "Time",
        unread = false,
        targetId = "SCR-PHO-06",
    ),
)

// SCR-SHR-11 Notification centre. Each row shows its text, time and unread state as a word. A failed delivery stays
// on the row with a retry scheduled (FR-NTF-05). Opening a row goes to its target screen; Back returns here.
@Composable
fun NotificationCentre() {
    val nav = LocalScreenNavigator.current
    var rows by remember { mutableStateOf(SAMPLE_NOTIFICATIONS) }
    ScreenBody {
        TePageHeader(title = "Notification centre", description = "Your notifications and their delivery state")
        StatePreview(
            ariaLabel = "Notification centre states",
            main = {
                NotificationList(
                    nav = nav,
                    rows = rows,
                    onMarkAllRead = { rows = rows.map { it.copy(unread = false) } },
                )
            },
            loading = { StateLoadingCard(subject = "your notifications") },
            empty = { StateEmptyCard(header = "Notifications", message = "No notifications yet.") },
            error = { StateErrorBlock(retryMessage = "Notifications did not load. Retry to see them.") },
        )
        TeButton(text = "Back", onClick = { nav.back() }, variant = TeButtonVariant.Ghost)
    }
}

@Composable
private fun NotificationList(
    nav: ScreenNavigator,
    rows: List<NotificationRow>,
    onMarkAllRead: () -> Unit,
) {
    TeButton(text = "Mark all as read", onClick = onMarkAllRead, variant = TeButtonVariant.Secondary)
    rows.forEach { row ->
        TeNotificationItem(
            title = row.title,
            body = row.body,
            time = row.time,
            unread = row.unread,
            onOpen = { nav.open(row.targetId) },
        )
    }
    TeCard(header = "Channel preferences") {
        ScreenNote(text = "Choose how you receive each category in your profile settings.")
    }
}
