import { AccountingServiceError } from "../errors";
import type { AccountingSummary, LedgerEntryStatus } from "../model";
import { createAccountingRepository, type ServiceDatabase } from "../repository";
import type { CreatePayoutSettlementInput, FlagReconciliationExceptionInput } from "../types";

export function createAccountingService(deps: { db: ServiceDatabase }) {
  const repo = createAccountingRepository(deps.db);

  return {
    async getOrganizationSummary(tenantId: string): Promise<AccountingSummary> {
      const entries = await repo.listEntriesByTenant(tenantId);
      let grossRevenueMinor = 0;
      let platformCommissionMinor = 0;
      let refundsMinor = 0;
      let payoutsSettledMinor = 0;

      for (const entry of entries) {
        if (entry.entryType === "booking_revenue") {
          grossRevenueMinor += entry.grossAmountMinor;
          platformCommissionMinor += entry.commissionAmountMinor;
        } else if (entry.entryType === "refund_debit") {
          refundsMinor += entry.netAmountMinor;
        } else if (entry.entryType === "payout_settlement") {
          payoutsSettledMinor += entry.netAmountMinor;
        }
      }

      const availableBalanceMinor = Math.max(
        0,
        grossRevenueMinor - platformCommissionMinor - refundsMinor - payoutsSettledMinor,
      );

      return {
        grossRevenueMinor,
        platformCommissionMinor,
        refundsMinor,
        payoutsSettledMinor,
        availableBalanceMinor,
        currencyCode: entries[0]?.currencyCode ?? "EGP",
      };
    },

    async listLedgerEntries(
      tenantId: string,
      filters?: { tripId?: string; status?: LedgerEntryStatus },
    ) {
      return repo.listEntriesByTenant(tenantId, filters);
    },

    async createPayoutSettlement(tenantId: string, input: CreatePayoutSettlementInput) {
      const summary = await this.getOrganizationSummary(tenantId);
      if (input.amountMinor > summary.availableBalanceMinor) {
        throw new AccountingServiceError(
          "INSUFFICIENT_SETTLEMENT_BALANCE",
          "Requested settlement exceeds available balance.",
        );
      }
      return repo.insertPayoutSettlement({
        tenantId,
        amountMinor: input.amountMinor,
        currencyCode: input.currencyCode,
        invoiceNumber: input.invoiceNumber ?? null,
        description: input.description,
      });
    },

    async flagReconciliationException(input: FlagReconciliationExceptionInput) {
      const existing = await repo.findEntryById(input.entryId);
      if (!existing) {
        throw new AccountingServiceError("LEDGER_ENTRY_NOT_FOUND", "Ledger entry not found.");
      }
      const updated = await repo.flagEntryException(input.entryId, input.reason);
      if (!updated) {
        throw new AccountingServiceError("LEDGER_ENTRY_NOT_FOUND", "Ledger entry not found.");
      }
      return updated;
    },

    async listAdminReconciliationExceptions() {
      return repo.listAllReconciliationExceptions();
    },
  };
}

export type AccountingService = ReturnType<typeof createAccountingService>;
