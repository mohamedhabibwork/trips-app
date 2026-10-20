// SCR-ORG-63 Help and support: the help centre of the design. The ticket list is the account's
// notification inbox with mark-as-read; help articles are a static searchable list, and opening a
// ticket has no procedure yet, so the form says so instead of pretending to send.
import { useState, type FormEvent, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions, serverMutationOptions } from "@/utils/server-rpc";

import { OrgInput, OrgSelect, OrgTextarea } from "../common/org-form";
import { OrgButtonLink } from "../common/org-link";
import { formatDateTime } from "../accounting/finance-format";
import { OrgTable, type OrgColumn } from "../common/org-table";
import {
  NO_VALUE,
  OrgAlert,
  OrgBadge,
  OrgButton,
  OrgCard,
  OrgError,
  OrgKpi,
  OrgKpiRow,
  OrgLoading,
  OrgPage,
  OrgPageHeader,
  OrgRow,
} from "../common/org-ui";

const K = "screen.organization.workspace.support";

interface HelpArticle {
  titleKey: string;
  bodyKey: string;
  category: string;
}

/** The static help articles the artboard lists; the search filters them in memory. */
const HELP_ARTICLES: readonly HelpArticle[] = [
  { titleKey: "articleCreditNote", bodyKey: "articleCreditNoteBody", category: "invoices" },
  {
    titleKey: "articleCreditNoteRejected",
    bodyKey: "articleCreditNoteRejectedBody",
    category: "invoices",
  },
  {
    titleKey: "articleRefundsAfterPayout",
    bodyKey: "articleRefundsAfterPayoutBody",
    category: "settlements",
  },
  {
    titleKey: "articleWebhookSignature",
    bodyKey: "articleWebhookSignatureBody",
    category: "webhooks",
  },
  { titleKey: "articleDealFees", bodyKey: "articleDealFeesBody", category: "deals" },
];

interface InboxRow {
  id: string;
  title: string;
  category: string;
  createdAt: string | Date;
  isRead: boolean;
}

