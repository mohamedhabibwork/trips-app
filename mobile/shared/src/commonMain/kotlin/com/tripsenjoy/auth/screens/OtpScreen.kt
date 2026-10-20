package com.tripsenjoy.auth.screens

import androidx.compose.foundation.layout.Arrangement
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
import com.tripsenjoy.analytics.AnalyticsTracker
import com.tripsenjoy.auth.AuthErrorMapper
import com.tripsenjoy.auth.AuthErrorRecovery
import com.tripsenjoy.auth.AuthErrorView
import com.tripsenjoy.auth.AuthConventions
import com.tripsenjoy.auth.AuthRepository
import com.tripsenjoy.auth.AuthSessionHolder
import com.tripsenjoy.auth.AuthStrings
import com.tripsenjoy.auth.OtpDispatch
import com.tripsenjoy.auth.SessionRecord
import com.tripsenjoy.auth.components.AuthScaffold
import com.tripsenjoy.auth.components.OtpCodeField
import com.tripsenjoy.ui.components.AlertTone
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonSize
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeInlineAlert
import com.tripsenjoy.ui.theme.TripsEnjoyTheme
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.coroutines.cancellation.CancellationException

/**
 * The six-digit code screen, shared by sign-in and registration (PRD §6).
 *
 * The resend countdown starts from `otpDispatch.resendAvailableInSeconds` and restarts after a
 * resend. `devCodePreview` is shown when the server returns one, which is how QA drives the flow
 * without an SMS provider.
 *
 * A successful verification that returns a session signs the user in directly — no second
 * `auth/signIn` call (PRD §3).
 */
@Composable
fun OtpScreen(
    target: String,
    purpose: String,
    dispatch: OtpDispatch?,
    session: AuthSessionHolder,
    locale: String = AuthStrings.defaultLocale,
    onVerified: (SessionRecord) -> Unit,
    onChangeIdentifier: () -> Unit,
    modifier: Modifier = Modifier,
    onVerifiedWithoutSession: (() -> Unit)? = null,
) {
    val spacing = TripsEnjoyTheme.spacing
    val scope = rememberCoroutineScope()
    var code by remember(target, purpose) { mutableStateOf("") }
    var busy by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<AuthErrorView?>(null) }
    var countdown by remember { mutableLongStateOf(0L) }
    var currentDispatch by remember(dispatch) { mutableStateOf(dispatch) }

    LaunchedEffect(currentDispatch) {
        countdown = currentDispatch?.resendAvailableInSeconds?.toLong() ?: 0L
    }
    LaunchedEffect(countdown) {
        if (countdown > 0L) {
            delay(1_000)
            countdown -= 1L
        }
    }

    val length = AuthConventions.otpCodeLength
    val bannerError = error?.takeIf { it.field == null }

    AuthScaffold(
        title = AuthStrings.t("auth.otp.title", locale),
        subtitle = AuthStrings.format("auth.otp.subtitle", locale, mapOf("target" to target)),
        locale = locale,
        modifier = modifier,
    ) {
        if (bannerError != null) {
            TeInlineAlert(
                tone = AlertTone.Error,
                title = AuthErrorMapper.messageFor(bannerError, locale),
            )
        }

        OtpCodeField(
            value = code,
            onValueChange = { typed ->
                code = typed.take(length)
                if (error != null) error = null
            },
            digitLabel = { index -> AuthStrings.format("auth.otp.digitLabel", locale, mapOf("index" to index.toString())) },
            length = length,
            enabled = !busy,
            error = error?.takeIf { it.field == AuthErrorMapper.FIELD_CODE }?.let {
                AuthErrorMapper.messageFor(it, locale)
            },
        )

        val preview = currentDispatch?.devCodePreview
        if (!preview.isNullOrBlank()) {
            TeInlineAlert(
                tone = AlertTone.Info,
                title = AuthStrings.format("auth.otp.devCode", locale, mapOf("code" to preview)),
            )
        }

        TeButton(
            text = if (busy) {
                AuthStrings.t("auth.common.submitting", locale)
            } else {
                AuthStrings.t("auth.otp.submit", locale)
            },
            onClick = {
                if (busy || code.length < length) return@TeButton
                // The code itself is never logged (no PII); only the purpose.
                AnalyticsTracker.trackAction("otp_submit", mapOf("purpose" to purpose))
                scope.launch {
                    busy = true
                    error = null
                    try {
                        val outcome = session.repository.verifyOtp(
                            targetIdentifier = target,
                            purpose = purpose,
                            code = code,
                        )
                        val record = outcome.record
                        when {
                            record != null -> onVerified(record)
                            // Verified but no session: either another channel is still outstanding or
                            // the role is waiting for approval. The caller decides which.
                            onVerifiedWithoutSession != null -> onVerifiedWithoutSession()
                            else -> error = AuthErrorView(
                                key = AuthErrorMapper.Keys.VERIFICATION_REQUIRED,
                                recovery = AuthErrorRecovery.STAY,
                            )
                        }
                    } catch (caught: CancellationException) {
                        throw caught
                    } catch (caught: Throwable) {
                        val mapped = AuthErrorMapper.fromThrowable(
                            error = caught,
                            procedure = AuthRepository.PROC_VERIFY_OTP,
                            locale = locale,
                            nowMs = session.repository.nowMillis(),
                        )
                        error = mapped
                        session.onFailure(caught)
                        if (mapped.recovery == AuthErrorRecovery.CLEAR_CODE) code = ""
                        if (mapped.recovery == AuthErrorRecovery.COUNTDOWN) {
                            countdown = mapped.params[AuthErrorMapper.PARAM_SECONDS]?.toLongOrNull() ?: 0L
                        }
                    } finally {
                        busy = false
                    }
                }
            },
            modifier = Modifier.fillMaxWidth(),
            size = TeButtonSize.Large,
            enabled = !busy && code.length == length,
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(spacing.space2),
        ) {
            TeButton(
                text = if (countdown > 0L) {
                    AuthStrings.format(
                        "auth.otp.resendIn",
                        locale,
                        mapOf(AuthErrorMapper.PARAM_SECONDS to countdown.toString()),
                    )
                } else {
                    AuthStrings.t("auth.otp.resend", locale)
                },
                onClick = {
                    if (busy || countdown > 0L) return@TeButton
                    AnalyticsTracker.trackAction("otp_resend", mapOf("purpose" to purpose))
                    scope.launch {
                        busy = true
                        error = null
                        try {
                            currentDispatch = session.repository.resendOtp(
                                targetIdentifier = target,
                                purpose = purpose,
                            )
                        } catch (caught: CancellationException) {
                            throw caught
                        } catch (caught: Throwable) {
                            val mapped = AuthErrorMapper.fromThrowable(
                                error = caught,
                                procedure = AuthRepository.PROC_RESEND_OTP,
                                locale = locale,
                                nowMs = session.repository.nowMillis(),
                            )
                            error = mapped
                            if (mapped.recovery == AuthErrorRecovery.COUNTDOWN ||
                                mapped.recovery == AuthErrorRecovery.ENABLE_RESEND
                            ) {
                                countdown = mapped.params[AuthErrorMapper.PARAM_SECONDS]
                                    ?.toLongOrNull() ?: 0L
                            }
                        } finally {
                            busy = false
                        }
                    }
                },
                variant = TeButtonVariant.Secondary,
                enabled = !busy && countdown == 0L,
            )
            TeButton(
                text = AuthStrings.t("auth.otp.changeIdentifier", locale),
                onClick = onChangeIdentifier,
                variant = TeButtonVariant.Ghost,
                enabled = !busy,
            )
        }
    }
}
