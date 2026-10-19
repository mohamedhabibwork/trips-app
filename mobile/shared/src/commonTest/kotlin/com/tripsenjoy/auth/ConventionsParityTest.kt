package com.tripsenjoy.auth

import com.tripsenjoy.auth.screens.countryName
import com.tripsenjoy.auth.screens.defaultCountryCode
import com.tripsenjoy.auth.screens.isRegistrationCountryEnabled
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

/**
 * Guards the codegen (ARCHITECTURE §6 rule 3).
 *
 * If `generateAuthContract` silently stops producing values, or the JSON changes shape, this test
 * fails instead of letting the app behave differently. Every assertion here is a value the Kotlin
 * code depends on, compared against the contract the design documents.
 */
/** The surface values `moderatorSignInSchema` accepts (packages/services/auth validation). */
private val MODERATOR_SURFACES = setOf("mobile", "pwa")

class ConventionsParityTest {

    @Test
    fun `the storage key is the one the design documents`() {
        assertEquals("trips.auth.v1", AuthConventions.storageKey)
        assertEquals(1, AuthConventions.version)
    }

    @Test
    fun `the refresh window and token lifetimes match the design`() {
        assertEquals(60_000L, AuthConventions.refreshLeadMs)
        assertEquals(900L, AuthConventions.accessTokenTtlSeconds)
        assertEquals(43_200L, AuthConventions.webSessionMaxSeconds)
        assertEquals(60_000L, AuthExpiry.defaultLeadMs)
    }

    @Test
    fun `the OTP rules match the design`() {
        assertEquals(6, AuthConventions.otpCodeLength)
        assertEquals(5, AuthConventions.otpMaxWrongAttempts)
    }

    @Test
    fun `the status strings are exactly the ones AuthStatus serialises`() {
        assertEquals(
            listOf("loading", "authenticated", "anonymous", "sessionExpired"),
            AuthConventions.statuses,
        )
        assertEquals(AuthConventions.statuses, AuthStatus.wireValues)
        for (status in AuthStatus.entries) {
            assertEquals(status, AuthStatus.fromWire(status.wire))
        }
    }

    @Test
    fun `every no-refresh procedure is a real procedure the app calls`() {
        val procedures = AuthConventions.noRefreshProcedures
        assertTrue(procedures.isNotEmpty())
        assertTrue("auth/refreshSession" in procedures)
        assertTrue("auth/signIn" in procedures)
        assertTrue("auth/adminSignIn" in procedures)
        assertTrue("auth/staffSignIn" in procedures)
        assertTrue("auth/moderatorSignIn" in procedures)
        // The refresh procedure itself must never be wrapped by the reactive retry (R3).
        assertTrue(AuthRefreshPolicy.isNoRefreshProcedure(AuthRepository.PROC_REFRESH_SESSION))
    }

    @Test
    fun `the sign-in procedure set is a subset of the procedures the app calls`() {
        val known = setOf(
            AuthRepository.PROC_SIGN_IN,
            AuthRepository.PROC_VERIFY_OTP,
            AuthRepository.PROC_ADMIN_SIGN_IN,
            AuthRepository.PROC_ADMIN_VERIFY_TOTP,
            AuthRepository.PROC_STAFF_SIGN_IN,
            AuthRepository.PROC_STAFF_VERIFY_SECOND_FACTOR,
            AuthRepository.PROC_MODERATOR_SIGN_IN,
        )
        for (procedure in AuthConventions.signInProcedures) {
            assertTrue(procedure in known, "$procedure is not a procedure this module calls")
        }
        assertTrue(AuthRepository.PROC_SIGN_IN in AuthConventions.signInProcedures)
    }

    @Test
    fun `the OTP procedure set covers verification and resend`() {
        assertTrue(AuthRepository.PROC_VERIFY_OTP in AuthConventions.otpProcedures)
        assertTrue(AuthRepository.PROC_RESEND_OTP in AuthConventions.otpProcedures)
    }

    @Test
    fun `the refreshable codes include the three the server actually sends`() {
        assertTrue("AUTH_TOKEN_EXPIRED" in AuthConventions.refreshableCodes)
        assertTrue("AUTH_SESSION_EXPIRED" in AuthConventions.refreshableCodes)
        assertTrue("UNAUTHORIZED" in AuthConventions.refreshableCodes)
        assertEquals(AuthConventions.refreshableCodes.toSet(), AuthRefreshPolicy.expiredCodes)
    }

    @Test
    fun `the maximum-session reason is the detail the server sends`() {
        assertEquals("MAX_SESSION_DURATION_REACHED", AuthConventions.maxSessionReason)
        assertEquals(AuthConventions.maxSessionReason, AuthRefreshPolicy.maxSessionReason)
    }

