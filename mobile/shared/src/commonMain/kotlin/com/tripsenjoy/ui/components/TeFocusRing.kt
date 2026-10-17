package com.tripsenjoy.ui.components

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawWithContent
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

private val FocusRingWidth: Dp = 2.dp
private val FocusRingOffset: Dp = 2.dp

// 2px solid focus-ring outline, 2px outside the element (README: Focus).
// Apply it after the focusable modifier (clickable or selectable) so it follows focus.
@Composable
fun Modifier.teFocusRing(corner: Dp): Modifier {
    var focused by remember { mutableStateOf(false) }
    val ringColor = TripsEnjoyTheme.colors.focusRing
    return this
        .onFocusChanged { focused = it.isFocused }
        .drawWithContent {
            drawContent()
            if (focused) {
                val outset = (FocusRingOffset + FocusRingWidth / 2).toPx()
                drawRoundRect(
                    color = ringColor,
                    topLeft = Offset(-outset, -outset),
                    size = Size(size.width + outset * 2, size.height + outset * 2),
                    cornerRadius = CornerRadius(corner.toPx() + outset),
                    style = Stroke(width = FocusRingWidth.toPx()),
                )
            }
        }
}
