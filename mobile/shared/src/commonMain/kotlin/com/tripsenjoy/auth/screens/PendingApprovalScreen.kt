package com.tripsenjoy.auth.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.tripsenjoy.auth.ApplicationStatusResult
import com.tripsenjoy.auth.AuthRepository
import com.tripsenjoy.auth.AuthSessionHolder
import com.tripsenjoy.auth.AuthStrings
import com.tripsenjoy.auth.OnboardingDocumentInput
import com.tripsenjoy.auth.components.AuthScaffold
import com.tripsenjoy.ui.components.AlertTone
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonSize
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeCheckbox
import com.tripsenjoy.ui.components.TeInlineAlert
import com.tripsenjoy.ui.components.TeInput
import com.tripsenjoy.ui.components.TeSwitch
import com.tripsenjoy.ui.components.TeTextarea
import com.tripsenjoy.ui.theme.TripsEnjoyTheme
import kotlinx.coroutines.launch
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import kotlin.coroutines.cancellation.CancellationException

/**
 * The screen a supplier applicant sees between registration and approval (PRD Q5, D5, FR-ONB-01..07).
 *
 * When a supplier session token is present in [session], it loads `onboarding/getApplicationStatus`
 * and lets the applicant submit their driver/photographer application, respond to requested changes,
 * request a 7-day extension, or appeal a rejection.
 */
