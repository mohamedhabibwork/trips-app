package com.tripsenjoy.auth.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.tripsenjoy.auth.AuthErrorMapper
import com.tripsenjoy.auth.AuthErrorRecovery
import com.tripsenjoy.auth.AuthErrorView
import com.tripsenjoy.auth.AuthRepository
import com.tripsenjoy.auth.AuthSessionHolder
import com.tripsenjoy.auth.AuthStrings
import com.tripsenjoy.auth.AuthUiState
import com.tripsenjoy.auth.OtpDispatch
import com.tripsenjoy.auth.SessionExpiredNotice
import com.tripsenjoy.auth.SignInConfig
import com.tripsenjoy.auth.SignInMethod
import com.tripsenjoy.auth.SignInOutcome
import com.tripsenjoy.auth.components.AuthScaffold
import com.tripsenjoy.surfaces.SurfaceRole
import com.tripsenjoy.ui.components.AlertTone
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonSize
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeChip
import com.tripsenjoy.ui.components.TeInlineAlert
import com.tripsenjoy.ui.components.TeInput
import com.tripsenjoy.ui.theme.TripsEnjoyTheme
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.coroutines.cancellation.CancellationException

/**
 * The one parameterised sign-in screen (PRD Q3, ARCHITECTURE D3).
 *
 * It renders the identifier + method form for the traveler, driver and photographer apps and the
 * staff-code form for the moderator app, and it owns the step machine that follows a successful
 * call: `otp_required` → [OtpScreen], `application_pending_approval` → [PendingApprovalScreen],
 * `authenticated` → the session holder. No app repeats any of it.
 */
@Composable
fun SignInScreen(
    config: SignInConfig,
    session: AuthSessionHolder,
    locale: String = AuthStrings.defaultLocale,
    expired: AuthUiState? = null,
    modifier: Modifier = Modifier,
) {
    val state = remember(config) { SignInFormState(config) }
    val scope = rememberCoroutineScope()

    // One decrement per second while a countdown is running; the effect re-arms on each tick.
    LaunchedEffect(state.countdown) {
        if (state.countdown > 0L) {
            delay(1_000)
            state.countdown -= 1L
        }
    }

    when (val step = state.step) {
        SignInStep.Form -> SignInForm(
            config = config,
            locale = locale,
            state = state,
            expired = expired,
            modifier = modifier,
            onSubmit = { submitSignIn(config, state, session, scope, locale) },
            onRegister = {
                state.error = null
                state.step = SignInStep.Register
            },
        )

        is SignInStep.Otp -> OtpScreen(
            target = step.target,
            purpose = AuthRepository.PURPOSE_SIGN_IN,
            dispatch = step.dispatch,
            session = session,
            locale = locale,
            onVerified = session::onAuthenticated,
            onChangeIdentifier = {
                state.step = SignInStep.Form
                state.error = null
            },
            modifier = modifier,
        )

        is SignInStep.Pending -> PendingApprovalScreen(
            contact = step.contact,
            locale = locale,
            onBackToSignIn = {
                state.step = SignInStep.Form
                state.error = null
            },
            modifier = modifier,
            session = session,
            role = step.role.ifBlank { config.registrationRole },
        )

        SignInStep.Register -> RegisterScreen(
            config = config,
            session = session,
            locale = locale,
            onBackToSignIn = {
                state.step = SignInStep.Form
                state.error = null
            },
            modifier = modifier,
        )
    }
}

/** The steps a sign-in can be in. Kept private: nothing outside this screen may drive them. */
private sealed interface SignInStep {
    /** The identifier (or staff code) form. */
    data object Form : SignInStep

    /** A code was dispatched; the user types it. */
    data class Otp(val target: String, val dispatch: OtpDispatch?) : SignInStep

    /** A supplier application is under review; session is saved when returned so onboarding RPCs work. */
    data class Pending(val contact: String, val role: String = "") : SignInStep

    /** Self-registration. */
    data object Register : SignInStep
}

/** The mutable form state, held in one object so the screen stays a single function. */
private class SignInFormState(config: SignInConfig) {
    var identifier by mutableStateOf("")
    var password by mutableStateOf("")
    var staffCode by mutableStateOf("")
    var method by mutableStateOf(config.methods.firstOrNull() ?: SignInMethod.OTP)
    var busy by mutableStateOf(false)
    var error by mutableStateOf<AuthErrorView?>(null)
    var countdown by mutableLongStateOf(0L)
    var step by mutableStateOf<SignInStep>(SignInStep.Form)

