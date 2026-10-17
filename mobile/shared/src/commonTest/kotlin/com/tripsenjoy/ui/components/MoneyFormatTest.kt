package com.tripsenjoy.ui.components

import kotlin.test.Test
import kotlin.test.assertEquals

class MoneyFormatTest {

    @Test
    fun `formats whole and fractional minor units with two digits`() {
        assertEquals("12.50 USD", formatMoney(1250, "USD"))
    }

    @Test
    fun `pads fractions below one unit`() {
        assertEquals("0.05 USD", formatMoney(5, "USD"))
    }

    @Test
    fun `shows zero with its fraction`() {
        assertEquals("0.00 USD", formatMoney(0, "USD"))
    }

    @Test
    fun `puts a minus sign before negative amounts`() {
        assertEquals("-0.05 USD", formatMoney(-5, "USD"))
    }

    @Test
    fun `groups thousands with commas`() {
        assertEquals("1,234,567.89 USD", formatMoney(123456789, "USD"))
    }

    @Test
    fun `omits the fraction when the currency has no minor unit`() {
        assertEquals("1,500 JPY", formatMoney(1500, "JPY", fractionDigits = 0))
    }
}