    @Test
    fun `the fallback error key is the unexpected copy`() {
        assertEquals("auth.error.unexpected", AuthConventions.fallbackErrorKey)
    }

    @Test
    fun `the error table is not empty and every row has a real key and recovery`() {
        assertTrue(AuthConventions.errorRows.isNotEmpty())
        for (row in AuthConventions.errorRows) {
            assertTrue(row.codes.isNotEmpty(), "a row with no codes is dead documentation")
            assertTrue(row.key.startsWith("auth."), "unexpected key shape: ${row.key}")
            assertTrue(
                AuthErrorRecovery.entries.any { it.wire == row.recovery },
                "unknown recovery '${row.recovery}' for ${row.key}",
            )
            assertTrue(
                AuthStrings.has(row.key),
                "the table references ${row.key}, which messages.json does not define",
            )
        }
    }

    @Test
    fun `the error table lookup finds a documented row`() {
        val row = AuthConventions.errorRowFor("AUTH_OTP_INVALID")
        assertNotNull(row)
        assertEquals("auth.error.otpInvalid", row.key)
        assertEquals("clearCode", row.recovery)
    }

    @Test
    fun `the field names the screens send are declared in the contract`() {
        val expected = listOf(
            AuthErrorMapper.FIELD_IDENTIFIER,
            AuthErrorMapper.FIELD_PASSWORD,
            AuthErrorMapper.FIELD_CODE,
            AuthErrorMapper.FIELD_STAFF_CODE,
            AuthErrorMapper.FIELD_EMAIL,
            AuthErrorMapper.FIELD_PHONE,
            AuthErrorMapper.FIELD_FULL_NAME,
            AuthErrorMapper.FIELD_SURFACE,
        )
        for (field in expected) {
            assertTrue(field in AuthConventions.fieldNames, "$field is not a declared field name")
        }
    }

    @Test
    fun `the surfaces and their platforms are generated`() {
        assertTrue(AuthConventions.surfaces.isNotEmpty())
        // `surfacePlatforms` maps a surface id to the platform it belongs to: the traveler, business,
        // admin and studio surfaces are web, crew is the PWA, and the three role apps are mobile.
        assertEquals("web", AuthConventions.surfacePlatforms["traveler"])
        assertEquals("web", AuthConventions.surfacePlatforms["business"])
        assertEquals("pwa", AuthConventions.surfacePlatforms["crew"])
        assertEquals("mobile", AuthConventions.surfacePlatforms["driver"])
        assertEquals("mobile", AuthConventions.surfacePlatforms["photographer"])
        assertEquals("mobile", AuthConventions.surfacePlatforms["moderator"])
        assertEquals("/sign-in", AuthConventions.signInPaths["traveler"])
    }

    @Test
    fun `the moderator app declares the crew surface which the schema accepts`() {
        // The moderator is the crew surface. `moderatorSignInSchema` accepts "mobile" and "pwa"; the
        // mobile moderator app sends "pwa" so it is indistinguishable from the /crew PWA, which is
        // what the auth e2e flow uses. Everything else declares "mobile".
        assertEquals("pwa", SignInConfig.MODERATOR.surface)
        assertTrue("pwa" in MODERATOR_SURFACES)
        assertTrue("mobile" in MODERATOR_SURFACES)
        assertEquals(AuthRepository.SURFACE_MOBILE, SignInConfig.TRAVELER.surface)
        assertEquals(AuthRepository.SURFACE_MOBILE, SignInConfig.DRIVER.surface)
        assertEquals(AuthRepository.SURFACE_MOBILE, SignInConfig.PHOTOGRAPHER.surface)
    }

    @Test
    fun `the copy ships both locales with the same key set`() {
        assertEquals(listOf("en", "ar"), AuthStrings.locales)
        assertEquals("en", AuthStrings.defaultLocale)
        assertTrue(AuthStrings.keys.size > 100, "the auth copy should be the full set of keys")

        for (key in AuthStrings.keys) {
            for (locale in AuthStrings.locales) {
                assertTrue(AuthStrings.has(key, locale), "$key is missing $locale")
                val message = AuthStrings.t(key, locale)
                assertTrue(message.isNotBlank(), "$key is blank in $locale")
            }
        }
    }

