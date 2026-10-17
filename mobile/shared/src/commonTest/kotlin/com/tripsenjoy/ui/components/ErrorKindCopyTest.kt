package com.tripsenjoy.ui.components

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class ErrorKindCopyTest {

    @Test
    fun `not found copy names the page and points to trips`() {
        val copy = ErrorKind.NotFound.errorCopy()
        assertEquals("We could not find this page", copy.title)
        assertEquals("Go to your trips", copy.actionLabel)
    }

    @Test
    fun `server copy tells the traveler to try again and quotes the reference ID`() {
        val copy = ErrorKind.Server.errorCopy()
        assertEquals("Try again", copy.actionLabel)
        assertTrue(copy.message.contains("reference ID"))
    }

    @Test
    fun `offline copy says to check the connection`() {
        assertEquals("You are offline", ErrorKind.Offline.errorCopy().title)
        assertEquals("Try again", ErrorKind.Offline.errorCopy().actionLabel)
    }

    @Test
    fun `forbidden copy says who can grant access`() {
        assertTrue(ErrorKind.Forbidden.errorCopy().message.contains("trip organizer"))
    }

    @Test
    fun `only server errors show a reference ID`() {
        assertTrue(ErrorKind.Server.showsReferenceId())
        assertFalse(ErrorKind.NotFound.showsReferenceId())
        assertFalse(ErrorKind.Offline.showsReferenceId())
        assertFalse(ErrorKind.Forbidden.showsReferenceId())
    }

    @Test
    fun `unauthorized copy asks the traveler to sign in again`() {
        val copy = ErrorKind.Unauthorized.errorCopy()
        assertEquals("Sign in to continue", copy.title)
        assertEquals("Your session has ended. Sign in again to see this page.", copy.message)
        assertEquals("Sign in", copy.actionLabel)
    }

    @Test
    fun `unavailable copy says the service is temporarily down and offers a retry`() {
        val copy = ErrorKind.Unavailable.errorCopy()
        assertEquals("Service temporarily unavailable", copy.title)
        assertEquals("We are working on it. Try again in a few minutes.", copy.message)
        assertEquals("Try again", copy.actionLabel)
    }

    @Test
    fun `new kinds do not show a reference ID`() {
        assertFalse(ErrorKind.Unauthorized.showsReferenceId())
        assertFalse(ErrorKind.Unavailable.showsReferenceId())
    }

    @Test
    fun `every kind has non-blank copy and no apologetic opener`() {
        ErrorKind.entries.forEach { kind ->
            val copy = kind.errorCopy()
            assertFalse(copy.title.isBlank(), "title for $kind")
            assertFalse(copy.message.isBlank(), "message for $kind")
            assertFalse(copy.actionLabel.isBlank(), "action for $kind")
            assertFalse(copy.message.contains("Oops", ignoreCase = true), "message for $kind")
        }
    }
}
