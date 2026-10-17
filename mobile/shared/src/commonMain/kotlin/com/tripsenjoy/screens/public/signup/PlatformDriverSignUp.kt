package com.tripsenjoy.screens.public.signup

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.tripsenjoy.auth.LocalAuthSessionOrNull
import com.tripsenjoy.auth.OnboardingDocumentInput
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.public.common.PublicBackToStart
import com.tripsenjoy.screens.public.common.PublicCountryOptions
import com.tripsenjoy.screens.public.common.PublicScreenIds
import com.tripsenjoy.screens.public.common.PublicSection
import com.tripsenjoy.screens.public.common.PublicStateCopy
import com.tripsenjoy.screens.public.common.PublicViewState
import com.tripsenjoy.screens.public.common.StatePreview
import com.tripsenjoy.screens.public.common.publicFieldsFilled
import com.tripsenjoy.screens.public.common.publicSampleUpload
import com.tripsenjoy.ui.components.AlertTone
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeCheckbox
import com.tripsenjoy.ui.components.TeFileUpload
import com.tripsenjoy.ui.components.TeInlineAlert
import com.tripsenjoy.ui.components.TeInput
import com.tripsenjoy.ui.components.TeKeyboardType
import com.tripsenjoy.ui.components.TePageHeader
import com.tripsenjoy.ui.components.TeSelect
import com.tripsenjoy.ui.components.TeSwitch
import com.tripsenjoy.ui.components.TeUploadFile
import kotlinx.coroutines.launch
import kotlin.coroutines.cancellation.CancellationException

// SCR-PUB-04 Platform driver sign-up. Applies to join the driver pool. Access opens only after approval (PUB-17).
// Drivers verify both email and phone (D-20). Submit stays disabled until the required fields, documents and consents are in.
// Date rules (insurance at least 3 months, lab result within 30 days) are checked by the app, not in this preview.
private val driverCopy = PublicStateCopy(loadingMessage = "Submitting your application...")

