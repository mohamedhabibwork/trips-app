package com.tripsenjoy.screens.shared.documents

import androidx.compose.runtime.Composable
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

private data class InvoiceLine(val id: String, val description: String, val amount: String)

// Export is locked on the demo plan. The real plan check comes from the account, not from this screen.
private const val EXPORT_LOCKED_IN_GALLERY = true

// SCR-SHR-12 Receipt and invoice view. Shows the number, lines, tax and totals with currency.
// Export depends on the plan (FR-ORG-07); a locked export opens the plan prompt (SCR-SHR-01). Back returns to the caller.
// The file download is not wired here.
@Composable
fun ReceiptAndInvoiceView() {
    val nav = LocalScreenNavigator.current
    val lineAmount = formatMoney(PLACEHOLDER_AMOUNT_MINOR, PLACEHOLDER_CURRENCY)
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
                    ScreenNote(text = "Invoice number")
                    ScreenNote(text = "Issue date")
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
                    TeMoney(amountMinor = PLACEHOLDER_AMOUNT_MINOR, currencyCode = PLACEHOLDER_CURRENCY, label = "Total")
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
