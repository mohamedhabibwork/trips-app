package com.tripsenjoy.auth.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.tripsenjoy.analytics.AnalyticsTracker
import com.tripsenjoy.auth.AuthConventions
import com.tripsenjoy.auth.AuthErrorMapper
import com.tripsenjoy.auth.AuthErrorRecovery
import com.tripsenjoy.auth.AuthErrorView
import com.tripsenjoy.auth.AuthRepository
import com.tripsenjoy.auth.AuthSessionHolder
import com.tripsenjoy.auth.AuthStrings
import com.tripsenjoy.auth.OtpDispatch
import com.tripsenjoy.auth.RegistrationOutcome
import com.tripsenjoy.auth.SignInConfig
import com.tripsenjoy.auth.components.AuthScaffold
import com.tripsenjoy.ui.components.AlertTone
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonSize
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeChip
import com.tripsenjoy.ui.components.TeInlineAlert
import com.tripsenjoy.ui.components.TeInput
import com.tripsenjoy.ui.theme.TripsEnjoyTheme
import kotlinx.coroutines.launch
import kotlin.coroutines.cancellation.CancellationException

/**
 * Whether a market can be submitted today (mirrors `isRegistrationCountryEnabled` on web).
 *
 * An unknown code is not enabled, so a stale stored value can never be submitted.
 */
fun isRegistrationCountryEnabled(code: String): Boolean =
    AuthConventions.AuthCountries.any { it.code == code && it.enabled }

/**
 * The country code selected on first render for [locale] (PRD §7.10 G2).
 *
 * The default is **data**, not logic: `AuthDefaultCountryByLocale` maps a locale to a market. The
 * mapped market is honoured **only when it is enabled** — otherwise the first enabled market wins.
 * That `enabled` check is not decoration: web applies the same one, and without it a contract that
 * mapped a locale to a not-yet-live market would have mobile preselect a disabled option while web
 * preselected the live one. Same rule, same table, no branch that can drift.
 */
fun defaultCountryCode(locale: String): String {
    val mapped = AuthConventions.AuthDefaultCountryByLocale[locale]
    if (mapped != null && isRegistrationCountryEnabled(mapped)) return mapped
    return AuthConventions.AuthCountries.firstOrNull { it.enabled }?.code
        ?: AuthConventions.AuthCountries.first().code
}

/** The display name of a market in [locale], falling back to the code for an unknown one. */
fun countryName(code: String, locale: String): String {
    val country = AuthConventions.AuthCountries.firstOrNull { it.code == code } ?: return code
    return if (locale == "ar") country.nameAr else country.nameEn
}

/** The roles a supplier applicant can pick on mobile; organization is web-only (FR-AUTH-11). */
private enum class SupplierChoice { DRIVER, PHOTOGRAPHER, ORGANIZATION }

/**
 * Self-registration for the traveler, driver and photographer apps (PRD P0-1).
 *
 * Country is required in the form but is **not** sent: the server schemas have no country field and
 * Zod strips unknown keys, so the value is dropped behind a `TODO(FR-AUTH-02)` marker in
 * [AuthRepository.registerTraveler]. Collecting it now means persisting it later is a one-line change.
 *
 * Choosing "organization" never submits anything: it swaps the form for the web-only screen, so no
 * `organization_owner` payload can leave a mobile surface (G4, G5).
 */
