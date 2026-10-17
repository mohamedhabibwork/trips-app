package com.tripsenjoy.ui.components

import kotlin.test.Test
import kotlin.test.assertEquals

class TrackingStatusMappingTest {

    @Test
    fun `on time maps to the success tone with a check icon`() {
        assertEquals(BadgeTone.Success, TrackingStatus.OnTime.badgeTone())
        assertEquals(IconName.Check, TrackingStatus.OnTime.icon())
    }

    @Test
    fun `delayed maps to the warning tone with a clock icon`() {
        assertEquals(BadgeTone.Warning, TrackingStatus.Delayed.badgeTone())
        assertEquals(IconName.Clock, TrackingStatus.Delayed.icon())
    }

    @Test
    fun `boarded maps to the success tone with a bus icon`() {
        assertEquals(BadgeTone.Success, TrackingStatus.Boarded.badgeTone())
        assertEquals(IconName.Bus, TrackingStatus.Boarded.icon())
    }

    @Test
    fun `not boarded maps to the danger tone with an alert icon`() {
        assertEquals(BadgeTone.Danger, TrackingStatus.NotBoarded.badgeTone())
        assertEquals(IconName.Alert, TrackingStatus.NotBoarded.icon())
    }

    @Test
    fun `arrived maps to the success tone with a shield icon`() {
        assertEquals(BadgeTone.Success, TrackingStatus.Arrived.badgeTone())
        assertEquals(IconName.Shield, TrackingStatus.Arrived.icon())
    }

    @Test
    fun `every status has a visible English word`() {
        assertEquals("Not boarded", TrackingStatus.NotBoarded.defaultLabel())
        TrackingStatus.entries.forEach { status ->
            assertEquals(false, status.defaultLabel().isBlank(), "label for $status")
        }
    }
}
