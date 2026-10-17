package com.tripsenjoy.ui.components

import kotlin.test.Test
import kotlin.test.assertEquals

class RoleBadgeToneTest {

    @Test
    fun `traveler role uses the accent tone`() {
        assertEquals(BadgeTone.Accent, UserRole.Traveler.badgeTone())
    }

    @Test
    fun `parent role uses the info tone`() {
        assertEquals(BadgeTone.Info, UserRole.Parent.badgeTone())
    }

    @Test
    fun `driver role uses the neutral tone`() {
        assertEquals(BadgeTone.Neutral, UserRole.Driver.badgeTone())
    }

    @Test
    fun `photographer role uses the highlight tone to match its amber app icon`() {
        assertEquals(BadgeTone.Highlight, UserRole.Photographer.badgeTone())
    }

    @Test
    fun `organization role uses the info tone as the README pins`() {
        assertEquals(BadgeTone.Info, UserRole.Organization.badgeTone())
    }

    @Test
    fun `admin role uses the neutral tone`() {
        assertEquals(BadgeTone.Neutral, UserRole.Admin.badgeTone())
    }

    @Test
    fun `every role has a non-blank English default label`() {
        UserRole.entries.forEach { role ->
            assertEquals(false, role.defaultLabel().isBlank(), "label for $role")
        }
    }
}
