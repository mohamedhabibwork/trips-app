package com.tripsenjoy.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

// Title block for a screen: heading, optional description, and actions aligned to the end.
// Actions wrap onto their own line only through the caller's layout, so keep them to one or two controls.
@Composable
fun TePageHeader(
    title: String,
    description: String? = null,
    actions: @Composable RowScope.() -> Unit = {},
) {
    val colors = TripsEnjoyTheme.colors
    val spacing = TripsEnjoyTheme.spacing
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.Top,
        horizontalArrangement = Arrangement.spacedBy(spacing.space3),
    ) {
        Column(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(spacing.space1),
        ) {
            Text(
                text = title,
                style = TripsEnjoyTheme.typography.h2,
                color = colors.ink,
                modifier = Modifier.semantics { heading() },
            )
            if (description != null) {
                Text(text = description, style = TripsEnjoyTheme.typography.body, color = colors.inkMuted)
            }
        }
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(spacing.space2),
        ) {
            actions()
        }
    }
}
