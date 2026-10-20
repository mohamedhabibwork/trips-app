package com.tripsenjoy.analytics

/**
 * JS (webApp) actual: no-op.
 *
 * Known gap: the web build does not include Firebase Analytics JS (@firebase/analytics) and the
 * webApp does not load a Firebase web config, so events are dropped. To close the gap, add the
 * Firebase JS SDK to webApp and forward these calls to `logEvent`.
 */
actual object AnalyticsTracker {
    actual fun trackScreen(screenName: String, params: Map<String, String>) {
        // No-op: see the class doc.
    }

    actual fun trackAction(name: String, params: Map<String, String>) {
        // No-op: see the class doc.
    }
}
