package com.tripsenjoy.auth

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * The one place a session record lives in memory, backed by one [AuthStorage] (PRD §7.1 T1).
 *
 * There is no second copy: `ApiClient` reads its bearer token through [accessToken], the UI reads
 * [record], and nothing else caches a token. Clearing is a single operation shared by sign-out,
 * refresh failure and the session-expiry path (P0-5).
 *
 * The constructor hydrates from storage synchronously, so a relaunch with a valid record is
 * authenticated without a network round trip (AC-4).
 */
class AuthTokenStore(private val storage: AuthStorage) {

    private val _record = MutableStateFlow(SessionRecord.parse(storage.read()))

    /** The current record, observed by the provider so the UI follows sign-in and sign-out. */
    val record: StateFlow<SessionRecord?> = _record.asStateFlow()

    /** The current record, or `null` when signed out. */
    fun current(): SessionRecord? = _record.value

    /** The bearer token for the next request, or `null` when signed out. */
    fun accessToken(): String? = _record.value?.accessToken

    /** Persists [record] and publishes it. The write happens before the emission so a crash keeps it. */
    fun save(record: SessionRecord) {
        storage.write(SessionRecord.serialize(record))
        _record.value = record
    }

    /** Replaces only the cached actor, keeping both tokens untouched. */
    fun updateActor(actor: AuthActor) {
        val current = _record.value ?: return
        save(current.copy(actor = actor))
    }

    /** Removes the record from memory and from storage. Safe to call twice. */
    fun clear() {
        storage.clear()
        _record.value = null
    }

    /**
     * Re-reads storage. Used by tests and by a platform that restored storage behind our back.
     * A malformed value is treated as absent (T1).
     */
    fun reload() {
        _record.value = SessionRecord.parse(storage.read())
    }
}
