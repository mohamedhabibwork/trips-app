package com.tripsenjoy.ui.components

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class TeBarChartTest {

    @Test
    fun `largest value fills the full height and others scale against it`() {
        val fractions = barHeightFractions(listOf(10.0, 5.0, 20.0))

        assertEquals(listOf(0.5f, 0.25f, 1f), fractions)
    }

    @Test
    fun `empty input gives no bars`() {
        assertEquals(emptyList(), barHeightFractions(emptyList()))
    }

    @Test
    fun `all zero values give empty bars rather than dividing by zero`() {
        assertEquals(listOf(0f, 0f), barHeightFractions(listOf(0.0, 0.0)))
    }

    @Test
    fun `negative and NaN values count as empty bars`() {
        val fractions = barHeightFractions(listOf(-4.0, Double.NaN, 8.0))

        assertEquals(listOf(0f, 0f, 1f), fractions)
    }

    @Test
    fun `summary names the caption and every labelled value`() {
        val data = listOf(TeBarValue("Mon", 3.0), TeBarValue("Tue", 7.5))

        val summary = barChartSummary("Bookings", data) {
            val tenths = (it * 10).toInt()
            "${tenths / 10}.${tenths % 10}"
        }

        assertEquals("Bookings. Mon 3.0, Tue 7.5", summary)
    }

    @Test
    fun `summary says there is no data when the chart is empty`() {
        assertTrue(barChartSummary("Bookings", emptyList()) { it.toString() }.endsWith("No data"))
    }
}
