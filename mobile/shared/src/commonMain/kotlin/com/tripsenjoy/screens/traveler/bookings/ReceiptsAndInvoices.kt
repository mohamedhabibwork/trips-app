package com.tripsenjoy.screens.traveler.bookings

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.auth.LocalAuthApiOrNull
import com.tripsenjoy.screens.traveler.common.BackButton
import com.tripsenjoy.screens.traveler.common.ScreenPage
import com.tripsenjoy.screens.traveler.common.StatePreview
import com.tripsenjoy.screens.traveler.common.TravelerScreenState
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeColumn
import com.tripsenjoy.ui.components.TeColumnAlign
import com.tripsenjoy.ui.components.TeDataTable
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

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

@Composable
fun ReceiptsAndInvoices() {
    val api = LocalAuthApiOrNull.current
    var rows by remember { mutableStateOf<List<ReceiptRow>>(emptyList()) }

    LaunchedEffect(api) {
        val client = api ?: return@LaunchedEffect
        runCatching {
            val arr = client.call("payments/listPayments", JsonNull, JsonElement.serializer()).jsonArray
            rows = arr.map { el ->
                val obj = el.jsonObject
                ReceiptRow(
                    id = obj["id"]?.jsonPrimitive?.contentOrNull ?: "",
                    date = obj["createdAt"]?.jsonPrimitive?.contentOrNull ?: "—",
                    booking = obj["bookingId"]?.jsonPrimitive?.contentOrNull ?: "—",
                    number = obj["receiptNumber"]?.jsonPrimitive?.contentOrNull ?: "—",
                    type = obj["type"]?.jsonPrimitive?.contentOrNull ?: "Receipt",
                    amount = "${obj["amountMinor"]?.jsonPrimitive?.contentOrNull ?: "0"} ${obj["currency"]?.jsonPrimitive?.contentOrNull ?: "USD"}",
                )
            }
        }
    }

    ScreenPage(title = "Receipts and invoices") {
        StatePreview(
            listedStates = setOf(TravelerScreenState.Loading, TravelerScreenState.Empty, TravelerScreenState.Error),
            emptyTitle = "No receipts yet",
            emptyMessage = "Receipts appear after a booking is confirmed.",
        ) {
            TeDataTable(
                columns = RECEIPT_COLUMNS,
                rows = rows,
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
