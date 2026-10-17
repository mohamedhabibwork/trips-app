package com.tripsenjoy.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.size
import androidx.compose.material3.LocalContentColor
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.withTransform
import androidx.compose.ui.graphics.vector.PathParser
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp

// Trips Enjoy design-system icon set. Names follow the DS icon files.
enum class IconName {
    Search, Calendar, Pin, Route, Bus, Seat, Users, User, Home, Ticket, Live, Back, Arrow, More,
    Close, Plus, Minus, Check, Alert, Info, Clock, Refresh, Offline, Shield, Lock, Camera, Image,
    Upload, File, Heart, Phone, Chart,
    Download, Share, Bell, Receipt, Card, Globe, Mail, Logout, Filter, Trash,
}

private const val ICON_VIEWPORT = 24f
private const val ICON_STROKE_UNITS = 2f
private val DefaultIconSize: Dp = 24.dp

// SVG path data is parsed once with Compose's PathParser, which also handles arc commands.
private val parsedIconPaths: Map<IconName, Path> = iconPathData.mapValues { (_, data) ->
    PathParser().parsePathString(data).toPath()
}

internal fun iconPath(name: IconName): Path = parsedIconPaths.getValue(name)

// Decorative icons next to text pass contentDescription = null. Icon-only controls must pass a label.
// flipInRtl mirrors the icon horizontally in right-to-left layouts (for example arrows).
@Composable
fun TeIcon(
    name: IconName,
    contentDescription: String?,
    modifier: Modifier = Modifier,
    tint: Color = LocalContentColor.current,
    flipInRtl: Boolean = false,
    size: Dp = DefaultIconSize,
) {
    val mirror = flipInRtl && LocalLayoutDirection.current == LayoutDirection.Rtl
    val described = if (contentDescription != null) {
        modifier.semantics { this.contentDescription = contentDescription }
    } else {
        modifier
    }
    Canvas(modifier = described.size(size)) {
        val widthPx = this.size.width
        val unit = widthPx / ICON_VIEWPORT
        withTransform({
            if (mirror) {
                translate(left = widthPx)
                scale(scaleX = -1f, scaleY = 1f, pivot = Offset.Zero)
            }
            scale(unit, unit, pivot = Offset.Zero)
        }) {
            drawPath(
                path = iconPath(name),
                color = tint,
                style = Stroke(
                    width = ICON_STROKE_UNITS,
                    cap = StrokeCap.Round,
                    join = StrokeJoin.Round,
                ),
            )
        }
    }
}
