package com.tripsenjoy.screens.traveler.common

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.tripsenjoy.ui.components.ErrorKind
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeErrorState
import com.tripsenjoy.ui.components.TeTab
import com.tripsenjoy.ui.components.TeTabs
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

// The views a screen can show besides its main view. A screen lists only the ones its spec names.
enum class TravelerScreenState(val label: String) {
    Main("Main"),
    Loading("Loading"),
    Empty("Empty"),
    Error("Error"),
}

// Switches one screen between Main and the listed Loading, Empty and Error views, using tabs.
// Tabs appear only for the states in listedStates, so no screen shows a state its spec does not name.
@Composable
fun StatePreview(
    listedStates: Set<TravelerScreenState>,
    emptyTitle: String = "Nothing to show yet",
    emptyMessage: String = "Nothing matches this view yet.",
    emptyAction: (@Composable () -> Unit)? = null,
    errorKind: ErrorKind = ErrorKind.Server,
    main: @Composable () -> Unit,
) {
    var selected by remember { mutableStateOf(TravelerScreenState.Main) }
    val tabStates = TravelerScreenState.entries.filter { it == TravelerScreenState.Main || it in listedStates }
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(TripsEnjoyTheme.spacing.space3),
    ) {
        if (tabStates.size > 1) {
            TeTabs(
                tabs = tabStates.map { TeTab(id = it.name, label = it.label) },
                activeId = selected.name,
                onSelect = { id -> selected = TravelerScreenState.valueOf(id) },
                ariaLabel = "Screen state",
            )
        }
        when (selected) {
            TravelerScreenState.Main -> main()
            TravelerScreenState.Loading -> LoadingView()
            TravelerScreenState.Empty -> EmptyView(title = emptyTitle, message = emptyMessage, action = emptyAction)
            TravelerScreenState.Error -> TeErrorState(kind = errorKind)
        }
    }
}

@Composable
private fun LoadingView() {
    TeCard(header = "Loading") {
        CircularProgressIndicator()
        ScreenNote(text = "Loading the latest details.")
    }
}

@Composable
private fun EmptyView(title: String, message: String, action: (@Composable () -> Unit)?) {
    TeCard(header = title) {
        ScreenNote(text = message)
        action?.invoke()
    }
}
