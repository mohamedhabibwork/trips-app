package com.tripsenjoy.auth.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.error
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.tripsenjoy.ui.components.TeIcon
import com.tripsenjoy.ui.components.IconName
import com.tripsenjoy.ui.components.TeMinTouchTarget
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

private val OtpBoxSize = 44.dp
private val OtpBoxRadius = 8.dp

/**
 * The six single-digit boxes from the PRD sketch (PRD §6, mobile OTP screen).
 *
 * Typing a digit advances to the next box, backspace retreats, and pasting a six-digit code fills
 * every box at once. The digits are announced individually so a screen reader says "Digit 1" rather
 * than reading a bare number.
 *
 * [digitLabel] supplies the "Digit {index}" copy from `AuthStrings`, so no string is hardcoded here.
 */
@Composable
fun OtpCodeField(
    value: String,
    onValueChange: (String) -> Unit,
    digitLabel: (Int) -> String,
    modifier: Modifier = Modifier,
    length: Int = 6,
    enabled: Boolean = true,
    error: String? = null,
) {
    val colors = TripsEnjoyTheme.colors
    val spacing = TripsEnjoyTheme.spacing
    val focusRequesters = remember(length) { List(length) { FocusRequester() } }
    val digits = value.filter { it.isDigit() }.take(length)

    Column(modifier = modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(spacing.space2)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(spacing.space2),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            repeat(length) { index ->
                val character = digits.getOrNull(index)?.toString().orEmpty()
                val shape = RoundedCornerShape(OtpBoxRadius)
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .defaultMinSize(minHeight = TeMinTouchTarget)
                        .clip(shape)
                        .background(colors.surfaceRaised, shape)
                        .border(1.dp, if (error != null) colors.danger else colors.controlBorder, shape),
                    contentAlignment = Alignment.Center,
                ) {
                    BasicTextField(
                        value = character,
                        onValueChange = { input ->
                            val typed = input.filter { it.isDigit() }
                            when {
                                typed.length > 1 -> {
                                    // A paste: distribute from this box onwards and stop at the end.
                                    val merged = digits.take(index) + typed
                                    onValueChange(merged.take(length))
                                    focusRequesters.last().requestFocusSafely()
                                }
                                typed.isEmpty() -> {
                                    // A deletion: drop this digit and step back.
                                    onValueChange(digits.removeRangeSafely(index))
                                    if (index > 0) focusRequesters[index - 1].requestFocusSafely()
                                }
                                else -> {
                                    onValueChange(digits.replaceAtSafely(index, typed))
                                    if (index < length - 1) {
                                        focusRequesters[index + 1].requestFocusSafely()
                                    }
                                }
                            }
                        },
                        enabled = enabled,
                        singleLine = true,
                        textStyle = TripsEnjoyTheme.typography.h3.copy(
                            color = colors.ink,
                            textAlign = TextAlign.Center,
                        ),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                        cursorBrush = SolidColor(colors.primaryText),
                        modifier = Modifier
                            .fillMaxWidth()
                            .focusRequester(focusRequesters[index])
                            .semantics {
                                contentDescription = digitLabel(index + 1)
                                if (error != null) this.error(error)
                            },
                    )
                }
            }
        }
        if (error != null) {
            Row(
                modifier = Modifier.semantics { liveRegion = LiveRegionMode.Assertive },
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(spacing.space2),
            ) {
                TeIcon(
                    name = IconName.Alert,
                    contentDescription = null,
                    tint = colors.danger,
                    size = OtpBoxSize / 2,
                )
                Text(
                    text = error,
                    style = TripsEnjoyTheme.typography.caption,
                    color = colors.danger,
                )
            }
        }
    }

    // Ask for the first empty box once, so the keyboard is ready without the user tapping.
    LaunchedEffect(enabled, digits.length) {
        if (!enabled) return@LaunchedEffect
        if (digits.length < length) focusRequesters[digits.length].requestFocusSafely()
    }
}

/** `requestFocus` throws when the field is not attached yet; a lost focus is not worth a crash. */
private fun FocusRequester.requestFocusSafely() {
    runCatching { requestFocus() }
}

/** Replaces the digit at [index], padding with nothing so the string stays dense. */
private fun String.replaceAtSafely(index: Int, digit: String): String {
    val builder = StringBuilder(this)
    while (builder.length <= index) builder.append(' ')
    builder.set(index, digit.first())
    return builder.toString().replace(" ", "")
}

/** Removes the digit at [index] when there is one. */
private fun String.removeRangeSafely(index: Int): String {
    if (index >= length) return this
    return removeRange(index, index + 1)
}
