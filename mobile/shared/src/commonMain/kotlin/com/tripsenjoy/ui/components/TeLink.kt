package com.tripsenjoy.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextDecoration
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

// Spoken suffix for links that leave the app or open a new tab, so the user knows before activating.
const val TeExternalLinkSuffix = "(opens in a new tab)"

// Text link with the link colour (primary text) and an underline, so the link is not identified by colour alone.
// Compose has no Link role, so the element is announced as a clickable item rather than a button.
// external adds the suffix to the spoken label. externalLabel can be replaced for other languages.
@Composable
fun TeLink(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    external: Boolean = false,
    externalLabel: String = TeExternalLinkSuffix,
) {
    val colors = TripsEnjoyTheme.colors
    val spokenLabel = linkSpokenLabel(text, external, externalLabel)
    Box(
        modifier = modifier
            .defaultMinSize(minHeight = TeMinTouchTarget)
            .clickable(onClick = onClick)
            .semantics { contentDescription = spokenLabel }
            .teFocusRing(TripsEnjoyTheme.radius.sm)
            .padding(vertical = TripsEnjoyTheme.spacing.space2),
        contentAlignment = Alignment.CenterStart,
    ) {
        Text(
            text = text,
            style = TripsEnjoyTheme.typography.label.copy(textDecoration = TextDecoration.Underline),
            color = colors.primaryText,
        )
    }
}

// Pure helper: the label a screen reader speaks for the link.
internal fun linkSpokenLabel(text: String, external: Boolean, externalLabel: String): String =
    if (external) "$text $externalLabel" else text
