package com.tripsenjoy.ui.components

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class TeCalendarGridTest {

    @Test
    fun `february has 29 days only in leap years`() {
        assertEquals(29, daysInMonth(2024, 2))
        assertEquals(28, daysInMonth(2026, 2))
        assertEquals(28, daysInMonth(2100, 2))
        assertEquals(29, daysInMonth(2000, 2))
    }

    @Test
    fun `thirty day months and thirty one day months are counted correctly`() {
        assertEquals(30, daysInMonth(2026, 4))
        assertEquals(31, daysInMonth(2026, 10))
    }

    @Test
    fun `first of october 2026 is a Thursday`() {
        assertEquals(4, TeDate(2026, 10, 1).weekday())
    }

    @Test
    fun `unix epoch day is a Thursday on day zero`() {
        assertEquals(0L, TeDate(1970, 1, 1).epochDay())
        assertEquals(4, TeDate(1970, 1, 1).weekday())
    }

    @Test
    fun `october 2026 grid starts with five blanks when weeks start on Saturday`() {
        val grid = buildMonthGrid(2026, 10, weekStartsOnSaturday = true)

        assertEquals(listOf(null, null, null, null, null, TeDate(2026, 10, 1), TeDate(2026, 10, 2)), grid.first())
        assertEquals(TeDate(2026, 10, 31), grid.flatten().last { it != null })
    }

    @Test
    fun `october 2026 grid starts with four blanks when weeks start on Sunday`() {
        val grid = buildMonthGrid(2026, 10, weekStartsOnSaturday = false)

        assertEquals(listOf(null, null, null, null, TeDate(2026, 10, 1), TeDate(2026, 10, 2), TeDate(2026, 10, 3)), grid.first())
    }

    @Test
    fun `every grid row has seven cells and every day of the month appears once`() {
        val grid = buildMonthGrid(2024, 2, weekStartsOnSaturday = true)

        assertTrue(grid.all { it.size == 7 })
        val days = grid.flatten().filterNotNull()
        assertEquals((1..29).map { TeDate(2024, 2, it) }, days)
    }

    @Test
    fun `grid cells outside the month are null`() {
        val grid = buildMonthGrid(2026, 10, weekStartsOnSaturday = true)

        assertTrue(grid.last().contains(null))
        assertEquals(31, grid.flatten().count { it != null })
    }

    @Test
    fun `header order starts with Saturday or Sunday`() {
        assertEquals(listOf("Sa", "Su", "Mo", "Tu", "We", "Th", "Fr"), weekdayHeaders(weekStartsOnSaturday = true))
        assertEquals(listOf("Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"), weekdayHeaders(weekStartsOnSaturday = false))
    }

    @Test
    fun `shifting the month wraps across year boundaries`() {
        assertEquals(TeDate(2027, 1, 1), TeDate(2026, 12, 15).shiftMonth(1))
        assertEquals(TeDate(2025, 12, 1), TeDate(2026, 1, 20).shiftMonth(-1))
        assertEquals(TeDate(2026, 10, 1), TeDate(2026, 10, 17).shiftMonth(0))
    }

    @Test
    fun `date outside the month range is rejected`() {
        assertFailsWith<IllegalArgumentException> { TeDate(2026, 2, 30) }
        assertFailsWith<IllegalArgumentException> { TeDate(2026, 13, 1) }
    }

    @Test
    fun `dates are ordered by year then month then day`() {
        assertTrue(TeDate(2026, 1, 31) < TeDate(2026, 2, 1))
        assertTrue(TeDate(2025, 12, 31) < TeDate(2026, 1, 1))
        assertFalse(TeDate(2026, 3, 5) < TeDate(2026, 3, 5))
    }

    @Test
    fun `day is enabled only between the optional bounds inclusive`() {
        val min = TeDate(2026, 10, 10)
        val max = TeDate(2026, 10, 20)

        assertFalse(isDateEnabled(TeDate(2026, 10, 9), min, max))
        assertTrue(isDateEnabled(TeDate(2026, 10, 10), min, max))
        assertTrue(isDateEnabled(TeDate(2026, 10, 20), min, max))
        assertFalse(isDateEnabled(TeDate(2026, 10, 21), min, max))
        assertTrue(isDateEnabled(TeDate(2000, 1, 1), null, null))
    }

    @Test
    fun `day description gives the full date and says selected only when selected`() {
        assertEquals("15 October 2026", dayDescription(TeDate(2026, 10, 15), selected = false))
        assertEquals("15 October 2026, selected", dayDescription(TeDate(2026, 10, 15), selected = true))
    }
}
