package com.tripsenjoy.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.key
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.CollectionInfo
import androidx.compose.ui.semantics.CollectionItemInfo
import androidx.compose.ui.semantics.collectionInfo
import androidx.compose.ui.semantics.collectionItemInfo
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

enum class TeColumnAlign { Start, End }

data class TeColumn<T>(
    val key: String,
    val header: String,
    val align: TeColumnAlign = TeColumnAlign.Start,
    val render: (T) -> String,
)

private val TableCellWidth: Dp = 160.dp
private val TableLoadingSize: Dp = 24.dp

// Simple table for lists of records (admin, fleet, bookings). The grid scrolls sideways on narrow screens.
// Headers are marked as headings and each cell carries its row and column position, so screen readers can
// move across the table. Compose has no native table role, so the grid uses the collection semantics.
// The empty state is shown in place of the grid, with no lazy layout inside a parent that may not be bounded.
@Composable
fun <T> TeDataTable(
    columns: List<TeColumn<T>>,
    rows: List<T>,
    rowKey: (T) -> Any,
    caption: String,
    emptyTitle: String,
    emptyDescription: String? = null,
    loading: Boolean = false,
    modifier: Modifier = Modifier,
) {
    val spacing = TripsEnjoyTheme.spacing
    Column(modifier = modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(spacing.space2)) {
        Text(text = caption, style = TripsEnjoyTheme.typography.label, color = TripsEnjoyTheme.colors.ink)
        when {
            rows.isEmpty() && loading -> TableLoading(caption = caption)
            rows.isEmpty() -> TableEmptyMessage(title = emptyTitle, description = emptyDescription)
            else -> TableGrid(columns = columns, rows = rows, rowKey = rowKey, loading = loading, caption = caption)
        }
    }
}

@Composable
private fun <T> TableGrid(
    columns: List<TeColumn<T>>,
    rows: List<T>,
    rowKey: (T) -> Any,
    loading: Boolean,
    caption: String,
) {
    val colors = TripsEnjoyTheme.colors
    Column(
        modifier = Modifier
            .horizontalScroll(rememberScrollState())
            .semantics {
                collectionInfo = CollectionInfo(rowCount = rows.size + 1, columnCount = columns.size)
            },
    ) {
        TableHeaderRow(columns = columns)
        Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(colors.controlBorder))
        rows.forEachIndexed { index, row ->
            key(rowKey(row)) {
                TableBodyRow(columns = columns, row = row, rowIndex = index + 1)
            }
        }
        if (loading) {
            TableLoading(caption = caption)
        }
    }
}

@Composable
private fun <T> TableHeaderRow(columns: List<TeColumn<T>>) {
    val colors = TripsEnjoyTheme.colors
    Row {
        columns.forEachIndexed { index, column ->
            Box(
                modifier = Modifier
                    .width(TableCellWidth)
                    .padding(vertical = TripsEnjoyTheme.spacing.space2, horizontal = TripsEnjoyTheme.spacing.space2)
                    .semantics {
                        heading()
                        collectionItemInfo = CollectionItemInfo(
                            rowIndex = 0,
                            rowSpan = 1,
                            columnIndex = index,
                            columnSpan = 1,
                        )
                    },
            ) {
                Text(
                    text = column.header,
                    style = TripsEnjoyTheme.typography.label,
                    color = colors.inkMuted,
                    textAlign = column.align.toTextAlign(),
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        }
    }
}

@Composable
private fun <T> TableBodyRow(columns: List<TeColumn<T>>, row: T, rowIndex: Int) {
    val colors = TripsEnjoyTheme.colors
    Column {
        Row {
            columns.forEachIndexed { index, column ->
                Box(
                    modifier = Modifier
                        .width(TableCellWidth)
                        .padding(vertical = TripsEnjoyTheme.spacing.space2, horizontal = TripsEnjoyTheme.spacing.space2)
                        .semantics {
                            collectionItemInfo = CollectionItemInfo(
                                rowIndex = rowIndex,
                                rowSpan = 1,
                                columnIndex = index,
                                columnSpan = 1,
                            )
                        },
                ) {
                    Text(
                        text = column.render(row),
                        style = TripsEnjoyTheme.typography.body,
                        color = colors.ink,
                        textAlign = column.align.toTextAlign(),
                        modifier = Modifier.fillMaxWidth(),
                    )
                }
            }
        }
        Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(colors.hairline))
    }
}

@Composable
private fun TableEmptyMessage(title: String, description: String?) {
    val colors = TripsEnjoyTheme.colors
    val spacing = TripsEnjoyTheme.spacing
    Column(
        modifier = Modifier.fillMaxWidth().padding(vertical = spacing.space6),
        verticalArrangement = Arrangement.spacedBy(spacing.space2),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(
            text = title,
            style = TripsEnjoyTheme.typography.h3,
            color = colors.ink,
            textAlign = TextAlign.Center,
            modifier = Modifier.semantics { heading() },
        )
        if (description != null) {
            Text(
                text = description,
                style = TripsEnjoyTheme.typography.body,
                color = colors.inkMuted,
                textAlign = TextAlign.Center,
            )
        }
    }
}

@Composable
private fun TableLoading(caption: String) {
    Box(
        modifier = Modifier.fillMaxWidth().padding(vertical = TripsEnjoyTheme.spacing.space4),
        contentAlignment = Alignment.Center,
    ) {
        CircularProgressIndicator(
            modifier = Modifier
                .size(TableLoadingSize)
                .semantics { contentDescription = caption },
        )
    }
}

private fun TeColumnAlign.toTextAlign(): TextAlign = when (this) {
    TeColumnAlign.Start -> TextAlign.Start
    TeColumnAlign.End -> TextAlign.End
}
