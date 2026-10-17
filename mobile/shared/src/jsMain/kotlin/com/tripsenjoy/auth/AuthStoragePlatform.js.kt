package com.tripsenjoy.auth

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import kotlinx.browser.localStorage

/** The one storage key, shared with web, Android and iOS (PRD §7.1 T1). */
private const val AUTH_STORAGE_KEY: String = "trips.auth.v1"

/** The key used to prove `localStorage` is writable before relying on it. */
private const val AUTH_PROBE_KEY: String = "trips.auth.v1.probe"

/**
 * JS storage: `localStorage` when a probe write succeeds, otherwise memory (ARCHITECTURE §5.4).
 *
 * The probe matters because `localStorage` throws a `SecurityError` when the browser blocks storage
 * for the origin (private mode, third-party frame, disabled cookies). Without the probe the app
 * would fail on the first write instead of degrading to a session that lives as long as the tab.
 */
private class JsAuthStorage(private val backing: AuthStorage) : AuthStorage {

    override fun read(): String? = runCatching { backing.read() }.getOrNull()

    override fun write(value: String) {
        runCatching { backing.write(value) }
    }

    override fun clear() {
        runCatching { backing.clear() }
    }
}

/** `localStorage` when it is reachable and writable, memory otherwise. */
private fun browserOrMemoryStorage(): AuthStorage {
    val localStorageWorks = runCatching {
        localStorage.setItem(AUTH_PROBE_KEY, "1")
        localStorage.removeItem(AUTH_PROBE_KEY)
        true
    }.getOrDefault(false)
    if (!localStorageWorks) return InMemoryAuthStorage()

    return object : AuthStorage {
        override fun read(): String? = localStorage.getItem(AUTH_STORAGE_KEY)

        override fun write(value: String) {
            localStorage.setItem(AUTH_STORAGE_KEY, value)
        }

        override fun clear() {
            localStorage.removeItem(AUTH_STORAGE_KEY)
        }
    }
}

@Composable
actual fun rememberAuthStorage(): AuthStorage =
    remember { JsAuthStorage(browserOrMemoryStorage()) }
