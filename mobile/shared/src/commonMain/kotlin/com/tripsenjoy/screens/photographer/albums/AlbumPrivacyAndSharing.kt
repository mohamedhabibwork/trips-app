package com.tripsenjoy.screens.photographer.albums

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.ScreenNavigator
import com.tripsenjoy.screens.moderator.common.icon
import com.tripsenjoy.screens.photographer.common.CURRENT_PLAN
import com.tripsenjoy.screens.photographer.common.PhotographerPlan
import com.tripsenjoy.screens.photographer.common.StatePreview
import com.tripsenjoy.screens.photographer.common.includes
import com.tripsenjoy.screens.shared.common.ScreenBody
import com.tripsenjoy.screens.shared.common.ScreenNote
import com.tripsenjoy.screens.shared.common.SharedScreenId
import com.tripsenjoy.screens.shared.common.StateErrorBlock
import com.tripsenjoy.ui.components.BadgeTone
import com.tripsenjoy.ui.components.IconName
import com.tripsenjoy.ui.components.TeBadge
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeOption
import com.tripsenjoy.ui.components.TePageHeader
import com.tripsenjoy.ui.components.TePlanGate
import com.tripsenjoy.ui.components.TeSelect
import com.tripsenjoy.ui.components.TeSwitch

// Privacy modes by plan (UF-PHO-12 to UF-PHO-14): public for all plans, shared link for Studio and Pro,
// selected users for Pro only.
private enum class AlbumPrivacy(val value: String, val label: String, val minimumPlan: PhotographerPlan) {
    Public(value = "public", label = "Public to trip participants", minimumPlan = PhotographerPlan.Basic),
    SharedLink(value = "shared-link", label = "Private by shared link", minimumPlan = PhotographerPlan.Studio),
    SelectedUsers(value = "selected-users", label = "Private to selected users", minimumPlan = PhotographerPlan.Pro),
}

// SCR-PHO-09 Album privacy and sharing. A mode above the plan opens the upgrade prompt (SCR-SHR-01) and is not chosen.
// Revoking a link asks for confirmation first (SCR-SHR-09).
@Composable
fun AlbumPrivacyAndSharing() {
    val nav = LocalScreenNavigator.current
    ScreenBody {
        TePageHeader(title = "Album privacy and sharing", description = "Who can see this album")
        StatePreview(
            ariaLabel = "Album privacy states",
            main = { PrivacyContent(nav = nav) },
            error = { StateErrorBlock(retryMessage = "Privacy settings did not save. Your choice is still shown.") },
        )
    }
}

@Composable
private fun PrivacyContent(nav: ScreenNavigator) {
    var privacy by remember { mutableStateOf(AlbumPrivacy.Public) }
    var linkCreated by remember { mutableStateOf(false) }
    var publish by remember { mutableStateOf(true) }
    TeCard(header = "Privacy") {
        TeSelect(
            label = "Who can see this album",
            options = AlbumPrivacy.entries.map { TeOption(value = it.value, label = it.label) },
            value = privacy.value,
            onValueChange = { value ->
                val chosen = AlbumPrivacy.entries.first { it.value == value }
                if (CURRENT_PLAN.includes(chosen.minimumPlan)) {
                    privacy = chosen
                } else {
                    nav.open(SharedScreenId.PLAN_LIMIT_PROMPT)
                }
            },
            supportingText = "A shared link needs Studio. Selected users needs Pro.",
        )
        PrivacyModeNote(privacy = privacy)
    }
    if (CURRENT_PLAN.includes(PhotographerPlan.Studio)) {
        TeCard(header = "Shared link") {
            TeBadge(label = "Studio and Pro", tone = BadgeTone.Info, icon = IconName.Lock)
            ScreenNote(text = "A 32-character token is created when you create the link.")
            TeButton(
                text = if (linkCreated) "Link created" else "Create link",
                onClick = { linkCreated = true },
                variant = TeButtonVariant.Secondary,
                enabled = !linkCreated,
            )
            TeButton(
                text = "Revoke link",
                onClick = { nav.open(SharedScreenId.CONFIRMATION_DIALOG) },
                variant = TeButtonVariant.Destructive,
                enabled = linkCreated,
            )
        }
    } else {
        TeCard(header = "Shared link") {
            TePlanGate(
                plan = "Studio",
                lockedLabel = "Shared links are available on Studio and Pro.",
                upgradeLabel = "Upgrade plan",
                onUpgrade = { nav.open(SharedScreenId.PLAN_LIMIT_PROMPT) },
            )
        }
    }
    if (!CURRENT_PLAN.includes(PhotographerPlan.Pro)) {
        TeCard(header = "Selected users") {
            TePlanGate(
                plan = "Pro",
                lockedLabel = "Selected users are available on the Pro plan.",
                upgradeLabel = "Upgrade to Pro",
                onUpgrade = { nav.open(SharedScreenId.PLAN_LIMIT_PROMPT) },
            )
        }
    }
    TeSwitch(
        checked = publish,
        onCheckedChange = { publish = it },
        label = "Publish album to the trip record",
    )
    TeButton(text = "Save privacy", onClick = { nav.back() })
}

@Composable
private fun PrivacyModeNote(privacy: AlbumPrivacy) {
    when (privacy) {
        AlbumPrivacy.Public -> ScreenNote(
            text = "Visible to trip participants. Photo links are signed and valid for 24 hours.",
        )
        AlbumPrivacy.SharedLink -> ScreenNote(
            text = "Anyone with the link can view. Revoking the link makes it return not found.",
        )
        AlbumPrivacy.SelectedUsers -> ScreenNote(
            text = "Only listed users can view. Each photo link is issued per access and valid for 15 minutes.",
        )
    }
}
