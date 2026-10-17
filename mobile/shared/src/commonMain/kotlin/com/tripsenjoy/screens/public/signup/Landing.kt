package com.tripsenjoy.screens.public.signup

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.moderator.common.icon
import com.tripsenjoy.screens.public.common.PublicNav
import com.tripsenjoy.screens.public.common.PublicNavItem
import com.tripsenjoy.screens.public.common.PublicRoleCards
import com.tripsenjoy.screens.public.common.PublicScreenIds
import com.tripsenjoy.screens.public.common.PublicSection
import com.tripsenjoy.screens.public.common.PublicStateCopy
import com.tripsenjoy.screens.public.common.PublicViewState
import com.tripsenjoy.screens.public.common.StatePreview
import com.tripsenjoy.ui.components.BadgeTone
import com.tripsenjoy.ui.components.IconName
import com.tripsenjoy.ui.components.LogoVariant
import com.tripsenjoy.ui.components.TeBadge
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonSize
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeChip
import com.tripsenjoy.ui.components.TripsLogo
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

// SCR-PUB-01 Landing (gap). Routes visitors to browsing trips or to the sign-up chooser. It only routes.
// Draft and targeted-only trips are never listed (FR-TRIP-02). Browse trips opens TRV-01, which is another app.
private val landingCopy = PublicStateCopy(
    loadingMessage = "Loading public trips...",
    emptyTitle = "No public trips right now",
    emptyMessage = "You can still sign up for your role below.",
    errorTitle = "Trips could not load",
    errorMessage = "Try again later. Sign-up and sign-in still work.",
)

@Composable
fun Landing() {
    val nav = LocalScreenNavigator.current
    val colors = TripsEnjoyTheme.colors
    val spacing = TripsEnjoyTheme.spacing
    var language by remember { mutableStateOf("en") }

    StatePreview(
        namedStates = listOf(PublicViewState.Loading, PublicViewState.Empty, PublicViewState.Error),
        copy = landingCopy,
    ) {
        PublicNav(current = PublicNavItem.Start)
        TripsLogo(
            variant = LogoVariant.HorizontalFullColor,
            contentDescription = "Trips Enjoy",
            modifier = Modifier.height(40.dp),
        )
        Text(
            text = "Plan trips with Trips Enjoy",
            style = TripsEnjoyTheme.typography.h2,
            color = colors.ink,
        )
        Text(
            text = "Browse trips, or sign up for your role.",
            style = TripsEnjoyTheme.typography.body,
            color = colors.inkMuted,
        )
        TeButton(
            text = "Browse trips",
            onClick = {},
            modifier = Modifier.fillMaxWidth(),
            size = TeButtonSize.Large,
        )
        PublicSection(title = "Join as") {
            PublicRoleCards.forEach { role ->
                TeCard {
                    Text(text = role.title, style = TripsEnjoyTheme.typography.h3, color = colors.ink)
                    Text(text = role.description, style = TripsEnjoyTheme.typography.body, color = colors.inkMuted)
                    if (role.webOnly) {
                        TeBadge(label = "Web only", tone = BadgeTone.Info, icon = IconName.Info)
                    }
                }
            }
            TeButton(
                text = "Sign up",
                onClick = { nav.open(PublicScreenIds.SIGN_UP_CHOOSER) },
                variant = TeButtonVariant.Secondary,
                modifier = Modifier.fillMaxWidth(),
            )
        }
        PublicSection(title = "Language") {
            Row(horizontalArrangement = Arrangement.spacedBy(spacing.space2)) {
                TeChip(label = "English", selected = language == "en", onClick = { language = "en" })
                TeChip(label = "Arabic", selected = language == "ar", onClick = { language = "ar" })
            }
        }
        TeButton(
            text = "Sign in",
            onClick = { nav.open(PublicScreenIds.SIGN_IN) },
            variant = TeButtonVariant.Ghost,
            modifier = Modifier.fillMaxWidth(),
        )
    }
}
