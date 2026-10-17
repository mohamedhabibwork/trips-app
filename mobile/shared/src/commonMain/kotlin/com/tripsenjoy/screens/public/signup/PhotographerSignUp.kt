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
import com.tripsenjoy.screens.public.common.PublicStateCopy
import com.tripsenjoy.screens.public.common.PublicViewState
import com.tripsenjoy.screens.public.common.StatePreview
import com.tripsenjoy.screens.public.common.publicFieldsFilled
import com.tripsenjoy.screens.public.common.publicSampleUpload
import com.tripsenjoy.ui.components.AlertTone
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeFileUpload
import com.tripsenjoy.ui.components.TeInlineAlert
import com.tripsenjoy.ui.components.TeInput
import com.tripsenjoy.ui.components.TeKeyboardType
import com.tripsenjoy.ui.components.TePageHeader
import com.tripsenjoy.ui.components.TeSelect
import com.tripsenjoy.ui.components.TeUploadFile
import kotlinx.coroutines.launch
import kotlin.coroutines.cancellation.CancellationException

// SCR-PUB-05 Photographer sign-up. Applies to join the photographer pool. Access opens only after approval (PUB-17).
// Photographers verify both email and phone (D-20). Submit is blocked while fewer than 8 portfolio photos are added (FR-ONB-06, D-01).
private const val PORTFOLIO_MINIMUM_PHOTOS = 8
private val photographerCopy = PublicStateCopy(loadingMessage = "Submitting your application...")

@Composable
fun PhotographerSignUp() {
    val nav = LocalScreenNavigator.current
    val session = LocalAuthSessionOrNull.current
    val scope = rememberCoroutineScope()
    var nameOrStudio by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var country by remember { mutableStateOf<String?>(null) }
    var portfolio by remember { mutableStateOf<List<TeUploadFile>>(emptyList()) }
    var busy by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    val photosReady = portfolio.size >= PORTFOLIO_MINIMUM_PHOTOS
    val canSubmit = !busy && publicFieldsFilled(nameOrStudio, email, phone, country) && photosReady

    StatePreview(namedStates = listOf(PublicViewState.Loading), copy = photographerCopy) {
        TePageHeader(
            title = "Apply as a photographer",
            description = "Access opens only after an admin approves your application.",
        )
        if (errorMessage != null) {
            TeInlineAlert(tone = AlertTone.Error, title = errorMessage!!)
        }
        TeInput(
            value = nameOrStudio,
            onValueChange = { nameOrStudio = it },
            label = "Name or studio name",
        )
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
        TeFileUpload(
            label = "Add a portfolio photo",
            onPick = { portfolio = portfolio + publicSampleUpload("photo-${portfolio.size + 1}.jpg") },
            files = portfolio,
            onRemove = { name -> portfolio = portfolio.filterNot { it.name == name } },
            hint = "Add at least $PORTFOLIO_MINIMUM_PHOTOS photos. ${portfolio.size} of $PORTFOLIO_MINIMUM_PHOTOS added.",
        )
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
                        val docs = portfolio.map { file ->
                            OnboardingDocumentInput(
                                documentType = "portfolio_sample",
                                storageKey = "onboarding/photographer/${file.name}",
                                mimeType = "image/jpeg",
                                fileSizeBytes = 250_000,
                            )
                        }
                        session.repository.submitPhotographerApplication(
                            fullName = nameOrStudio.trim(),
                            email = email.trim(),
                            phone = phone.trim(),
                            portfolioPhotoCount = portfolio.size,
                            cameraEquipmentSummary = "Professional camera kit (${nameOrStudio.trim()})",
                            documents = docs,
                        )
                        nav.open(PublicScreenIds.APPLICATION_STATUS)
                    } catch (caught: CancellationException) {
                        throw caught
                    } catch (caught: Throwable) {
                        errorMessage = caught.message ?: "Could not submit photographer application."
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
