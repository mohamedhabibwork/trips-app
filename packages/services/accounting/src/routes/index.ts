import {
  accountingSummaryDtoSchema,
  createPayoutSettlementSchema,
  flagReconciliationExceptionSchema,
  ledgerEntryDtoSchema,
  listLedgerEntriesSchema,
} from "../schemas";
import { createAccountingService } from "../services";
import {
  accountingAdminProcedure,
  accountingOrgManageProcedure,
  accountingOrgViewProcedure,
  procedure,
} from "./procedure";

const status = procedure
  .route({
    method: "GET",
    path: "/accounting/status",
    summary: "Health check for the accounting service",
    tags: ["accounting"],
  })
  .handler(async () => ({ service: "accounting" as const, status: "ok" as const }));

const getOrganizationSummary = accountingOrgViewProcedure
  .output(accountingSummaryDtoSchema)
  .handler(async ({ context }) => {
    const svc = createAccountingService({ db: context.db });
    return await svc.getOrganizationSummary(context.auth.activeTenantId);
  });

const listLedgerEntries = accountingOrgViewProcedure
  .input(listLedgerEntriesSchema)
  .output(ledgerEntryDtoSchema.array())
  .handler(async ({ context, input }) => {
    const svc = createAccountingService({ db: context.db });
    return await svc.listLedgerEntries(context.auth.activeTenantId, input);
  });

const createPayoutSettlement = accountingOrgManageProcedure
  .input(createPayoutSettlementSchema)
  .output(ledgerEntryDtoSchema)
  .handler(async ({ context, input }) => {
    const svc = createAccountingService({ db: context.db });
    return await svc.createPayoutSettlement(context.auth.activeTenantId, input);
  });

const flagReconciliationException = accountingAdminProcedure
  .input(flagReconciliationExceptionSchema)
  .output(ledgerEntryDtoSchema)
  .handler(async ({ context, input }) => {
    const svc = createAccountingService({ db: context.db });
    return await svc.flagReconciliationException(input);
  });

const listAdminReconciliationExceptions = accountingAdminProcedure
  .output(ledgerEntryDtoSchema.array())
  .handler(async ({ context }) => {
    const svc = createAccountingService({ db: context.db });
    return await svc.listAdminReconciliationExceptions();
  });

export const routes = {
  status,
  getOrganizationSummary,
  listLedgerEntries,
  createPayoutSettlement,
  flagReconciliationException,
  listAdminReconciliationExceptions,
};
