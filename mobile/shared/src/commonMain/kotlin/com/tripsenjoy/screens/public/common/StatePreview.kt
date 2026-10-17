package com.tripsenjoy.screens.public.common

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import com.tripsenjoy.ui.components.AlertTone
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeInlineAlert
import com.tripsenjoy.ui.components.TeTab
import com.tripsenjoy.ui.components.TeTabs
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

// The views a public screen can be previewed in. Main is always offered.
internal enum class PublicViewState(val label: String) {
    Main(label = "Main"),
    Loading(label = "Loading"),
    Empty(label = "Empty"),
    Error(label = "Error"),
}

// Copy for the non-Main views. Each screen passes the copy its spec describes.
internal data class PublicStateCopy(
    val loadingMessage: String = "Loading...",
    val emptyTitle: String = "Nothing to show yet",
    val emptyMessage: String = "There is nothing here yet.",
    val errorTitle: String = "This page could not load",
    val errorMessage: String = "Check your connection and try again.",
)

// Page body with a tab row that switches between Main and the states the spec names.
// States the spec does not name are not offered, so no state is invented for a screen.
@Composable
internal fun StatePreview(
    namedStates: List<PublicViewState>,
    copy: PublicStateCopy = PublicStateCopy(),
    main: @Composable ColumnScope.() -> Unit,
) {
    var selected by remember { mutableStateOf(PublicViewState.Main) }
    val offered = listOf(PublicViewState.Main) + namedStates.filter { it != PublicViewState.Main }
    PublicScreenColumn {
        TeTabs(
            tabs = offered.map { TeTab(id = it.name, label = it.label) },
            activeId = selected.name,
            onSelect = { id -> offered.firstOrNull { it.name == id }?.let { selected = it } },
            ariaLabel = "Preview state",
        )
        when (selected) {
            PublicViewState.Main -> main()
            PublicViewState.Loading -> PublicLoadingView(copy.loadingMessage)
            PublicViewState.Empty -> PublicEmptyView(copy)
            PublicViewState.Error -> PublicErrorView(copy)
        }
    }
}

@Composable
private fun PublicLoadingView(message: String) {
    val spacing = TripsEnjoyTheme.spacing
    TeCard {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(spacing.space3),
        ) {
            CircularProgressIndicator()
            Text(text = message, style = TripsEnjoyTheme.typography.body, color = TripsEnjoyTheme.colors.ink)
        }
    }
}

@Composable
private fun PublicEmptyView(copy: PublicStateCopy) {
    TeCard(header = copy.emptyTitle) {
        PublicNote(copy.emptyMessage)
    }
}

@Composable
private fun PublicErrorView(copy: PublicStateCopy) {
    TeInlineAlert(tone = AlertTone.Error, title = copy.errorTitle, message = copy.errorMessage)
}