@Composable
fun PendingApprovalScreen(
    contact: String,
    locale: String = AuthStrings.defaultLocale,
    onBackToSignIn: () -> Unit,
    modifier: Modifier = Modifier,
    session: AuthSessionHolder? = null,
    role: String? = null,
) {
    val spacing = TripsEnjoyTheme.spacing
    val scope = rememberCoroutineScope()
    val hasToken = session?.repository?.hasStoredSession() == true

    var reloadKey by remember { mutableIntStateOf(0) }
    var statusResult by remember { mutableStateOf<ApplicationStatusResult?>(null) }
    var busy by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var feedbackMessage by remember { mutableStateOf<String?>(null) }

    // Driver / photographer submission state when no application has been filed yet
    val effectiveRole = role ?: session?.config?.registrationRole ?: AuthRepository.ROLE_PLATFORM_DRIVER
    var fullName by remember { mutableStateOf("Supplier Applicant") }
    var email by remember { mutableStateOf(if (contact.contains("@")) contact else "applicant@trips-enjoy.com") }
    var phone by remember { mutableStateOf(if (contact.startsWith("+")) contact else "+201012345678") }
    var ownsVehicle by remember { mutableStateOf(true) }
    var plateNumber by remember { mutableStateOf("ABC-1234") }
    var vehicleModel by remember { mutableStateOf("Toyota HiAce 2024") }
    var seatCapacity by remember { mutableStateOf("14") }
    var licenseNumber by remember { mutableStateOf("DL-EG-998877") }
    var licenseExpiry by remember { mutableStateOf("2028-12-31T00:00:00.000Z") }
    var insuranceExpiry by remember { mutableStateOf("2027-06-30T00:00:00.000Z") }
    var labDateIso by remember { mutableStateOf("2026-10-10T00:00:00.000Z") }
    var backgroundConsent by remember { mutableStateOf(true) }
    var labConsent by remember { mutableStateOf(true) }
    var cameraSummary by remember { mutableStateOf("Sony A7 IV + 24-70mm f/2.8 GM") }

    // Changes response / appeal state
    var resubmitNote by remember { mutableStateOf("") }
    var appealStatement by remember { mutableStateOf("") }

    LaunchedEffect(session, hasToken, reloadKey) {
        if (session == null || !hasToken) return@LaunchedEffect
        busy = true
        errorMessage = null
        try {
            statusResult = session.repository.getApplicationStatus()
        } catch (caught: CancellationException) {
            throw caught
        } catch (caught: Throwable) {
            errorMessage = caught.message ?: "Could not load application status."
        } finally {
            busy = false
        }
    }

    AuthScaffold(
        title = AuthStrings.t("auth.pending.title", locale),
        subtitle = AuthStrings.format("auth.pending.body", locale, mapOf("contact" to contact)),
        locale = locale,
        modifier = modifier,
    ) {
        TeInlineAlert(
            tone = AlertTone.Info,
            title = AuthStrings.t("auth.error.pendingApproval", locale),
        )

        if (errorMessage != null) {
            TeInlineAlert(
                tone = AlertTone.Error,
                title = errorMessage!!,
            )
        }

        if (feedbackMessage != null) {
            TeInlineAlert(
                tone = AlertTone.Success,
                title = feedbackMessage!!,
            )
        }

        val currentStatus = statusResult
        val application = currentStatus?.application

        if (session != null && hasToken && currentStatus != null && !currentStatus.hasApplication) {
            TeCard(header = "Complete your onboarding application") {
                Column(verticalArrangement = Arrangement.spacedBy(spacing.space2)) {
                    TeInput(
                        value = fullName,
                        onValueChange = { fullName = it },
                        label = "Full name",
                        enabled = !busy,
                    )
                    TeInput(
                        value = email,
                        onValueChange = { email = it },
                        label = "Email",
                        enabled = !busy,
                    )
                    TeInput(
                        value = phone,
                        onValueChange = { phone = it },
                        label = "Phone",
                        enabled = !busy,
                    )
                    if (effectiveRole == AuthRepository.ROLE_PLATFORM_PHOTOGRAPHER) {
                        TeInput(
                            value = cameraSummary,
                            onValueChange = { cameraSummary = it },
                            label = "Camera equipment summary",
                            enabled = !busy,
                        )
                        TeButton(
                            text = if (busy) "Submitting..." else "Submit photographer application",
                            onClick = {
                                if (busy) return@TeButton
                                scope.launch {
                                    busy = true
                                    errorMessage = null
                                    feedbackMessage = null
                                    try {
                                        val docs = (1..8).map { idx ->
                                            OnboardingDocumentInput(
                                                documentType = "portfolio_sample",
                                                storageKey = "onboarding/photographer/portfolio-$idx.jpg",
                                                mimeType = "image/jpeg",
                                                fileSizeBytes = 250_000,
                                            )
                                        }
                                        session.repository.submitPhotographerApplication(
                                            fullName = fullName.trim(),
                                            email = email.trim(),
                                            phone = phone.trim(),
                                            portfolioPhotoCount = docs.size,
                                            cameraEquipmentSummary = cameraSummary.trim(),
                                            documents = docs,
                                        )
                                        feedbackMessage = "Photographer application submitted."
                                        reloadKey += 1
                                    } catch (caught: CancellationException) {
                                        throw caught
                                    } catch (caught: Throwable) {
                                        errorMessage = caught.message ?: "Could not submit photographer application."
                                    } finally {
                                        busy = false
                                    }
                                }
                            },
                            modifier = Modifier.fillMaxWidth(),
                            enabled = !busy && fullName.isNotBlank() && cameraSummary.isNotBlank(),
                        )
                    } else {
                        TeSwitch(
                            checked = ownsVehicle,
                            onCheckedChange = { ownsVehicle = it },
                            label = "I drive my own vehicle",
                        )
                        if (ownsVehicle) {
                            TeInput(
                                value = plateNumber,
                                onValueChange = { plateNumber = it },
                                label = "Plate number",
                                enabled = !busy,
                            )
                            TeInput(
                                value = vehicleModel,
                                onValueChange = { vehicleModel = it },
                                label = "Vehicle model",
                                enabled = !busy,
                            )
                            TeInput(
                                value = seatCapacity,
                                onValueChange = { seatCapacity = it },
                                label = "Seats",
                                enabled = !busy,
                            )
                        }
                        TeInput(
                            value = licenseNumber,
                            onValueChange = { licenseNumber = it },
                            label = "Driver license number",
                            enabled = !busy,
                        )
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
                        TeButton(
                            text = if (busy) "Submitting..." else "Submit driver application",
                            onClick = {
                                if (busy) return@TeButton
                                scope.launch {
                                    busy = true
                                    errorMessage = null
                                    feedbackMessage = null
                                    try {
                                        val docs = buildList {
                                            add(
                                                OnboardingDocumentInput(
                                                    documentType = "driver_license",
                                                    storageKey = "onboarding/driver/license.pdf",
                                                    expiresAt = licenseExpiry,
                                                ),
                                            )
                                            add(
                                                OnboardingDocumentInput(
                                                    documentType = "insurance_policy",
                                                    storageKey = "onboarding/driver/insurance.pdf",
                                                    expiresAt = insuranceExpiry,
                                                ),
                                            )
                                            if (ownsVehicle) {
                                                add(
                                                    OnboardingDocumentInput(
                                                        documentType = "vehicle_registration",
                                                        storageKey = "onboarding/driver/registration.pdf",
                                                    ),
                                                )
                                            }
                                        }
                                        session.repository.submitDriverApplication(
                                            fullName = fullName.trim(),
                                            email = email.trim(),
                                            phone = phone.trim(),
                                            ownsVehicle = ownsVehicle,
                                            vehiclePlateNumber = if (ownsVehicle) plateNumber.trim() else null,
                                            vehicleModel = if (ownsVehicle) vehicleModel.trim() else null,
                                            vehicleSeatCapacity = if (ownsVehicle) seatCapacity.toIntOrNull() ?: 14 else null,
                                            driverLicenseNumber = licenseNumber.trim(),
                                            driverLicenseExpiry = licenseExpiry,
                                            insurancePolicyExpiry = insuranceExpiry,
                                            initialLabTestCompletedAt = labDateIso,
                                            labTestConsentSigned = labConsent,
                                            backgroundCheckConsentSigned = backgroundConsent,
                                            documents = docs,
                                        )
                                        feedbackMessage = "Driver application submitted."
                                        reloadKey += 1
                                    } catch (caught: CancellationException) {
                                        throw caught
                                    } catch (caught: Throwable) {
                                        errorMessage = caught.message ?: "Could not submit driver application."
                                    } finally {
                                        busy = false
                                    }
                                }
                            },
                            modifier = Modifier.fillMaxWidth(),
                            enabled = !busy && backgroundConsent && labConsent && fullName.isNotBlank(),
                        )
                    }
                }
            }
        } else if (session != null && application != null) {
            TeCard(header = "Application status: ${application.state}") {
                Column(verticalArrangement = Arrangement.spacedBy(spacing.space2)) {
                    Text(
                        text = "Type: ${application.applicationType}",
                        style = TripsEnjoyTheme.typography.body,
                        color = TripsEnjoyTheme.colors.ink,
                    )
                    if (!application.decisionNotes.isNullOrBlank()) {
                        Text(
                            text = "Reviewer notes: ${application.decisionNotes}",
                            style = TripsEnjoyTheme.typography.body,
                            color = TripsEnjoyTheme.colors.ink,
                        )
                    }
                    application.changesRequestedChecklist.forEach { item ->
                        Text(
                            text = "• ${item.field}: ${item.instruction}",
                            style = TripsEnjoyTheme.typography.caption,
                            color = TripsEnjoyTheme.colors.inkMuted,
                        )
                    }
                    if (application.state == "changes_requested") {
                        TeInput(
                            value = resubmitNote,
                            onValueChange = { resubmitNote = it },
                            label = "Update summary",
                            enabled = !busy,
                        )
                        TeButton(
                            text = if (busy) "Submitting..." else "Resubmit application",
                            onClick = {
                                if (busy) return@TeButton
                                scope.launch {
                                    busy = true
                                    errorMessage = null
                                    feedbackMessage = null
                                    try {
                                        session.repository.resubmitApplication(
                                            applicationId = application.id,
                                            updatedPayload = buildJsonObject {
                                                if (resubmitNote.isNotBlank()) {
                                                    put("resubmissionNotes", resubmitNote.trim())
                                                }
                                            },
                                        )
                                        feedbackMessage = "Application resubmitted."
                                        reloadKey += 1
                                    } catch (caught: CancellationException) {
                                        throw caught
                                    } catch (caught: Throwable) {
                                        errorMessage = caught.message ?: "Could not resubmit application."
                                    } finally {
                                        busy = false
                                    }
                                }
                            },
                            modifier = Modifier.fillMaxWidth(),
                            enabled = !busy,
                        )
                        if (!application.changesExtensionUsed) {
                            TeButton(
                                text = "Request 7-day extension",
                                onClick = {
                                    if (busy) return@TeButton
                                    scope.launch {
                                        busy = true
                                        errorMessage = null
                                        feedbackMessage = null
                                        try {
                                            session.repository.requestChangesExtension(
                                                applicationId = application.id,
                                                reason = "Need additional time to gather updated documents.",
                                            )
                                            feedbackMessage = "Extension granted."
                                            reloadKey += 1
                                        } catch (caught: CancellationException) {
                                            throw caught
                                        } catch (caught: Throwable) {
                                            errorMessage = caught.message ?: "Could not request extension."
                                        } finally {
                                            busy = false
                                        }
                                    }
                                },
                                variant = TeButtonVariant.Secondary,
                                modifier = Modifier.fillMaxWidth(),
                                enabled = !busy,
                            )
                        }
                    }
                    if (application.state == "rejected" && application.appealStatement.isNullOrBlank()) {
                        TeTextarea(
                            value = appealStatement,
                            onValueChange = { appealStatement = it },
                            label = "Appeal statement",
                            supportingText = "Explain what changed since the rejection.",
                            maxLength = 1000,
                        )
                        TeButton(
                            text = if (busy) "Submitting..." else "Submit appeal",
                            onClick = {
                                if (busy || appealStatement.trim().length < 10) return@TeButton
                                scope.launch {
                                    busy = true
                                    errorMessage = null
                                    feedbackMessage = null
                                    try {
                                        session.repository.submitAppeal(
                                            applicationId = application.id,
                                            appealStatement = appealStatement.trim(),
                                        )
                                        feedbackMessage = "Appeal submitted."
                                        reloadKey += 1
                                    } catch (caught: CancellationException) {
                                        throw caught
                                    } catch (caught: Throwable) {
                                        errorMessage = caught.message ?: "Could not submit appeal."
                                    } finally {
                                        busy = false
                                    }
                                }
                            },
                            modifier = Modifier.fillMaxWidth(),
                            enabled = !busy && appealStatement.trim().length >= 10,
                        )
                    }
                }
            }
        }

        TeButton(
            text = AuthStrings.t("auth.pending.backToSignIn", locale),
            onClick = {
                session?.repository?.clearLocalSession()
                onBackToSignIn()
            },
            modifier = Modifier.fillMaxWidth(),
            size = TeButtonSize.Large,
            variant = TeButtonVariant.Secondary,
        )
    }
}