@Composable
fun RegisterScreen(
    config: SignInConfig,
    session: AuthSessionHolder,
    locale: String = AuthStrings.defaultLocale,
    onBackToSignIn: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val spacing = TripsEnjoyTheme.spacing
    val scope = rememberCoroutineScope()
    val isSupplier = config.registrationRole != null

    var fullName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var country by remember(locale) { mutableStateOf(defaultCountryCode(locale)) }
    var parentToggle by remember { mutableStateOf(false) }
    var supplierChoice by remember {
        mutableStateOf(
            when (config.registrationRole) {
                AuthRepository.ROLE_PLATFORM_PHOTOGRAPHER -> SupplierChoice.PHOTOGRAPHER
                else -> SupplierChoice.DRIVER
            },
        )
    }
    var busy by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<AuthErrorView?>(null) }
    // A supplier verifies both channels, so the queue holds every dispatch the server returned.
    var otpQueue by remember { mutableStateOf<List<OtpTarget>>(emptyList()) }
    var otpIndex by remember { mutableStateOf(0) }
    var pendingApprovalContact by remember { mutableStateOf<String?>(null) }
    var showWebOnly by remember { mutableStateOf(false) }

    if (showWebOnly) {
        WebOnlyRegistrationScreen(locale = locale, onBack = { showWebOnly = false }, modifier = modifier)
        return
    }

    val awaitingApproval = pendingApprovalContact
    if (awaitingApproval != null) {
        val chosenRole = when (supplierChoice) {
            SupplierChoice.PHOTOGRAPHER -> AuthRepository.ROLE_PLATFORM_PHOTOGRAPHER
            SupplierChoice.DRIVER, SupplierChoice.ORGANIZATION -> AuthRepository.ROLE_PLATFORM_DRIVER
        }
        PendingApprovalScreen(
            contact = awaitingApproval,
            locale = locale,
            onBackToSignIn = onBackToSignIn,
            modifier = modifier,
            session = session,
            role = chosenRole,
        )
        return
    }

    val otp = otpQueue.getOrNull(otpIndex)
    if (otp != null) {
        OtpScreen(
            target = otp.target,
            purpose = AuthRepository.PURPOSE_REGISTRATION,
            dispatch = otp.dispatch,
            session = session,
            locale = locale,
            onVerified = { record ->
                if (isSupplier) {
                    if (otpIndex + 1 < otpQueue.size) {
                        otpIndex += 1
                    } else {
                        pendingApprovalContact = otpQueue.firstOrNull()?.target ?: otp.target
                    }
                } else {
                    session.onAuthenticated(record)
                }
            },
            onChangeIdentifier = onBackToSignIn,
            modifier = modifier,
            onVerifiedWithoutSession = {
                // No session means one of two things, and both are correct outcomes:
                // another channel is still outstanding (verify it), or the role is waiting for
                // approval (show the pending screen and store nothing, D5 / AC-1).
                if (otpIndex + 1 < otpQueue.size) {
                    otpIndex += 1
                } else {
                    pendingApprovalContact = otpQueue.firstOrNull()?.target ?: otp.target
                }
            },
        )
        return
    }

    AuthScaffold(
        title = AuthStrings.t("auth.signUp.title", locale),
        subtitle = AuthStrings.t("auth.signUp.subtitle", locale),
        locale = locale,
        modifier = modifier,
    ) {
        val bannerError = error?.takeIf { it.field == null }
        if (bannerError != null) {
            TeInlineAlert(
                tone = AlertTone.Error,
                title = AuthErrorMapper.messageFor(bannerError, locale),
            )
        }

        if (isSupplier) {
            Column(verticalArrangement = Arrangement.spacedBy(spacing.space2)) {
                Text(
                    text = AuthStrings.t("auth.signUp.roleLabel", locale),
                    style = TripsEnjoyTheme.typography.label,
                    color = TripsEnjoyTheme.colors.ink,
                )
                Row(horizontalArrangement = Arrangement.spacedBy(spacing.space2)) {
                    TeChip(
                        label = AuthStrings.t("auth.signUp.roleDriver", locale),
                        selected = supplierChoice == SupplierChoice.DRIVER,
                        onClick = { supplierChoice = SupplierChoice.DRIVER },
                        enabled = !busy,
                    )
                    TeChip(
                        label = AuthStrings.t("auth.signUp.rolePhotographer", locale),
                        selected = supplierChoice == SupplierChoice.PHOTOGRAPHER,
                        onClick = { supplierChoice = SupplierChoice.PHOTOGRAPHER },
                        enabled = !busy,
                    )
                    TeChip(
                        label = AuthStrings.t("auth.signUp.roleOrganization", locale),
                        selected = false,
                        onClick = {
                            // Never submitted: the form is replaced by the web-only screen (G4).
                            showWebOnly = true
                        },
                        enabled = !busy,
                    )
                }
                Text(
                    text = AuthStrings.t("auth.signUp.hintBoth", locale),
                    style = TripsEnjoyTheme.typography.caption,
                    color = TripsEnjoyTheme.colors.inkMuted,
                )
            }
        } else {
            Text(
                text = AuthStrings.t("auth.signUp.hintEither", locale),
                style = TripsEnjoyTheme.typography.caption,
                color = TripsEnjoyTheme.colors.inkMuted,
            )
        }

        TeInput(
            value = fullName,
            onValueChange = { fullName = it },
            label = AuthStrings.t("auth.signUp.fullName", locale),
            error = error?.takeIf { it.field == AuthErrorMapper.FIELD_FULL_NAME }
                ?.let { AuthErrorMapper.messageFor(it, locale) },
            enabled = !busy,
        )
        TeInput(
            value = email,
            onValueChange = { email = it },
            label = AuthStrings.t("auth.signUp.email", locale),
            error = error?.takeIf { it.field == AuthErrorMapper.FIELD_EMAIL }
                ?.let { AuthErrorMapper.messageFor(it, locale) },
            enabled = !busy,
        )
        TeInput(
            value = phone,
            onValueChange = { phone = it },
            label = AuthStrings.t("auth.signUp.phone", locale),
            error = error?.takeIf { it.field == AuthErrorMapper.FIELD_PHONE }
                ?.let { AuthErrorMapper.messageFor(it, locale) },
            enabled = !busy,
        )

        Column(verticalArrangement = Arrangement.spacedBy(spacing.space2)) {
            Text(
                text = AuthStrings.t("auth.signUp.country", locale),
                style = TripsEnjoyTheme.typography.label,
                color = TripsEnjoyTheme.colors.ink,
            )
            Row(horizontalArrangement = Arrangement.spacedBy(spacing.space2)) {
                AuthConventions.AuthCountries.forEach { market ->
                    val name = countryName(market.code, locale)
                    TeChip(
                        // A disabled market is shown greyed with a "coming soon" hint, never hidden (G1).
                        label = if (market.enabled) {
                            name
                        } else {
                            AuthStrings.format(
                                "auth.signUp.countryComingSoon",
                                locale,
                                mapOf("country" to name),
                            )
                        },
                        selected = country == market.code,
                        onClick = { if (isRegistrationCountryEnabled(market.code)) country = market.code },
                        enabled = isRegistrationCountryEnabled(market.code) && !busy,
                    )
                }
            }
        }

        TeInput(
            value = password,
            onValueChange = { password = it },
            label = AuthStrings.t("auth.signUp.password", locale),
            supportingText = AuthStrings.t("auth.signUp.passwordHint", locale),
            error = error?.takeIf { it.field == AuthErrorMapper.FIELD_PASSWORD }
                ?.let { AuthErrorMapper.messageFor(it, locale) },
            enabled = !busy,
        )

        if (!isSupplier) {
            TeChip(
                label = AuthStrings.t("auth.signUp.parentToggle", locale),
                selected = parentToggle,
                onClick = { parentToggle = !parentToggle },
                enabled = !busy,
            )
        }

        TeButton(
            text = if (busy) {
                AuthStrings.t("auth.common.submitting", locale)
            } else {
                AuthStrings.t("auth.signUp.submit", locale)
            },
            onClick = {
                if (busy) return@TeButton
                // No PII: only the chosen role/channel shape, not the name, email or phone.
                AnalyticsTracker.trackAction(
                    "register_submit",
                    mapOf("role" to (config.registrationRole ?: "unknown"), "supplier" to supplierChoice.name),
                )
                val validation = validateRegistration(
                    fullName = fullName,
                    email = email,
                    phone = phone,
                    password = password,
                    requireBothChannels = isSupplier,
                    locale = locale,
                )
                if (validation != null) {
                    error = validation
                    return@TeButton
                }
                scope.launch {
                    busy = true
                    error = null
                    try {
                        val outcome = register(
                            config = config,
                            supplierChoice = supplierChoice,
                            fullName = fullName.trim(),
                            email = email.trim(),
                            phone = phone.trim(),
                            password = password,
                            parentToggle = parentToggle,
                            country = country,
                            session = session,
                        )
                        val fallbackTarget = email.trim().ifBlank { phone.trim() }
                        val queue = outcome.otpDispatches.map { dispatch ->
                            OtpTarget(
                                target = dispatch.targetIdentifier.takeIf { it.isNotBlank() }
                                    ?: fallbackTarget,
                                dispatch = dispatch,
                            )
                        }
                        otpQueue = queue.ifEmpty { listOf(OtpTarget(fallbackTarget, null)) }
                        otpIndex = 0
                    } catch (caught: CancellationException) {
                        throw caught
                    } catch (caught: Throwable) {
                        error = AuthErrorMapper.fromThrowable(
                            error = caught,
                            procedure = config.registrationProcedure,
                            locale = locale,
                            nowMs = session.repository.nowMillis(),
                        )
                    } finally {
                        busy = false
                    }
                }
            },
            modifier = Modifier.fillMaxWidth(),
            size = TeButtonSize.Large,
            enabled = !busy,
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(spacing.space2),
        ) {
            TeButton(
                text = AuthStrings.t("auth.signUp.haveAccount", locale),
                onClick = {},
                variant = TeButtonVariant.Ghost,
                enabled = false,
            )
            TeButton(
                text = AuthStrings.t("auth.signUp.signIn", locale),
                onClick = onBackToSignIn,
                variant = TeButtonVariant.Ghost,
                enabled = !busy,
            )
        }
    }
}

