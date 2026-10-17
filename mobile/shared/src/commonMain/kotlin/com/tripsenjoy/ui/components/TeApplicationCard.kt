package com.tripsenjoy.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

enum class ApplicationStatus(val word: String) {
    Pending("Pending review"),
    ChangesRequested("Changes requested"),
    Approved("Approved"),
    Rejected("Rejected"),
}

data class TeDocument(val label: String, val verified: Boolean)

fun ApplicationStatus.icon(): IconName = when (this) {
    ApplicationStatus.Pending -> IconName.Clock
    ApplicationStatus.ChangesRequested -> IconName.Info
    ApplicationStatus.Approved -> IconName.Check
    ApplicationStatus.Rejected -> IconName.Close
}

fun ApplicationStatus.tone(): BadgeTone = when (this) {
    ApplicationStatus.Pending -> BadgeTone.Neutral
    ApplicationStatus.ChangesRequested -> BadgeTone.Warning
    ApplicationStatus.Approved -> BadgeTone.Success
    ApplicationStatus.Rejected -> BadgeTone.Danger
}

fun TeDocument.verificationWord(): String = if (verified) "Verified" else "Not verified"

private val ApplicationIconSize = 16.dp

// Admin review card for one applicant (SCR-ADM review queue). The role uses TeBadge with the role's tone.
// Status and each document's verification are shown as words with icons. The whole card opens the review.
@Composable
fun TeApplicationCard(
    applicant: String,
    role: UserRole,
    submittedAt: String,
    status: ApplicationStatus,
    documents: List<TeDocument>,
    onOpen: (() -> Unit)? = null,
    modifier: Modifier = Modifier,
) {
    val colors = TripsEnjoyTheme.colors
    val spacing = TripsEnjoyTheme.spacing
    val radius = TripsEnjoyTheme.radius.md
    val shape = RoundedCornerShape(radius)
    val tappable = if (onOpen != null) {
        Modifier.clickable(role = Role.Button, onClick = onOpen)
    } else {
        Modifier
    }
    Column(
        modifier = modifier
            .fillMaxWidth()
            .clip(shape)
            .background(colors.surfaceRaised, shape)
            .border(1.dp, colors.hairline, shape)
            .then(tappable)
            .teFocusRing(radius)
            .padding(spacing.space4),
        verticalArrangement = Arrangement.spacedBy(spacing.space3),
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(spacing.space2),
        ) {
            Text(
                text = applicant,
                style = TripsEnjoyTheme.typography.h3,
                color = colors.ink,
                modifier = Modifier.weight(1f),
            )
            TeBadge(label = role.defaultLabel(), tone = role.badgeTone())
        }
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(spacing.space1)) {
            TeIcon(name = IconName.Clock, contentDescription = null, tint = colors.inkMuted, size = ApplicationIconSize)
            Text(text = submittedAt, style = TripsEnjoyTheme.typography.caption, color = colors.inkMuted)
        }
        TeBadge(label = status.word, tone = status.tone(), icon = status.icon())
        documents.forEach { document ->
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(spacing.space2),
            ) {
                TeIcon(
                    name = if (document.verified) IconName.Check else IconName.Clock,
                    contentDescription = null,
                    tint = if (document.verified) colors.success else colors.warning,
                    size = ApplicationIconSize,
                )
                Text(
                    text = document.label,
                    style = TripsEnjoyTheme.typography.body,
                    color = colors.ink,
                    modifier = Modifier.weight(1f),
                )
                Text(
                    text = document.verificationWord(),
                    style = TripsEnjoyTheme.typography.caption,
                    color = colors.inkMuted,
                )
            }
        }
    }
}
