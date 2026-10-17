import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import type { TeSelectOption } from "@trips-app/ui/components/te-select";
import { StatePreview } from "../common/admin-state-preview";
import { AdminScreenLink } from "../common/admin-links";
import {
  AdminActions,
  AdminFilterSelect,
  AdminFilters,
  AdminKpiGrid,
  AdminPage,
  AdminPanel,
} from "../common/admin-shared";

const PERIOD_OPTIONS: readonly TeSelectOption[] = [
  { value: "month", label: "This month" },
  { value: "quarter", label: "This quarter" },
  { value: "year", label: "This year" },
];

export function PlatformFinancialView() {
  return (
    <AdminPage>
      <TePageHeader
        title="Platform financial view"
        description="The system-wide financial picture for the selected period."
      />
      <StatePreview
        emptyTitle="No activity in this period"
        emptyDescription="Choose another period to see totals."
        loadingLabel="Loading the financial totals."
      >
        <AdminFilters>
          <AdminFilterSelect label="Period" options={PERIOD_OPTIONS} />
        </AdminFilters>
        <AdminKpiGrid>
          <TeKpiTile label="Subscription revenue" value="[Amount] [Currency]" hint="Period total" />
          <TeKpiTile label="Commission" value="[Amount] [Currency]" hint="Period total" />
          <TeKpiTile label="Deal audit summary" value="[Amount] [Currency]" hint="Period total" />
          <TeKpiTile label="Coupon redemptions" value="0" hint="Period total" />
          <TeKpiTile label="Disputes" value="0" hint="Opened in the period" />
          <TeKpiTile label="Payouts" value="[Amount] [Currency]" hint="Period total" />
        </AdminKpiGrid>
        <AdminPanel title="Detail views">
          <AdminActions>
            <AdminScreenLink slug="payout-runs" variant="secondary">
              Payout runs
            </AdminScreenLink>
            <AdminScreenLink slug="reconciliation-exceptions" variant="secondary">
              Reconciliation exceptions
            </AdminScreenLink>
            <AdminScreenLink slug="settlements-tracker" variant="secondary">
              Settlements tracker
            </AdminScreenLink>
          </AdminActions>
        </AdminPanel>
        <TeInlineAlert tone="info" title="Amounts">
          Every amount shows its ISO currency code. Rounding follows D-157.
        </TeInlineAlert>
      </StatePreview>
    </AdminPage>
  );
}
