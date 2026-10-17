package com.tripsenjoy.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.error
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextDirection
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

enum class TeKeyboardType { Text, Email, Phone, Number, Url }

internal fun TeKeyboardType.toKeyboardType(): KeyboardType = when (this) {
    TeKeyboardType.Text -> KeyboardType.Text
    TeKeyboardType.Email -> KeyboardType.Email
    TeKeyboardType.Phone -> KeyboardType.Phone
    TeKeyboardType.Number -> KeyboardType.Number
    TeKeyboardType.Url -> KeyboardType.Uri
}

// Keeps the end padding clear of the show/hide toggle, which is one touch target wide.
private val PasswordToggleSize = TeMinTouchTarget

// Text field with a visible label (always shown), optional supporting text, and an error line.
// The error says what to do next and shows an icon plus text, never colour alone.
// Text direction is "content", so Arabic and English input follow their own direction (dir="auto").
// isPassword masks the text and adds a show/hide toggle. Its visibility state is kept locally.
@Composable
fun TeInput(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    supportingText: String? = null,
    error: String? = null,
    isError: Boolean = error != null,
    enabled: Boolean = true,
    keyboardType: TeKeyboardType = TeKeyboardType.Text,
    isPassword: Boolean = false,
    imeAction: ImeAction = ImeAction.Next,
    showPasswordLabel: String = "Show password",
    hidePasswordLabel: String = "Hide password",
) {
    val colors = TripsEnjoyTheme.colors
    val spacing = TripsEnjoyTheme.spacing
    val radius = TripsEnjoyTheme.radius.sm
    val errorText: String? = if (isError) error else null
    var passwordVisible by rememberSaveable { mutableStateOf(false) }
    val masked = isPassword && !passwordVisible
    val endPadding = if (isPassword) PasswordToggleSize else spacing.space4

    TeFieldColumn(label = label, errorText = errorText, supportingText = supportingText, modifier = modifier) {
        Box(modifier = Modifier.fillMaxWidth()) {
            BasicTextField(
                value = value,
                onValueChange = onValueChange,
                enabled = enabled,
                singleLine = true,
                textStyle = TripsEnjoyTheme.typography.body.copy(
                    color = colors.ink,
                    textDirection = TextDirection.Content,
                ),
                cursorBrush = SolidColor(colors.primaryText),
                keyboardOptions = KeyboardOptions(
                    keyboardType = if (isPassword) KeyboardType.Password else keyboardType.toKeyboardType(),
                    imeAction = imeAction,
                ),
                visualTransformation = if (masked) PasswordVisualTransformation() else VisualTransformation.None,
                modifier = Modifier
                    .fillMaxWidth()
                    .defaultMinSize(minHeight = TeMinTouchTarget)
                    .teFieldSurface()
                    .teFocusRing(radius)
                    .padding(start = spacing.space4, end = endPadding, top = spacing.space3, bottom = spacing.space3)
                    .semantics {
                        if (errorText != null) this.error(errorText)
                    },
            )
            if (isPassword) {
                PasswordToggle(
                    visible = passwordVisible,
                    showLabel = showPasswordLabel,
                    hideLabel = hidePasswordLabel,
                    onToggle = { passwordVisible = !passwordVisible },
                    modifier = Modifier.align(Alignment.CenterEnd),
                )
            }
        }
    }
}

// Lock icon as the toggle glyph. The spoken label names the action: "Show password" or "Hide password".
@Composable
private fun PasswordToggle(
    visible: Boolean,
    showLabel: String,
    hideLabel: String,
    onToggle: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Box(
        modifier = modifier
            .size(PasswordToggleSize)
            .clickable(role = Role.Button, onClick = onToggle)
            .semantics { contentDescription = if (visible) hideLabel else showLabel }
            .teFocusRing(TripsEnjoyTheme.radius.sm),
        contentAlignment = Alignment.Center,
    ) {
        TeIcon(
            name = IconName.Lock,
            contentDescription = null,
            tint = TripsEnjoyTheme.colors.inkMuted,
        )
    }
}