/** Where the OTP for a fresh registration goes. */
private data class OtpTarget(val target: String, val dispatch: OtpDispatch?)

/**
 * R-ORG: the screen an organization applicant sees instead of a form (PRD §6, FR-AUTH-11).
 *
 * It makes no call. The "open the website" action is deliberately a plain button with no platform
 * browser intent, because the shared module has no `expect`/`actual` URL opener and adding one is
 * outside the auth scope; the body copy already tells the user what to do.
 */
@Composable
fun WebOnlyRegistrationScreen(
    locale: String = AuthStrings.defaultLocale,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    AuthScaffold(
        title = AuthStrings.t("auth.signUp.webOnlyTitle", locale),
        subtitle = AuthStrings.t("auth.signUp.webOnlyBody", locale),
        locale = locale,
        modifier = modifier,
    ) {
        TeInlineAlert(
            tone = AlertTone.Info,
            title = AuthStrings.t("auth.signUp.webOnlyCta", locale),
        )
        TeButton(
            text = AuthStrings.t("auth.signUp.webOnlyBack", locale),
            onClick = onBack,
            modifier = Modifier.fillMaxWidth(),
            size = TeButtonSize.Large,
            variant = TeButtonVariant.Secondary,
        )
    }
}

/** Local validation, so an obviously empty form never costs a round trip. */
private fun validateRegistration(
    fullName: String,
    email: String,
    phone: String,
    password: String,
    requireBothChannels: Boolean,
    locale: String,
): AuthErrorView? {
    if (fullName.trim().length < 2) {
        return AuthErrorMapper.requiredFieldError(AuthErrorMapper.FIELD_FULL_NAME, locale)
    }
    if (requireBothChannels) {
        if (email.isBlank()) {
            return AuthErrorMapper.requiredFieldError(AuthErrorMapper.FIELD_EMAIL, locale)
        }
        if (phone.isBlank()) {
            return AuthErrorMapper.requiredFieldError(AuthErrorMapper.FIELD_PHONE, locale)
        }
    } else if (email.isBlank() && phone.isBlank()) {
        return AuthErrorMapper.requiredFieldError(AuthErrorMapper.FIELD_IDENTIFIER, locale)
    }
    if (password.isNotEmpty() && password.length < MIN_PASSWORD_LENGTH) {
        // A too-short password is not "required": it gets the policy hint the form already shows.
        return AuthErrorView(
            key = AuthErrorMapper.fieldKey(AuthErrorMapper.FIELD_PASSWORD),
            params = mapOf(
                AuthErrorMapper.PARAM_MESSAGE to AuthStrings.t("auth.signUp.passwordHint", locale),
            ),
            field = AuthErrorMapper.FIELD_PASSWORD,
            recovery = AuthErrorRecovery.FOCUS_FIELD,
        )
    }
    return null
}

