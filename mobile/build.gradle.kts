plugins {
    // this is necessary to avoid the plugins to be loaded multiple times
    // in each subproject's classloader
    alias(libs.plugins.androidApplication) apply false
    alias(libs.plugins.androidMultiplatformLibrary) apply false
    alias(libs.plugins.composeMultiplatform) apply false
    alias(libs.plugins.composeCompiler) apply false
    alias(libs.plugins.kotlinMultiplatform) apply false
    alias(libs.plugins.googleServices) apply false
    alias(libs.plugins.firebaseCrashlytics) apply false
    alias(libs.plugins.firebasePerf) apply false
}
// Builds every mobile app: Android debug APKs, plus the web test harness (Kotlin/Wasm).
// Production web is apps/web (TanStack Start), not this build. iOS is built separately
// with xcodebuild from each app's iosApp folder.
tasks.register("buildAllApps") {
    group = "build"
    description = "Builds the Android apps and the Kotlin/Wasm test harness."
    dependsOn(
        ":androidApp:assembleDebug",
        ":driver:androidApp:assembleDebug",
        ":photographer:androidApp:assembleDebug",
        ":moderator:androidApp:assembleDebug",
        ":webApp:wasmJsBrowserDistribution",
    )
}
