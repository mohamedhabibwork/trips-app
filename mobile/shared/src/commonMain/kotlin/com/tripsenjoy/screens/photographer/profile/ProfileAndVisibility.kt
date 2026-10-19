package com.tripsenjoy.screens.photographer.profile

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.ScreenNavigator
import com.tripsenjoy.screens.moderator.common.icon
import com.tripsenjoy.screens.photographer.common.CURRENT_PLAN
import com.tripsenjoy.screens.photographer.common.LocalPhotographerSession
import com.tripsenjoy.screens.photographer.common.PhotoScreenId
import com.tripsenjoy.screens.photographer.common.PhotographerPlan
import com.tripsenjoy.screens.photographer.common.StatePreview
import com.tripsenjoy.screens.photographer.common.includes
import com.tripsenjoy.screens.shared.common.ScreenBody
import com.tripsenjoy.screens.shared.common.SharedScreenId
import com.tripsenjoy.screens.shared.common.StateErrorBlock
import com.tripsenjoy.screens.shared.common.StateLoadingCard
import com.tripsenjoy.ui.components.AlertTone
import com.tripsenjoy.ui.components.BadgeTone
import com.tripsenjoy.ui.components.IconName
import com.tripsenjoy.ui.components.TeBadge
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeInlineAlert
import com.tripsenjoy.ui.components.TeInput
import com.tripsenjoy.ui.components.TeKeyboardType
import com.tripsenjoy.ui.components.TeOption
import com.tripsenjoy.ui.components.TePageHeader
import com.tripsenjoy.ui.components.TeSelect

// Visibility levels by plan (UF-PHO-03): Basic standard, Studio featured, Pro top placement.
private enum class ProfileVisibility(val value: String, val label: String, val minimumPlan: PhotographerPlan) {
    Standard(value = "standard", label = "Standard", minimumPlan = PhotographerPlan.Basic),
    Featured(value = "featured", label = "Featured", minimumPlan = PhotographerPlan.Studio),
    Top(value = "top", label = "Top placement", minimumPlan = PhotographerPlan.Pro),
}

private data class ProfileForm(
    val name: String = "",
    val description: String = "",
    val serviceArea: String = "",
    val email: String = "",
    val phone: String = "",
)

// SCR-PHO-03 Profile and visibility: public profile, visibility level and the verified badge (Studio and Pro).
// A visibility level above the plan opens the upgrade prompt (SCR-SHR-01) instead of being selected.
@Composable
fun ProfileAndVisibility() {
    val nav = LocalScreenNavigator.current
    ScreenBody {
        TePageHeader(title = "Profile and visibility", description = "Your public profile and how it is shown")
        StatePreview(
            ariaLabel = "Profile and visibility states",
            main = { ProfileContent(nav = nav) },
            loading = { StateLoadingCard(subject = "your profile") },
            error = { StateErrorBlock(retryMessage = "Your profile did not load. Your edits are not lost.") },
        )
    }
}

@Composable
private fun ProfileContent(nav: ScreenNavigator) {
    val session = LocalPhotographerSession.current
    var form by remember(session.studioName, session.contactEmail) {
        mutableStateOf(
            ProfileForm(
                name = session.studioName,
                description = session.description,
                serviceArea = session.serviceArea,
                email = session.contactEmail,
                phone = session.contactPhone,
            ),
        )
    }
    var visibility by remember { mutableStateOf(ProfileVisibility.Standard) }
    val canSave = form.name.isNotBlank() && form.email.isNotBlank()
    TeCard(header = "Profile") {
        TeInput(
            value = form.name,
            onValueChange = { form = form.copy(name = it) },
            label = "Name or studio name",
        )
        TeInput(
            value = form.description,
            onValueChange = { form = form.copy(description = it) },
            label = "Description",
        )
        TeInput(
            value = form.serviceArea,
            onValueChange = { form = form.copy(serviceArea = it) },
            label = "Service area",
        )
        TeInput(
            value = form.email,
            onValueChange = { form = form.copy(email = it) },
            label = "Contact email",
            keyboardType = TeKeyboardType.Email,
        )
        TeInput(
            value = form.phone,
            onValueChange = { form = form.copy(phone = it) },
            label = "Contact phone",
            keyboardType = TeKeyboardType.Phone,
        )
    }
    TeCard(header = "Visibility") {
        TeSelect(
            label = "Visibility level",
            options = ProfileVisibility.entries.map { TeOption(value = it.value, label = it.label) },
            value = visibility.value,
            onValueChange = { value ->
                val chosen = ProfileVisibility.entries.first { it.value == value }
                if (CURRENT_PLAN.includes(chosen.minimumPlan)) {
                    visibility = chosen
                } else {
                    nav.open(SharedScreenId.PLAN_LIMIT_PROMPT)
                }
            },
            supportingText = "Featured needs Studio. Top placement needs Pro.",
        )
        VerifiedBadgeRow()
        TeButton(
            text = "Watermark settings",
            onClick = { nav.open(PhotoScreenId.WATERMARK) },
            variant = TeButtonVariant.Ghost,
        )
    }
    TeButton(
        text = "Save profile",
        onClick = {
            session.saveProfile(
                name = form.name,
                desc = form.description,
                area = form.serviceArea,
                email = form.email,
                phone = form.phone,
                visibility = visibility.value,
            )
            nav.back()
        },
        enabled = canSave,
    )
}

@Composable
private fun VerifiedBadgeRow() {
    if (CURRENT_PLAN.includes(PhotographerPlan.Studio)) {
        TeBadge(label = "Verified badge", tone = BadgeTone.Success, icon = IconName.Shield)
    } else {
        TeInlineAlert(
            tone = AlertTone.Info,
            title = "Verified badge needs Studio or Pro",
            message = "Upgrade your plan to show the badge on your profile.",
        )
    }
}
