package com.tripsenjoy.screens.public.signup

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.public.common.PublicBackToStart
import com.tripsenjoy.screens.public.common.PublicCountryOptions
import com.tripsenjoy.screens.public.common.PublicNote
import com.tripsenjoy.screens.public.common.PublicScreenIds
import com.tripsenjoy.screens.public.common.PublicSection
import com.tripsenjoy.screens.public.common.PublicStateCopy
import com.tripsenjoy.screens.public.common.PublicViewState
import com.tripsenjoy.screens.public.common.StatePreview
import com.tripsenjoy.screens.public.common.publicFieldsFilled
import com.tripsenjoy.screens.public.common.publicSampleUpload
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeFileUpload
import com.tripsenjoy.ui.components.TeInput
import com.tripsenjoy.ui.components.TeKeyboardType
import com.tripsenjoy.ui.components.TePageHeader
import com.tripsenjoy.ui.components.TeSelect
import com.tripsenjoy.ui.components.TeUploadFile

// SCR-PUB-06 Organization sign-up. WEB ONLY: the mobile apps do not open this screen (the chooser shows a message instead).
// Registers an organization for manual admin review (OD-16). Plan is not chosen here: Starter is assigned on approval (D-24).
// Owners verify both email and phone (D-20). Country is required (FR-AUTH-02). No staff access before approval.
private val organizationCopy = PublicStateCopy(loadingMessage = "Submitting your organization...")

@Composable
fun OrganizationSignUp() {
    val nav = LocalScreenNavigator.current
    var legalName by remember { mutableStateOf("") }
    var ownerName by remember { mutableStateOf("") }
    var ownerEmail by remember { mutableStateOf("") }
    var ownerPhone by remember { mutableStateOf("") }
    var country by remember { mutableStateOf<String?>(null) }
    var commercialRegistration by remember { mutableStateOf("") }
    var registrationFiles by remember { mutableStateOf<List<TeUploadFile>>(emptyList()) }
    var taxNumber by remember { mutableStateOf("") }
    var billingContactName by remember { mutableStateOf("") }
    var billingContactEmail by remember { mutableStateOf("") }

    val canSubmit = publicFieldsFilled(
        legalName,
        country,
        commercialRegistration,
        ownerName,
        ownerEmail,
        ownerPhone,
    ) && registrationFiles.isNotEmpty()

    StatePreview(namedStates = listOf(PublicViewState.Loading), copy = organizationCopy) {
        TePageHeader(
            title = "Register an organization",
            description = "Web only. Register your organization so an admin can review it.",
        )
        PublicSection(title = "Organization") {
            TeInput(value = legalName, onValueChange = { legalName = it }, label = "Legal name")
            TeSelect(
                label = "Country",
                options = PublicCountryOptions,
                value = country,
                onValueChange = { country = it },
                supportingText = "Required",
            )
            TeInput(
                value = commercialRegistration,
                onValueChange = { commercialRegistration = it },
                label = "Commercial registration number",
            )
            TeFileUpload(
                label = "Commercial registration document",
                onPick = { registrationFiles = listOf(publicSampleUpload("commercial-registration.pdf")) },
                files = registrationFiles,
                onRemove = { name -> registrationFiles = registrationFiles.filterNot { it.name == name } },
                hint = "Required. PDF or image.",
            )
            TeInput(value = taxNumber, onValueChange = { taxNumber = it }, label = "Tax number")
        }
        PublicSection(title = "Owner") {
            TeInput(value = ownerName, onValueChange = { ownerName = it }, label = "Owner name")
            TeInput(
                value = ownerEmail,
                onValueChange = { ownerEmail = it },
                label = "Owner email",
                keyboardType = TeKeyboardType.Email,
            )
            TeInput(
                value = ownerPhone,
                onValueChange = { ownerPhone = it },
                label = "Owner phone",
                keyboardType = TeKeyboardType.Phone,
            )
        }
        PublicSection(title = "Billing contact") {
            TeInput(
                value = billingContactName,
                onValueChange = { billingContactName = it },
                label = "Billing contact name",
            )
            TeInput(
                value = billingContactEmail,
                onValueChange = { billingContactEmail = it },
                label = "Billing contact email",
                keyboardType = TeKeyboardType.Email,
            )
        }
        PublicNote("Starter plan is assigned when your application is approved. You do not choose a plan now.")
        PublicNote("Staff access opens only after approval.")
        TeButton(
            text = "Submit organization",
            onClick = { nav.open(PublicScreenIds.VERIFICATION) },
            enabled = canSubmit,
            modifier = Modifier.fillMaxWidth(),
        )
        PublicBackToStart()
    }
}
