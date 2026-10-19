package com.tripsenjoy.screens.shared.settings

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import com.tripsenjoy.auth.LocalAuthApiOrNull
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
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put

private data class NotificationRow(
    val id: String,
    val title: String,
    val body: String,
    val time: String,
    val unread: Boolean,
    val targetId: String,
)

@Composable
fun NotificationCentre() {
    val nav = LocalScreenNavigator.current
    val api = LocalAuthApiOrNull.current
    val scope = rememberCoroutineScope()
    var rows by remember { mutableStateOf<List<NotificationRow>>(emptyList()) }

    LaunchedEffect(api) {
        val client = api ?: return@LaunchedEffect
        runCatching {
            val arr = client.call("notifications/listInbox", buildJsonObject {}, JsonElement.serializer()).jsonArray
            rows = arr.map { el ->
                val obj = el.jsonObject
                NotificationRow(
                    id = obj["id"]?.jsonPrimitive?.contentOrNull ?: "",
                    title = obj["titleEn"]?.jsonPrimitive?.contentOrNull
                        ?: obj["titleAr"]?.jsonPrimitive?.contentOrNull
                        ?: obj["title"]?.jsonPrimitive?.contentOrNull
                        ?: "Notification",
                    body = obj["bodyEn"]?.jsonPrimitive?.contentOrNull
                        ?: obj["bodyAr"]?.jsonPrimitive?.contentOrNull
                        ?: obj["body"]?.jsonPrimitive?.contentOrNull
                        ?: "",
                    time = obj["createdAt"]?.jsonPrimitive?.contentOrNull ?: "—",
                    unread = obj["isRead"]?.jsonPrimitive?.booleanOrNull?.not()
                        ?: (obj["readAt"]?.jsonPrimitive?.contentOrNull == null),
                    targetId = obj["actionUrl"]?.jsonPrimitive?.contentOrNull
                        ?: obj["targetScreenId"]?.jsonPrimitive?.contentOrNull
                        ?: "SCR-PHO-05",
                )
            }
        }
    }

    ScreenBody {
        TePageHeader(title = "Notification centre", description = "Your notifications and their delivery state")
        StatePreview(
            ariaLabel = "Notification centre states",
            main = {
                NotificationList(
                    nav = nav,
                    rows = rows,
                    onMarkAllRead = {
                        rows = rows.map { it.copy(unread = false) }
                        val client = api
                        if (client != null) {
                            scope.launch {
                                runCatching {
                                    client.call("notifications/markAllRead", JsonNull, JsonElement.serializer())
                                }
                            }
                        }
                    },
                    onOpenRow = { row ->
                        val client = api
                        if (client != null && row.unread) {
                            scope.launch {
                                runCatching {
                                    client.call(
                                        "notifications/markRead",
                                        buildJsonObject { put("notificationId", row.id) },
                                        JsonElement.serializer(),
                                    )
                                }
                            }
                        }
                        nav.open(row.targetId)
                    },
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
    onOpenRow: (NotificationRow) -> Unit,
) {
    TeButton(text = "Mark all as read", onClick = onMarkAllRead, variant = TeButtonVariant.Secondary)
    rows.forEach { row ->
        TeNotificationItem(
            title = row.title,
            body = row.body,
            time = row.time,
            unread = row.unread,
            onOpen = { onOpenRow(row) },
        )
    }
    TeCard(header = "Channel preferences") {
        ScreenNote(text = "Choose how you receive each category in your profile settings.")
    }
}