    /** True while the submit button must stay disabled (busy or counting down). */
    val submitDisabled: Boolean get() = busy || countdown > 0L

    /** The error message for [field], or `null` when the current error is not about it. */
    fun fieldError(field: String, locale: String): String? =
        error?.takeIf { it.field == field }?.let { AuthErrorMapper.messageFor(it, locale) }
}

@Composable
private fun SignInForm(
    config: SignInConfig,
    locale: String,
    state: SignInFormState,
    expired: AuthUiState?,
    modifier: Modifier,
    onSubmit: () -> Unit,
    onRegister: () -> Unit,
) {
    val spacing = TripsEnjoyTheme.spacing
    val staffOnly = config.isStaffCodeOnly
    val title = if (staffOnly) {
        AuthStrings.t("auth.crew.title", locale)
    } else {
        AuthStrings.t("auth.signIn.title", locale)
    }
    val subtitle = if (staffOnly) {
        AuthStrings.t("auth.crew.subtitle", locale)
    } else {
        AuthStrings.t("auth.signIn.subtitle", locale)
    }

    AuthScaffold(title = title, subtitle = subtitle, locale = locale, modifier = modifier) {
        if (expired != null) {
            SessionExpiredNotice(expired, locale)
        }

        val bannerError = state.error?.takeIf { it.field == null }
        if (bannerError != null) {
            TeInlineAlert(
                tone = AlertTone.Error,
                title = AuthErrorMapper.messageFor(bannerError, locale),
            )
        }

        val roleKey = roleLabelKey(config.role)
        if (roleKey != null && !staffOnly) {
            TeInlineAlert(
                tone = AlertTone.Info,
                title = AuthStrings.t(roleKey, locale),
            )
        }

        TeInput(
            value = state.identifier,
            onValueChange = { state.identifier = it },
            label = AuthStrings.t(
                if (staffOnly) "auth.crew.identifier" else "auth.signIn.identifierLabel",
                locale,
            ),
            supportingText = if (staffOnly) null else AuthStrings.t("auth.signIn.identifierPlaceholder", locale),
            error = state.fieldError(AuthErrorMapper.FIELD_IDENTIFIER, locale),
            enabled = !state.busy,
        )

        if (staffOnly) {
            TeInput(
                value = state.staffCode,
                onValueChange = { state.staffCode = it },
                label = AuthStrings.t("auth.crew.staffCode", locale),
                error = state.fieldError(AuthErrorMapper.FIELD_STAFF_CODE, locale),
                enabled = !state.busy,
            )
        } else {
            if (config.offersOtp && config.offersPassword) {
                Column(verticalArrangement = Arrangement.spacedBy(spacing.space2)) {
                    AuthFieldLabel(AuthStrings.t("auth.signIn.methodLabel", locale))
                    Row(horizontalArrangement = Arrangement.spacedBy(spacing.space2)) {
                        TeChip(
                            label = AuthStrings.t("auth.signIn.methodOtp", locale),
                            selected = state.method == SignInMethod.OTP,
                            onClick = {
                                state.method = SignInMethod.OTP
                                state.error = null
                            },
                            enabled = !state.busy,
                        )
                        TeChip(
                            label = AuthStrings.t("auth.signIn.methodPassword", locale),
                            selected = state.method == SignInMethod.PASSWORD,
                            onClick = {
                                state.method = SignInMethod.PASSWORD
                                state.error = null
                            },
                            enabled = !state.busy,
                        )
                    }
                }
            }
            if (state.method == SignInMethod.PASSWORD) {
                TeInput(
                    value = state.password,
                    onValueChange = { state.password = it },
                    label = AuthStrings.t("auth.signIn.passwordLabel", locale),
                    error = state.fieldError(AuthErrorMapper.FIELD_PASSWORD, locale),
                    enabled = !state.busy,
                )
            }
        }

        TeButton(
            text = if (state.busy) {
                AuthStrings.t("auth.common.submitting", locale)
            } else if (staffOnly) {
                AuthStrings.t("auth.crew.submit", locale)
            } else {
                AuthStrings.t("auth.signIn.submit", locale)
            },
            onClick = onSubmit,
            modifier = Modifier.fillMaxWidth(),
            size = TeButtonSize.Large,
            enabled = !state.submitDisabled,
        )

        if (state.countdown > 0L) {
            TeInlineAlert(
                tone = AlertTone.Warning,
                title = AuthStrings.format(
                    "auth.error.rateLimited",
                    locale,
                    mapOf(AuthErrorMapper.PARAM_SECONDS to state.countdown.toString()),
                ),
            )
        }

        if (config.allowRegistration) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(spacing.space2, androidx.compose.ui.Alignment.CenterHorizontally),
                verticalAlignment = androidx.compose.ui.Alignment.CenterVertically,
            ) {
                androidx.compose.material3.Text(
                    text = AuthStrings.t("auth.signIn.noAccount", locale),
                    style = TripsEnjoyTheme.typography.body,
                    color = TripsEnjoyTheme.colors.inkMuted,
                )
                TeButton(
                    text = AuthStrings.t("auth.signIn.createAccount", locale),
                    onClick = onRegister,
                    variant = TeButtonVariant.Ghost,
                    enabled = !state.busy,
                )
            }
        }
    }
}

