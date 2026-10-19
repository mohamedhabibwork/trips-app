package com.tripsenjoy.screens.driver.account

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.screens.driver.common.DriverSampleData
import com.tripsenjoy.screens.driver.common.DrvField
import com.tripsenjoy.screens.driver.common.DrvLoadingBlock
import com.tripsenjoy.screens.driver.common.DrvNote
import com.tripsenjoy.screens.driver.common.DrvProfile
import com.tripsenjoy.screens.driver.common.DrvScreen
import com.tripsenjoy.screens.driver.common.LocalDriverSession
import com.tripsenjoy.screens.driver.common.StatePreview
import com.tripsenjoy.screens.driver.common.isValidSeats
import com.tripsenjoy.screens.driver.common.isValidYear
import com.tripsenjoy.screens.driver.common.tone
import com.tripsenjoy.screens.driver.common.withPlaceholderFile
import com.tripsenjoy.screens.moderator.common.icon
import com.tripsenjoy.ui.components.AlertTone
import com.tripsenjoy.ui.components.BadgeTone
import com.tripsenjoy.ui.components.ErrorKind
import com.tripsenjoy.ui.components.IconName
import com.tripsenjoy.ui.components.TeBadge
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeFileUpload
import com.tripsenjoy.ui.components.TeInlineAlert
import com.tripsenjoy.ui.components.TeInput
import com.tripsenjoy.ui.components.TeKeyboardType
import com.tripsenjoy.ui.components.TeSelect
import com.tripsenjoy.ui.components.TeUploadFile

// SCR-DRV-10 Profile, vehicle and documents. Edits stay on this screen until saved.
@Composable
fun ProfileVehicleAndDocuments() {
    DrvScreen(
        title = "Profile, vehicle and documents",
        description = "Keep your profile, vehicle and insurance documents current.",
    ) {
        StatePreview(
            main = { ProfileMain() },
            loading = { DrvLoadingBlock("Loading your profile") },
            error = {
                TeInlineAlert(
                    tone = AlertTone.Error,
                    title = "Profile not saved",
                    message = "Check your connection and save again. Your changes are still on screen.",
                )
            },
        )
    }
}

@Composable
private fun ProfileMain() {
    val session = LocalDriverSession.current
    var draft by remember { mutableStateOf(session.profile) }
    var saved by remember { mutableStateOf(false) }
    fun edit(change: (DrvProfile) -> DrvProfile) {
        draft = change(draft)
        saved = false
    }
    TeInput(
        value = draft.fullName,
        onValueChange = { value -> edit { profile -> profile.copy(fullName = value) } },
        label = "Full name",
    )
    TeInput(
        value = draft.phone,
        onValueChange = { value -> edit { profile -> profile.copy(phone = value) } },
        label = "Phone",
        keyboardType = TeKeyboardType.Phone,
    )
    TeSelect(
        label = "Country",
        options = DriverSampleData.countries,
        value = draft.country,
        onValueChange = { value -> edit { profile -> profile.copy(country = value) } },
    )
    TeInput(
        value = draft.plate,
        onValueChange = { value -> edit { profile -> profile.copy(plate = value) } },
        label = "Plate number",
    )
    TeInput(
        value = draft.model,
        onValueChange = { value -> edit { profile -> profile.copy(model = value) } },
        label = "Vehicle model",
    )
    TeInput(
        value = draft.year,
        onValueChange = { value -> edit { profile -> profile.copy(year = value.take(YEAR_MAX_DIGITS)) } },
        label = "Vehicle year",
        keyboardType = TeKeyboardType.Number,
        error = if (draft.year.isNotEmpty() && !isValidYear(draft.year)) "Enter a 4-digit year." else null,
    )
    TeInput(
        value = draft.seats,
        onValueChange = { value -> edit { profile -> profile.copy(seats = value.take(SEATS_MAX_DIGITS)) } },
        label = "Seats",
        keyboardType = TeKeyboardType.Number,
        error = if (draft.seats.isNotEmpty() && !isValidSeats(draft.seats)) "Enter a seat count from 1 to 60." else null,
    )
    TeButton(
        text = "Save profile",
        enabled = draft.isComplete() && draft != session.profile,
        onClick = {
            session.saveProfile(draft)
            saved = true
        },
    )
    if (saved) {
        TeInlineAlert(tone = AlertTone.Success, title = "Profile saved", message = "Your details are up to date.")
    }
    DocumentsCard()
    TeCard(header = "Lab record") {
        DrvField(label = "Lab consent", value = "Given 03 Aug 2026 at registration")
        DrvField(label = "Last lab result date", value = "03 Aug 2026")
    }
}

@Composable
private fun DocumentsCard() {
    val session = LocalDriverSession.current
    var files by remember { mutableStateOf(listOf<TeUploadFile>()) }
    TeCard(header = "Documents") {
        session.documents.forEach { document ->
            DrvField(label = document.name, value = document.detail)
            TeBadge(
                label = if (document.expiringSoon) "Expiring soon" else "Valid",
                tone = if (document.expiringSoon) BadgeTone.Warning else BadgeTone.Success,
                icon = if (document.expiringSoon) IconName.Alert else IconName.Check,
            )
        }
        DrvNote("Documents that expire soon are flagged here. Renew them before the date.")
        TeFileUpload(
            label = "Upload renewed insurance",
            onPick = { files = files.withPlaceholderFile(prefix = "insurance") },
            files = files,
            onRemove = { name -> files = files.filterNot { it.name == name } },
            hint = "PDF or photo. Insurance must be valid for at least 3 months when you submit.",
        )
    }
}

private const val YEAR_MAX_DIGITS = 4
private const val SEATS_MAX_DIGITS = 2
