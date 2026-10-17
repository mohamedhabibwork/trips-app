import { useEffect, useState } from "react";
import { TeCheckbox } from "@trips-app/ui/components/te-checkbox";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";
import { useAuth } from "@/auth/auth-context";
import { getSelectedAdminApplicationId } from "@/screens/onboarding-state";
import { client } from "@/utils/orpc";
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
  const { status: authStatus } = useAuth();
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [language, setLanguage] = useState("en");
  const [applicantName, setApplicantName] = useState("[Applicant name]");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const goTo = useAdminNavigate();

  useEffect(() => {
    const appId = getSelectedAdminApplicationId();
    if (authStatus !== "authenticated" || !appId || appId.startsWith("app-")) return;
    let cancelled = false;
    void client.onboarding
      .getApplicationDetail({ applicationId: appId })
      .then((detail) => {
        if (cancelled) return;
        setApplicantName(detail.applicant?.fullName ?? "[Applicant name]");
      })
      .catch(() => {
        // Ignore when previewed without session
      });
    return () => {
      cancelled = true;
    };
  }, [authStatus]);

  function toggleItem(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  async function handleConfirm(reason: string) {
    const appId = getSelectedAdminApplicationId();
    if (authStatus === "authenticated" && appId && !appId.startsWith("app-")) {
      setErrorMsg(null);
      try {
        await client.onboarding.requestApplicationChanges({
          applicationId: appId,
          decisionReasonCode: "changes_requested",
          decisionNotes: reason.length >= 5 ? reason : `${reason} (changes requested)`,
          checklist: selected.map((id) => {
            const found = FIX_ITEMS.find((f) => f.id === id);
            return {
              field: id,
              instruction: found?.label ?? id,
            };
          }),
        });
      } catch (caught) {
        setErrorMsg(caught instanceof Error ? caught.message : "Could not request changes.");
        return;
      }
    }
    await goTo("application-review-detail");
  }

  const deadlineDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString();

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
              { label: "Applicant name", value: applicantName },
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
        {errorMsg ? (
          <TeInlineAlert tone="error" title="Could not send request">
            {errorMsg}
          </TeInlineAlert>
        ) : null}
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
            onConfirm={(reason) => handleConfirm(reason)}
          />
        </AdminPanel>
        <TeInlineAlert tone="info" title="Response deadline">
          The applicant has 14 days to respond. Deadline: {deadlineDate}. If the deadline passes,
          the application closes.
        </TeInlineAlert>
      </StatePreview>
    </AdminPage>
  );
}
