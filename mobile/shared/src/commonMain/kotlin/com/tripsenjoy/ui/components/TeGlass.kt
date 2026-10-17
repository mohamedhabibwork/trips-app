package com.tripsenjoy.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.tripsenjoy.ui.theme.TripsEnjoyColors
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

private val GlassElevation: Dp = 8.dp
private val GlassStrokeWidth: Dp = 1.dp
private val GlassIconSize: Dp = 24.dp

/**
 * Liquid Glass approximation for Compose.
 *
 * Compose has no backdrop blur, so glass-blur-regular, glass-blur-clear and glass-saturate are NOT applied.
 * Glass is the translucent glass-fill-regular over the content, a 1dp glass-stroke edge and a soft glass-shadow.
 *
 * reduceTransparency falls back to an opaque surface-raised fill.
 * tint gives the one primary floating action an opaque primary fill (glass-tint).
 * Glass sits on controls only (bars, floating buttons, toasts). Never put glass on glass.
 */
@Composable
fun TeGlassSurface(
    modifier: Modifier = Modifier,
    shape: Shape = RoundedCornerShape(TripsEnjoyTheme.radius.pill),
    tint: Boolean = false,
    reduceTransparency: Boolean = false,
    content: @Composable () -> Unit,
) {
    val colors = TripsEnjoyTheme.colors
    Box(
        modifier = modifier
            .shadow(
                elevation = GlassElevation,
                shape = shape,
                ambientColor = colors.glassShadow,
                spotColor = colors.glassShadow,
            )
            .clip(shape)
            .background(glassFill(tint, reduceTransparency, colors), shape)
            .border(GlassStrokeWidth, colors.glassStroke, shape),
        contentAlignment = Alignment.Center,
    ) {
        content()
    }
}

// Floating control. Pass icon for an icon button; label then becomes the accessible name.
// tint = true for the single primary action (for example Track bus).
@Composable
fun TeGlassButton(
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    icon: IconName? = null,
    tint: Boolean = false,
    reduceTransparency: Boolean = false,
    enabled: Boolean = true,
) {
    val colors = TripsEnjoyTheme.colors
    val spacing = TripsEnjoyTheme.spacing
    val foreground = if (tint) colors.onPrimary else colors.ink
    val pill = RoundedCornerShape(TripsEnjoyTheme.radius.pill)
    val touchModifier = modifier
        .defaultMinSize(minWidth = TeMinTouchTarget, minHeight = TeMinTouchTarget)
        .clickable(enabled = enabled, role = Role.Button, onClick = onClick)
        .teFocusRing(TripsEnjoyTheme.radius.pill)

    if (icon != null) {
        TeGlassSurface(
            modifier = touchModifier,
            shape = CircleShape,
            tint = tint,
            reduceTransparency = reduceTransparency,
        ) {
            TeIcon(name = icon, contentDescription = label, tint = foreground, size = GlassIconSize)
        }
    } else {
        TeGlassSurface(
            modifier = touchModifier,
            shape = pill,
            tint = tint,
            reduceTransparency = reduceTransparency,
        ) {
            Text(
                text = label,
                style = TripsEnjoyTheme.typography.label,
                color = foreground,
                modifier = Modifier.padding(horizontal = spacing.space6, vertical = spacing.space3),
            )
        }
    }
}

// Floating top bar. Title is a heading for screen readers. navigation and actions are optional slots.
@Composable
fun TeGlassNavBar(
    title: String,
    modifier: Modifier = Modifier,
    reduceTransparency: Boolean = false,
    navigation: (@Composable () -> Unit)? = null,
    actions: @Composable RowScope.() -> Unit = {},
) {
    val spacing = TripsEnjoyTheme.spacing
    TeGlassSurface(modifier = modifier.fillMaxWidth(), reduceTransparency = reduceTransparency) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = spacing.space4, vertical = spacing.space2),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(spacing.space2),
        ) {
            if (navigation != null) {
                navigation()
            }
            Text(
                text = title,
                style = TripsEnjoyTheme.typography.label,
                color = TripsEnjoyTheme.colors.ink,
                modifier = Modifier.weight(1f).semantics { heading() },
            )
            actions()
        }
    }
}

data class TeGlassTab(val label: String, val icon: IconName)

// Floating tab bar. The active tab uses tab-active on a glass-selection pill.
@Composable
fun TeGlassTabBar(
    tabs: List<TeGlassTab>,
    selectedIndex: Int,
    onSelect: (Int) -> Unit,
    modifier: Modifier = Modifier,
    reduceTransparency: Boolean = false,
) {
    val spacing = TripsEnjoyTheme.spacing
    TeGlassSurface(modifier = modifier.fillMaxWidth(), reduceTransparency = reduceTransparency) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(spacing.space2),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            tabs.forEachIndexed { index, tab ->
                TeGlassTabItem(
                    tab = tab,
                    selected = index == selectedIndex,
                    onClick = { onSelect(index) },
                    modifier = Modifier.weight(1f),
                )
            }
        }
    }
}

@Composable
private fun TeGlassTabItem(
    tab: TeGlassTab,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier,
) {
    val colors = TripsEnjoyTheme.colors
    val spacing = TripsEnjoyTheme.spacing
    val pill = RoundedCornerShape(TripsEnjoyTheme.radius.pill)
    val tint = if (selected) colors.tabActive else colors.inkMuted
    val selection = if (selected) colors.glassSelection else Color.Transparent
    Column(
        modifier = modifier
            .defaultMinSize(minHeight = TeMinTouchTarget)
            .clip(pill)
            .background(selection, pill)
            .selectable(selected = selected, role = Role.Tab, onClick = onClick)
            .teFocusRing(TripsEnjoyTheme.radius.pill)
            .padding(horizontal = spacing.space2, vertical = spacing.space1),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        TeIcon(name = tab.icon, contentDescription = null, tint = tint)
        Text(text = tab.label, style = TripsEnjoyTheme.typography.caption, color = tint)
    }
}

private fun glassFill(tint: Boolean, reduceTransparency: Boolean, colors: TripsEnjoyColors): Color = when {
    tint -> colors.glassTint
    reduceTransparency -> colors.surfaceRaised
    else -> colors.glassFillRegular
}

