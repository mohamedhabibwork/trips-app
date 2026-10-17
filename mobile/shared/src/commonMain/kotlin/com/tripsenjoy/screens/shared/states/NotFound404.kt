package com.tripsenjoy.screens.shared.states

import androidx.compose.runtime.Composable
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.shared.common.ScreenBody
import com.tripsenjoy.ui.components.ErrorKind
import com.tripsenjoy.ui.components.TeErrorState
import com.tripsenjoy.ui.components.TePageHeader

// SCR-SHR-03 Not found (404). Used for missing items, revoked shared links and another tenant's data.
// It never says whether the item exists in another organization. Back returns to the previous screen.
@Composable
fun NotFound404() {
    val nav = LocalScreenNavigator.current
    ScreenBody {
        TePageHeader(title = "Not found (404)", description = "Missing item, or a link that was revoked")
        TeErrorState(
            kind = ErrorKind.NotFound,
            actionLabel = "Go back",
            onAction = { nav.back() },
        )
    }
}
