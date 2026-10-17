package com.tripsenjoy.screens.driver.common

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.moderator.common.icon
import com.tripsenjoy.ui.components.BadgeTone
import com.tripsenjoy.ui.components.IconName
import com.tripsenjoy.ui.components.TeBadge
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TePageHeader
import com.tripsenjoy.ui.components.TeUploadFile
import com.tripsenjoy.ui.components.UploadStatus
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

// Shared frame for the driver screens: a scrolling column with a Back action when there is history,
// then the page header. The 16dp side gutter is applied here because ScreenHost adds no padding.
@Composable
internal fun DrvScreen(
    title: String,
    description: String?,
    content: @Composable ColumnScope.() -> Unit,
) {
    val nav = LocalScreenNavigator.current
    val spacing = TripsEnjoyTheme.spacing
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = spacing.space4, vertical = spacing.space4),
        verticalArrangement = Arrangement.spacedBy(spacing.space4),
    ) {
        if (nav.canGoBack) {
            TeButton(text = "Back", onClick = { nav.back() }, variant = TeButtonVariant.Ghost)
        }
        TePageHeader(title = title, description = description)
        content()
    }
}

// Muted supporting copy under a control or inside a card.
@Composable
internal fun DrvNote(text: String) {
    Text(
        text = text,
        style = TripsEnjoyTheme.typography.caption,
        color = TripsEnjoyTheme.colors.inkMuted,
    )
}

// A labelled read-only value, such as a deadline or a vehicle plate.
@Composable
internal fun DrvField(label: String, value: String) {
    Column(verticalArrangement = Arrangement.spacedBy(TripsEnjoyTheme.spacing.space1)) {
        Text(text = label, style = TripsEnjoyTheme.typography.caption, color = TripsEnjoyTheme.colors.inkMuted)
        Text(text = value, style = TripsEnjoyTheme.typography.body, color = TripsEnjoyTheme.colors.ink)
    }
}

// Lab test status word plus icon. Pending and uploaded are told apart by the word, not colour alone.
@Composable
internal fun DrvLabStatusBadge(uploaded: Boolean) {
    if (uploaded) {
        TeBadge(label = "Result uploaded, waiting for admin decision", tone = BadgeTone.Info, icon = IconName.Upload)
    } else {
        TeBadge(label = "Pending", tone = BadgeTone.Warning, icon = IconName.Clock)
    }
}

// Adds a placeholder file to an upload list. The platform file picker is not wired yet, so the name is generated.
internal fun List<TeUploadFile>.withPlaceholderFile(prefix: String): List<TeUploadFile> =
    this + TeUploadFile(name = "$prefix-${size + 1}.pdf", status = UploadStatus.Pending)
