// SCR-ORG-54 Inbox: questions from travelers before and after they book
// (docs/design/web/OrgInbox.dc.html). The conversations are the account's notification inbox
// (notifications.listInbox) with mark-as-read; replying has no procedure yet and says so.
import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions, serverMutationOptions } from "@/utils/server-rpc";

import { OrgChips, OrgTextarea } from "../common/org-form";
import { OrgButtonLink } from "../common/org-link";
import {
  NO_VALUE,
  OrgAlert,
  OrgBadge,
  OrgButton,
  OrgCard,
  OrgEmpty,
  OrgError,
  OrgKpi,
  OrgKpiRow,
  OrgLoading,
  OrgPage,
  OrgPageHeader,
  OrgRow,
} from "../common/org-ui";
import { formatDateTime } from "../accounting/finance-format";

const K = "screen.organization.crm.inbox";

interface InboxMessage {
  id: string;
  title: string;
  body: string;
  category: string;
  createdAt: string | Date;
  isRead: boolean;
}

export function Inbox(): ReactNode {
  const queryClient = useQueryClient();
  const { status: authStatus, locale } = useAuth();
  const enabled = authStatus === "authenticated";
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [replySent, setReplySent] = useState(false);

  const inboxQuery = useQuery({
    ...serverQueryOptions(orpc.notifications.listInbox, "notifications/listInbox", { input: {} }),
    enabled,
  });
  const markReadMutation = useMutation(
    serverMutationOptions(orpc.notifications.markRead, "notifications/markRead", {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: orpc.notifications.key(),
        });
      },
    }),
  );

  const messages: readonly InboxMessage[] = [...(inboxQuery.data ?? [])]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((item) => ({
      id: item.id,
      title: (locale === "ar" ? item.titleAr || item.titleEn : item.titleEn || item.titleAr) || "",
      body: (locale === "ar" ? item.bodyAr || item.bodyEn : item.bodyEn || item.bodyAr) || "",
      category: item.category,
      createdAt: item.createdAt,
      isRead: item.isRead,
    }));
  const unread = messages.filter((message) => !message.isRead);
  const visible = filter === "unread" ? unread : messages;
  const selected = visible.find((message) => message.id === selectedId) ?? visible[0] ?? null;

  function sendReply(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (!selected || reply.trim().length === 0) return;
    // No reply or conversation procedure exists yet; the alert says so.
    setReplySent(true);
  }

  return (
    <OrgPage>
      <OrgPageHeader title={t(`${K}.title`)} caption={t(`${K}.caption`)} />
      <OrgKpiRow>
        <OrgKpi
          label={t(`${K}.kpiConversations`)}
          value={inboxQuery.isSuccess ? messages.length : NO_VALUE}
          hint={t(`${K}.nUnread`, { n: unread.length })}
        />
        <OrgKpi label={t(`${K}.kpiReplySla`)} value={NO_VALUE} hint={t(`${K}.slaNote`)} />
      </OrgKpiRow>
      {inboxQuery.isError ? <OrgError onRetry={() => void inboxQuery.refetch()} /> : null}
      <OrgChips
        label={t(`${K}.filterLabel`)}
        options={[
          { value: "all", label: t(`${K}.filterAll`) },
          { value: "unread", label: t(`${K}.filterUnread`) },
        ]}
        value={filter}
        onValueChange={setFilter}
      />
      {inboxQuery.isLoading ? (
        <OrgLoading rows={4} />
      ) : visible.length === 0 ? (
        <OrgCard title={t(`${K}.conversationsTitle`)}>
          <OrgEmpty title={t(`${K}.noConversationsTitle`)}>
            {filter === "unread" ? t(`${K}.noneUnread`) : t(`${K}.noConversationsBody`)}
          </OrgEmpty>
        </OrgCard>
      ) : (
        <OrgRow align="start">
          <OrgCard title={t(`${K}.conversationsTitle`)} className="lg:flex-1">
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {visible.map((message) => (
                <li key={message.id}>
                  <button
                    type="button"
                    aria-current={selected?.id === message.id ? "true" : undefined}
                    onClick={() => {
                      setSelectedId(message.id);
                      setReply("");
                      setReplySent(false);
                    }}
                    className="w-full cursor-pointer rounded-lg border border-transparent p-3 text-start hover:border-[var(--te-control-border)] aria-current:border-[var(--te-accent)]"
                  >
                    <span className="flex items-center justify-between gap-2">
                      <b className="truncate text-sm leading-5 font-semibold">{message.title}</b>
                      {message.isRead ? null : <OrgBadge tone="warn">{t(`${K}.unread`)}</OrgBadge>}
                    </span>
                    <span className="te-caption block truncate text-[var(--te-ink-muted)]">
                      {t(`${K}.category.${message.category}`)} ·{" "}
                      {formatDateTime(message.createdAt, locale)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </OrgCard>
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            {selected ? (
              <>
                <OrgCard title={selected.title}>
                  <p className="m-0 text-sm leading-5 whitespace-pre-line">{selected.body}</p>
                  <p className="te-caption m-0 text-[var(--te-ink-muted)]">
                    {t(`${K}.category.${selected.category}`)} ·{" "}
                    {formatDateTime(selected.createdAt, locale)}
                  </p>
                  {selected.isRead ? null : (
                    <div>
                      <OrgButton
                        variant="secondary"
                        disabled={markReadMutation.isPending}
                        onClick={() =>
                          markReadMutation.mutate({
                            notificationId: selected.id,
                          })
                        }
                      >
                        {t(`${K}.markRead`)}
                      </OrgButton>
                    </div>
                  )}
                </OrgCard>
                <OrgCard title={t(`${K}.replyTitle`)}>
                  <form onSubmit={sendReply} className="flex flex-col gap-4" noValidate>
                    <OrgTextarea
                      label={t(`${K}.replyLabel`)}
                      rows={4}
                      value={reply}
                      onChange={(change) => setReply(change.target.value)}
                    />
                    {replySent ? (
                      <OrgAlert tone="info" title={t(`${K}.replyUnavailableTitle`)}>
                        {t(`${K}.replyUnavailableBody`)}
                      </OrgAlert>
                    ) : null}
                    <div>
                      <OrgButton type="submit" disabled={reply.trim().length === 0}>
                        {t(`${K}.sendReply`)}
                      </OrgButton>
                    </div>
                  </form>
                </OrgCard>
              </>
            ) : null}
            <OrgCard title={t(`${K}.customerCardTitle`)}>
              <OrgEmpty title={t(`${K}.customerCardEmptyTitle`)}>
                {t(`${K}.customerCardEmptyBody`)}
                <span className="mt-1 block">
                  <OrgButtonLink slug="crm-customers" variant="text" className="-ms-2">
                    {t(`${K}.openCustomers`)}
                  </OrgButtonLink>
                </span>
              </OrgEmpty>
            </OrgCard>
          </div>
        </OrgRow>
      )}
    </OrgPage>
  );
}
