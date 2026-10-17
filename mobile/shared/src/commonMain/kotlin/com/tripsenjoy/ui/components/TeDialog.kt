package com.tripsenjoy.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

// Confirmation dialog for a decision (SCR-SHR-09). The primary action takes focus when the dialog opens.
// Danger dialogs use a red primary action, and the consequence is written out in the description, not in colour.
@Composable
fun TeDialog(
    visible: Boolean,
    onDismiss: () -> Unit,
    title: String,
    primaryLabel: String,
    onPrimary: () -> Unit,
    secondaryLabel: String,
    danger: Boolean = false,
    confirmEnabled: Boolean = true,
    description: String? = null,
    content: @Composable () -> Unit = {},
) {
    if (!visible) return
    val colors = TripsEnjoyTheme.colors
    val spacing = TripsEnjoyTheme.spacing
    val primaryFocus = remember { FocusRequester() }

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = colors.surfaceRaised,
        title = {
            Text(
                text = title,
                style = TripsEnjoyTheme.typography.h3,
                color = colors.ink,
                modifier = Modifier.semantics { heading() },
            )
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(spacing.space3)) {
                if (description != null) {
                    Text(text = description, style = TripsEnjoyTheme.typography.body, color = colors.ink)
                }
                content()
            }
        },
        confirmButton = {
            // Runs after the button is attached, so the focus requester is ready when the dialog opens.
            LaunchedEffect(Unit) { primaryFocus.requestFocus() }
            TeButton(
                text = primaryLabel,
                onClick = onPrimary,
                modifier = Modifier.focusRequester(primaryFocus),
                variant = if (danger) TeButtonVariant.Destructive else TeButtonVariant.Primary,
                enabled = confirmEnabled,
            )
        },
        dismissButton = {
            TeButton(
                text = secondaryLabel,
                onClick = onDismiss,
                variant = TeButtonVariant.Secondary,
            )
        },
    )
}