/** The password policy the server enforces; checking it here only saves a round trip. */
private const val MIN_PASSWORD_LENGTH = 12

/** Calls the right registration procedure for the chosen role. */
private suspend fun register(
    config: SignInConfig,
    supplierChoice: SupplierChoice,
    fullName: String,
    email: String,
    phone: String,
    password: String,
    parentToggle: Boolean,
    country: String,
    session: AuthSessionHolder,
): RegistrationOutcome = if (config.registrationRole == null) {
    session.repository.registerTraveler(
        fullName = fullName,
        email = email.ifBlank { null },
        phone = phone.ifBlank { null },
        password = password.ifBlank { null },
        enableParentRole = parentToggle,
        countryCode = country,
    )
} else {
    val role = when (supplierChoice) {
        SupplierChoice.PHOTOGRAPHER -> AuthRepository.ROLE_PLATFORM_PHOTOGRAPHER
        // ORGANIZATION never reaches here: the chip swaps the form for the web-only screen.
        SupplierChoice.DRIVER, SupplierChoice.ORGANIZATION -> AuthRepository.ROLE_PLATFORM_DRIVER
    }
    session.repository.registerSupplierAccount(
        role = role,
        fullName = fullName,
        email = email,
        phone = phone,
        password = password,
        countryCode = country,
    )
}
