// SCR-ADM-31 Notification templates (docs/design/web/admin/SCR-ADM-31.dc.html): notification
// text by category and language, an editor with English and Arabic tabs, the variables the text
// uses, and a preview. Each save creates a new version. No procedure lists or saves templates yet,
// so the list shows its empty state and saving stays disabled.
import { useState, type ReactNode } from "react";
import { t } from "@trips-app/i18n";

import { AdminButton } from "../common/admin-actions";
import { AdminTabs, AdminTextarea, type AdminTab } from "../common/admin-form";
import { AdminEmpty } from "../common/admin-states";
import {
  AdminAlert,
  AdminBadge,
  AdminCard,
  AdminPage,
  AdminTable,
  type AdminColumn,
} from "../common/admin-ui";

type TemplateLanguage = "en" | "ar";

interface TemplateRow {
  id: string;
  category: string;
  language: string;
  version: string;
}

const TEMPLATE_ROWS: readonly TemplateRow[] = [];
const VARIABLE_PATTERN = /\[([a-z][a-z0-9_]*)\]/g;
const EMPTY_DRAFTS: Readonly<Record<TemplateLanguage, string>> = { en: "", ar: "" };

const languageTabs = (): readonly AdminTab[] => [
  { id: "en", label: t("screen.admin.platform.notificationTemplates.english") },
  { id: "ar", label: t("screen.admin.platform.notificationTemplates.arabic") },
];

const columns = (): readonly AdminColumn<TemplateRow>[] => [
  {
    key: "category",
    header: t("screen.admin.platform.notificationTemplates.category"),
    render: (row) => row.category,
    wrap: true,
  },
  {
    key: "language",
    header: t("screen.admin.platform.notificationTemplates.language"),
    render: (row) => row.language,
  },
  {
    key: "version",
    header: t("screen.admin.platform.notificationTemplates.version"),
    render: (row) => row.version,
  },
];

/** The distinct `[variable]` names in a message, in the order they first appear. */
function variablesIn(text: string): readonly string[] {
  return [...new Set([...text.matchAll(VARIABLE_PATTERN)].map((match) => match[1] ?? ""))].filter(
    Boolean,
  );
}

/** `[trip_name]` reads as `[Trip name]` in the preview. */
function previewText(text: string): string {
  return text.replace(VARIABLE_PATTERN, (_match, name: string) => {
    const words = name.replace(/_/g, " ");
    return `[${words.charAt(0).toUpperCase()}${words.slice(1)}]`;
  });
}

function isLanguage(value: string): value is TemplateLanguage {
  return value === "en" || value === "ar";
}

/** List and editor side by side, one to two. Stacks below `lg`. */
function TemplateLayout({ list, editor }: { list: ReactNode; editor: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <div className="flex min-w-0 flex-col gap-6">{list}</div>
      <div className="flex min-w-0 flex-col gap-6">{editor}</div>
    </div>
  );
}

export function NotificationTemplates() {
  const [language, setLanguage] = useState<TemplateLanguage>("en");
  const [drafts, setDrafts] = useState(EMPTY_DRAFTS);

  const text = drafts[language];
  const variables = variablesIn(text);
  const unavailable = t("screen.admin.platform.notificationTemplates.savingUnavailable");

  const editorCard = (
    <AdminCard label={t("screen.admin.platform.notificationTemplates.editorLabel")}>
      <AdminTabs
        label={t("screen.admin.platform.notificationTemplates.language")}
        tabs={languageTabs()}
        activeId={language}
        onSelect={(id) => isLanguage(id) && setLanguage(id)}
      />
      <AdminTextarea
        label={t("screen.admin.platform.notificationTemplates.messageText")}
        placeholder={t("screen.admin.platform.notificationTemplates.messagePlaceholder")}
        rows={4}
        lang={language}
        dir={language === "ar" ? "rtl" : "ltr"}
        value={text}
        onChange={(event) =>
          setDrafts((current) => ({ ...current, [language]: event.target.value }))
        }
      />
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--te-hairline)] py-2.5">
        <span className="te-caption">
          {t("screen.admin.platform.notificationTemplates.variables")}
        </span>
        {variables.length === 0 ? (
          <span className="te-caption">—</span>
        ) : (
          variables.map((name) => (
            <AdminBadge key={name} icon={false}>
              {`[${name}]`}
            </AdminBadge>
          ))
        )}
      </div>
    </AdminCard>
  );

  const previewCard = (
    <AdminCard title={t("screen.admin.platform.notificationTemplates.preview")}>
      <p
        lang={language}
        dir={language === "ar" ? "rtl" : "ltr"}
        className="te-body rounded-[var(--te-radius-md)] bg-[var(--te-surface)] p-4"
      >
        {text ? previewText(text) : t("screen.admin.platform.notificationTemplates.previewEmpty")}
      </p>
      <p className="te-caption">
        {t("screen.admin.platform.notificationTemplates.publishedVersion", { version: "—" })}
      </p>
    </AdminCard>
  );

  return (
    <AdminPage
      title={t("screen.admin.platform.notificationTemplates.title")}
      description={t("screen.admin.platform.notificationTemplates.description")}
      actions={
        <>
          <AdminButton disabled title={unavailable}>
            {t("screen.admin.platform.notificationTemplates.saveAsNewVersion")}
          </AdminButton>
          <AdminButton variant="primary" disabled title={unavailable}>
            {t("screen.admin.platform.notificationTemplates.publishVersion")}
          </AdminButton>
        </>
      }
    >
      <TemplateLayout
        list={
          <AdminTable
            caption={t("screen.admin.platform.notificationTemplates.tableCaption")}
            columns={columns()}
            rows={TEMPLATE_ROWS}
            getRowKey={(row) => row.id}
            empty={
              <AdminEmpty
                title={t("screen.admin.platform.notificationTemplates.emptyTitle")}
                description={t("screen.admin.platform.notificationTemplates.emptyBody")}
              />
            }
          />
        }
        editor={
          <>
            {editorCard}
            {previewCard}
            <AdminAlert tone="warning">
              {t("screen.admin.platform.notificationTemplates.translationRule")}
            </AdminAlert>
          </>
        }
      />
    </AdminPage>
  );
}
