package com.tripsenjoy.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

data class TeBarValue(val label: String, val value: Double)

private val ChartHeight = 160.dp
private const val BarWidthShare = 0.6f

// Scales each value against the largest one, giving heights from 0f to 1f in the same order.
// Negative and NaN values count as zero. If nothing is positive, every bar is empty.
fun barHeightFractions(values: List<Double>): List<Float> {
    val clean = values.map { if (it.isNaN() || it < 0.0) 0.0 else it }
    val largest = clean.maxOrNull() ?: 0.0
    if (largest <= 0.0) return clean.map { 0f }
    return clean.map { (it / largest).toFloat().coerceIn(0f, 1f) }
}

// Bar chart drawn on a Canvas in the primary colour. The caption and every value are read out together
// as one summary, so a screen reader gets the full data rather than the bars.
@Composable
fun TeBarChart(
    data: List<TeBarValue>,
    caption: String,
    formatValue: (Double) -> String = { it.toString() },
    modifier: Modifier = Modifier,
) {
    val colors = TripsEnjoyTheme.colors
    val spacing = TripsEnjoyTheme.spacing
    val fractions = barHeightFractions(data.map { it.value })
    val summary = barChartSummary(caption, data, formatValue)

    Column(
        modifier = modifier.fillMaxWidth().clearAndSetSemantics { contentDescription = summary },
        verticalArrangement = Arrangement.spacedBy(spacing.space2),
    ) {
        Text(text = caption, style = TripsEnjoyTheme.typography.label, color = colors.ink)
        Canvas(modifier = Modifier.fillMaxWidth().height(ChartHeight)) {
            val slot = if (fractions.isEmpty()) size.width else size.width / fractions.size
            val barWidth = slot * BarWidthShare
            fractions.forEachIndexed { index, fraction ->
                val barHeight = size.height * fraction
                drawRect(
                    color = colors.primary,
                    topLeft = Offset(index * slot + (slot - barWidth) / 2f, size.height - barHeight),
                    size = Size(barWidth, barHeight),
                )
            }
        }
        Row(modifier = Modifier.fillMaxWidth()) {
            data.forEach { bar ->
                Column(modifier = Modifier.weight(1f), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = formatValue(bar.value),
                        style = TripsEnjoyTheme.typography.caption,
                        color = colors.ink,
                        textAlign = TextAlign.Center,
                    )
                    Text(
                        text = bar.label,
                        style = TripsEnjoyTheme.typography.caption,
                        color = colors.inkMuted,
                        textAlign = TextAlign.Center,
                    )
                }
            }
        }
    }
}

// Pure helper: "Caption. Label value, Label value, ..." for screen readers.
internal fun barChartSummary(caption: String, data: List<TeBarValue>, formatValue: (Double) -> String): String {
    if (data.isEmpty()) return "$caption. No data"
    val values = data.joinToString(separator = ", ") { "${it.label} ${formatValue(it.value)}" }
    return "$caption. $values"
}