    @Test
    fun `every error key the mapper emits exists in the copy`() {
        val keys = listOf(
            AuthErrorMapper.Keys.INVALID_CREDENTIALS,
            AuthErrorMapper.Keys.ACCOUNT_LOCKED,
            AuthErrorMapper.Keys.OTP_INVALID,
            AuthErrorMapper.Keys.OTP_EXPIRED,
            AuthErrorMapper.Keys.OTP_PAUSED,
            AuthErrorMapper.Keys.OTP_COOLDOWN,
            AuthErrorMapper.Keys.MFA_REQUIRED,
            AuthErrorMapper.Keys.VERIFICATION_REQUIRED,
            AuthErrorMapper.Keys.SUSPENDED,
            AuthErrorMapper.Keys.DELETION_PENDING,
            AuthErrorMapper.Keys.SESSION_EXPIRED,
            AuthErrorMapper.Keys.VALIDATION,
            AuthErrorMapper.Keys.ALREADY_EXISTS,
            AuthErrorMapper.Keys.FORBIDDEN,
            AuthErrorMapper.Keys.WEB_ONLY_REGISTRATION,
            AuthErrorMapper.Keys.RATE_LIMITED,
            AuthErrorMapper.Keys.NOT_FOUND,
            AuthErrorMapper.Keys.UNAVAILABLE,
            AuthErrorMapper.Keys.UNEXPECTED,
        )
        for (key in keys) {
            assertTrue(AuthStrings.has(key), "$key is emitted by the mapper but missing from the copy")
        }
    }

    @Test
    fun `the field copy exists for every input a screen can highlight`() {
        val fields = listOf(
            AuthErrorMapper.FIELD_IDENTIFIER,
            AuthErrorMapper.FIELD_PASSWORD,
            AuthErrorMapper.FIELD_CODE,
            AuthErrorMapper.FIELD_STAFF_CODE,
            AuthErrorMapper.FIELD_EMAIL,
            AuthErrorMapper.FIELD_PHONE,
            AuthErrorMapper.FIELD_FULL_NAME,
            AuthErrorMapper.FIELD_COUNTRY,
        )
        for (field in fields) {
            assertTrue(
                AuthStrings.has(AuthErrorMapper.fieldKey(field)),
                "field.$field is missing, so a validation error has no message",
            )
        }
    }

    @Test
    fun `an unknown key renders as the key so a gap is visible`() {
        assertEquals("auth.does.not.exist", AuthStrings.t("auth.does.not.exist"))
        assertTrue(!AuthStrings.has("auth.does.not.exist"))
    }

    @Test
    fun `format fills every placeholder and leaves unknown ones alone`() {
        val formatted = AuthStrings.format(
            "auth.otp.resendIn",
            "en",
            mapOf("seconds" to "45"),
        )
        assertTrue(formatted.contains("45"), formatted)
        assertTrue(!formatted.contains("{seconds}"), formatted)

        val untouched = AuthStrings.format(
            "auth.otp.resendIn",
            "en",
            mapOf("other" to "1"),
        )
        assertTrue(untouched.contains("{seconds}"), untouched)
    }

    @Test
    fun `the app surfaces declare the right sign-in shape`() {
        assertEquals(AuthRepository.SURFACE_MOBILE, SignInConfig.TRAVELER.surface)
        assertEquals(AuthRepository.SURFACE_MOBILE, SignInConfig.DRIVER.surface)
        assertEquals(AuthRepository.SURFACE_MOBILE, SignInConfig.PHOTOGRAPHER.surface)

        assertTrue(SignInConfig.MODERATOR.isStaffCodeOnly)
        assertTrue(!SignInConfig.MODERATOR.allowRegistration)
        assertTrue(!SignInConfig.TRAVELER.isStaffCodeOnly)
        assertTrue(SignInConfig.TRAVELER.offersOtp)
        assertTrue(SignInConfig.TRAVELER.offersPassword)
        // Organization registration is never offered on mobile (FR-AUTH-11).
        assertTrue(SignInConfig.TRAVELER.registrationRole == null)
        assertTrue(SignInConfig.DRIVER.registrationRole == AuthRepository.ROLE_PLATFORM_DRIVER)
        assertTrue(
            SignInConfig.PHOTOGRAPHER.registrationRole ==
                AuthRepository.ROLE_PLATFORM_PHOTOGRAPHER,
        )
    }

    @Test
    fun `each app picks the registration procedure its role requires`() {
        assertEquals(AuthRepository.PROC_REGISTER_TRAVELER, SignInConfig.TRAVELER.registrationProcedure)
        assertEquals(AuthRepository.PROC_REGISTER_SUPPLIER, SignInConfig.DRIVER.registrationProcedure)
        assertEquals(AuthRepository.PROC_REGISTER_SUPPLIER, SignInConfig.PHOTOGRAPHER.registrationProcedure)
        // The moderator never registers, and organization registration is never offered on mobile.
        assertNull(SignInConfig.MODERATOR.registrationProcedure)
        assertEquals("platform_driver", SignInConfig.DRIVER.registrationRole)
        assertEquals("platform_photographer", SignInConfig.PHOTOGRAPHER.registrationRole)
        assertEquals(null, SignInConfig.TRAVELER.registrationRole)
    }

