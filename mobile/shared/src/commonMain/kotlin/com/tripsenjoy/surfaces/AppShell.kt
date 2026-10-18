package com.tripsenjoy.surfaces

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
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
import com.tripsenjoy.ui.components.IconName
import com.tripsenjoy.ui.components.TeGlassButton
import com.tripsenjoy.ui.components.TeGlassNavBar
import kotlinx.coroutines.launch

private enum class ShellTab { ROLE, TRAVELER }

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

    TripsApp {
        Scaffold(
            bottomBar = {
                if (state.isAuthenticated) {
                    NavigationBar {
                        NavigationBarItem(
                            selected = tab == ShellTab.ROLE,
                            onClick = { tab = ShellTab.ROLE },
                            icon = { Text(role.title.take(1)) },
                            label = { Text(role.title) },
                        )
                        NavigationBarItem(
                            selected = tab == ShellTab.TRAVELER,
                            onClick = { tab = ShellTab.TRAVELER },
                            icon = { Text(SurfaceRole.TRAVELER.title.take(1)) },
                            label = { Text(SurfaceRole.TRAVELER.title) },
                        )
                    }
                }
            },
        ) { padding ->
            Column(modifier = Modifier.fillMaxSize().padding(padding)) {
                if (state.isAuthenticated) {
                    TeGlassNavBar(
                        title = role.title,
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp),
                        actions = {
                            TeGlassButton(
                                label = AuthStrings.t("auth.account.menu", locale),
                                onClick = { menuOpen = true },
                                icon = IconName.User,
                            )
                        },
                    )
                }
                Box(modifier = Modifier.fillMaxSize()) {
                    AuthGate {
                        when (tab) {
                            ShellTab.ROLE -> roleContent()
                            ShellTab.TRAVELER -> TravelerSurface(api)
                        }
                    }
                }
            }
        }

        if (menuOpen && state.isAuthenticated) {
            AccountMenuSheet(
                actor = state.actor,
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

/** The role's home screen, until its real screens are built (docs/screens). */
@Composable
fun RoleHome(role: SurfaceRole) {
    SurfaceScreen(title = role.title, subtitle = role.subtitle)
}
