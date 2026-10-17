package com.tripsenjoy.screens.traveler.account

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.auth.ApplicationStatusResult
import com.tripsenjoy.auth.LocalAuthSessionOrNull
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.moderator.common.icon
import com.tripsenjoy.screens.public.common.PublicScreenIds
import com.tripsenjoy.screens.traveler.common.BackButton
import com.tripsenjoy.screens.traveler.common.LabelValue
import com.tripsenjoy.screens.traveler.common.ScreenNote
import com.tripsenjoy.screens.traveler.common.ScreenPage
import com.tripsenjoy.screens.traveler.common.ScreenSection
import com.tripsenjoy.screens.traveler.common.StatePreview
import com.tripsenjoy.screens.traveler.common.TravelerScreenState
import com.tripsenjoy.ui.components.BadgeTone
import com.tripsenjoy.ui.components.IconName
import com.tripsenjoy.ui.components.TeBadge
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import kotlin.coroutines.cancellation.CancellationException

// SCR-TRV-21. Three supplier cards. Traveler access is unchanged while an application is pending, rejected or
// in review (FR-TRV-06). Organization applications are web only. Approval adds the role; switch via SCR-SHR-13.
@Composable
fun SupplierApplicationEntry() {
    val nav = LocalScreenNavigator.current
    val session = LocalAuthSessionOrNull.current
    var statusResult by remember { mutableStateOf<ApplicationStatusResult?>(null) }

    LaunchedEffect(session) {
        if (session == null || !session.repository.hasStoredSession()) return@LaunchedEffect
        try {
            statusResult = session.repository.getApplicationStatus()
        } catch (caught: CancellationException) {
            throw caught
        } catch (_: Throwable) {
            // Keep default badge when offline or previewing without a live application
        }
    }

    val existingApp = statusResult?.application

    ScreenPage(title = "Supplier application entry") {
        StatePreview(listedStates = setOf(TravelerScreenState.Error)) {
            if (existingApp != null) {
                TeBadge(
                    label = "${existingApp.applicationType}: ${existingApp.state}",
                    tone = BadgeTone.Info,
                    icon = IconName.Info,
                )
                TeButton(
                    text = "View application status",
                    onClick = { nav.open(PublicScreenIds.APPLICATION_STATUS) },
                )
            } else {
                TeBadge(label = "No application", tone = BadgeTone.Neutral, icon = IconName.Info)
            }
            ScreenNote(text = "Your traveler access does not change while you apply.")
            ScreenSection(header = "Driver") {
                TeButton(
                    text = "Apply as driver",
                    onClick = { nav.open(PublicScreenIds.PLATFORM_DRIVER_SIGN_UP) },
                )
            }
            ScreenSection(header = "Photographer") {
                TeButton(
                    text = "Apply as photographer",
                    onClick = { nav.open(PublicScreenIds.PHOTOGRAPHER_SIGN_UP) },
                    variant = TeButtonVariant.Secondary,
                )
            }
            ScreenSection(header = "Organization") {
                LabelValue(label = "Available on", value = "Web only")
                TeButton(
                    text = "Apply as organization",
                    onClick = { nav.open(PublicScreenIds.ORGANIZATION_SIGN_UP) },
                    variant = TeButtonVariant.Secondary,
                )
            }
            BackButton()
        }
    }
}
