package com.tripsenjoy.traveler

import androidx.compose.runtime.Composable
import androidx.compose.ui.tooling.preview.Preview
import com.tripsenjoy.auth.AuthGate
import com.tripsenjoy.auth.AuthProvider
import com.tripsenjoy.auth.AuthStrings
import com.tripsenjoy.auth.LocalAuthApi
import com.tripsenjoy.auth.SignInConfig
import com.tripsenjoy.surfaces.traveler.TravelerSurface

/**
 * Traveler app entry, shared by Android, iOS and web.
 *
 * Authentication wraps the surface, so a cold start shows the sign-in screen and the traveler
 * content only appears once a session exists (AC-4: a stored record signs the user in with no
 * network round trip and no sign-in flash).
 */
@Composable
@Preview
fun App(locale: String = AuthStrings.defaultLocale) {
    AuthProvider(config = SignInConfig.TRAVELER, locale = locale) {
        val api = LocalAuthApi.current
        AuthGate {
            TravelerSurface(api)
        }
    }
}
