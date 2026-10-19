package com.tripsenjoy.screens.shared.documents

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.auth.LocalAuthApiOrNull
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.moderator.common.icon
import com.tripsenjoy.screens.photographer.common.StatePreview
import com.tripsenjoy.screens.shared.common.PLACEHOLDER_AMOUNT_MINOR
import com.tripsenjoy.screens.shared.common.PLACEHOLDER_CURRENCY
import com.tripsenjoy.screens.shared.common.ScreenBody
import com.tripsenjoy.screens.shared.common.ScreenNote
import com.tripsenjoy.screens.shared.common.SharedScreenId
import com.tripsenjoy.screens.shared.common.StateErrorBlock
import com.tripsenjoy.screens.shared.common.StateLoadingCard
import com.tripsenjoy.ui.components.BadgeTone
import com.tripsenjoy.ui.components.IconName
import com.tripsenjoy.ui.components.TeBadge
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TeColumn
import com.tripsenjoy.ui.components.TeColumnAlign
import com.tripsenjoy.ui.components.TeDataTable
import com.tripsenjoy.ui.components.TeMoney
import com.tripsenjoy.ui.components.TePageHeader
import com.tripsenjoy.ui.components.TePlanGate
import com.tripsenjoy.ui.components.formatMoney
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.longOrNull

private data class InvoiceLine(val id: String, val description: String, val amount: String)

// Export is locked on the demo plan. The real plan check comes from the account, not from this screen.
private const val EXPORT_LOCKED_IN_GALLERY = true

// SCR-SHR-12 Receipt and invoice view. Shows the number, lines, tax and totals with currency.
// Export depends on the plan (FR-ORG-07); a locked export opens the plan prompt (SCR-SHR-01). Back returns to the caller.
@Composable
fun ReceiptAndInvoiceView() {
    val nav = LocalScreenNavigator.current
    val api = LocalAuthApiOrNull.current
    var invoiceNumber by remember { mutableStateOf("Invoice number") }
    var issueDate by remember { mutableStateOf("Issue date") }
    var totalMinor by remember { mutableLongStateOf(PLACEHOLDER_AMOUNT_MINOR) }

    LaunchedEffect(api) {
        val client = api ?: return@LaunchedEffect
        runCatching {
            val arr = client.call("payments/listPayments", JsonNull, JsonElement.serializer()).jsonArray
            val first = arr.firstOrNull()?.jsonObject ?: return@runCatching
            invoiceNumber = first["providerReference"]?.jsonPrimitive?.contentOrNull ?: invoiceNumber
            issueDate = first["createdAt"]?.jsonPrimitive?.contentOrNull ?: issueDate
            totalMinor = first["amountMinor"]?.jsonPrimitive?.longOrNull ?: totalMinor
        }
    }

    val lineAmount = formatMoney(totalMinor, PLACEHOLDER_CURRENCY)
    val lineColumns = listOf(
        TeColumn<InvoiceLine>(key = "description", header = "Description", render = { it.description }),
        TeColumn<InvoiceLine>(key = "amount", header = "Amount", align = TeColumnAlign.End, render = { it.amount }),
    )
    val lines = listOf(InvoiceLine(id = "line-1", description = "Line description", amount = lineAmount))
    ScreenBody {
        TePageHeader(title = "Receipt and invoice view", description = "Number, lines, tax and totals")
        StatePreview(
            ariaLabel = "Receipt and invoice states",
            main = {
                TeBadge(label = "Issued", tone = BadgeTone.Success, icon = IconName.Check)
                TeCard(header = "Document") {
                    ScreenNote(text = invoiceNumber)
                    ScreenNote(text = issueDate)
                    ScreenNote(text = "Buyer name")
                }
                TeDataTable(
                    columns = lineColumns,
                    rows = lines,
                    rowKey = { row: InvoiceLine -> row.id },
                    caption = "Invoice lines",
                    emptyTitle = "No lines",
                )
                TeCard(header = "Totals") {
                    TeMoney(amountMinor = PLACEHOLDER_AMOUNT_MINOR, currencyCode = PLACEHOLDER_CURRENCY, label = "Tax")
                    TeMoney(amountMinor = totalMinor, currencyCode = PLACEHOLDER_CURRENCY, label = "Total")
                }
                TeButton(text = "Download", onClick = {})
                if (EXPORT_LOCKED_IN_GALLERY) {
                    TePlanGate(
                        plan = "Pro",
                        lockedLabel = "Export is available on the Pro plan.",
                        upgradeLabel = "Upgrade to Pro",
                        onUpgrade = { nav.open(SharedScreenId.PLAN_LIMIT_PROMPT) },
                    )
                }
                TeButton(text = "Back", onClick = { nav.back() }, variant = TeButtonVariant.Ghost)
            },
            loading = { StateLoadingCard(subject = "this receipt") },
            error = { StateErrorBlock(retryMessage = "This receipt did not load. Retry to see the totals.") },
        )
    }
}
