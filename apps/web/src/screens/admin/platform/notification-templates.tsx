import { useState } from "react";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";
import { StatePreview } from "../common/admin-state-preview";
import {
  AdminActions,
  AdminFilterSelect,
  AdminFilters,
  AdminPage,
  AdminPagination,
  AdminPanel,
  AdminSearch,
  AdminStatus,
  type AdminStatusPresentation,
} from "../common/admin-shared";

interface TemplateRow {
  id: string;
  category: string;
  language: string;
  version: string;
  state: "published" | "missing-translation";
}

const TEMPLATE_ROWS: readonly TemplateRow[] = [
  {
    id: "tpl-1",
    category: "[Category]",
    language: "English",
    version: "[Version]",
    state: "published",
  },
  {
    id: "tpl-2",
    category: "[Category]",
    language: "Arabic",
    version: "[Version]",
    state: "missing-translation",
  },
];

const STATE_PRESENTATION: Record<TemplateRow["state"], AdminStatusPresentation> = {
  published: { tone: "success", icon: "check", label: "Published" },
  "missing-translation": { tone: "danger", icon: "alert", label: "Translation missing" },
};

const LANGUAGE_OPTIONS: readonly TeSelectOption[] = [
  { value: "all", label: "All languages" },
  { value: "en", label: "English" },
  { value: "ar", label: "Arabic" },
];
const EDIT_LANGUAGE_OPTIONS: readonly TeSelectOption[] = [
  { value: "en", label: "English" },
  { value: "ar", label: "Arabic" },
];

const COLUMNS: readonly TeDataTableColumn<TemplateRow>[] = [
  { key: "category", header: "Category" },
  { key: "language", header: "Language" },
  { key: "version", header: "Version" },
  {
    key: "state",
    header: "Status",
    render: (row) => <AdminStatus status={STATE_PRESENTATION[row.state]} />,
  },
  {
    key: "edit",
    header: "Action",
    render: (row) => (
      <TeButton variant="secondary" aria-label={`Edit ${row.category} in ${row.language}`}>
        Edit
      </TeButton>
    ),
  },
];

export function NotificationTemplates() {
  const [language, setLanguage] = useState("en");
  const [text, setText] = useState("");

  return (
    <AdminPage>
      <TePageHeader
        title="Notification templates"
        description="Edit notification text by category and language. Each save makes a new version."
      />
      <StatePreview
        emptyTitle="No templates"
        emptyDescription="No templates match these filters."
        loadingLabel="Loading the templates."
      >
        <AdminFilters>
          <AdminSearch label="Category" placeholder="Category name" clearLabel="Clear category" />
          <AdminFilterSelect label="Language" options={LANGUAGE_OPTIONS} />
        </AdminFilters>
        <AdminPanel title="Templates">
          <TeDataTable
            columns={COLUMNS}
            rows={TEMPLATE_ROWS}
            getRowKey={(row) => row.id}
            caption="Notification templates"
            emptyTitle="No templates"
            emptyDescription="No templates match these filters."
          />
          <AdminPagination pageCount={1} />
        </AdminPanel>
        <AdminPanel title="Edit template">
          <TeSelect
            label="Language"
            options={EDIT_LANGUAGE_OPTIONS}
            value={language}
            onValueChange={setLanguage}
          />
          <TeInput
            label="Message text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="[Message text]"
            supportingText="Use the {variable} placeholders from the template catalogue."
          />
        </AdminPanel>
        <AdminPanel title="Preview">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TeCard>
              <p className="te-caption">English preview</p>
              <p lang="en" dir="ltr">
                [English preview of the message]
              </p>
            </TeCard>
            <TeCard>
              <p className="te-caption">Arabic preview</p>
              <p lang="ar" dir="rtl">
                [Arabic preview of the message]
              </p>
            </TeCard>
          </div>
        </AdminPanel>
        <AdminActions>
          <TeButton variant="secondary">Save as new version</TeButton>
          <TeButton>Publish</TeButton>
        </AdminActions>
        <p className="te-caption">Earlier messages keep the version they were sent with.</p>
      </StatePreview>
    </AdminPage>
  );
}