export function Support(): ReactNode {
  const queryClient = useQueryClient();
  const { t, locale, status } = useAuth();
  const signedIn = status === "authenticated";
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("other");
  const [description, setDescription] = useState("");

  const inboxQuery = useQuery({
    ...serverQueryOptions(orpc.notifications.listInbox, "notifications/listInbox", { input: {} }),
    enabled: signedIn,
  });
  const markReadMutation = useMutation(
    serverMutationOptions(orpc.notifications.markRead, "notifications/markRead", {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.notifications.key() });
      },
    }),
  );

  const inbox: readonly InboxRow[] = [...(inboxQuery.data ?? [])]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)
    .map((item) => ({
      id: item.id,
      title: (locale === "ar" ? item.titleAr || item.titleEn : item.titleEn || item.titleAr) || "",
      category: item.category,
      createdAt: item.createdAt,
      isRead: item.isRead,
    }));
  const unread = inbox.filter((row) => !row.isRead).length;

  const query = search.trim().toLowerCase();
  const results = query
    ? HELP_ARTICLES.filter((article) =>
        `${t(`${K}.${article.titleKey}`)} ${t(`${K}.${article.bodyKey}`)}`
          .toLowerCase()
          .includes(query),
      )
    : [];

  const columns: readonly OrgColumn<InboxRow>[] = [
    {
      key: "title",
      header: t(`${K}.ticket`),
      render: (row) => (
        <span className="flex flex-col">
          <b className="max-w-[320px] truncate">{row.title || NO_VALUE}</b>
          <span className="te-caption text-[var(--te-ink-muted)]">
            {t(`${K}.category.${row.category}`)}
          </span>
        </span>
      ),
    },
    {
      key: "createdAt",
      header: t(`${K}.lastReply`),
      render: (row) => formatDateTime(row.createdAt, locale),
    },
    {
      key: "isRead",
      header: t(`${K}.status`),
      render: (row) =>
        row.isRead ? (
          <OrgBadge tone="neu" icon={false}>
            {t(`${K}.read`)}
          </OrgBadge>
        ) : (
          <OrgBadge tone="warn">{t(`${K}.unread`)}</OrgBadge>
        ),
    },
    {
      key: "action",
      header: t(`${K}.action`),
      hiddenHeader: true,
      align: "end",
      render: (row) =>
        row.isRead ? undefined : (
          <OrgButton
            variant="text"
            className="-mx-2"
            disabled={markReadMutation.isPending}
            onClick={() => markReadMutation.mutate({ notificationId: row.id })}
          >
            {t(`${K}.markRead`)}
          </OrgButton>
        ),
    },
  ];

  function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    // No ticket procedure exists yet; the honest notice under the form says so.
  }

  return (
    <OrgPage>
      <OrgPageHeader title={t(`${K}.title`)} caption={t(`${K}.caption`)} />
      <OrgCard title={t(`${K}.searchTitle`)}>
        <OrgInput
          label={t(`${K}.searchLabel`)}
          type="search"
          placeholder={t(`${K}.searchPlaceholder`)}
          value={search}
          onChange={(change) => setSearch(change.target.value)}
          fieldClassName="max-w-[560px]"
        />
        {query ? (
          results.length > 0 ? (
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {results.map((article) => (
                <li key={article.titleKey} className="flex flex-col gap-0.5">
                  <b>{t(`${K}.${article.titleKey}`)}</b>
                  <span className="te-caption text-[var(--te-ink-muted)]">
                    {t(`${K}.${article.bodyKey}`)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="m-0 text-sm text-[var(--te-ink-muted)]">{t(`${K}.noArticles`)}</p>
          )
        ) : null}
      </OrgCard>
      <OrgKpiRow>
        <OrgKpi
          label={t(`${K}.kpiMessages`)}
          value={inboxQuery.isSuccess ? inbox.length : NO_VALUE}
          hint={t(`${K}.nUnread`, { n: unread })}
        />
        <OrgKpi
          label={t(`${K}.kpiSupportPlan`)}
          value={t(`${K}.standardSupport`)}
          hint={t(`${K}.standardReplyTime`)}
        />
      </OrgKpiRow>
      <OrgCard
        title={t(`${K}.ticketsTitle`)}
        actions={
          <span className="te-caption text-[var(--te-ink-muted)]">{t(`${K}.ticketsNote`)}</span>
        }
      >
        {inboxQuery.isError ? <OrgError onRetry={() => void inboxQuery.refetch()} /> : null}
        {inboxQuery.isLoading ? (
          <OrgLoading />
        ) : (
          <OrgTable
            columns={columns}
            rows={inbox}
            rowKey={(row) => row.id}
            caption={t(`${K}.ticketsTitle`)}
            empty={t(`${K}.noTickets`)}
          />
        )}
      </OrgCard>
      <OrgRow align="start">
        <OrgCard title={t(`${K}.newTicketTitle`)} className="lg:flex-[2]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <OrgSelect
              label={t(`${K}.categoryLabel`)}
              options={[
                { value: "settlements", label: t(`${K}.categoryOption.settlements`) },
                { value: "invoices", label: t(`${K}.categoryOption.invoices`) },
                { value: "deals", label: t(`${K}.categoryOption.deals`) },
                { value: "webhooks", label: t(`${K}.categoryOption.webhooks`) },
                { value: "bookings", label: t(`${K}.categoryOption.bookings`) },
                { value: "billing", label: t(`${K}.categoryOption.billing`) },
                { value: "other", label: t(`${K}.categoryOption.other`) },
              ]}
              value={category}
              onValueChange={setCategory}
            />
            <OrgTextarea
              label={t(`${K}.descriptionLabel`)}
              hint={t(`${K}.descriptionHint`)}
              rows={5}
              value={description}
              onChange={(change) => setDescription(change.target.value)}
            />
            <div>
              <OrgButton type="submit" disabled={description.trim().length < 20}>
                {t(`${K}.sendTicket`)}
              </OrgButton>
            </div>
            <OrgAlert tone="info" title={t(`${K}.ticketUnavailableTitle`)}>
              {t(`${K}.ticketUnavailableBody`)}
            </OrgAlert>
          </form>
        </OrgCard>
        <OrgCard title={t(`${K}.accountManagerTitle`)} className="lg:flex-1">
          <p className="m-0 text-sm leading-5">{t(`${K}.accountManagerBody`)}</p>
          <OrgButtonLink slug="subscription-and-billing" variant="secondary">
            {t(`${K}.seeEnterprise`)}
          </OrgButtonLink>
        </OrgCard>
      </OrgRow>
    </OrgPage>
  );
}