    @Test
    fun `the generated country list equals the contract exactly with Arabic included`() {
        // PRD §7.10 G6: the option list must be byte-identical on web and mobile and asserted from
        // one fixture. This is the mobile half: the full expected list, field by field, in order.
        val expected = listOf(
            AuthCountry(code = "EG", nameEn = "Egypt", nameAr = "\u0645\u0635\u0631", enabled = true),
            AuthCountry(
                code = "SA",
                nameEn = "Saudi Arabia",
                nameAr = "\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0639\u0631\u0628\u064a\u0629 \u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0629",
                enabled = false,
            ),
            AuthCountry(
                code = "AE",
                nameEn = "United Arab Emirates",
                nameAr = "\u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062a \u0627\u0644\u0639\u0631\u0628\u064a\u0629 \u0627\u0644\u0645\u062a\u062d\u062f\u0629",
                enabled = false,
            ),
        )
        assertEquals(expected, AuthConventions.AuthCountries)
    }

    @Test
    fun `the country list has three entries with EG first and exactly one enabled`() {
        val countries = AuthConventions.AuthCountries
        assertEquals(3, countries.size)
        assertEquals("EG", countries.first().code)
        assertEquals(1, countries.count { it.enabled })
        assertTrue(countries.first().enabled, "the first market must be the live one")
        assertEquals(listOf("SA", "AE"), countries.drop(1).map { it.code })
        assertTrue(countries.none { it.code.isBlank() }, "every market needs a code")
        assertTrue(countries.all { it.nameEn.isNotBlank() && it.nameAr.isNotBlank() }, "every market needs both names")
    }

    @Test
    fun `the locale to country map equals the contract`() {
        // PRD §7.10 G2: the default selection is data, so both platforms resolve a locale identically.
        assertEquals(mapOf("ar" to "EG", "en" to "EG"), AuthConventions.AuthDefaultCountryByLocale)
    }

    @Test
    fun `every locale in the map resolves to a market that exists and is enabled`() {
        for ((locale, code) in AuthConventions.AuthDefaultCountryByLocale) {
            val country = AuthConventions.AuthCountries.firstOrNull { it.code == code }
            assertNotNull(country, "locale '$locale' points at unknown market '$code'")
            assertTrue(country.enabled, "locale '$locale' points at disabled market '$code'")
        }
    }

    @Test
    fun `ar and en both select EG`() {
        assertEquals("EG", defaultCountryCode("ar"))
        assertEquals("EG", defaultCountryCode("en"))
    }

    @Test
    fun `the contract default market is a real enabled market and the map agrees with it`() {
        assertEquals("EG", AuthConventions.AuthDefaultRegistrationCountry)
        assertTrue(
            isRegistrationCountryEnabled(AuthConventions.AuthDefaultRegistrationCountry),
            "the contract default must be an enabled market",
        )
        // Every mapped locale must resolve to the same market while only one is live.
        for (code in AuthConventions.AuthDefaultCountryByLocale.values) {
            assertTrue(isRegistrationCountryEnabled(code), "mapped market '$code' is not enabled")
        }
    }

    @Test
    fun `the default never resolves to a disabled or unknown market for any locale`() {
        // The property that matters: whatever the locale, the preselected market must be submittable.
        val locales = AuthConventions.AuthDefaultCountryByLocale.keys + listOf("fr", "", "AR", "ar-EG")
        for (locale in locales) {
            val code = defaultCountryCode(locale)
            assertTrue(
                isRegistrationCountryEnabled(code),
                "locale '$locale' preselected '$code', which cannot be submitted",
            )
        }
    }

    @Test
    fun `isRegistrationCountryEnabled mirrors the generated flags`() {
        assertTrue(isRegistrationCountryEnabled("EG"))
        assertTrue(!isRegistrationCountryEnabled("SA"))
        assertTrue(!isRegistrationCountryEnabled("AE"))
        // An unknown code is never enabled, so a stale stored value cannot be submitted.
        assertTrue(!isRegistrationCountryEnabled("XX"))
        assertTrue(!isRegistrationCountryEnabled(""))
    }

    @Test
    fun `an unknown locale falls back to the first enabled market`() {
        val firstEnabled = AuthConventions.AuthCountries.first { it.enabled }.code
        assertEquals(firstEnabled, defaultCountryCode("fr"))
        assertEquals(firstEnabled, defaultCountryCode(""))
        assertEquals(firstEnabled, defaultCountryCode("AR"))
    }

    @Test
    fun `the country name is localized and falls back to the code`() {
        assertEquals("Egypt", countryName("EG", "en"))
        assertEquals("\u0645\u0635\u0631", countryName("EG", "ar"))
        assertEquals("Saudi Arabia", countryName("SA", "en"))
        // An unknown market is echoed rather than blanked.
        assertEquals("XX", countryName("XX", "en"))
    }
}
