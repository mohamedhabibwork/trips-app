package com.tripsenjoy.screens.moderator.access

import androidx.compose.runtime.Composable
import com.tripsenjoy.screens.moderator.common.ModErrorBlock
import com.tripsenjoy.screens.moderator.common.ModNote
import com.tripsenjoy.screens.moderator.common.ModScreen
import com.tripsenjoy.screens.moderator.common.StatePreview
import com.tripsenjoy.screens.moderator.common.tone
import com.tripsenjoy.ui.components.AlertTone
import com.tripsenjoy.ui.components.ErrorKind
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeInlineAlert

// SCR-MOD-09 Access ended or vehicle reassigned. Shown in place of the vehicle home; check-ins are refused.
@Composable
fun AccessEndedOrVehicleReassigned() {
    ModScreen(
        title = "Access ended or vehicle reassigned",
        description = "Your access to this vehicle has ended. Check-in requests are refused.",
    ) {
        StatePreview(
            main = { AccessEndedMain() },
            error = { ModErrorBlock(ErrorKind.Forbidden) },
        )
    }
}

@Composable
private fun AccessEndedMain() {
    TeInlineAlert(
        tone = AlertTone.Warning,
        title = "Access to this vehicle has ended",
        message = "You are no longer assigned to this vehicle or trip. Check-ins are refused.",
    )
    TeCard(header = "What to do next") {
        ModNote("Contact the operations team through your organization. They can reassign the vehicle or restore access.")
    }
    // Sign-out belongs to the auth layer, which is not part of this screen set.
    TeButton(text = "Sign out", onClick = {}, variant = TeButtonVariant.Secondary)
}
