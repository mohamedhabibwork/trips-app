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
import com.tripsenjoy.screens.photographer.common.PhotographerPlan
import com.tripsenjoy.screens.photographer.common.StatePreview
import com.tripsenjoy.screens.photographer.common.includes
import com.tripsenjoy.screens.shared.common.ScreenBody
import com.tripsenjoy.screens.shared.common.ScreenNote
import com.tripsenjoy.screens.shared.common.SharedScreenId
import com.tripsenjoy.screens.shared.common.StateErrorBlock
import com.tripsenjoy.screens.shared.common.placeholderPhoto
import com.tripsenjoy.ui.components.BadgeTone
import com.tripsenjoy.ui.components.IconName
import com.tripsenjoy.ui.components.TeBadge
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeOption
import com.tripsenjoy.ui.components.TePageHeader
import com.tripsenjoy.ui.components.TePhoto
import com.tripsenjoy.ui.components.TePhotoGrid
import com.tripsenjoy.ui.components.TePlanGate
import com.tripsenjoy.ui.components.TeSelect
import com.tripsenjoy.ui.components.TeSwitch
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

private const val DEFAULT_POSITION = "bottom-right"

private val WATERMARK_POSITIONS = listOf(
    TeOption(value = DEFAULT_POSITION, label = "Bottom right"),
    TeOption(value = "bottom-left", label = "Bottom left"),
    TeOption(value = "center", label = "Centre"),
)

// SCR-PHO-10 Watermark settings (Studio and Pro). The watermark applies to public copies only; originals are unchanged.
// On Basic the controls are locked and the upgrade prompt (SCR-SHR-01) opens instead (FR-MED-06).
@Composable
fun WatermarkSettings() {
    val nav = LocalScreenNavigator.current
    ScreenBody {
        TePageHeader(title = "Watermark settings", description = "Watermark for public copies of photos")
        StatePreview(
            ariaLabel = "Watermark settings states",
            main = { WatermarkContent(nav = nav) },
            error = { StateErrorBlock(retryMessage = "Watermark settings did not save. Your choice is still shown.") },
        )
    }
}

@Composable
private fun WatermarkContent(nav: ScreenNavigator) {
    val session = LocalPhotographerSession.current
    var watermarkOn by remember(session.watermarkEnabled) { mutableStateOf(session.watermarkEnabled) }
    var position by remember(session.watermarkPosition) { mutableStateOf(session.watermarkPosition) }
    val available = CURRENT_PLAN.includes(PhotographerPlan.Studio)
    if (!available) {
        TeCard(header = "Watermark") {
            TePlanGate(
                plan = "Studio",
                lockedLabel = "Watermarks are available on Studio and Pro.",
                upgradeLabel = "Upgrade plan",
                onUpgrade = { nav.open(SharedScreenId.PLAN_LIMIT_PROMPT) },
            )
        }
    } else {
        TeCard(header = "Watermark") {
            TeSwitch(
                checked = watermarkOn,
                onCheckedChange = { watermarkOn = it },
                label = "Watermark public copies",
            )
            TeBadge(
                label = if (watermarkOn) "Watermark on" else "Watermark off",
                tone = if (watermarkOn) BadgeTone.Success else BadgeTone.Neutral,
                icon = IconName.Shield,
            )
            TeSelect(
                label = "Position",
                options = WATERMARK_POSITIONS,
                value = position,
                onValueChange = { position = it },
                supportingText = "Shown on public copies only.",
            )
            ScreenNote(text = "Applies per album. Originals are never changed.")
        }
        TeCard(header = "Preview") {
            TePhotoGrid(photos = listOf(previewPhoto()), columns = 1)
        }
    }
    TeButton(
        text = "Save watermark",
        onClick = {
            session.saveWatermark(watermarkOn, position)
            nav.back()
        },
        enabled = available,
    )
}

@Composable
private fun previewPhoto(): TePhoto = TePhoto(
    id = "watermark-preview",
    painter = placeholderPhoto(TripsEnjoyTheme.colors.brandNavy),
    alt = "Preview of a public copy with the watermark setting applied",
)
