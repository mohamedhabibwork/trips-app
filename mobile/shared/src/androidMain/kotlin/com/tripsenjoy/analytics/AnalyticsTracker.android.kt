package com.tripsenjoy.analytics

import com.google.firebase.Firebase
import com.google.firebase.analytics.FirebaseAnalytics
import com.google.firebase.analytics.analytics
import com.google.firebase.analytics.logEvent

/**
 * Android actual: Firebase Analytics, provided through the shared module's `firebase-analytics`
 * dependency (BoM-managed, same catalog entry as :androidApp). Firebase is auto-initialized by
 * the google-services plugin of every consuming Android app (`trips-enjoy-google-services.json`).
 *
 * Every call is guarded so an uninitialized Firebase or a logging failure can never crash the UI.
 */
actual object AnalyticsTracker {
    actual fun trackScreen(screenName: String, params: Map<String, String>) {
        runCatching {
            Firebase.analytics.logEvent(FirebaseAnalytics.Event.SCREEN_VIEW) {
                param(FirebaseAnalytics.Param.SCREEN_NAME, screenName)
                for ((key, value) in params) param(key, value)
            }
        }
    }

    actual fun trackAction(name: String, params: Map<String, String>) {
        runCatching {
            Firebase.analytics.logEvent(name) {
                for ((key, value) in params) param(key, value)
            }
        }
    }
}
