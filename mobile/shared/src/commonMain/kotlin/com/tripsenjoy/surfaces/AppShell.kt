package com.tripsenjoy.surfaces

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.tripsenjoy.analytics.AnalyticsTracker
import com.tripsenjoy.auth.AuthGate
import com.tripsenjoy.auth.AuthProvider
import com.tripsenjoy.auth.AuthStrings
import com.tripsenjoy.auth.LocalAuthApi
import com.tripsenjoy.auth.LocalAuthSession
import com.tripsenjoy.auth.SignInConfig
import com.tripsenjoy.auth.screens.AccountMenuSheet
import com.tripsenjoy.surfaces.traveler.TravelerSurface
import com.tripsenjoy.ui.TripsApp
import com.tripsenjoy.ui.TripsAppRoot
import com.tripsenjoy.ui.TripsSideGutter
import com.tripsenjoy.ui.components.IconName
import com.tripsenjoy.ui.components.TeGlassButton
import com.tripsenjoy.ui.components.TeGlassNavBar
import com.tripsenjoy.ui.components.TeGlassTab
import com.tripsenjoy.ui.components.TeGlassTabBar
import com.tripsenjoy.ui.theme.TripsEnjoyTheme
import kotlinx.coroutines.launch

private enum class ShellTab { ROLE, TRAVELER }

private fun SurfaceRole.icon(): IconName = when (this) {
    SurfaceRole.DRIVER -> IconName.Bus
    SurfaceRole.MODERATOR -> IconName.Shield
    SurfaceRole.PHOTOGRAPHER -> IconName.Camera
    SurfaceRole.TRAVELER -> IconName.Ticket
}

/**
 * Shell for a role app (driver, photographer, moderator).
 *
 * Authentication wraps the whole shell: the tab bar and the top bar only appear once a session
 * exists (PRD §6 "Tab bar (AppShell) is hidden until a session exists"), and the role's own screen
 * is the first tab with the traveler surface as the second, so every user can also reach the
 * traveler side (D-124).
 */
@Composable
fun AppShell(
    role: SurfaceRole,
    locale: String = AuthStrings.defaultLocale,
    roleContent: @Composable () -> Unit = { RoleHome(role) },
) {
    require(role != SurfaceRole.TRAVELER) { "The traveler app has no role tab. Use TravelerSurface directly." }

    TripsAppRoot(rtl = locale == "ar") {
        AuthProvider(config = SignInConfig.forRole(role), locale = locale) {
            SignedInShell(role = role, locale = locale, roleContent = roleContent)
        }
    }
}

@Composable
private fun SignedInShell(
    role: SurfaceRole,
    locale: String,
    roleContent: @Composable () -> Unit,
) {
    val session = LocalAuthSession.current
    val api = LocalAuthApi.current
    val state by session.state.collectAsState()
    val scope = rememberCoroutineScope()
    var tab by remember { mutableStateOf(ShellTab.ROLE) }
    var menuOpen by remember { mutableStateOf(false) }
    val spacing = TripsEnjoyTheme.spacing

    TripsApp {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .let { base -> if (state.isAuthenticated) base.safeDrawingPadding() else base },
        ) {
            if (state.isAuthenticated) {
                TeGlassNavBar(
                    title = if (tab == ShellTab.ROLE) role.title else SurfaceRole.TRAVELER.title,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = TripsSideGutter, vertical = spacing.space2),
                    actions = {
                        TeGlassButton(
                            label = AuthStrings.t("auth.account.menu", locale),
                            onClick = {
                                AnalyticsTracker.trackAction("account_menu_open", mapOf("role" to role.name))
                                menuOpen = true
                            },
                            icon = IconName.User,
                        )
                    },
                )
            }
            Box(modifier = Modifier.weight(1f).fillMaxSize()) {
                AuthGate {
                    when (tab) {
                        ShellTab.ROLE -> roleContent()
                        ShellTab.TRAVELER -> TravelerSurface(api, embeddedInRoleShell = true)
                    }
                }
            }
            if (state.isAuthenticated) {
                val tabs = remember(role) {
                    listOf(
                        TeGlassTab(label = role.title, icon = role.icon()),
                        TeGlassTab(label = SurfaceRole.TRAVELER.title, icon = SurfaceRole.TRAVELER.icon()),
                    )
                }
                TeGlassTabBar(
                    tabs = tabs,
                    selectedIndex = if (tab == ShellTab.ROLE) 0 else 1,
                    onSelect = { index ->
                        val next = if (index == 0) ShellTab.ROLE else ShellTab.TRAVELER
                        AnalyticsTracker.trackAction(
                            "tab_switch",
                            mapOf("role" to role.name, "tab" to next.name),
                        )
                        tab = next
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = TripsSideGutter, vertical = spacing.space2),
                )
            }
        }

        if (menuOpen && state.isAuthenticated) {
            AccountMenuSheet(
                actor = state.actor,
                locale = locale,
                onSignOut = {
                    menuOpen = false
                    AnalyticsTracker.trackAction("sign_out", mapOf("role" to role.name, "all_devices" to "false"))
                    scope.launch { session.signOut(allDevices = false) }
                },
                onSignOutAll = {
                    menuOpen = false
                    AnalyticsTracker.trackAction("sign_out", mapOf("role" to role.name, "all_devices" to "true"))
                    scope.launch { session.signOut(allDevices = true) }
                },
                onDismiss = { menuOpen = false },
            )
        }
    }
}

/** The role's home screen, until its real screens are built (docs/screens). */
@Composable
fun RoleHome(role: SurfaceRole) {
    SurfaceScreen(title = role.title, subtitle = role.subtitle)
}

