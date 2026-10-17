package com.tripsenjoy.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

// Small status pill, for example "Confirmed" or "Payment Failed".
@Composable
fun StatusBadge(label: String, modifier: Modifier = Modifier) {
    Text(
        text = label,
        style = MaterialTheme.typography.labelMedium,
        color = MaterialTheme.colorScheme.onSecondary,
        modifier = modifier
            .background(MaterialTheme.colorScheme.secondary, RoundedCornerShape(50))
            .padding(horizontal = 12.dp, vertical = 4.dp),
    )
}

// Banner shown over any screen when the connection is lost (SCR-SHR-08, gap screen).
@Composable
fun OfflineBanner(message: String, modifier: Modifier = Modifier) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.error)
            .padding(horizontal = 16.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(text = message, color = MaterialTheme.colorScheme.onError)
    }
}
