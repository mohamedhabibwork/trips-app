package com.tripsenjoy.ui.components

import androidx.compose.ui.text.input.KeyboardType
import kotlin.test.Test
import kotlin.test.assertEquals

class TeFieldAndLinkHelpersTest {

    @Test
    fun `email field uses the email keyboard`() {
        assertEquals(KeyboardType.Email, TeKeyboardType.Email.toKeyboardType())
    }

    @Test
    fun `url field uses the URI keyboard`() {
        assertEquals(KeyboardType.Uri, TeKeyboardType.Url.toKeyboardType())
    }

    @Test
    fun `text limit keeps the first characters and leaves short text alone`() {
        assertEquals("abc", limitTextLength("abcdef", 3))
        assertEquals("abc", limitTextLength("abc", 10))
        assertEquals("abcdef", limitTextLength("abcdef", null))
    }

    @Test
    fun `counter shows characters used over the limit`() {
        assertEquals("12 / 280", characterCounter(12, 280))
    }

    @Test
    fun `link says it opens in a new tab only when external`() {
        assertEquals("Terms", linkSpokenLabel("Terms", external = false, externalLabel = TeExternalLinkSuffix))
        assertEquals(
            "Terms (opens in a new tab)",
            linkSpokenLabel("Terms", external = true, externalLabel = TeExternalLinkSuffix),
        )
    }
}
