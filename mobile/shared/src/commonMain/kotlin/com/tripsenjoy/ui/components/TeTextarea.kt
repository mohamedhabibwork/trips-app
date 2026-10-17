package com.tripsenjoy.ui.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.semantics.error
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextDirection
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

// Keeps the first text value within maxLength characters. A null limit leaves the text unchanged.
internal fun limitTextLength(text: String, maxLength: Int?): String =
    if (maxLength == null) text else text.take(maxLength)

// The "n / max" counter shown under the field when a limit is set.
internal fun characterCounter(length: Int, maxLength: Int): String = "$length / $maxLength"

// Multi-line text field. Label, border, error and supporting text follow the TeInput rules.
// When maxLength is set, input stops at the limit and a counter shows how much is used.
// Text direction is "content", so Arabic and English input follow their own direction (dir="auto").
@Composable
fun TeTextarea(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    supportingText: String? = null,
    error: String? = null,
    isError: Boolean = error != null,
    enabled: Boolean = true,
    minLines: Int = 4,
    maxLength: Int? = null,
) {
    val colors = TripsEnjoyTheme.colors
    val spacing = TripsEnjoyTheme.spacing
    val radius = TripsEnjoyTheme.radius.sm
    val errorText: String? = if (isError) error else null
    val counter = maxLength?.let { characterCounter(value.length, it) }

    TeFieldColumn(
        label = label,
        errorText = errorText,
        supportingText = supportingText,
        modifier = modifier,
        counterText = counter,
    ) {
        BasicTextField(
            value = value,
            onValueChange = { next -> onValueChange(limitTextLength(next, maxLength)) },
            enabled = enabled,
            singleLine = false,
            minLines = minLines,
            textStyle = TripsEnjoyTheme.typography.body.copy(
                color = colors.ink,
                textDirection = TextDirection.Content,
            ),
            cursorBrush = SolidColor(colors.primaryText),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Text, imeAction = ImeAction.Default),
            modifier = Modifier
                .fillMaxWidth()
                .teFieldSurface()
                .teFocusRing(radius)
                .padding(horizontal = spacing.space4, vertical = spacing.space3)
                .semantics {
                    if (errorText != null) this.error(errorText)
                },
        )
    }
}
