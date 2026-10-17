package com.tripsenjoy.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

// Shown in place of a limited action (SCR-SHR-01). Names the plan that unlocks it, says it is locked,
// and offers the upgrade. The plan is shown as a badge with a lock icon, not by colour alone.
@Composable
fun TePlanGate(
    plan: String,
    lockedLabel: String,
    upgradeLabel: String,
    onUpgrade: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val colors = TripsEnjoyTheme.colors
    val spacing = TripsEnjoyTheme.spacing
    val shape = RoundedCornerShape(TripsEnjoyTheme.radius.md)
    Column(
        modifier = modifier
            .fillMaxWidth()
            .clip(shape)
            .background(colors.surfaceRaised, shape)
            .border(1.dp, colors.hairline, shape)
            .padding(spacing.space4),
        verticalArrangement = Arrangement.spacedBy(spacing.space3),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            TeBadge(label = plan, tone = BadgeTone.Highlight, icon = IconName.Lock)
        }
        Text(text = lockedLabel, style = TripsEnjoyTheme.typography.body, color = colors.ink)
        TeButton(text = upgradeLabel, onClick = onUpgrade, modifier = Modifier.fillMaxWidth())
    }
}
