package com.tripsenjoy.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.autofill.ContentType
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.contentType
import androidx.compose.ui.semantics.error
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

private val OtpBoxHeight = 56.dp
private val OtpBorderWidth = 1.dp
private val OtpFocusedBorderWidth = 2.dp
private val OtpErrorIconSize = 16.dp

// One-time code entry. A single hidden text field takes the digits, so the platform's numeric keyboard and
// one-time-code autofill work; the boxes only display them. Digits only, capped at length.
// The error says what to do next and shows an icon plus text, never colour alone.
@Composable
fun TeOtpInput(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    length: Int = 6,
    error: String? = null,
    modifier: Modifier = Modifier,
) {
    require(length > 0) { "length must be positive" }
    val colors = TripsEnjoyTheme.colors
    val spacing = TripsEnjoyTheme.spacing
    val digits = value.filter(Char::isDigit).take(length)
    val errorText: String? = error
    var focused by remember { mutableStateOf(false) }
    val activeIndex = minOf(digits.length, length - 1)

    Column(modifier = modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(spacing.space2)) {
        Text(text = label, style = TripsEnjoyTheme.typography.label, color = colors.ink)
        Box(modifier = Modifier.fillMaxWidth().height(OtpBoxHeight)) {
            Row(
                modifier = Modifier.fillMaxSize(),
                horizontalArrangement = Arrangement.spacedBy(spacing.space2),
            ) {
                repeat(length) { index ->
                    OtpDigitBox(
                        digit = digits.getOrNull(index),
                        active = focused && index == activeIndex,
                        invalid = errorText != null,
                    )
                }
            }
            BasicTextField(
                value = digits,
                onValueChange = { next -> onValueChange(next.filter(Char::isDigit).take(length)) },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                modifier = Modifier
                    .fillMaxSize()
                    .alpha(0f)
                    .onFocusChanged { focused = it.isFocused }
                    .semantics {
                        contentDescription = label
                        contentType = ContentType.SmsOtpCode
                        if (errorText != null) this.error(errorText)
                    },
            )
        }
        if (errorText != null) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(spacing.space2),
            ) {
                TeIcon(
                    name = IconName.Alert,
                    contentDescription = null,
                    tint = colors.danger,
                    size = OtpErrorIconSize,
                )
                Text(text = errorText, style = TripsEnjoyTheme.typography.caption, color = colors.danger)
            }
        }
    }
}

@Composable
private fun RowScope.OtpDigitBox(digit: Char?, active: Boolean, invalid: Boolean) {
    val colors = TripsEnjoyTheme.colors
    val shape = RoundedCornerShape(TripsEnjoyTheme.radius.sm)
    val borderColor = when {
        invalid -> colors.danger
        active -> colors.focusRing
        else -> colors.controlBorder
    }
    val borderWidth = if (active) OtpFocusedBorderWidth else OtpBorderWidth
    Box(
        modifier = Modifier
            .weight(1f)
            .fillMaxHeight()
            .clip(shape)
            .background(colors.surfaceRaised, shape)
            .border(borderWidth, borderColor, shape),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = digit?.toString().orEmpty(),
            style = TripsEnjoyTheme.typography.h2,
            color = colors.ink,
        )
    }
}
