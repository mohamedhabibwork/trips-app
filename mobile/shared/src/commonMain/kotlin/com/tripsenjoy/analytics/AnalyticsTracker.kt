package com.tripsenjoy.analytics

/**
 * The single analytics entry point for every mobile surface.
 *
 * - Android: `androidMain` actual sends events through Firebase Analytics (`Firebase.analytics`).
 * - iOS: `iosMain` actual is a no-op until the shared framework integrates the FirebaseAnalytics
 *   pod (the shared module does not use the Kotlin CocoaPods integration today — see the actual).
 * - js / wasmJs (webApp): no-op actuals; Firebase Analytics JS is not wired into the web build.
 *
 * Ground rules: never pass PII (identifiers, phone numbers, emails, OTP codes). Event and param
 * names must stay within Firebase limits (event name <= 40 chars, param key <= 40, value <= 100).
 */
expect object AnalyticsTracker {
    /** A screen became visible. One call per screen change, emitted from the central navigation. */
    fun trackScreen(screenName: String, params: Map<String, String> = emptyMap())

    /** A user action (button tap, tab switch, sign-out, …). Names use `snake_case`. */
    fun trackAction(name: String, params: Map<String, String> = emptyMap())
}
