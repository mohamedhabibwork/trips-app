package com.tripsenjoy.ui.components

import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import kotlin.math.abs

// Money is always shown as amount plus currency (UI-06, DAT-06).
// Amounts are integer minor units (for example cents), never floats.

// ISO 4217 minor-unit exceptions. Every other currency uses 2 digits.
private val ZeroDecimalCurrencies = setOf(
    "BIF", "CLP", "DJF", "GNF", "ISK", "JPY", "KMF", "KRW", "PYG", "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF",
)
private val ThreeDecimalCurrencies = setOf("BHD", "IQD", "JOD", "KWD", "LYD", "OMR", "TND")
private const val DefaultFractionDigits = 2
private const val ZeroFractionDigits = 0
private const val ThreeFractionDigits = 3

// Number of fraction digits for a currency's minor unit: 0 for JPY, 3 for KWD and BHD, 2 otherwise.
fun currencyFractionDigits(currencyCode: String): Int {
    val code = currencyCode.uppercase()
    return when (code) {
        in ZeroDecimalCurrencies -> ZeroFractionDigits
        in ThreeDecimalCurrencies -> ThreeFractionDigits
        else -> DefaultFractionDigits
    }
}

fun formatMoney(
    minorUnits: Long,
    currencyCode: String,
    fractionDigits: Int = currencyFractionDigits(currencyCode),
): String {
    require(fractionDigits >= 0) { "fractionDigits must not be negative" }
    val divisor = pow10(fractionDigits)
    val magnitude = abs(minorUnits)
    val whole = groupThousands((magnitude / divisor).toString())
    val sign = if (minorUnits < 0) "-" else ""
    val amount = if (fractionDigits == 0) {
        whole
    } else {
        "$whole.${(magnitude % divisor).toString().padStart(fractionDigits, '0')}"
    }
    return "$sign$amount $currencyCode"
}

@Composable
fun MoneyText(
    minorUnits: Long,
    currencyCode: String,
    modifier: Modifier = Modifier,
    fractionDigits: Int = currencyFractionDigits(currencyCode),
) {
    Text(text = formatMoney(minorUnits, currencyCode, fractionDigits), modifier = modifier)
}

private fun pow10(exponent: Int): Long {
    var result = 1L
    repeat(exponent) { result *= 10L }
    return result
}

private fun groupThousands(digits: String): String =
    digits.reversed().chunked(3).joinToString(",").reversed()
