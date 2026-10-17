package com.tripsenjoy.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.tripsenjoy.ui.theme.TripsEnjoyColors
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

enum class UploadStatus { Pending, Uploading, Done, Failed }

data class TeUploadFile(val name: String, val status: UploadStatus, val message: String? = null)

fun UploadStatus.word(): String = when (this) {
    UploadStatus.Pending -> "Pending"
    UploadStatus.Uploading -> "Uploading"
    UploadStatus.Done -> "Done"
    UploadStatus.Failed -> "Failed"
}

fun UploadStatus.icon(): IconName = when (this) {
    UploadStatus.Pending -> IconName.Clock
    UploadStatus.Uploading -> IconName.Refresh
    UploadStatus.Done -> IconName.Check
    UploadStatus.Failed -> IconName.Alert
}

fun UploadStatus.tone(): BadgeTone = when (this) {
    UploadStatus.Pending -> BadgeTone.Neutral
    UploadStatus.Uploading -> BadgeTone.Info
    UploadStatus.Done -> BadgeTone.Success
    UploadStatus.Failed -> BadgeTone.Danger
}

private val FileRemoveTouchSize = 44.dp

// Upload control. The file picker is supplied by the caller (onPick), since file access differs per platform.
// The label is the button text. Each file shows its status as an icon plus a word.
@Composable
fun TeFileUpload(
    label: String,
    onPick: () -> Unit,
    files: List<TeUploadFile>,
    onRemove: (String) -> Unit,
    hint: String? = null,
    removeLabel: String = "Remove",
    modifier: Modifier = Modifier,
) {
    val colors = TripsEnjoyTheme.colors
    val spacing = TripsEnjoyTheme.spacing
    Column(modifier = modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(spacing.space3)) {
        TeButton(text = label, onClick = onPick, variant = TeButtonVariant.Secondary, modifier = Modifier.fillMaxWidth())
        if (hint != null) {
            Text(text = hint, style = TripsEnjoyTheme.typography.caption, color = colors.inkMuted)
        }
        files.forEach { file ->
            TeUploadRow(
                file = file,
                removeLabel = removeLabel,
                onRemove = { onRemove(file.name) },
            )
        }
    }
}

@Composable
private fun TeUploadRow(file: TeUploadFile, removeLabel: String, onRemove: () -> Unit) {
    val colors = TripsEnjoyTheme.colors
    val spacing = TripsEnjoyTheme.spacing
    val shape = RoundedCornerShape(TripsEnjoyTheme.radius.sm)
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(shape)
            .background(colors.surfaceRaised, shape)
            .border(1.dp, colors.hairline, shape)
            .padding(start = spacing.space3, end = spacing.space1, top = spacing.space2, bottom = spacing.space2),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(spacing.space2),
    ) {
        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(spacing.space1)) {
            Text(
                text = file.name,
                style = TripsEnjoyTheme.typography.body,
                color = colors.ink,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            TeBadge(label = file.status.word(), tone = file.status.tone(), icon = file.status.icon())
            if (file.message != null) {
                Text(text = file.message, style = TripsEnjoyTheme.typography.caption, color = colors.inkMuted)
            }
        }
        Box(
            modifier = Modifier
                .defaultMinSize(minWidth = FileRemoveTouchSize, minHeight = FileRemoveTouchSize)
                .clickable(role = Role.Button, onClick = onRemove),
            contentAlignment = Alignment.Center,
        ) {
            TeIcon(name = IconName.Close, contentDescription = "$removeLabel ${file.name}", tint = colors.ink)
        }
    }
}