/** A small label above a chip row, matching the label style of `TeInput`. */
@Composable
private fun AuthFieldLabel(text: String) {
    androidx.compose.material3.Text(
        text = text,
        style = TripsEnjoyTheme.typography.label,
        color = TripsEnjoyTheme.colors.ink,
    )
}

/** The copy key for a role chip, or `null` for the traveler (the screen title already says it). */
private fun roleLabelKey(role: SurfaceRole): String? = when (role) {
    SurfaceRole.TRAVELER -> null
    SurfaceRole.DRIVER -> "auth.role.platform_driver"
    SurfaceRole.PHOTOGRAPHER -> "auth.role.platform_photographer"
    SurfaceRole.MODERATOR -> "auth.role.moderator"
}

/**
 * Validates the form, calls the right procedure, and routes the outcome.
 *
 * Validation is local so an empty field never costs a round trip; everything else is decided by the
 * server and mapped through [AuthErrorMapper].
 */
private fun submitSignIn(
    config: SignInConfig,
    state: SignInFormState,
    session: AuthSessionHolder,
    scope: CoroutineScope,
    locale: String,
) {
    if (state.submitDisabled) return
    val identifier = state.identifier.trim()
    val procedure = if (config.isStaffCodeOnly) {
        AuthRepository.PROC_MODERATOR_SIGN_IN
    } else {
        AuthRepository.PROC_SIGN_IN
    }

    state.error = null
    if (identifier.isEmpty()) {
        state.error = AuthErrorMapper.requiredFieldError(AuthErrorMapper.FIELD_IDENTIFIER, locale)
        return
    }
    if (config.isStaffCodeOnly && state.staffCode.isBlank()) {
        state.error = AuthErrorMapper.requiredFieldError(AuthErrorMapper.FIELD_STAFF_CODE, locale)
        return
    }
    if (!config.isStaffCodeOnly && state.method == SignInMethod.PASSWORD && state.password.isEmpty()) {
        state.error = AuthErrorMapper.requiredFieldError(AuthErrorMapper.FIELD_PASSWORD, locale)
        return
    }

    scope.launch {
        state.busy = true
        try {
            if (config.isStaffCodeOnly) {
                val record = session.repository.moderatorSignIn(identifier, state.staffCode.trim())
                session.onAuthenticated(record)
            } else {
                val outcome = session.repository.signIn(
                    identifier = identifier,
                    method = state.method.wire,
                    password = if (state.method == SignInMethod.PASSWORD) state.password else null,
                    requestedRole = config.registrationRole,
                )
                when (outcome) {
                    is SignInOutcome.OtpRequired -> {
                        state.step = SignInStep.Otp(identifier, outcome.otpDispatch)
                    }

                    is SignInOutcome.Authenticated -> session.onAuthenticated(outcome.record)

                    is SignInOutcome.PendingApproval -> {
                        state.step = SignInStep.Pending(identifier, outcome.role)
                    }
                }
            }
        } catch (error: CancellationException) {
            throw error
        } catch (error: Throwable) {
            state.error = AuthErrorMapper.fromThrowable(
                error = error,
                procedure = procedure,
                locale = locale,
                nowMs = session.repository.nowMillis(),
            )
            session.onFailure(error)
            val view = state.error
            if (view?.recovery == AuthErrorRecovery.COUNTDOWN) {
                state.countdown = view.params[AuthErrorMapper.PARAM_SECONDS]?.toLongOrNull() ?: 0L
            }
        } finally {
            state.busy = false
        }
    }
}
