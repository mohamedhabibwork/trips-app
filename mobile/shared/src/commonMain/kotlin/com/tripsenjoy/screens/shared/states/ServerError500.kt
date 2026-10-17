package com.tripsenjoy.screens.shared.states

import androidx.compose.runtime.Composable
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.shared.common.ScreenBody
import com.tripsenjoy.ui.components.ErrorKind
import com.tripsenjoy.ui.components.TeErrorState
import com.tripsenjoy.ui.components.TePageHeader

private const val SAMPLE_REFERENCE_ID = "REF-PLACEHOLDER"

// SCR-SHR-05 Server error (500). Shows a reference ID for support (IF-03). No stack trace is shown.
// Try again returns to the screen that failed, which asks for its data again when it is opened.
@Composable
fun ServerError500() {
    val nav = LocalScreenNavigator.current
    ScreenBody {
        TePageHeader(title = "Server error (500)", description = "Something failed on our side")
        TeErrorState(
            kind = ErrorKind.Server,
            referenceId = SAMPLE_REFERENCE_ID,
            actionLabel = "Try again",
            onAction = { nav.back() },
        )
    }
}
