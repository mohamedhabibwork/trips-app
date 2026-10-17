package com.tripsenjoy.auth

import androidx.compose.runtime.Composable

/**
 * The platform persistence boundary (ARCHITECTURE §5.4).
 *
 * One implementation per target, one record per platform. It is an interface so `commonTest` can
 * use an in-memory fake without a platform, and so the four apps share exactly one implementation.
 *
 * Implementations must never log the value they read or write (PRD §7.1 T4).
 */
interface AuthStorage {
    /** The stored record, or `null` when nothing is stored or the platform cannot be read. */
    fun read(): String?

    /** Replaces the stored record. */
    fun write(value: String)

    /** Removes the stored record. Must be a no-op when nothing is stored. */
    fun clear()
}

/**
 * The storage for the current platform.
 *
 * Android: `SharedPreferences` under the auth storage key.
 * iOS: `NSUserDefaults`.
 * JS: `localStorage` when a probe write succeeds, otherwise memory.
 * Wasm: memory only — `localStorage` is not reachable from `wasmJsMain` in this build.
 */
@Composable
expect fun rememberAuthStorage(): AuthStorage

/**
 * An [AuthStorage] that keeps the record in a plain field. Used by the wasm target and by tests.
 *
 * It is deliberately not `synchronized`: every call site is on the UI thread or a single coroutine
 * dispatcher, and a lost write only costs one sign-in.
 */
class InMemoryAuthStorage(initial: String? = null) : AuthStorage {
    private var value: String? = initial

    override fun read(): String? = value

    override fun write(value: String) {
        this.value = value
    }

    override fun clear() {
        value = null
    }
}
