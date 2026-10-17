package com.tripsenjoy.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

private const val FirstPage = 1

// Previous and next controls with a page label. Pages are numbered from 1.
// Previous is disabled on the first page and next on the last page.
@Composable
fun TePagination(
    page: Int,
    pageCount: Int,
    onPageChange: (Int) -> Unit,
    previousLabel: String,
    nextLabel: String,
    pageLabel: (Int, Int) -> String,
    modifier: Modifier = Modifier,
) {
    val lastPage = pageCount.coerceAtLeast(FirstPage)
    val currentPage = page.coerceIn(FirstPage, lastPage)
    Row(
        modifier = modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(TripsEnjoyTheme.spacing.space2),
    ) {
        TeButton(
            text = previousLabel,
            onClick = { onPageChange(currentPage - 1) },
            variant = TeButtonVariant.Secondary,
            enabled = currentPage > FirstPage,
        )
        Text(
            text = pageLabel(currentPage, lastPage),
            style = TripsEnjoyTheme.typography.label,
            color = TripsEnjoyTheme.colors.ink,
            textAlign = TextAlign.Center,
            modifier = Modifier.weight(1f),
        )
        TeButton(
            text = nextLabel,
            onClick = { onPageChange(currentPage + 1) },
            variant = TeButtonVariant.Secondary,
            enabled = currentPage < lastPage,
        )
    }
}
