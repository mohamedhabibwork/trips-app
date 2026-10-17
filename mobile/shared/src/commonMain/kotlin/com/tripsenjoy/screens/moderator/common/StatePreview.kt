package com.tripsenjoy.screens.moderator.common

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.ui.components.ErrorKind
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeErrorState
import com.tripsenjoy.ui.components.TePlatform
import com.tripsenjoy.ui.components.TeTab
import com.tripsenjoy.ui.components.TeTabs
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

// The states a moderator screen can be shown in. Main is the live content.
internal enum class ModPreviewState(val label: String) {
    Main("Main"),
    Loading("Loading"),
    Empty("Empty"),
    Error("Error"),
}

// Switches one screen between its states with tabs. A slot that is null means the spec does not name that
// state for the screen, so no tab is shown for it.
@Composable
internal fun StatePreview(
    main: @Composable () -> Unit,
    loading: (@Composable () -> Unit)? = null,
    empty: (@Composable () -> Unit)? = null,
    error: (@Composable () -> Unit)? = null,
) {
    val states = listOfNotNull(
        ModPreviewState.Main,
        ModPreviewState.Loading.takeIf { loading != null },
        ModPreviewState.Empty.takeIf { empty != null },
        ModPreviewState.Error.takeIf { error != null },
    )
    var selected by remember { mutableStateOf(ModPreviewState.Main) }
    Column(verticalArrangement = Arrangement.spacedBy(TripsEnjoyTheme.spacing.space4)) {
        TeTabs(
            tabs = states.map { TeTab(id = it.name, label = it.label) },
            activeId = selected.name,
            onSelect = { id -> selected = states.first { it.name == id } },
            ariaLabel = "Preview state",
        )
        when (selected) {
            ModPreviewState.Main -> main()
            ModPreviewState.Loading -> loading?.invoke()
            ModPreviewState.Empty -> empty?.invoke()
            ModPreviewState.Error -> error?.invoke()
        }
    }
}

// Loading block: a spinner with the word for what is loading.
@Composable
internal fun ModLoadingBlock(label: String) {
    TeCard(header = label) {
        CircularProgressIndicator()
        ModNote("Loading. This area fills in when the data arrives.")
    }
}

// Empty block: says why nothing is shown and what happens next.
@Composable
internal fun ModEmptyBlock(title: String, message: String) {
    TeCard(header = title) {
        ModNote(message)
    }
}

// Whole-area failure. The action is shown only when onRetry is given.
@Composable
internal fun ModErrorBlock(kind: ErrorKind, onRetry: (() -> Unit)? = null) {
    TeErrorState(kind = kind, platform = TePlatform.Mobile, onAction = onRetry)
}
