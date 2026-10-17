package com.tripsenjoy.screens.shared.prompts

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.shared.common.ScreenBody
import com.tripsenjoy.ui.components.TeDialog
import com.tripsenjoy.ui.components.TeInput
import com.tripsenjoy.ui.components.TePageHeader

// SCR-SHR-09 Confirmation dialog (gap, pending product sign-off). Confirms an irreversible or high-impact decision.
// It opens from a destructive action. Confirm and cancel both return to that caller with nav.back().
// Confirm stays disabled until the reason is written (BRL-19). Affected travelers are notified before a change applies (BRL-24).
@Composable
fun ConfirmationDialog() {
    val nav = LocalScreenNavigator.current
    var reason by remember { mutableStateOf("") }
    ScreenBody {
        TePageHeader(title = "Confirmation dialog", description = "Opened from a destructive action. Confirm or cancel returns to it")
    }
    TeDialog(
        visible = true,
        onDismiss = { nav.back() },
        title = "Confirm this change?",
        primaryLabel = "Confirm",
        onPrimary = { nav.back() },
        secondaryLabel = "Cancel",
        danger = true,
        confirmEnabled = reason.isNotBlank(),
        description = "This change takes effect once confirmed. Affected travelers are notified before it applies, " +
            "and the decision is recorded.",
    ) {
        TeInput(
            value = reason,
            onValueChange = { reason = it },
            label = "Reason",
            supportingText = "Required for this decision.",
        )
    }
}
