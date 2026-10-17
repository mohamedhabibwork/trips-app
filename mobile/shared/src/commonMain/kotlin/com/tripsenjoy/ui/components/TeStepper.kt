package com.tripsenjoy.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.tripsenjoy.ui.theme.TripsEnjoyColors
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

data class TeStep(val id: String, val label: String)

enum class TeStepState(val word: String) {
    Completed("Completed"),
    Current("Current"),
    Upcoming("Upcoming"),
}

private val StepWidth = 96.dp
private val StepMarkerSize = 36.dp
private val StepMarkerBorder = 2.dp
private val StepCheckSize = 18.dp

// The current step wins over completion, so a finished step can be reopened for editing and still show as current.
fun stepStateFor(step: TeStep, currentId: String, completedIds: Set<String>): TeStepState = when {
    step.id == currentId -> TeStepState.Current
    step.id in completedIds -> TeStepState.Completed
    else -> TeStepState.Upcoming
}

// Progress through a multi-step flow, for example creating a trip. Each step shows its state as a word,
// and completed steps show a check mark, so progress is not carried by colour alone.
@Composable
fun TeStepper(
    steps: List<TeStep>,
    currentId: String,
    completedIds: Set<String>,
    ariaLabel: String,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .horizontalScroll(rememberScrollState())
            .semantics { contentDescription = ariaLabel },
        horizontalArrangement = Arrangement.spacedBy(TripsEnjoyTheme.spacing.space4),
    ) {
        steps.forEachIndexed { index, step ->
            TeStepItem(
                number = index + 1,
                step = step,
                state = stepStateFor(step, currentId, completedIds),
            )
        }
    }
}

@Composable
private fun TeStepItem(number: Int, step: TeStep, state: TeStepState) {
    val colors = TripsEnjoyTheme.colors
    val spacing = TripsEnjoyTheme.spacing
    val markerFill = state.markerFill(colors)
    val markerBorder = state.markerBorder(colors)
    val stateColor = state.textColor(colors)
    Column(
        modifier = Modifier
            .width(StepWidth)
            .semantics { stateDescription = state.word },
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(spacing.space1),
    ) {
        Box(
            modifier = Modifier
                .size(StepMarkerSize)
                .clip(CircleShape)
                .background(markerFill, CircleShape)
                .border(StepMarkerBorder, markerBorder, CircleShape),
            contentAlignment = Alignment.Center,
        ) {
            if (state == TeStepState.Completed) {
                TeIcon(name = IconName.Check, contentDescription = null, tint = colors.success, size = StepCheckSize)
            } else {
                Text(text = number.toString(), style = TripsEnjoyTheme.typography.label, color = stateColor)
            }
        }
        Text(
            text = step.label,
            style = TripsEnjoyTheme.typography.caption,
            color = colors.ink,
            textAlign = TextAlign.Center,
        )
        Text(
            text = state.word,
            style = TripsEnjoyTheme.typography.caption,
            color = stateColor,
            textAlign = TextAlign.Center,
        )
    }
}

private fun TeStepState.markerFill(colors: TripsEnjoyColors): Color = when (this) {
    TeStepState.Completed -> colors.successSoft
    TeStepState.Current -> colors.accent
    TeStepState.Upcoming -> colors.surfaceRaised
}

private fun TeStepState.markerBorder(colors: TripsEnjoyColors): Color = when (this) {
    TeStepState.Completed -> colors.success
    TeStepState.Current -> colors.brandNavy
    TeStepState.Upcoming -> colors.controlBorder
}

private fun TeStepState.textColor(colors: TripsEnjoyColors): Color = when (this) {
    TeStepState.Completed -> colors.success
    TeStepState.Current -> colors.brandNavy
    TeStepState.Upcoming -> colors.inkMuted
}