@Composable
fun PlatformDriverSignUp() {
    val nav = LocalScreenNavigator.current
    val session = LocalAuthSessionOrNull.current
    val scope = rememberCoroutineScope()
    var fullName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var country by remember { mutableStateOf<String?>(null) }
    var ownsVehicle by remember { mutableStateOf(false) }
    var plate by remember { mutableStateOf("") }
    var model by remember { mutableStateOf("") }
    var year by remember { mutableStateOf("") }
    var seats by remember { mutableStateOf("") }
    var registrationFiles by remember { mutableStateOf<List<TeUploadFile>>(emptyList()) }
    var insuranceFiles by remember { mutableStateOf<List<TeUploadFile>>(emptyList()) }
    var labDate by remember { mutableStateOf("") }
    var backgroundConsent by remember { mutableStateOf(false) }
    var labConsent by remember { mutableStateOf(false) }
    var busy by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    val vehicleReady = !ownsVehicle || publicFieldsFilled(plate, model, year, seats)
    val documentsReady = registrationFiles.isNotEmpty() && insuranceFiles.isNotEmpty()
    val canSubmit = !busy && publicFieldsFilled(fullName, email, phone, country, labDate) &&
        backgroundConsent && labConsent && vehicleReady && documentsReady

    StatePreview(namedStates = listOf(PublicViewState.Loading), copy = driverCopy) {
        TePageHeader(
            title = "Apply as a platform driver",
            description = "Access opens only after an admin approves your application.",
        )
        if (errorMessage != null) {
            TeInlineAlert(tone = AlertTone.Error, title = errorMessage!!)
        }
        PublicSection(title = "Your details") {
            TeInput(value = fullName, onValueChange = { fullName = it }, label = "Full name")
            TeInput(
                value = email,
                onValueChange = { email = it },
                label = "Email",
                keyboardType = TeKeyboardType.Email,
            )
            TeInput(
                value = phone,
                onValueChange = { phone = it },
                label = "Phone",
                keyboardType = TeKeyboardType.Phone,
            )
            TeSelect(
                label = "Country",
                options = PublicCountryOptions,
                value = country,
                onValueChange = { country = it },
                supportingText = "Required",
            )
        }
        PublicSection(title = "Your vehicle") {
            TeSwitch(
                checked = ownsVehicle,
                onCheckedChange = { ownsVehicle = it },
                label = "I drive my own vehicle",
            )
            if (ownsVehicle) {
                TeInput(value = plate, onValueChange = { plate = it }, label = "Plate number")
                TeInput(value = model, onValueChange = { model = it }, label = "Model")
                TeInput(
                    value = year,
                    onValueChange = { year = it },
                    label = "Year",
                    keyboardType = TeKeyboardType.Number,
                )
                TeInput(
                    value = seats,
                    onValueChange = { seats = it },
                    label = "Seats",
                    keyboardType = TeKeyboardType.Number,
                )
            }
        }
        PublicSection(title = "Documents") {
            TeFileUpload(
                label = "Registration document",
                onPick = { registrationFiles = listOf(publicSampleUpload("registration.pdf")) },
                files = registrationFiles,
                onRemove = { name -> registrationFiles = registrationFiles.filterNot { it.name == name } },
                hint = "Required. PDF or image.",
            )
            TeFileUpload(
                label = "Insurance document",
                onPick = { insuranceFiles = listOf(publicSampleUpload("insurance.pdf")) },
                files = insuranceFiles,
                onRemove = { name -> insuranceFiles = insuranceFiles.filterNot { it.name == name } },
                hint = "Required. Must be valid for at least 3 more months.",
            )
            TeInput(
                value = labDate,
                onValueChange = { labDate = it },
                label = "Initial lab result date",
                supportingText = "Required. Must be within the last 30 days. Use YYYY-MM-DD.",
            )
        }
        PublicSection(title = "Consent") {
            TeCheckbox(
                checked = backgroundConsent,
                onCheckedChange = { backgroundConsent = it },
                label = "I consent to a background check",
            )
            TeCheckbox(
                checked = labConsent,
                onCheckedChange = { labConsent = it },
                label = "I consent to a lab test",
            )
        }
        TeButton(
            text = if (busy) "Submitting..." else "Submit application",
            onClick = {
                if (session == null || !session.repository.hasStoredSession()) {
                    nav.open(PublicScreenIds.VERIFICATION)
                    return@TeButton
                }
                scope.launch {
                    busy = true
                    errorMessage = null
                    try {
                        val labIso = if (labDate.contains("T")) labDate.trim() else "${labDate.trim()}T00:00:00.000Z"
                        val docs = buildList {
                            add(
                                OnboardingDocumentInput(
                                    documentType = "driver_license",
                                    storageKey = "onboarding/driver/${registrationFiles.first().name}",
                                    expiresAt = "2028-12-31T00:00:00.000Z",
                                ),
                            )
                            add(
                                OnboardingDocumentInput(
                                    documentType = "insurance_policy",
                                    storageKey = "onboarding/driver/${insuranceFiles.first().name}",
                                    expiresAt = "2027-06-30T00:00:00.000Z",
                                ),
                            )
                            if (ownsVehicle) {
                                add(
                                    OnboardingDocumentInput(
                                        documentType = "vehicle_registration",
                                        storageKey = "onboarding/driver/vehicle-${registrationFiles.first().name}",
                                    ),
                                )
                            }
                        }
                        session.repository.submitDriverApplication(
                            fullName = fullName.trim(),
                            email = email.trim(),
                            phone = phone.trim(),
                            ownsVehicle = ownsVehicle,
                            vehiclePlateNumber = if (ownsVehicle) plate.trim() else null,
                            vehicleModel = if (ownsVehicle) "${model.trim()} (${year.trim()})" else null,
                            vehicleSeatCapacity = if (ownsVehicle) seats.trim().toIntOrNull() ?: 4 else null,
                            driverLicenseNumber = if (ownsVehicle) "DL-${plate.trim()}" else "DL-PLATFORM-DRIVER",
                            driverLicenseExpiry = "2028-12-31T00:00:00.000Z",
                            insurancePolicyExpiry = "2027-06-30T00:00:00.000Z",
                            initialLabTestCompletedAt = labIso,
                            labTestConsentSigned = labConsent,
                            backgroundCheckConsentSigned = backgroundConsent,
                            documents = docs,
                        )
                        nav.open(PublicScreenIds.APPLICATION_STATUS)
                    } catch (caught: CancellationException) {
                        throw caught
                    } catch (caught: Throwable) {
                        errorMessage = caught.message ?: "Could not submit driver application."
                    } finally {
                        busy = false
                    }
                }
            },
            enabled = canSubmit,
            modifier = Modifier.fillMaxWidth(),
        )
        PublicBackToStart()
    }
}
