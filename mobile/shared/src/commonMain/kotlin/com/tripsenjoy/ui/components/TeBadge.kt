package com.tripsenjoy.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.tripsenjoy.ui.theme.TripsEnjoyColors
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

enum class BadgeTone { Neutral, Accent, Highlight, Success, Warning, Danger, Info }

enum class UserRole { Traveler, Parent, Driver, Photographer, Organization, Admin }

private val BadgeIconSize = 16.dp

// Small status pill. Status is word plus icon, never colour alone, so pass an icon for status badges.
@Composable
fun TeBadge(
    label: String,
    tone: BadgeTone,
    modifier: Modifier = Modifier,
    icon: IconName? = null,
) {
    val colors = TripsEnjoyTheme.colors
    val spacing = TripsEnjoyTheme.spacing
    val content = tone.contentColor(colors)
    Row(
        modifier = modifier
            .clip(RoundedCornerShape(TripsEnjoyTheme.radius.pill))
            .background(tone.containerColor(colors))
            .padding(horizontal = spacing.space3, vertical = spacing.space1),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (icon != null) {
            TeIcon(name = icon, contentDescription = null, tint = content, size = BadgeIconSize)
            Spacer(Modifier.width(spacing.space1))
        }
        Text(text = label, style = TripsEnjoyTheme.typography.caption, color = content)
    }
}

// Role badge for a person's role. Colours follow the role app icons where the README pins them.
@Composable
fun TeRoleBadge(
    role: UserRole,
    modifier: Modifier = Modifier,
    label: String = role.defaultLabel(),
) {
    TeBadge(label = label, tone = role.badgeTone(), modifier = modifier)
}

// Role to tone. Organization uses info-soft (README). Photographer uses the amber of its app icon.
// The other roles are a judgement call, since the token file does not pin them.
fun UserRole.badgeTone(): BadgeTone = when (this) {
    UserRole.Traveler -> BadgeTone.Accent
    UserRole.Parent -> BadgeTone.Info
    UserRole.Driver -> BadgeTone.Neutral
    UserRole.Photographer -> BadgeTone.Highlight
    UserRole.Organization -> BadgeTone.Info
    UserRole.Admin -> BadgeTone.Neutral
}

fun UserRole.defaultLabel(): String = when (this) {
    UserRole.Traveler -> "Traveler"
    UserRole.Parent -> "Parent"
    UserRole.Driver -> "Driver"
    UserRole.Photographer -> "Photographer"
    UserRole.Organization -> "Organization"
    UserRole.Admin -> "Admin"
}

private fun BadgeTone.containerColor(colors: TripsEnjoyColors): Color = when (this) {
    BadgeTone.Neutral -> colors.hairline
    BadgeTone.Accent -> colors.accent
    BadgeTone.Highlight -> colors.highlight
    BadgeTone.Success -> colors.successSoft
    BadgeTone.Warning -> colors.warningSoft
    BadgeTone.Danger -> colors.dangerSoft
    BadgeTone.Info -> colors.infoSoft
}

private fun BadgeTone.contentColor(colors: TripsEnjoyColors): Color = when (this) {
    BadgeTone.Neutral -> colors.ink
    BadgeTone.Accent -> colors.brandNavy
    BadgeTone.Highlight -> colors.brandNavy
    BadgeTone.Success -> colors.success
    BadgeTone.Warning -> colors.warning
    BadgeTone.Danger -> colors.danger
    BadgeTone.Info -> colors.ink
}
