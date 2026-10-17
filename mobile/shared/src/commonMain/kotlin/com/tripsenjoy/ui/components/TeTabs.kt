package com.tripsenjoy.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

data class TeTab(val id: String, val label: String, val count: Int? = null)

private val TabIndicatorHeight = 3.dp

// Tab row for switching views on one screen. Each tab is a Tab with a selected state. The active tab also
// gets an underline bar, so selection is not carried by colour alone. The row scrolls sideways when tabs overflow.
@Composable
fun TeTabs(
    tabs: List<TeTab>,
    activeId: String,
    onSelect: (String) -> Unit,
    ariaLabel: String,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .horizontalScroll(rememberScrollState())
            .semantics { contentDescription = ariaLabel },
        horizontalArrangement = Arrangement.spacedBy(TripsEnjoyTheme.spacing.space1),
    ) {
        tabs.forEach { tab ->
            TeTabItem(
                tab = tab,
                selected = tab.id == activeId,
                onClick = { onSelect(tab.id) },
            )
        }
    }
}

@Composable
private fun TeTabItem(tab: TeTab, selected: Boolean, onClick: () -> Unit) {
    val colors = TripsEnjoyTheme.colors
    val spacing = TripsEnjoyTheme.spacing
    val label = tab.count?.let { "${tab.label} ($it)" } ?: tab.label
    val textColor = if (selected) colors.tabActive else colors.inkMuted
    val indicatorColor = if (selected) colors.tabActive else Color.Transparent
    Box(
        modifier = Modifier
            .defaultMinSize(minHeight = TeMinTouchTarget)
            .selectable(selected = selected, role = Role.Tab, onClick = onClick)
            .teFocusRing(TripsEnjoyTheme.radius.sm)
            .padding(horizontal = spacing.space3, vertical = spacing.space2)
            .drawBehind {
                val barHeight = TabIndicatorHeight.toPx()
                drawRect(
                    color = indicatorColor,
                    topLeft = Offset(0f, size.height - barHeight),
                    size = Size(size.width, barHeight),
                )
            },
        contentAlignment = Alignment.Center,
    ) {
        Text(text = label, style = TripsEnjoyTheme.typography.label, color = textColor)
    }
}
