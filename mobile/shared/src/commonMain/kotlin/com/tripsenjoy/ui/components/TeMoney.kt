package com.tripsenjoy.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.semantics
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

// Amount with its currency code, for example "1,250.00 SAR". Amounts are integer minor units (DAT-06).
// Formatting, including per-currency minor units, lives in formatMoney in Money.kt.
@Composable
fun TeMoney(
    amountMinor: Long,
    currencyCode: String,
    label: String? = null,
    modifier: Modifier = Modifier,
) {
    val colors = TripsEnjoyTheme.colors
    val spacing = TripsEnjoyTheme.spacing
    Column(
        modifier = modifier.semantics(mergeDescendants = true) {},
        verticalArrangement = Arrangement.spacedBy(spacing.space1),
    ) {
        if (label != null) {
            Text(text = label, style = TripsEnjoyTheme.typography.caption, color = colors.inkMuted)
        }
        Text(
            text = formatMoney(amountMinor, currencyCode),
            style = TripsEnjoyTheme.typography.bodyMedium,
            color = colors.ink,
        )
    }
}
