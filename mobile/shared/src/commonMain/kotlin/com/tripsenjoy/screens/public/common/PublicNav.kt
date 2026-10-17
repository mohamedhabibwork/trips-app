package com.tripsenjoy.screens.public.common

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.runtime.Composable
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.public.signin.SignIn
import com.tripsenjoy.ui.components.TeChip
import com.tripsenjoy.ui.components.TeLink
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

internal enum class PublicNavItem(val label: String, val screenId: String) {
    Start(label = "Start", screenId = PublicScreenIds.LANDING),
    SignUp(label = "Sign up", screenId = PublicScreenIds.SIGN_UP_CHOOSER),
    SignIn(label = "Sign in", screenId = PublicScreenIds.SIGN_IN),
}

// Row of links to the start, sign-up and sign-in screens. The current item is marked selected.
@Composable
internal fun PublicNav(current: PublicNavItem) {
    val nav = LocalScreenNavigator.current
    val spacing = TripsEnjoyTheme.spacing
    Row(horizontalArrangement = Arrangement.spacedBy(spacing.space2)) {
        PublicNavItem.entries.forEach { item ->
            TeChip(
                label = item.label,
                selected = item == current,
                onClick = { if (item != current) nav.open(item.screenId) },
            )
        }
    }
}

// Link back to the landing screen, used on every public screen except the landing itself.
@Composable
internal fun PublicBackToStart() {
    val nav = LocalScreenNavigator.current
    TeLink(text = "Back to the start", onClick = { nav.open(PublicScreenIds.LANDING) })
}
