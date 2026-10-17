package com.tripsenjoy.auth.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.semantics.Role
import com.tripsenjoy.auth.AuthActor
import com.tripsenjoy.auth.AuthStrings
import com.tripsenjoy.ui.components.AlertTone
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonSize
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeInlineAlert
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

/**
 * The account sheet behind the top-app-bar overflow button (PRD §6 "Account menu").
 *
 * P0 shows the identity and the two sign-out actions. Role and organization switching are P1, so
 * they render as disabled rows with the "coming soon" copy rather than as dead buttons that look
 * live. "Sign out of all devices" asks for confirmation first (S2).
 *
 * The sheet is a plain overlay rather than a Material bottom sheet: Compose Multiplatform's
 * `ModalBottomSheet` is still experimental, and this module may not add dependencies.
 */
@Composable
fun AccountMenuSheet(
    actor: AuthActor?,
    locale: String = AuthStrings.defaultLocale,
    onSignOut: () -> Unit,
    onSignOutAll: () -> Unit,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val spacing = TripsEnjoyTheme.spacing
    val colors = TripsEnjoyTheme.colors
    var confirmingSignOutAll by remember { mutableStateOf(false) }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(colors.glassDim)
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null,
                role = Role.Button,
                onClickLabel = AuthStrings.t("auth.common.close", locale),
                onClick = onDismiss,
            ),
        contentAlignment = Alignment.BottomCenter,
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(topStart = TripsEnjoyTheme.radius.lg, topEnd = TripsEnjoyTheme.radius.lg))
                .background(colors.surfaceRaised)
                // Swallows taps on the sheet so they do not reach the dismiss scrim.
                .clickable(
                    interactionSource = remember { MutableInteractionSource() },
                    indication = null,
                    role = Role.Button,
                    onClick = {},
                )
                .padding(spacing.space4),
            verticalArrangement = Arrangement.spacedBy(spacing.space3),
        ) {
            Text(
                text = AuthStrings.t("auth.account.signedInAs", locale),
                style = TripsEnjoyTheme.typography.caption,
                color = colors.inkMuted,
            )
            Text(
                text = actor?.accountId ?: AuthStrings.t("auth.account.none", locale),
                style = TripsEnjoyTheme.typography.label,
                color = colors.ink,
            )
            Text(
                text = AuthStrings.format(
                    "auth.account.role",
                    locale,
                    mapOf("role" to roleLabel(actor?.activeRole, locale)),
                ),
                style = TripsEnjoyTheme.typography.body,
                color = colors.ink,
            )
            Text(
                text = AuthStrings.format(
                    "auth.account.organization",
                    locale,
                    mapOf("organization" to (actor?.activeTenantId ?: AuthStrings.t("auth.account.none", locale))),
                ),
                style = TripsEnjoyTheme.typography.body,
                color = colors.inkMuted,
            )

            if (confirmingSignOutAll) {
                TeInlineAlert(
                    tone = AlertTone.Warning,
                    title = AuthStrings.t("auth.account.signOutAllConfirmTitle", locale),
                    message = AuthStrings.t("auth.account.signOutAllConfirmBody", locale),
                )
                TeButton(
                    text = AuthStrings.t("auth.account.signOutAllConfirm", locale),
                    onClick = {
                        confirmingSignOutAll = false
                        onSignOutAll()
                    },
                    modifier = Modifier.fillMaxWidth(),
                    size = TeButtonSize.Large,
                )
                TeButton(
                    text = AuthStrings.t("auth.common.cancel", locale),
                    onClick = { confirmingSignOutAll = false },
                    modifier = Modifier.fillMaxWidth(),
                    variant = TeButtonVariant.Secondary,
                )
            } else {
                TeButton(
                    text = AuthStrings.t("auth.account.settings", locale),
                    onClick = {},
                    modifier = Modifier.fillMaxWidth(),
                    variant = TeButtonVariant.Ghost,
                    enabled = false,
                )
                TeButton(
                    text = AuthStrings.t("auth.account.signOut", locale),
                    onClick = onSignOut,
                    modifier = Modifier.fillMaxWidth(),
                    size = TeButtonSize.Large,
                    variant = TeButtonVariant.Secondary,
                )
                TeButton(
                    text = AuthStrings.t("auth.account.signOutAll", locale),
                    onClick = { confirmingSignOutAll = true },
                    modifier = Modifier.fillMaxWidth(),
                    variant = TeButtonVariant.Ghost,
                )
            }

            TeButton(
                text = AuthStrings.t("auth.common.close", locale),
                onClick = onDismiss,
                modifier = Modifier.fillMaxWidth(),
                variant = TeButtonVariant.Ghost,
            )
        }
    }
}

/** The localized label of a role, falling back to the raw role so an unknown one is still readable. */
private fun roleLabel(role: String?, locale: String): String {
    if (role.isNullOrBlank()) return AuthStrings.t("auth.account.none", locale)
    val key = "auth.role.$role"
    return if (AuthStrings.has(key, locale)) AuthStrings.t(key, locale) else role
}
