package com.tripsenjoy.screens.traveler.bookings

import androidx.compose.runtime.Composable
import com.tripsenjoy.screens.traveler.common.BackButton
import com.tripsenjoy.screens.traveler.common.ScreenPage
import com.tripsenjoy.screens.traveler.common.StatePreview
import com.tripsenjoy.screens.traveler.common.TravelerScreenState
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeColumn
import com.tripsenjoy.ui.components.TeColumnAlign
import com.tripsenjoy.ui.components.TeDataTable

// SCR-TRV-14. Receipts and invoices for confirmed bookings. Export is VIP only; Free sees the basic list.
private data class ReceiptRow(
    val id: String,
    val date: String,
    val booking: String,
    val number: String,
    val type: String,
    val amount: String,
)

private val RECEIPT_COLUMNS = listOf(
    TeColumn<ReceiptRow>(key = "date", header = "Date", render = { it.date }),
    TeColumn<ReceiptRow>(key = "booking", header = "Booking", render = { it.booking }),
    TeColumn<ReceiptRow>(key = "number", header = "Number", render = { it.number }),
    TeColumn<ReceiptRow>(key = "type", header = "Type", render = { it.type }),
    TeColumn<ReceiptRow>(
        key = "amount",
        header = "Amount",
        align = TeColumnAlign.End,
        render = { it.amount },
    ),
)

private val RECEIPT_ROWS = listOf(
    ReceiptRow(
        id = "receipt-1",
        date = "Date",
        booking = "Booking reference",
        number = "Receipt number",
        type = "Receipt",
        amount = "Amount and currency",
    ),
)

@Composable
fun ReceiptsAndInvoices() {
    ScreenPage(title = "Receipts and invoices") {
        StatePreview(
            listedStates = setOf(TravelerScreenState.Loading, TravelerScreenState.Empty, TravelerScreenState.Error),
            emptyTitle = "No receipts yet",
            emptyMessage = "Receipts appear after a booking is confirmed.",
        ) {
            TeDataTable(
                columns = RECEIPT_COLUMNS,
                rows = RECEIPT_ROWS,
                rowKey = { it.id },
                caption = "Receipts and invoices",
                emptyTitle = "No receipts yet",
                emptyDescription = "Receipts appear after a booking is confirmed.",
            )
            TeButton(text = "Export receipts", onClick = {}, variant = TeButtonVariant.Secondary)
            BackButton()
        }
    }
}
