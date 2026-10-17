package com.tripsenjoy.auth

import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.staticCompositionLocalOf
import com.tripsenjoy.api.ApiClient
import com.tripsenjoy.api.rememberApiClient
import com.tripsenjoy.auth.screens.SignInScreen
import com.tripsenjoy.ui.components.LoadingState
import com.tripsenjoy.ui.components.TeInlineAlert
import com.tripsenjoy.ui.components.AlertTone
import com.tripsenjoy.auth.components.AuthScaffold

/** The session holder for the current app. Reading it outside [AuthProvider] is a wiring bug. */
val LocalAuthSession = staticCompositionLocalOf<AuthSessionHolder> {
    error("No AuthSessionHolder provided. Wrap the app in AuthProvider.")
}

/** Optional session holder for screen catalog views that may render inside or outside [AuthProvider]. */
val LocalAuthSessionOrNull = staticCompositionLocalOf<AuthSessionHolder?> { null }

/** The API client that carries the bearer token, so screens never build their own. */
val LocalAuthApi = staticCompositionLocalOf<ApiClient> {
    error("No ApiClient provided. Wrap the app in AuthProvider.")
}

/** The per-app configuration of the current surface (ARCHITECTURE §5.3). */
val LocalSignInConfig = staticCompositionLocalOf<SignInConfig> {
    error("No SignInConfig provided. Wrap the app in AuthProvider.")
}

/** The locale the auth copy is rendered in. */
val LocalAuthLocale = staticCompositionLocalOf { AuthStrings.defaultLocale }

/**
 * Wires one app's authentication: platform storage → token store → repository → session holder,
 * plus the API client whose bearer token comes from that store.
 *
 * This is the only call site of `rememberAuthStorage()`, so all four apps inherit the same
 * persistence, the same refresh rules and the same screens.
 *
 * [locale] defaults to the copy's default locale: the mobile apps have no locale plumbing yet, so
 * the Arabic copy is generated and ready but the surrounding screens are English. Passing a locale
 * is the single change needed to ship Arabic.
 */
@Composable
fun AuthProvider(
    config: SignInConfig,
    locale: String = AuthStrings.defaultLocale,
    content: @Composable () -> Unit,
) {
    val storage = rememberAuthStorage()
    val store = remember(storage) { AuthTokenStore(storage) }
    val tokenSupplier = remember(store) { { store.accessToken() } }
    val api = rememberApiClient(tokenSupplier)
    val repository = remember(api, store) {
        AuthRepository(api = api, store = store, now = ::platformNowMillis).also { created ->
            created.surface = config.surface
        }
    }
    val session = remember(repository, store, config) {
        AuthSessionHolder(repository = repository, store = store, config = config)
    }

    // Hydration is asynchronous so the first frame is a skeleton, never a sign-in flash (AC-4).
    LaunchedEffect(session) { session.restore() }

    CompositionLocalProvider(
        LocalAuthSession provides session,
        LocalAuthSessionOrNull provides session,
        LocalAuthApi provides api,
        LocalSignInConfig provides config,
        LocalAuthLocale provides locale,
        content = content,
    )
}

/**
 * Renders the right thing for the current [AuthStatus] and nothing else (ARCHITECTURE §5.2).
 *
 * Loading → skeleton; anonymous or session-expired → the sign-in screen (with an expired notice
 * when the session ended); authenticated → [content]. The tab bar in `AppShell` sits outside this
 * gate, which is how it stays hidden until a session exists.
 */
@Composable
fun AuthGate(
    modifier: androidx.compose.ui.Modifier = androidx.compose.ui.Modifier,
    content: @Composable () -> Unit,
) {
    val session = LocalAuthSession.current
    val config = LocalSignInConfig.current
    val locale = LocalAuthLocale.current
    val state by session.state.collectAsState()

    when (state.status) {
        AuthStatus.LOADING -> AuthScaffold(
            title = AuthStrings.t(KEY_SIGN_IN_TITLE, locale),
            locale = locale,
            modifier = modifier,
        ) {
            LoadingState()
        }

        AuthStatus.ANONYMOUS -> SignInScreen(
            config = config,
            session = session,
            locale = locale,
            modifier = modifier,
        )

        AuthStatus.SESSION_EXPIRED -> SignInScreen(
            config = config,
            session = session,
            locale = locale,
            expired = state,
            modifier = modifier,
        )

        AuthStatus.AUTHENTICATED -> content()
    }
}

/** The notice a session that ended shows above the sign-in form (PRD §7.5 E2, F2). */
@Composable
internal fun SessionExpiredNotice(state: AuthUiState, locale: String) {
    val title = AuthStrings.t("auth.sessionExpired.title", locale)
    val body = if (state.isMaxSessionExpired) {
        AuthStrings.t("auth.error.sessionExpiredMax", locale)
    } else {
        AuthStrings.t("auth.sessionExpired.body", locale)
    }
    val drafts = if (state.draftsRetained) AuthStrings.t("auth.sessionExpired.drafts", locale) else null
    TeInlineAlert(
        tone = AlertTone.Warning,
        title = title,
        message = listOfNotNull(body, drafts).joinToString(" "),
    )
}

/** The sign-in title key, shared by the skeleton and the screen. */
internal const val KEY_SIGN_IN_TITLE = "auth.signIn.title"
