package com.tripsenjoy.auth

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlin.coroutines.cancellation.CancellationException

/**
 * What the UI renders, derived from the store plus the last failure (PRD §7.5 E1).
 *
 * [sessionExpiredReason] is `MAX_SESSION_DURATION_REACHED` when the 12-hour cap ended the session,
 * which selects the drafts-retained wording (F2); otherwise it is `null` and the generic notice is
 * used.
 */
data class AuthUiState(
    val status: AuthStatus = AuthStatus.LOADING,
    val actor: AuthActor? = null,
    val sessionExpiredReason: String? = null,
    val draftsRetained: Boolean = true,
) {
    /** True when a session record exists and the app may show its authenticated content. */
    val isAuthenticated: Boolean get() = status == AuthStatus.AUTHENTICATED

    /** True when the app should render the sign-in screen. */
    val needsSignIn: Boolean
        get() = status == AuthStatus.ANONYMOUS || status == AuthStatus.SESSION_EXPIRED

    /** True when the last session ended because the maximum duration was reached (F2). */
    val isMaxSessionExpired: Boolean
        get() = sessionExpiredReason == AuthRefreshPolicy.maxSessionReason
}

/**
 * The auth state machine: one status, one actor, and the three transitions that change them.
 *
 * Plain Kotlin with no Compose types, so the transitions are unit-testable and the provider is a
 * thin wrapper. Every refresh rule lives in [AuthRepository]; this class never issues a request it
 * was not asked to.
 */
class AuthSessionHolder(
    val repository: AuthRepository,
    val store: AuthTokenStore,
    val config: SignInConfig,
) {
    private val _state = MutableStateFlow(AuthUiState(status = AuthStatus.LOADING))
    val state: StateFlow<AuthUiState> = _state.asStateFlow()

    /** The current snapshot, for a non-composable caller. */
    fun snapshot(): AuthUiState = _state.value

    /**
     * Boots the session: a stored record is authenticated with **no** network call (AC-4), and an
     * absent one shows the sign-in screen. A restore that fails for any reason other than
     * cancellation falls back to anonymous rather than trapping the user on a skeleton.
     */
    suspend fun restore() {
        val stored = store.current()
        if (stored == null) {
            _state.value = AuthUiState(status = AuthStatus.ANONYMOUS)
            return
        }
        if (AuthExpiry.isSessionExpired(stored, repository.nowMillis())) {
            store.clear()
            _state.value = AuthUiState(
                status = AuthStatus.SESSION_EXPIRED,
                sessionExpiredReason = AuthRefreshPolicy.maxSessionReason,
            )
            return
        }
        _state.value = AuthUiState(status = AuthStatus.AUTHENTICATED, actor = stored.actor)
        try {
            repository.restore()
            _state.value = AuthUiState(
                status = AuthStatus.AUTHENTICATED,
                actor = store.current()?.actor,
            )
        } catch (error: CancellationException) {
            throw error
        } catch (_: Throwable) {
            // The record is still usable: the access token is valid until it expires, and the first
            // authenticated call will refresh or expire it properly.
        }
    }

    /** Called by a screen after a successful sign-in, OTP verification or TOTP verification. */
    fun onAuthenticated(record: SessionRecord) {
        _state.value = AuthUiState(status = AuthStatus.AUTHENTICATED, actor = record.actor)
    }

    /** Called when a refresh failed or the session cap was reached (F1). */
    fun onSessionExpired(reason: String? = null, draftsRetained: Boolean = true) {
        _state.value = AuthUiState(
            status = AuthStatus.SESSION_EXPIRED,
            sessionExpiredReason = reason,
            draftsRetained = draftsRetained,
        )
    }

    /**
     * Signs out and always ends the local session (S3).
     *
     * The status flips to anonymous even when `auth/signOut` throws, because the repository clears
     * the record in a `finally` block: a failed call must not leave the user signed in.
     */
    suspend fun signOut(allDevices: Boolean = false) {
        try {
            repository.signOut(allDevices)
        } catch (error: CancellationException) {
            _state.value = AuthUiState(status = AuthStatus.ANONYMOUS)
            throw error
        } catch (_: Throwable) {
            // Deliberately ignored: S3 says the local session ends regardless.
        } finally {
            repository.clearLocalSession()
        }
        _state.value = AuthUiState(status = AuthStatus.ANONYMOUS)
    }

    /** Maps a caught failure to a state transition when it means the session is over. */
    fun onFailure(error: Throwable) {
        if (error is SessionExpiredException) {
            onSessionExpired(error.reason, error.draftsRetained)
        }
    }
}
