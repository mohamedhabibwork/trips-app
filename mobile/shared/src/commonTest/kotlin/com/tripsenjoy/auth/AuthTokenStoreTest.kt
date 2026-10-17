package com.tripsenjoy.auth

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

/** An [AuthStorage] with no platform, recording how often it was touched. */
class FakeAuthStorage(initial: String? = null) : AuthStorage {
    private var value: String? = initial

    var reads: Int = 0
        private set
    var writes: Int = 0
        private set
    var clears: Int = 0
        private set

    override fun read(): String? {
        reads++
        return value
    }

    override fun write(value: String) {
        writes++
        this.value = value
    }

    override fun clear() {
        clears++
        value = null
    }

    /** The raw stored value, for assertions about what actually landed in storage. */
    fun raw(): String? = value
}

class AuthTokenStoreTest {

    private val actor = AuthActor(accountId = "acct-1", sessionId = "s1", activeRole = "traveler")

    private fun record(accessToken: String = "access-1", refreshToken: String = "refresh-1") =
        SessionRecord(
            accessToken = accessToken,
            refreshToken = refreshToken,
            accessTokenExpiresAt = 1_000L,
            sessionMaxExpiresAt = 2_000L,
            actor = actor,
        )

    @Test
    fun `save writes the record to storage and publishes it`() {
        val storage = FakeAuthStorage()
        val store = AuthTokenStore(storage)

        store.save(record())

        assertEquals("access-1", store.accessToken())
        assertNotNull(store.current())
        assertEquals(1, storage.writes)
        assertTrue(storage.raw()!!.contains("\"accessToken\":\"access-1\""))
    }

    @Test
    fun `a stored record hydrates without a network call`() {
        val storage = FakeAuthStorage(SessionRecord.serialize(record()))
        val store = AuthTokenStore(storage)

        assertEquals("access-1", store.accessToken())
        assertEquals("acct-1", store.current()?.actor?.accountId)
    }

    @Test
    fun `clear removes both the memory copy and the stored value`() {
        val storage = FakeAuthStorage(SessionRecord.serialize(record()))
        val store = AuthTokenStore(storage)

        store.clear()

        assertNull(store.accessToken())
        assertNull(store.current())
        assertNull(storage.raw())
        assertEquals(1, storage.clears)
    }

    @Test
    fun `clearing twice is safe`() {
        val store = AuthTokenStore(FakeAuthStorage())
        store.clear()
        store.clear()
        assertNull(store.current())
    }

    @Test
    fun `malformed stored JSON is treated as absent`() {
        val store = AuthTokenStore(FakeAuthStorage("{not json"))
        assertNull(store.current())
        assertNull(store.accessToken())
    }

    @Test
    fun `a record missing a required field is treated as absent`() {
        val partial = """{"accessToken":"a","refreshToken":"r"}"""
        assertNull(AuthTokenStore(FakeAuthStorage(partial)).current())
    }

    @Test
    fun `an empty stored value is treated as absent`() {
        assertNull(AuthTokenStore(FakeAuthStorage("")).current())
        assertNull(AuthTokenStore(FakeAuthStorage(null)).current())
    }

    @Test
    fun `updateActor replaces the actor and keeps both tokens`() {
        val store = AuthTokenStore(FakeAuthStorage(SessionRecord.serialize(record())))
        val updated = actor.copy(activeRole = "parent")

        store.updateActor(updated)

        assertEquals("parent", store.current()?.actor?.activeRole)
        assertEquals("access-1", store.accessToken())
        assertEquals("refresh-1", store.current()?.refreshToken)
    }

    @Test
    fun `reload picks up a record written behind the store`() {
        val storage = FakeAuthStorage()
        val store = AuthTokenStore(storage)
        assertNull(store.current())

        storage.write(SessionRecord.serialize(record()))
        store.reload()

        assertEquals("access-1", store.accessToken())
    }

    @Test
    fun `the record round-trips through the exact field names of the contract`() {
        val encoded = SessionRecord.serialize(record())
        assertTrue(encoded.contains("\"accessToken\""))
        assertTrue(encoded.contains("\"refreshToken\""))
        assertTrue(encoded.contains("\"accessTokenExpiresAt\""))
        assertTrue(encoded.contains("\"sessionMaxExpiresAt\""))
        assertTrue(encoded.contains("\"actor\""))
        assertEquals(record(), SessionRecord.parse(encoded))
    }

    @Test
    fun `the storage key is the generated convention`() {
        assertEquals("trips.auth.v1", AuthConventions.storageKey)
    }
}
