package com.tripsenjoy.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

enum class ErrorKind { NotFound, Server, Offline, Forbidden, Unauthorized, Unavailable }

// Web centres the content. Mobile stacks it and makes the action button full width.
enum class TePlatform { Web, Mobile }

data class ErrorCopy(val title: String, val message: String, val actionLabel: String)

private const val REFERENCE_LABEL = "Reference ID"
private val ErrorIconSize = 40.dp

// Whole-screen failure. Copy comes from errorCopy(); pass title, message or actionLabel to override it.
// The reference ID is shown for server errors only, so support can find the log entry. No stack traces are shown.
@Composable
fun TeErrorState(
    kind: ErrorKind,
    modifier: Modifier = Modifier,
    platform: TePlatform = TePlatform.Web,
    referenceId: String? = null,
    title: String = kind.errorCopy().title,
    message: String = kind.errorCopy().message,
    actionLabel: String = kind.errorCopy().actionLabel,
    onAction: (() -> Unit)? = null,
) {
    val colors = TripsEnjoyTheme.colors
    val spacing = TripsEnjoyTheme.spacing
    val shownReference = referenceId?.takeIf { kind.showsReferenceId() }
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = spacing.space4)
            .semantics { liveRegion = LiveRegionMode.Assertive },
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        TeIcon(name = kind.icon(), contentDescription = null, tint = colors.danger, size = ErrorIconSize)
        Spacer(Modifier.height(spacing.space2))
        Text(
            text = title,
            style = TripsEnjoyTheme.typography.h3,
            color = colors.ink,
            textAlign = TextAlign.Center,
            modifier = Modifier.semantics { heading() },
        )
        Spacer(Modifier.height(spacing.space2))
        Text(
            text = message,
            style = TripsEnjoyTheme.typography.body,
            color = colors.ink,
            textAlign = TextAlign.Center,
        )
        if (shownReference != null) {
            Spacer(Modifier.height(spacing.space2))
            Text(
                text = "$REFERENCE_LABEL: $shownReference",
                style = TripsEnjoyTheme.typography.caption,
                color = colors.inkMuted,
                textAlign = TextAlign.Center,
            )
        }
        if (onAction != null) {
            Spacer(Modifier.height(spacing.space4))
            TeButton(
                text = actionLabel,
                onClick = onAction,
                modifier = if (platform == TePlatform.Mobile) Modifier.fillMaxWidth() else Modifier,
            )
        }
    }
}

// Copy is written in the traveler's words: say what happened and what to do next. No "Oops", no emoji.
fun ErrorKind.errorCopy(): ErrorCopy = when (this) {
    ErrorKind.NotFound -> ErrorCopy(
        title = "We could not find this page",
        message = "The link may be out of date, or the trip may have been removed. Check the address or go back to your trips.",
        actionLabel = "Go to your trips",
    )
    ErrorKind.Server -> ErrorCopy(
        title = "Something went wrong on our side",
        message = "Try again in a few minutes. If it keeps happening, contact support and quote the reference ID below.",
        actionLabel = "Try again",
    )
    ErrorKind.Offline -> ErrorCopy(
        title = "You are offline",
        message = "Check your Wi-Fi or mobile data, then try again.",
        actionLabel = "Try again",
    )
    ErrorKind.Forbidden -> ErrorCopy(
        title = "You do not have access to this page",
        message = "Ask your trip organizer to give you access, or sign in with the account that has it.",
        actionLabel = "Go to your trips",
    )
    ErrorKind.Unauthorized -> ErrorCopy(
        title = "Sign in to continue",
        message = "Your session has ended. Sign in again to see this page.",
        actionLabel = "Sign in",
    )
    ErrorKind.Unavailable -> ErrorCopy(
        title = "Service temporarily unavailable",
        message = "We are working on it. Try again in a few minutes.",
        actionLabel = "Try again",
    )
}

// Only server errors carry a reference ID.
fun ErrorKind.showsReferenceId(): Boolean = this == ErrorKind.Server

fun ErrorKind.icon(): IconName = when (this) {
    ErrorKind.NotFound -> IconName.Info
    ErrorKind.Server -> IconName.Alert
    ErrorKind.Offline -> IconName.Offline
    ErrorKind.Forbidden -> IconName.Lock
    ErrorKind.Unauthorized -> IconName.Lock
    ErrorKind.Unavailable -> IconName.Clock
}
