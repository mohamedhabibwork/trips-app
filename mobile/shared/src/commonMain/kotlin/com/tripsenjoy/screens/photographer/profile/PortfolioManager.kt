package com.tripsenjoy.screens.photographer.profile

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.ScreenNavigator
import com.tripsenjoy.screens.photographer.common.CURRENT_PLAN
import com.tripsenjoy.screens.photographer.common.LocalPhotographerSession
import com.tripsenjoy.screens.photographer.common.PhotoScreenId
import com.tripsenjoy.screens.photographer.common.StatePreview
import com.tripsenjoy.screens.photographer.common.isWithinAllowance
import com.tripsenjoy.screens.photographer.common.usageText
import com.tripsenjoy.screens.shared.common.ScreenBody
import com.tripsenjoy.screens.shared.common.ScreenNote
import com.tripsenjoy.screens.shared.common.SharedScreenId
import com.tripsenjoy.screens.shared.common.StateEmptyCard
import com.tripsenjoy.screens.shared.common.StateErrorBlock
import com.tripsenjoy.screens.shared.common.StateLoadingCard
import com.tripsenjoy.screens.shared.common.placeholderPhoto
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeKpiTile
import com.tripsenjoy.ui.components.TePageHeader
import com.tripsenjoy.ui.components.TePhoto
import com.tripsenjoy.ui.components.TePhotoGrid
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

private const val MINIMUM_PORTFOLIO_IMAGES = 8
private const val PORTFOLIO_GRID_COLUMNS = 2

// SCR-PHO-02 Portfolio manager: image grid, upload within the plan allowance, and delete with confirmation.
// Upload opens SCR-SHR-16 when the allowance has room, and the plan prompt (SCR-SHR-01) when it does not.
@Composable
fun PortfolioManager() {
    val nav = LocalScreenNavigator.current
    val session = LocalPhotographerSession.current
    var selectedId by remember { mutableStateOf<String?>(null) }
    val photos = portfolioPhotos(session.portfolioImagesCount)
    ScreenBody {
        TePageHeader(title = "Portfolio manager", description = "Images on your public profile")
        StatePreview(
            ariaLabel = "Portfolio manager states",
            main = {
                PortfolioContent(
                    nav = nav,
                    photos = photos,
                    portfolioCount = session.portfolioImagesCount,
                    selectedId = selectedId,
                    onSelect = { selectedId = it },
                    onRemoveSelected = {
                        selectedId?.let { session.removePortfolioImage(it) }
                        selectedId = null
                        nav.open(SharedScreenId.CONFIRMATION_DIALOG)
                    },
                )
            },
            loading = { StateLoadingCard(subject = "your portfolio") },
            empty = {
                StateEmptyCard(
                    header = "Portfolio",
                    message = "No images yet. Add at least $MINIMUM_PORTFOLIO_IMAGES to match the minimum at application.",
                )
            },
            error = { StateErrorBlock(retryMessage = "Your portfolio did not load. Retry to see your images.") },
        )
    }
}

@Composable
private fun PortfolioContent(
    nav: ScreenNavigator,
    photos: List<TePhoto>,
    portfolioCount: Int,
    selectedId: String?,
    onSelect: (String) -> Unit,
    onRemoveSelected: () -> Unit,
) {
    val selectedAlt = photos.firstOrNull { it.id == selectedId }?.alt
    TeKpiTile(
        label = "Portfolio images",
        value = usageText(portfolioCount, CURRENT_PLAN.portfolioImages),
        hint = "${CURRENT_PLAN.label} plan allowance. Minimum $MINIMUM_PORTFOLIO_IMAGES.",
    )
    TePhotoGrid(photos = photos, onOpen = onSelect, columns = PORTFOLIO_GRID_COLUMNS)
    ScreenNote(text = if (selectedAlt != null) "Selected: $selectedAlt" else "Tap an image to select it.")
    val uploadTarget = if (isWithinAllowance(portfolioCount, CURRENT_PLAN.portfolioImages)) {
        SharedScreenId.DOCUMENT_UPLOAD
    } else {
        SharedScreenId.PLAN_LIMIT_PROMPT
    }
    TeButton(text = "Upload images", onClick = { nav.open(uploadTarget) })
    TeButton(
        text = "Remove selected image",
        onClick = onRemoveSelected,
        variant = TeButtonVariant.Destructive,
        enabled = selectedId != null,
    )
    TeButton(
        text = "Edit profile",
        onClick = { nav.open(PhotoScreenId.PROFILE_VISIBILITY) },
        variant = TeButtonVariant.Ghost,
    )
}

@Composable
private fun portfolioPhotos(count: Int): List<TePhoto> {
    val colors = TripsEnjoyTheme.colors
    val tones = listOf(colors.brandNavy, colors.brandOrange, colors.brandCoral, colors.brandAmber)
    return List(count) { index ->
        TePhoto(
            id = "portfolio-$index",
            painter = placeholderPhoto(tones[index % tones.size]),
            alt = "Portfolio image ${index + 1}",
        )
    }
}
