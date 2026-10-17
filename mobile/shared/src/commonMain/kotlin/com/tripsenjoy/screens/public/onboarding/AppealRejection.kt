package com.tripsenjoy.screens.public.onboarding

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.tripsenjoy.auth.ApplicationStatusResult
import com.tripsenjoy.auth.LocalAuthSessionOrNull
import com.tripsenjoy.auth.OnboardingDocumentInput
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.public.common.PublicBackToStart
import com.tripsenjoy.screens.public.common.PublicScreenColumn
import com.tripsenjoy.screens.public.common.publicSampleUpload
import com.tripsenjoy.ui.components.AlertTone
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeFileUpload
import com.tripsenjoy.ui.components.TeInlineAlert
import com.tripsenjoy.ui.components.TePageHeader
import com.tripsenjoy.ui.components.TeTextarea
import com.tripsenjoy.ui.components.TeUploadFile
import com.tripsenjoy.ui.theme.TripsEnjoyTheme
import kotlinx.coroutines.launch
import kotlin.coroutines.cancellation.CancellationException

// SCR-PUB-18 Appeal a rejection. Open while the appeal window is open (FR-ONB-05, proposed D-237).
// Shows the rejection reason as recorded, an appeal statement and supporting files. Traveler access is unchanged (BRL-06).
private const val APPEAL_STATEMENT_MAX_CHARACTERS = 1000

@Composable
fun AppealRejection() {
    val nav = LocalScreenNavigator.current
    val session = LocalAuthSessionOrNull.current
    val scope = rememberCoroutineScope()
    val colors = TripsEnjoyTheme.colors
    var statement by remember { mutableStateOf("") }
    var supportingFiles by remember { mutableStateOf<List<TeUploadFile>>(emptyList()) }
    var statusResult by remember { mutableStateOf<ApplicationStatusResult?>(null) }
    var busy by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var submitted by remember { mutableStateOf(false) }

    LaunchedEffect(session) {
        if (session == null || !session.repository.hasStoredSession()) return@LaunchedEffect
        try {
            statusResult = session.repository.getApplicationStatus()
        } catch (caught: CancellationException) {
            throw caught
        } catch (_: Throwable) {
            // Keep stand-in copy when offline or previewing without a live application
        }
    }

    val application = statusResult?.application
    val canSubmit = !busy && !submitted &&
        statement.isNotBlank() && statement.length <= APPEAL_STATEMENT_MAX_CHARACTERS

    PublicScreenColumn {
        TePageHeader(
            title = "Appeal the rejection",
            description = "Available while the appeal window is open.",
        )
        if (errorMessage != null) {
            TeInlineAlert(tone = AlertTone.Error, title = errorMessage!!)
        }
        if (submitted) {
            TeInlineAlert(
                tone = AlertTone.Success,
                title = "Appeal submitted",
                message = "Your appeal is now in the admin review queue.",
            )
        }
        TeCard(header = "Rejection reason as recorded") {
            Text(
                text = application?.decisionNotes
                    ?: application?.decisionReasonCode
                    ?: "The reason recorded by the reviewer appears here.",
                style = TripsEnjoyTheme.typography.body,
                color = colors.ink,
            )
        }
        TeTextarea(
            value = statement,
            onValueChange = { statement = it },
            label = "Your appeal",
            supportingText = "Explain what changed.",
            maxLength = APPEAL_STATEMENT_MAX_CHARACTERS,
        )
        TeFileUpload(
            label = "Supporting files",
            onPick = { supportingFiles = supportingFiles + publicSampleUpload("supporting-file-${supportingFiles.size + 1}.pdf") },
            files = supportingFiles,
            onRemove = { name -> supportingFiles = supportingFiles.filterNot { it.name == name } },
            hint = "Optional. PDF or image.",
        )
        TeButton(
            text = if (busy) "Submitting..." else "Submit appeal",
            onClick = {
                if (session == null || application == null) {
                    submitted = true
                    return@TeButton
                }
                scope.launch {
                    busy = true
                    errorMessage = null
                    try {
                        val docs = supportingFiles.map { file ->
                            OnboardingDocumentInput(
                                documentType = "identity_document",
                                storageKey = "onboarding/appeal/${file.name}",
                            )
                        }
                        session.repository.submitAppeal(
                            applicationId = application.id,
                            appealStatement = statement.trim(),
                            documents = docs,
                        )
                        submitted = true
                    } catch (caught: CancellationException) {
                        throw caught
                    } catch (caught: Throwable) {
                        errorMessage = caught.message ?: "Could not submit appeal."
                    } finally {
                        busy = false
                    }
                }
            },
            enabled = canSubmit,
            modifier = Modifier.fillMaxWidth(),
        )
        TeButton(
            text = "Back to application status",
            onClick = { nav.back() },
            variant = TeButtonVariant.Ghost,
            modifier = Modifier.fillMaxWidth(),
        )
        PublicBackToStart()
    }
}
