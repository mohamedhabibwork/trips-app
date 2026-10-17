import { TeButton } from "@trips-app/ui/components/te-button";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import type { TeSelectOption } from "@trips-app/ui/components/te-select";
import { StatePreview } from "../common/admin-state-preview";
import {
  AdminActions,
  AdminFilterSelect,
  AdminPage,
  AdminPanel,
  AdminToggle,
} from "../common/admin-shared";

const GATEWAY_OPTIONS: readonly TeSelectOption[] = [
  { value: "stripe", label: "Stripe (international)" },
  { value: "paymob", label: "Paymob (local MENA)" },
  { value: "tap", label: "Tap (local MENA)" },
  { value: "fawry", label: "Fawry (cash in Egypt)" },
];

export function FeatureFlagsAndPlatformConfiguration() {
  return (
    <AdminPage>
      <TePageHeader
        title="Feature flags and platform configuration"
        description="Turn features on or off by phase, and set platform configuration."
        actions={<TeButton>Save configuration</TeButton>}
      />
      <StatePreview
        emptyTitle="No feature flags"
        emptyDescription="No feature flags are defined for this phase."
        loadingLabel="Loading the configuration."
      >
        <AdminPanel title="Feature flags">
          <p className="te-caption">A flag change applies to all users at once and is audited.</p>
          <AdminToggle label="[Feature flag name]" />
          <p className="te-caption">Phase: [Phase]</p>
          <AdminToggle label="[Feature flag name]" />
          <p className="te-caption">Phase: [Phase]</p>
        </AdminPanel>
        <AdminPanel title="Payment gateway by market">
          <TeInput label="Market" placeholder="[Market code]" required />
          <AdminFilterSelect label="Gateway" options={GATEWAY_OPTIONS} />
          <p className="te-caption">
            Stripe for international payments. Paymob or Tap for local MENA. Fawry for cash in
            Egypt. The choice for each market is confirmed at launch (D-12).
          </p>
        </AdminPanel>
        <AdminPanel title="OTP and session policy">
          <TeInput
            label="OTP policy"
            value="Fixed by BRL-20"
            readOnly
            supportingText="Editability is under review (D-288)."
          />
          <TeInput
            label="Session policy"
            value="Fixed by BRL-22"
            readOnly
            supportingText="Editability is under review (D-288)."
          />
        </AdminPanel>
        <AdminPanel title="Quiet hours">
          <TeInput
            label="Urgent categories"
            placeholder="[Urgent notification categories]"
            disabled
            supportingText="Set by D-288."
          />
        </AdminPanel>
        <TeInlineAlert tone="info" title="Audit">
          Every change on this page is written to the audit log.
        </TeInlineAlert>
        <AdminActions>
          <TeButton variant="secondary">Cancel</TeButton>
        </AdminActions>
      </StatePreview>
    </AdminPage>
  );
}
