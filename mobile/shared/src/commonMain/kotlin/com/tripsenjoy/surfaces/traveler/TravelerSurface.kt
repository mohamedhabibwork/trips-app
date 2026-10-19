package com.tripsenjoy.surfaces.traveler

import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.tripsenjoy.api.ApiClient
import com.tripsenjoy.auth.AuthStrings
import com.tripsenjoy.auth.LocalAuthLocale
import com.tripsenjoy.auth.LocalAuthSessionOrNull
import com.tripsenjoy.auth.screens.AccountMenuSheet
import com.tripsenjoy.screens.ScreenEntry
import com.tripsenjoy.screens.ScreenHost
import com.tripsenjoy.screens.ScreenNavigator
import com.tripsenjoy.screens.parent.PARENT_SCREENS
import com.tripsenjoy.screens.public.PUBLIC_SCREENS
import com.tripsenjoy.screens.shared.SHARED_SCREENS
import com.tripsenjoy.screens.traveler.TRAVELER_SCREENS
import com.tripsenjoy.ui.TripsApp
import com.tripsenjoy.ui.TripsSideGutter
import com.tripsenjoy.ui.components.IconName
import com.tripsenjoy.ui.components.LogoVariant
import com.tripsenjoy.ui.components.TeGlassButton
import com.tripsenjoy.ui.components.TeGlassTab
import com.tripsenjoy.ui.components.TeGlassTabBar
import com.tripsenjoy.ui.components.TeRetryBanner
import com.tripsenjoy.ui.components.TripsLogo
import com.tripsenjoy.ui.theme.TripsEnjoyTheme
import kotlin.coroutines.cancellation.CancellationException
import kotlinx.coroutines.launch

// Traveler, parent, shared, and public/onboarding screens in one host. The home screen (SCR-TRV-01) is the start.
private val TRAVELER_APP_SCREENS: List<ScreenEntry> =
    TRAVELER_SCREENS + PARENT_SCREENS + PUBLIC_SCREENS + SHARED_SCREENS

private data class TravelerNavTab(
    val label: String,
    val icon: IconName,
    val screenId: String,
)

private val TRAVELER_TABS = listOf(
    TravelerNavTab(label = "Trips", icon = IconName.Home, screenId = "SCR-TRV-01"),
    TravelerNavTab(label = "Bookings", icon = IconName.Ticket, screenId = "SCR-TRV-10"),
    TravelerNavTab(label = "Albums", icon = IconName.Camera, screenId = "SCR-TRV-15"),
    TravelerNavTab(label = "Account", icon = IconName.User, screenId = "SCR-TRV-19"),
)

/** The traveler surface. Every app offers it (D-124). Matches SCR-TRV-01 layout and bottom navigation. */
@Composable
fun TravelerSurface(api: ApiClient, embeddedInRoleShell: Boolean = false) {
    val session = LocalAuthSessionOrNull.current
    val locale = LocalAuthLocale.current
    val authState = session?.state?.collectAsState()?.value
    val scope = rememberCoroutineScope()
    var menuOpen by remember { mutableStateOf(false) }
    val colors = TripsEnjoyTheme.colors
    val spacing = TripsEnjoyTheme.spacing
    val isDark = isSystemInDarkTheme()

    TripsApp(rtl = locale == "ar") {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(colors.surface)
                .let { base -> if (embeddedInRoleShell) base else base.safeDrawingPadding() },
        ) {
            if (!embeddedInRoleShell) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(colors.surfaceRaised)
                        .padding(horizontal = TripsSideGutter, vertical = spacing.space2),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    TripsLogo(
                        variant = if (isDark) LogoVariant.HorizontalReversed else LogoVariant.HorizontalFullColor,
                        contentDescription = AuthStrings.t("auth.app.name", locale),
                        modifier = Modifier.height(28.dp),
                    )
                    if (authState?.isAuthenticated == true) {
                        TeGlassButton(
                            label = AuthStrings.t("auth.account.menu", locale),
                            onClick = { menuOpen = true },
                            icon = IconName.User,
                        )
                    }
                }
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(1.dp)
                        .background(colors.hairline),
                )
            }

            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxSize()
                    .padding(horizontal = TripsSideGutter)
                    .padding(top = spacing.space4),
            ) {
                ApiStatusView(api)
                ScreenHost(
                    startId = "SCR-TRV-01",
                    screens = TRAVELER_APP_SCREENS,
                    modifier = Modifier.weight(1f).fillMaxSize(),
                    bottomBar = if (!embeddedInRoleShell) {
                        { nav -> TravelerBottomBar(nav) }
                    } else {
                        null
                    },
                )
            }
        }

        if (menuOpen && session != null && authState?.isAuthenticated == true) {
            AccountMenuSheet(
                actor = authState.actor,
                locale = locale,
                onSignOut = {
                    menuOpen = false
                    scope.launch { session.signOut(allDevices = false) }
                },
                onSignOutAll = {
                    menuOpen = false
                    scope.launch { session.signOut(allDevices = true) }
                },
                onDismiss = { menuOpen = false },
            )
        }
    }
}

@Composable
private fun TravelerBottomBar(nav: ScreenNavigator) {
    val spacing = TripsEnjoyTheme.spacing
    val selectedIndex = when (nav.currentId) {
        "SCR-TRV-10", "SCR-TRV-11", "SCR-TRV-12", "SCR-TRV-13", "SCR-TRV-14" -> 1
        "SCR-TRV-15", "SCR-TRV-16", "SCR-TRV-17" -> 2
        "SCR-TRV-18", "SCR-TRV-19", "SCR-TRV-20", "SCR-TRV-21" -> 3
        else -> 0
    }
    val glassTabs = remember {
        TRAVELER_TABS.map { TeGlassTab(label = it.label, icon = it.icon) }
    }
    TeGlassTabBar(
        tabs = glassTabs,
        selectedIndex = selectedIndex,
        onSelect = { index ->
            val target = TRAVELER_TABS.getOrNull(index)?.screenId ?: "SCR-TRV-01"
            if (nav.currentId != target) {
                nav.open(target)
            }
        },
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = spacing.space2),
    )
}

private sealed interface ApiState {
    data object Loading : ApiState
    data class Connected(val message: String) : ApiState
    data class Failed(val message: String) : ApiState
}

/** Calls the API's healthCheck. Shows a retry banner only when the API cannot be reached. */
@Composable
fun ApiStatusView(api: ApiClient) {
    var attempt by remember { mutableIntStateOf(0) }
    var state by remember { mutableStateOf<ApiState>(ApiState.Loading) }

    LaunchedEffect(api, attempt) {
        state = ApiState.Loading
        state = try {
            ApiState.Connected(api.healthCheck())
        } catch (error: CancellationException) {
            throw error
        } catch (error: Exception) {
            ApiState.Failed(error.message ?: "The API could not be reached.")
        }
    }

    if (state is ApiState.Failed) {
        val current = state as ApiState.Failed
        TeRetryBanner(
            message = "API unavailable: ${current.message}",
            onRetry = { attempt++ },
            retrying = false,
            modifier = Modifier.padding(bottom = TripsEnjoyTheme.spacing.space3),
        )
    }
}

