package com.tripsenjoy.screens.traveler.account

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.screens.traveler.common.BackButton
import com.tripsenjoy.screens.traveler.common.LabelValue
import com.tripsenjoy.screens.traveler.common.OpenScreenButton
import com.tripsenjoy.screens.traveler.common.ScreenPage
import com.tripsenjoy.screens.traveler.common.ScreenSection
import com.tripsenjoy.screens.traveler.common.StatePreview
import com.tripsenjoy.screens.traveler.common.TravelerScreenState
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeInput
import com.tripsenjoy.ui.components.TeKeyboardType
import com.tripsenjoy.ui.components.TeOption
import com.tripsenjoy.ui.components.TeSelect
import com.tripsenjoy.ui.components.TeSwitch

// SCR-TRV-19. Profile, language and channels per category. Language change applies at once to the interface
// and to notifications. Quiet hours (10 pm to 7 am for SMS and push, unless urgent) are shown as a notice.
// Save needs a name, a country, and an email or a phone (D-20).
private val LANGUAGE_OPTIONS = listOf(
    TeOption(value = "ar", label = "Arabic"),
    TeOption(value = "en", label = "English"),
)

@Composable
fun ProfileLanguageAndNotifications() {
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var country by remember { mutableStateOf("") }
    var language by remember { mutableStateOf<String?>(null) }
    var bookingUpdates by remember { mutableStateOf(true) }
    var tripUpdates by remember { mutableStateOf(true) }
    val canSave = name.isNotBlank() && country.isNotBlank() && (email.isNotBlank() || phone.isNotBlank())

    ScreenPage(title = "Profile, language and notifications") {
        StatePreview(listedStates = setOf(TravelerScreenState.Loading, TravelerScreenState.Error)) {
            ScreenSection(header = "Profile") {
                TeInput(
                    value = name,
                    onValueChange = { name = it },
                    label = "Name",
                    supportingText = "Required",
                )
                TeInput(
                    value = email,
                    onValueChange = { email = it },
                    label = "Email",
                    keyboardType = TeKeyboardType.Email,
                    supportingText = "Email or phone is required",
                )
                TeInput(
                    value = phone,
                    onValueChange = { phone = it },
                    label = "Phone",
                    keyboardType = TeKeyboardType.Phone,
                )
                TeInput(
                    value = country,
                    onValueChange = { country = it },
                    label = "Country",
                    supportingText = "Required",
                )
                TeSelect(
                    label = "Language",
                    options = LANGUAGE_OPTIONS,
                    value = language,
                    onValueChange = { language = it },
                    placeholder = "Select a language",
                )
            }
            ScreenSection(header = "Notifications") {
                TeSwitch(
                    checked = bookingUpdates,
                    onCheckedChange = { bookingUpdates = it },
                    label = "Booking and payment updates",
                )
                TeSwitch(
                    checked = tripUpdates,
                    onCheckedChange = { tripUpdates = it },
                    label = "Trip day updates",
                )
                LabelValue(label = "Quiet hours", value = "10 pm to 7 am for SMS and push, unless urgent")
            }
            ScreenSection(header = "Account") {
                OpenScreenButton(text = "Plans and upgrade", screenId = "SCR-TRV-18", variant = TeButtonVariant.Secondary)
                OpenScreenButton(text = "Privacy: data copy and deletion", screenId = "SCR-TRV-20", variant = TeButtonVariant.Secondary)
                OpenScreenButton(text = "Supplier application", screenId = "SCR-TRV-21", variant = TeButtonVariant.Secondary)
                TeButton(text = "Switch role", onClick = {}, variant = TeButtonVariant.Ghost)
            }
            BackButton(text = "Save changes", variant = TeButtonVariant.Primary, enabled = canSave)
        }
    }
}
