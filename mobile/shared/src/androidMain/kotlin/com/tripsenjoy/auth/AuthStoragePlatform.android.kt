package com.tripsenjoy.auth

import android.content.Context
import android.content.SharedPreferences
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext

/** The one storage key, shared with web and iOS (PRD §7.1 T1). */
private const val AUTH_STORAGE_KEY: String = "trips.auth.v1"

/** The preferences file. One per app, named after the same contract key. */
private const val AUTH_STORAGE_FILE: String = "trips.auth.v1"

/**
 * Android storage: private `SharedPreferences` under the one auth key (PRD §7.1).
 *
 * `LocalContext` supplies the `Context` without an `Application` subclass or a per-app initializer,
 * and `AuthProvider` is the single call site, so all four apps inherit it.
 */
private class AndroidAuthStorage(private val preferences: SharedPreferences) : AuthStorage {

    override fun read(): String? = runCatching { preferences.getString(AUTH_STORAGE_KEY, null) }.getOrNull()

    override fun write(value: String) {
        // commit() rather than apply(): the record must be on disk before the process can die, and it
        // is a single small string, so the cost is negligible.
        preferences.edit().putString(AUTH_STORAGE_KEY, value).commit()
    }

    override fun clear() {
        preferences.edit().remove(AUTH_STORAGE_KEY).commit()
    }
}

@Composable
actual fun rememberAuthStorage(): AuthStorage {
    val context = LocalContext.current.applicationContext
    return remember(context) {
        AndroidAuthStorage(context.getSharedPreferences(AUTH_STORAGE_FILE, Context.MODE_PRIVATE))
    }
}
