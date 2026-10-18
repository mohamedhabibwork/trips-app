import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";
import { t } from "@trips-app/i18n";
import { orpc } from "@/utils/orpc";
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

const DEFAULT_TEMPLATE_ROWS: readonly TemplateRow[] = [];

const STATE_PRESENTATION = (): Record<TemplateRow["state"], AdminStatusPresentation> => ({
  published: {
    tone: "success",
    icon: "check",
    label: t("screen.admin.platform.notificationTemplates.published"),
  },
  "missing-translation": {
    tone: "danger",
    icon: "alert",
    label: t("screen.admin.platform.notificationTemplates.translationMissing"),
  },
});

const LANGUAGE_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "all", label: t("screen.admin.platform.notificationTemplates.allLanguages") },
  { value: "en", label: t("screen.admin.platform.notificationTemplates.english") },
  { value: "ar", label: t("screen.admin.platform.notificationTemplates.arabic") },
];
const EDIT_LANGUAGE_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "en", label: t("screen.admin.platform.notificationTemplates.englishLabel") },
  { value: "ar", label: t("screen.admin.platform.notificationTemplates.arabicLabel") },
];

export function NotificationTemplates() {
  const inboxQuery = useQuery(orpc.notifications.listInbox.queryOptions({ input: {} }));
  const [publishedIds, setPublishedIds] = useState<ReadonlySet<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string>("tpl-1");
  const [language, setLanguage] = useState("en");
  const [text, setText] = useState("Your booking {{bookingRef}} for {{tripName}} is confirmed.");

  const rows: readonly TemplateRow[] =
    inboxQuery.data && inboxQuery.data.length > 0
      ? inboxQuery.data.slice(0, 10).map((n, index) => {
          const isPublished = publishedIds.has(n.id) || !!n.bodyAr;
          return {
            id: n.id,
            category: n.category,
            language: n.bodyAr ? "English / Arabic" : "English",
            version: publishedIds.has(n.id) ? "v2.0" : `v1.${index + 1}`,
            state: (isPublished ? "published" : "missing-translation") as TemplateRow["state"],
          };
        })
      : DEFAULT_TEMPLATE_ROWS;

  const handlePublish = () => {
    setPublishedIds((prev) => new Set([...prev, selectedId]));
  };

  const columns: readonly TeDataTableColumn<TemplateRow>[] = [
    { key: "category", header: t("screen.admin.platform.notificationTemplates.category") },
    { key: "language", header: t("screen.admin.platform.notificationTemplates.language") },
    { key: "version", header: t("screen.admin.platform.notificationTemplates.version") },
    {
      key: "state",
      header: t("screen.admin.platform.notificationTemplates.status"),
      render: (row) => <AdminStatus status={STATE_PRESENTATION()[row.state]} />,
    },
    {
      key: "edit",
      header: t("screen.admin.platform.notificationTemplates.action"),
      render: (row) => (
        <TeButton
          variant="secondary"
          aria-label={t("screen.admin.platform.notificationTemplates.editIn", {
            category: row.category,
            language: row.language,
          })}
          onClick={() => {
            setSelectedId(row.id);
            setText(`Notification template for ${row.category}`);
          }}
        >
          {t("screen.admin.platform.notificationTemplates.edit")}
        </TeButton>
      ),
    },
  ];

  return (
    <AdminPage>
      <TePageHeader
        title={t("screen.admin.platform.notificationTemplates.notificationTemplates")}
        description={t(
          "screen.admin.platform.notificationTemplates.editNotificationTextByCategory",
        )}
      />
      <StatePreview
        emptyTitle={t("screen.admin.platform.notificationTemplates.noTemplates")}
        emptyDescription={t(
          "screen.admin.platform.notificationTemplates.noTemplatesMatchTheseFilters",
        )}
        loadingLabel={t("screen.admin.platform.notificationTemplates.loadingTheTemplates")}
      >
        <AdminFilters>
          <AdminSearch
            label={t("screen.admin.platform.notificationTemplates.categoryLabel")}
            placeholder={t("screen.admin.platform.notificationTemplates.categoryName")}
            clearLabel={t("screen.admin.platform.notificationTemplates.clearCategory")}
          />
          <AdminFilterSelect
            label={t("screen.admin.platform.notificationTemplates.languageLabel")}
            options={LANGUAGE_OPTIONS()}
          />
        </AdminFilters>
        <AdminPanel title={t("screen.admin.platform.notificationTemplates.templates")}>
          <TeDataTable
            columns={columns}
            rows={rows}
            getRowKey={(row) => row.id}
            caption={t("screen.admin.platform.notificationTemplates.notificationTemplatesCaption")}
            emptyTitle={t("screen.admin.platform.notificationTemplates.noTemplatesEmptyTitle")}
            emptyDescription={t(
              "screen.admin.platform.notificationTemplates.noTemplatesMatchTheseFiltersEmptyDescription",
            )}
          />
          <AdminPagination pageCount={1} />
        </AdminPanel>
        <AdminPanel title={t("screen.admin.platform.notificationTemplates.editTemplate")}>
          <TeSelect
            label={t("screen.admin.platform.notificationTemplates.language2")}
            options={EDIT_LANGUAGE_OPTIONS()}
            value={language}
            onValueChange={setLanguage}
          />
          <TeInput
            label={t("screen.admin.platform.notificationTemplates.messageText")}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={t("screen.admin.platform.notificationTemplates.messageTextPlaceholder")}
            supportingText={t(
              "screen.admin.platform.notificationTemplates.useThePlaceholdersFromThe",
            )}
          />
        </AdminPanel>
        <AdminPanel title={t("screen.admin.platform.notificationTemplates.preview")}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TeCard>
              <p className="te-caption">
                {t("screen.admin.platform.notificationTemplates.englishPreview")}
              </p>
              <p lang="en" dir="ltr">
                {text ||
                  t("screen.admin.platform.notificationTemplates.englishPreviewOfTheMessage")}
              </p>
            </TeCard>
            <TeCard>
              <p className="te-caption">
                {t("screen.admin.platform.notificationTemplates.arabicPreview")}
              </p>
              <p lang="ar" dir="rtl">
                {t("screen.admin.platform.notificationTemplates.arabicPreviewOfTheMessage")}
              </p>
            </TeCard>
          </div>
        </AdminPanel>
        <AdminActions>
          <TeButton variant="secondary" onClick={handlePublish}>
            {t("screen.admin.platform.notificationTemplates.saveAsNewVersion")}
          </TeButton>
          <TeButton onClick={handlePublish}>
            {t("screen.admin.platform.notificationTemplates.publish")}
          </TeButton>
        </AdminActions>
        <p className="te-caption">
          {t("screen.admin.platform.notificationTemplates.earlierMessagesKeepTheVersion")}
        </p>
      </StatePreview>
    </AdminPage>
  );
}
