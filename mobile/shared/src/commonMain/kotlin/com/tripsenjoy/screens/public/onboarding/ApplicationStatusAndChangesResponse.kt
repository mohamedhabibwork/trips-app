package com.tripsenjoy.screens.public.onboarding

import androidx.compose.foundation.layout.fillMaxWidth
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
import com.tripsenjoy.auth.LocalAuthSessionOrNull
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.moderator.common.icon
import com.tripsenjoy.screens.public.common.PublicBackToStart
import com.tripsenjoy.screens.public.common.PublicNote
import com.tripsenjoy.screens.public.common.PublicScreenIds
import com.tripsenjoy.screens.public.common.PublicStateCopy
import com.tripsenjoy.screens.public.common.PublicViewState
import com.tripsenjoy.screens.public.common.StatePreview
import com.tripsenjoy.ui.components.AlertTone
import com.tripsenjoy.ui.components.ApplicationStatus
import com.tripsenjoy.ui.components.TeBadge
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeInlineAlert
import com.tripsenjoy.ui.components.TePageHeader
import com.tripsenjoy.ui.components.icon
import com.tripsenjoy.ui.components.tone
import kotlinx.coroutines.launch
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import kotlin.coroutines.cancellation.CancellationException

// SCR-PUB-17 Application status and changes response. Applicant view for organization, driver and photographer (FR-ONB-01).
// Shows the Changes Requested state, which has the primary action (resubmit). Other states: Submitted, Pending Review (2 working days),
// Approved (goes to the role home), Rejected (re-apply after 30 days), Closed. The overdue flag is admin-only (FR-ONB-03).
// Appeal (PUB-18) is the secondary action.
private val statusCopy = PublicStateCopy(
    errorTitle = "Application status could not load",
    errorMessage = "Try again later. Your application is not changed.",
)

private fun mapApplicationStatus(state: String?): ApplicationStatus = when (state) {
    "submitted", "under_review" -> ApplicationStatus.Pending
    "changes_requested" -> ApplicationStatus.ChangesRequested
    "approved" -> ApplicationStatus.Approved
    "rejected", "closed" -> ApplicationStatus.Rejected
    else -> ApplicationStatus.ChangesRequested
}

@Composable
fun ApplicationStatusAndChangesResponse() {
    val nav = LocalScreenNavigator.current
    val session = LocalAuthSessionOrNull.current
    val scope = rememberCoroutineScope()
    var reloadKey by remember { mutableIntStateOf(0) }
    var statusResult by remember { mutableStateOf<ApplicationStatusResult?>(null) }
    var busy by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var feedbackMessage by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(session, reloadKey) {
        if (session == null || !session.repository.hasStoredSession()) return@LaunchedEffect
        busy = true
        errorMessage = null
        try {
            statusResult = session.repository.getApplicationStatus()
        } catch (caught: CancellationException) {
            throw caught
        } catch (caught: Throwable) {
            errorMessage = caught.message ?: "Application status could not load."
        } finally {
            busy = false
        }
    }

    val application = statusResult?.application
    val status = mapApplicationStatus(application?.state)
    val checklist = application?.changesRequestedChecklist.orEmpty()
    val dueDisplay = application?.changesDueAt?.take(10) ?: "31 Oct 2026"

    StatePreview(namedStates = listOf(PublicViewState.Error), copy = statusCopy) {
        TePageHeader(
            title = "Application status",
            description = "Reply to the requested changes by $dueDisplay.",
        )
        TeBadge(label = status.word, tone = status.tone(), icon = status.icon())
        if (errorMessage != null) {
            TeInlineAlert(tone = AlertTone.Error, title = errorMessage!!)
        }
        if (feedbackMessage != null) {
            TeInlineAlert(tone = AlertTone.Success, title = feedbackMessage!!)
        }
        TeInlineAlert(
            tone = AlertTone.Warning,
            title = status.word,
            message = application?.decisionNotes
                ?: "Make the changes below and resubmit. The application closes if there is no reply within 14 days.",
        )
        TeCard(header = "Requested changes") {
            if (checklist.isNotEmpty()) {
                checklist.forEach { item ->
                    PublicNote("${item.field}: ${item.instruction}")
                }
            } else {
                PublicNote("Replace the registration document with a clearer scan.")
                PublicNote("Confirm the billing contact email address.")
            }
        }
        TeButton(
            text = if (busy) "Submitting..." else "Resubmit application",
            onClick = {
                if (session == null || application == null) return@TeButton
                scope.launch {
                    busy = true
                    errorMessage = null
                    feedbackMessage = null
                    try {
                        session.repository.resubmitApplication(
                            applicationId = application.id,
                            updatedPayload = buildJsonObject {
                                put("resubmittedFromMobile", true)
                            },
                        )
                        feedbackMessage = "Application resubmitted for review."
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
            enabled = !busy,
            modifier = Modifier.fillMaxWidth(),
        )
        if (application != null && application.state == "changes_requested" && !application.changesExtensionUsed) {
            TeButton(
                text = "Request 7-day extension",
                onClick = {
                    if (session == null || busy) return@TeButton
                    scope.launch {
                        busy = true
                        errorMessage = null
                        feedbackMessage = null
                        try {
                            session.repository.requestChangesExtension(
                                applicationId = application.id,
                                reason = "Requesting 7-day extension from mobile.",
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
                enabled = !busy,
                modifier = Modifier.fillMaxWidth(),
            )
        }
        TeButton(
            text = "Appeal a rejection",
            onClick = { nav.open(PublicScreenIds.APPEAL_REJECTION) },
            variant = TeButtonVariant.Ghost,
            modifier = Modifier.fillMaxWidth(),
        )
        PublicBackToStart()
    }
}
