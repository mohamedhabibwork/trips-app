package com.tripsenjoy.screens.shared.common

import androidx.compose.runtime.Composable
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.ui.components.ErrorKind
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeErrorState
import com.tripsenjoy.ui.components.TeRetryBanner

// Loading view as a text card. The full-screen LoadingState does not fit inside a scrolling screen body.
@Composable
fun StateLoadingCard(subject: String) {
    TeCard(header = "Loading") {
        ScreenNote(text = "Loading $subject. It appears here when ready.")
    }
}

// Empty view: the spec's empty text inside a card.
@Composable
fun StateEmptyCard(header: String, message: String) {
    TeCard(header = header) {
        ScreenNote(text = message)
    }
}

// Error view: the error block, a retry banner and a link to the full server error page (SCR-SHR-05).
// Retry is preview only in the gallery and changes nothing.
@Composable
fun StateErrorBlock(retryMessage: String) {
    val nav = LocalScreenNavigator.current
    TeErrorState(kind = ErrorKind.Server, actionLabel = "Try again", onAction = {})
    TeRetryBanner(message = retryMessage, onRetry = {}, retrying = false)
    TeButton(
        text = "Open server error page",
        onClick = { nav.open(SharedScreenId.SERVER_ERROR) },
        variant = TeButtonVariant.Ghost,
    )
}
