package com.tripsenjoy.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.unit.dp
import com.tripsenjoy.ui.theme.TripsEnjoyColors
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

private const val MapAspectRatio = 4f / 3f
private val MapRoadWidth = 6.dp
private val MapRouteWidth = 4.dp
private val MapBusRadius = 8.dp
private val MapBusRingWidth = 2.dp
private val MapRoadFractions = listOf(0.25f, 0.5f, 0.75f)

// Maps a point in the unit box (0..1 on both axes) to canvas pixels. Out-of-range points are clamped to the edge.
internal fun mapPointToCanvas(point: Offset, width: Float, height: Float): Offset =
    Offset(point.x.coerceIn(0f, 1f) * width, point.y.coerceIn(0f, 1f) * height)

// Live bus position on a simplified street grid. Route and bus use the map tokens from the theme.
// The canvas carries contentDescription and statusText as its state, and the status is also shown as text,
// so the bus position is never conveyed by the drawing alone.
@Composable
fun TeLiveMap(
    route: List<Offset>,
    busPosition: Offset?,
    statusText: String,
    contentDescription: String,
    modifier: Modifier = Modifier,
) {
    val colors = TripsEnjoyTheme.colors
    val shape = RoundedCornerShape(TripsEnjoyTheme.radius.md)
    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(TripsEnjoyTheme.spacing.space2),
    ) {
        Canvas(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(MapAspectRatio)
                .clip(shape)
                .background(colors.mapGround, shape)
                .semantics {
                    this.contentDescription = contentDescription
                    this.stateDescription = statusText
                },
        ) {
            drawStreets(colors)
            drawRoute(route, colors)
            if (busPosition != null) {
                drawBus(mapPointToCanvas(busPosition, size.width, size.height), colors)
            }
        }
        Text(text = statusText, style = TripsEnjoyTheme.typography.label, color = colors.ink)
    }
}

private fun DrawScope.drawStreets(colors: TripsEnjoyColors) {
    val roadWidth = MapRoadWidth.toPx()
    MapRoadFractions.forEach { fraction ->
        drawLine(
            color = colors.mapRoad,
            start = Offset(0f, size.height * fraction),
            end = Offset(size.width, size.height * fraction),
            strokeWidth = roadWidth,
        )
        drawLine(
            color = colors.mapRoad,
            start = Offset(size.width * fraction, 0f),
            end = Offset(size.width * fraction, size.height),
            strokeWidth = roadWidth,
        )
    }
}

private fun DrawScope.drawRoute(route: List<Offset>, colors: TripsEnjoyColors) {
    val points = route.map { mapPointToCanvas(it, size.width, size.height) }
    if (points.size < 2) return
    val path = Path().apply {
        moveTo(points.first().x, points.first().y)
        points.drop(1).forEach { lineTo(it.x, it.y) }
    }
    drawPath(
        path = path,
        color = colors.mapRoute,
        style = Stroke(width = MapRouteWidth.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round),
    )
}

private fun DrawScope.drawBus(center: Offset, colors: TripsEnjoyColors) {
    val radius = MapBusRadius.toPx()
    drawCircle(color = colors.accent, radius = radius, center = center)
    drawCircle(
        color = colors.brandNavy,
        radius = radius,
        center = center,
        style = Stroke(width = MapBusRingWidth.toPx()),
    )
}
