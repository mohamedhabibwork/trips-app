package com.tripsenjoy.screens.shared.states

import androidx.compose.runtime.Composable
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.shared.common.ScreenBody
import com.tripsenjoy.ui.components.ErrorKind
import com.tripsenjoy.ui.components.TeErrorState
import com.tripsenjoy.ui.components.TePageHeader

// SCR-SHR-06 Service unavailable (503). Booking payments are never lost on an outage: callbacks queue (NFR-AVL-03).
// Try again returns to the screen that failed. The status page link waits for its address.
@Composable
fun ServiceUnavailable503() {
    val nav = LocalScreenNavigator.current
    ScreenBody {
        TePageHeader(title = "Service unavailable (503)", description = "The service is temporarily down")
        TeErrorState(
            kind = ErrorKind.Unavailable,
            actionLabel = "Try again",
            onAction = { nav.back() },
        )
    }
}
