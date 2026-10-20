package com.tripsenjoy.analytics

/**
 * Kotlin/Wasm (webApp) actual: no-op.
 *
 * Known gap: same as the jsMain actual — the web build has no Firebase Analytics JS integration,
 * so events are dropped. Close it together with the jsMain actual once the webApp loads a
 * Firebase web config.
 */
actual object AnalyticsTracker {
    actual fun trackScreen(screenName: String, params: Map<String, String>) {
        // No-op: see the class doc.
    }

    actual fun trackAction(name: String, params: Map<String, String>) {
        // No-op: see the class doc.
    }
}
