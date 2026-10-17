package com.tripsenjoy.auth

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import platform.Foundation.NSUserDefaults

/** The one storage key, shared with web and Android (PRD §7.1 T1). */
private const val AUTH_STORAGE_KEY: String = "trips.auth.v1"

/**
 * iOS storage: `NSUserDefaults` (ARCHITECTURE D7).
 *
 * Keychain would need a `SecItem*` cinterop surface that CI cannot exercise; `NSUserDefaults` is
 * app-sandboxed but **not** encrypted at rest, which is the accepted trade-off recorded as R-7.
 * The container is not synced to iCloud, so the record never leaves the device.
 */
private class IosAuthStorage(private val defaults: NSUserDefaults) : AuthStorage {

    override fun read(): String? = defaults.stringForKey(AUTH_STORAGE_KEY)

    override fun write(value: String) {
        defaults.setObject(value, AUTH_STORAGE_KEY)
    }

    override fun clear() {
        defaults.removeObjectForKey(AUTH_STORAGE_KEY)
    }
}

@Composable
actual fun rememberAuthStorage(): AuthStorage = remember { IosAuthStorage(NSUserDefaults.standardUserDefaults) }
