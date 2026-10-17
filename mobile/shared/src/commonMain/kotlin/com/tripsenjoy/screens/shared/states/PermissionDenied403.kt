package com.tripsenjoy.screens.shared.states

import androidx.compose.runtime.Composable
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.shared.common.ScreenBody
import com.tripsenjoy.ui.components.ErrorKind
import com.tripsenjoy.ui.components.TeErrorState
import com.tripsenjoy.ui.components.TePageHeader

// SCR-SHR-02 Permission denied (403). Shown on a direct URL or a blocked action. No restricted data is shown.
// Back returns to the previous screen.
@Composable
fun PermissionDenied403() {
    val nav = LocalScreenNavigator.current
    ScreenBody {
        TePageHeader(title = "Permission denied (403)", description = "Outside your permission")
        TeErrorState(
            kind = ErrorKind.Forbidden,
            actionLabel = "Go back",
            onAction = { nav.back() },
        )
    }
}
