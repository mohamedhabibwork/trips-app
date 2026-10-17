import { useState } from "react";
import { TeCheckbox } from "@trips-app/ui/components/te-checkbox";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";
import { AdminDecisionForm } from "../common/admin-decision-form";
import { StatePreview } from "../common/admin-state-preview";
import { useAdminNavigate } from "../common/admin-links";
import { AdminFacts, AdminPage, AdminPanel } from "../common/admin-shared";

interface FixItem {
  id: string;
  label: string;
}

const FIX_ITEMS: readonly FixItem[] = [
  { id: "identity", label: "Readable identity document" },
  { id: "insurance", label: "Valid insurance certificate" },
  { id: "lab-consent", label: "Signed lab consent" },
  { id: "background", label: "Signed background check consent" },
  { id: "photos", label: "At least 8 portfolio photos (photographers)" },
];

const LANGUAGE_OPTIONS: readonly TeSelectOption[] = [
  { value: "en", label: "English" },
  { value: "ar", label: "Arabic" },
];

export function RequestChangesDecision() {
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [language, setLanguage] = useState("en");
  const goTo = useAdminNavigate();

  function toggleItem(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  return (
    <AdminPage>
      <TePageHeader
        title="Request changes (decision)"
        description="Ask the applicant for specific fixes within 14 days."
      />
      <StatePreview
        emptyTitle="No items to fix"
        emptyDescription="Select at least one item before you send the request."
        loadingLabel="Loading the application."
      >
        <AdminPanel title="Applicant">
          <AdminFacts
            items={[
              { label: "Applicant name", value: "[Applicant name]" },
              { label: "Application state", value: "Changes requested after sending" },
            ]}
          />
        </AdminPanel>
        <AdminPanel title="Items to fix">
          <p className="te-caption">Select at least one item. Send stays off until then.</p>
          {FIX_ITEMS.map((item) => (
            <TeCheckbox
              key={item.id}
              label={item.label}
              checked={selected.includes(item.id)}
              onCheckedChange={() => toggleItem(item.id)}
            />
          ))}
        </AdminPanel>
        <AdminPanel title="Message to applicant">
          <TeSelect
            label="Message language"
            options={LANGUAGE_OPTIONS}
            value={language}
            onValueChange={setLanguage}
            supportingText="Use the applicant's language."
          />
          <AdminDecisionForm
            reasonLabel="Message to applicant (required)"
            reasonHelp="Say exactly what to fix. The 14-day deadline is added for you."
            submitLabel="Send request"
            dialogTitle="Send this request to the applicant?"
            dialogDescription="The applicant gets 14 days to fix the items. If they do not, the application closes."
            confirmLabel="Send request"
            extraValid={selected.length > 0}
            dialogEffect={
              <p className="te-caption">Application state becomes Changes Requested.</p>
            }
            cancel={{ slug: "application-review-detail", label: "Cancel" }}
            onConfirm={() => goTo("application-review-detail")}
          />
        </AdminPanel>
        <TeInlineAlert tone="info" title="Response deadline">
          The applicant has 14 days to respond. Deadline: [Date]. If the deadline passes, the
          application closes.
        </TeInlineAlert>
      </StatePreview>
    </AdminPage>
  );
}
