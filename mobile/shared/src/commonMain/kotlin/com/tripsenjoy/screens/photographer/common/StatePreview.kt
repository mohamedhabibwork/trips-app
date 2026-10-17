package com.tripsenjoy.screens.photographer.common

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.ui.components.TeTab
import com.tripsenjoy.ui.components.TeTabs

private const val TAB_MAIN = "main"
private const val TAB_LOADING = "loading"
private const val TAB_EMPTY = "empty"
private const val TAB_ERROR = "error"

// Switches one screen between its Main view and the Loading, Empty and Error views its spec names.
// A tab appears only for a view that is passed in. The tabs preview states; they do not change any data.
@Composable
fun StatePreview(
    ariaLabel: String,
    main: @Composable () -> Unit,
    loading: (@Composable () -> Unit)? = null,
    empty: (@Composable () -> Unit)? = null,
    error: (@Composable () -> Unit)? = null,
) {
    val tabs = buildList {
        add(TeTab(id = TAB_MAIN, label = "Main"))
        if (loading != null) add(TeTab(id = TAB_LOADING, label = "Loading"))
        if (empty != null) add(TeTab(id = TAB_EMPTY, label = "Empty"))
        if (error != null) add(TeTab(id = TAB_ERROR, label = "Error"))
    }
    var activeId by remember { mutableStateOf(TAB_MAIN) }
    TeTabs(tabs = tabs, activeId = activeId, onSelect = { activeId = it }, ariaLabel = ariaLabel)
    val view: @Composable () -> Unit = when (activeId) {
        TAB_LOADING -> loading ?: main
        TAB_EMPTY -> empty ?: main
        TAB_ERROR -> error ?: main
        else -> main
    }
    view()
}
