package com.tripsenjoy.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TePageHeader
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

// Lists a surface's screens and opens one at a time, with a back action.
// Used by each app's surface entry until a real navigation graph is built.
@Composable
fun ScreenBrowser(title: String, screens: List<ScreenEntry>, modifier: Modifier = Modifier) {
    var openId by remember { mutableStateOf<String?>(null) }
    val open = screens.firstOrNull { it.id == openId }
    val spacing = TripsEnjoyTheme.spacing

    Column(
        modifier = modifier.fillMaxSize().padding(spacing.space4),
        verticalArrangement = Arrangement.spacedBy(spacing.space4),
    ) {
        if (open == null) {
            TePageHeader(title = title, description = "${screens.size} screens")
            LazyColumn(verticalArrangement = Arrangement.spacedBy(spacing.space2)) {
                items(screens, key = { it.id }) { screen ->
                    TeButton(
                        text = "${screen.id}  ${screen.title}",
                        onClick = { openId = screen.id },
                        variant = TeButtonVariant.Secondary,
                        modifier = Modifier.fillMaxSize(),
                    )
                }
            }
        } else {
            TeButton(
                text = "Back to $title",
                onClick = { openId = null },
                variant = TeButtonVariant.Secondary,
            )
            TePageHeader(title = open.title, description = open.id)
            open.content()
        }
    }
}
