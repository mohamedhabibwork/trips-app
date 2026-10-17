package com.tripsenjoy.screens.shared.states

import androidx.compose.runtime.Composable
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.shared.common.ScreenBody
import com.tripsenjoy.screens.shared.common.SharedScreenId
import com.tripsenjoy.ui.components.ErrorKind
import com.tripsenjoy.ui.components.TeErrorState
import com.tripsenjoy.ui.components.TePageHeader

// SCR-SHR-04 Unauthorized (401). The session is missing, expired or ended. Sign-in goes to the code entry screen
// (SCR-SHR-14), so the user can sign in and return here. The return keeps the destination (proposed D-333).
@Composable
fun Unauthorized401() {
    val nav = LocalScreenNavigator.current
    ScreenBody {
        TePageHeader(title = "Unauthorized (401)", description = "Your session is missing or has ended")
        TeErrorState(
            kind = ErrorKind.Unauthorized,
            title = "Sign in to continue",
            message = "Your session has ended. Sign in with a code and you return to this page.",
            actionLabel = "Sign in with a code",
            onAction = { nav.open(SharedScreenId.OTP_ENTRY) },
        )
    }
}
