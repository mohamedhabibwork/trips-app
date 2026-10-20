package com.tripsenjoy.analytics

/**
 * iOS actual: no-op.
 *
 * TODO(Firebase-iOS): replace with real FirebaseAnalytics logging once the shared framework
 * integrates the `FirebaseAnalytics` CocoaPod (mobile/shared/build.gradle.kts has no
 * `kotlin { cocoapods { … } }` block and mobile/iosApp has no Podfile, so adding the pod
 * requires an iOS build restructuring that is out of scope here; the iosApp already ships
 * GoogleService-Info.plist). When wired, log:
 *   - `FirebaseAnalytics.EventScreenView` with `AnalyticsParameterScreenName` in trackScreen
 *   - the action name with its params as custom parameters in trackAction
 * until then events are dropped silently on iOS only.
 */
actual object AnalyticsTracker {
    actual fun trackScreen(screenName: String, params: Map<String, String>) {
        // No-op: see the class doc. Kept parameter-carrying so the future implementation can
        // log the same data as the Android actual.
    }

    actual fun trackAction(name: String, params: Map<String, String>) {
        // No-op: see the class doc.
    }
}
