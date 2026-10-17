package com.tripsenjoy.screens.shared.settings

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.shared.common.ScreenBody
import com.tripsenjoy.screens.shared.common.ScreenNote
import com.tripsenjoy.ui.TripsApp
import com.tripsenjoy.ui.components.IconName
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeChip
import com.tripsenjoy.ui.components.TeIcon
import com.tripsenjoy.ui.components.TeInput
import com.tripsenjoy.ui.components.TePageHeader
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

// SCR-SHR-10 Language switch and RTL. The switch keeps form data and the current step. The preview block mirrors
// when Arabic is on: navigation, forms and direction icons flip (UI-01, UI-02). Labels stay in English.
// Done returns to the screen that opened this one.
@Composable
fun LanguageSwitchAndRtl() {
    val nav = LocalScreenNavigator.current
    var arabic by remember { mutableStateOf(false) }
    var fullName by remember { mutableStateOf("") }
    ScreenBody {
        TePageHeader(title = "Language switch and RTL", description = "Switch language without losing your place")
        Row(horizontalArrangement = Arrangement.spacedBy(TripsEnjoyTheme.spacing.space2)) {
            TeChip(label = "English", selected = !arabic, onClick = { arabic = false })
            TeChip(label = "Arabic", selected = arabic, onClick = { arabic = true })
        }
        TripsApp(rtl = arabic) {
            Column(verticalArrangement = Arrangement.spacedBy(TripsEnjoyTheme.spacing.space4)) {
                TeInput(
                    value = fullName,
                    onValueChange = { fullName = it },
                    label = "Full name",
                    supportingText = "Form data is kept when the language changes.",
                )
                TeCard(header = "Next step") {
                    Row(horizontalArrangement = Arrangement.spacedBy(TripsEnjoyTheme.spacing.space2)) {
                        ScreenNote(text = "Continue")
                        TeIcon(
                            name = IconName.Arrow,
                            contentDescription = null,
                            flipInRtl = true,
                        )
                    }
                }
            }
        }
        TeButton(text = "Done", onClick = { nav.back() }, variant = TeButtonVariant.Secondary)
    }
}
