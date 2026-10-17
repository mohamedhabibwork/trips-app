package com.tripsenjoy.screens.public.signup

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.public.common.PublicBackToStart
import com.tripsenjoy.screens.public.common.PublicNote
import com.tripsenjoy.screens.public.common.PublicRoleCard
import com.tripsenjoy.screens.public.common.PublicRoleCards
import com.tripsenjoy.screens.public.common.PublicStateCopy
import com.tripsenjoy.screens.public.common.PublicViewState
import com.tripsenjoy.screens.public.common.StatePreview
import com.tripsenjoy.ui.components.AlertTone
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeChip
import com.tripsenjoy.ui.components.TeInlineAlert
import com.tripsenjoy.ui.components.TePageHeader
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

// SCR-PUB-02 Sign-up chooser (/register). The visitor picks one role, and only that role's form opens.
// Organization sign-up is web only: choosing it shows a message and does not navigate (user flows 02).
private val chooserCopy = PublicStateCopy(
    loadingMessage = "Loading sign-up options...",
    errorTitle = "Sign-up options could not load",
    errorMessage = "Try again in a moment.",
)

@Composable
fun SignUpChooser() {
    val nav = LocalScreenNavigator.current
    val spacing = TripsEnjoyTheme.spacing
    var chosen by remember { mutableStateOf<PublicRoleCard?>(null) }
    val webOnlyChosen = chosen?.webOnly == true

    StatePreview(
        namedStates = listOf(PublicViewState.Loading, PublicViewState.Error),
        copy = chooserCopy,
    ) {
        TePageHeader(
            title = "Create an account",
            description = "Choose your role. Organization sign-up is web only.",
        )
        Column(verticalArrangement = Arrangement.spacedBy(spacing.space3)) {
            PublicRoleCards.forEach { role ->
                TeChip(
                    label = if (role.webOnly) "${role.title} (web only)" else role.title,
                    selected = chosen == role,
                    onClick = { chosen = role },
                )
                PublicNote(role.description)
            }
        }
        if (webOnlyChosen) {
            TeInlineAlert(
                tone = AlertTone.Info,
                title = "Organization sign-up is completed on the web",
                message = "Register your organization on the trips-enjoy.com website. This app does not open organization sign-up.",
            )
        }
        TeButton(
            text = "Continue",
            onClick = { chosen?.let { nav.open(it.screenId) } },
            enabled = chosen != null && !webOnlyChosen,
            modifier = Modifier.fillMaxWidth(),
        )
        PublicBackToStart()
    }
}
