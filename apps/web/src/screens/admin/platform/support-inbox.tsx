// SCR-ADM-41 Support inbox (docs/design/web/AdmSupport.dc.html): queues of tickets from travellers,
// organizations, drivers and photographers with assignment, status, reply history, macros and a
// customer card. Tickets map to the notification inbox the signed-in admin can read, with
// mark-as-read as the real action; assignment, status and sending replies have no procedure yet,
// so those controls hold local state and say so.
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverMutationOptions, serverQueryOptions } from "@/utils/server-rpc";

import { AdminButton } from "../common/admin-actions";
import { AdminInput, AdminSelect, type AdminOption } from "../common/admin-form";
import { AdminEmpty, AdminQueryState } from "../common/admin-states";
import {
  AdminAlert,
  AdminBadge,
  AdminCard,
  AdminPage,
  AdminRow,
  AdminSplit,
} from "../common/admin-ui";

const K = "screen.admin.platform.supportInbox";

const QUEUE_OPTIONS = (): readonly AdminOption[] => [
  { value: "all", label: t(`${K}.queueAll`) },
  { value: "open", label: t(`${K}.queueOpen`) },
  { value: "unread", label: t(`${K}.queueUnread`) },
  { value: "read", label: t(`${K}.queueRead`) },
];

const STATUS_OPTIONS = (): readonly AdminOption[] => [
  { value: "open", label: t(`${K}.statusOpen`) },
  { value: "waiting_customer", label: t(`${K}.statusWaitingCustomer`) },
  { value: "waiting_gateway", label: t(`${K}.statusWaitingGateway`) },
  { value: "solved", label: t(`${K}.statusSolved`) },
];

const MACROS = ["refundTimeline", "gatewayDelay", "paymentMissing", "documentsNeeded"] as const;

interface TicketRow {
  id: string;
  title: string;
  body: string;
  category: string;
  channel: string;
  createdAt: string;
  isRead: boolean;
}

export function SupportInbox() {
  const { status: authStatus, locale } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [queue, setQueue] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [assignee, setAssignee] = useState("unassigned");
  const [status, setStatus] = useState("open");
  const [reply, setReply] = useState("");

  const inboxQuery = useQuery({
    ...serverQueryOptions(orpc.notifications.listInbox, "notifications/listInbox", { input: {} }),
    enabled: authStatus === "authenticated",
  });
  const markReadMutation = useMutation(
    serverMutationOptions(orpc.notifications.markRead, "notifications/markRead", {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.notifications.key() });
      },
    }),
  );
  const markAllReadMutation = useMutation(
    serverMutationOptions(orpc.notifications.markAllRead, "notifications/markAllRead", {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.notifications.key() });
      },
    }),
  );

  const tickets: readonly TicketRow[] = useMemo(
    () =>
      [...(inboxQuery.data ?? [])]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map((message) => ({
          id: message.id,
          title: (locale === "ar" ? message.titleAr : message.titleEn) || message.titleEn,
          body: (locale === "ar" ? message.bodyAr : message.bodyEn) || message.bodyEn,
          category: message.category,
          channel: message.channel,
          createdAt: new Date(message.createdAt).toISOString(),
          isRead: message.isRead,
        })),
    [inboxQuery.data, locale],
  );

  const needle = search.trim().toLowerCase();
  const rows = tickets.filter((ticket) => {
    if (needle && !`${ticket.title} ${ticket.body}`.toLowerCase().includes(needle)) return false;
    if (queue === "unread") return !ticket.isRead;
    if (queue === "read") return ticket.isRead;
    return true;
  });
  const selected = rows.find((ticket) => ticket.id === selectedId) ?? null;
  const unreadCount = tickets.filter((ticket) => !ticket.isRead).length;

  return (
    <AdminPage
      title={t(`${K}.title`)}
      description={t(`${K}.description`, { open: tickets.length, unread: unreadCount })}
      actions={
        <AdminButton
          variant="secondary"
          disabled={markAllReadMutation.isPending || unreadCount === 0}
          onClick={() => markAllReadMutation.mutate(undefined)}
        >
          {t(`${K}.markAllRead`)}
        </AdminButton>
      }
    >
      <AdminQueryState query={inboxQuery} loadingLabel={t(`${K}.loading`)}>
        <AdminSplit
          main={
            <>
              <AdminCard>
                <AdminInput
                  type="search"
                  label={t(`${K}.searchLabel`)}
                  placeholder={t(`${K}.searchPlaceholder`)}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <AdminSelect
                  label={t(`${K}.queueLabel`)}
                  options={QUEUE_OPTIONS()}
                  value={queue}
                  onValueChange={setQueue}
                />
              </AdminCard>
              <AdminCard title={t(`${K}.ticketsTitle`)} caption={t(`${K}.ticketsCaption`)}>
                {rows.length === 0 ? (
                  <AdminEmpty title={t(`${K}.emptyTitle`)} description={t(`${K}.emptyBody`)} />
                ) : (
                  <ul className="m-0 flex list-none flex-col gap-1 p-0">
                    {rows.map((ticket) => {
                      const isSelected = ticket.id === selected?.id;
                      return (
                        <li key={ticket.id}>
                          <button
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => setSelectedId(ticket.id)}
                            className={`w-full rounded-[var(--te-radius-md)] p-3 text-start ${
                              isSelected
                                ? "bg-[var(--te-info-soft)]"
                                : "hover:bg-[var(--te-surface)]"
                            }`}
                          >
                            <span className="flex flex-wrap items-center gap-2">
                              {ticket.isRead ? (
                                <AdminBadge tone="neutral" icon={false}>
                                  {t(`${K}.read`)}
                                </AdminBadge>
                              ) : (
                                <AdminBadge tone="warn">{t(`${K}.unread`)}</AdminBadge>
                              )}
                              <b className="te-body">{ticket.title}</b>
                            </span>
                            <span className="te-caption mt-1 block">
                              {t(`${K}.category.${ticket.category}`)} ·{" "}
                              {t(`${K}.channel.${ticket.channel}`)} ·{" "}
                              {new Date(ticket.createdAt).toLocaleString(locale)}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </AdminCard>
            </>
          }
          side={
            <AdminCard
              title={
                selected
                  ? t(`${K}.detailTitle`, { subject: selected.title })
                  : t(`${K}.detailPickTitle`)
              }
            >
              {!selected ? (
                <AdminEmpty
                  title={t(`${K}.pickTicketTitle`)}
                  description={t(`${K}.pickTicketBody`)}
                />
              ) : (
                <>
                  <AdminRow label={t(`${K}.openedAt`)}>
                    {new Date(selected.createdAt).toLocaleString(locale)}
                  </AdminRow>
                  <AdminRow label={t(`${K}.channelLabel`)}>
                    {t(`${K}.channel.${selected.channel}`)}
                  </AdminRow>
                  <AdminRow label={t(`${K}.categoryLabel`)} last>
                    {t(`${K}.category.${selected.category}`)}
                  </AdminRow>
                  <p className="te-body">{selected.body}</p>
                  <AdminSelect
                    label={t(`${K}.assigneeLabel`)}
                    options={[
                      { value: "unassigned", label: t(`${K}.assigneeUnassigned`) },
                      { value: "payments", label: t(`${K}.assigneePayments`) },
                      { value: "operations", label: t(`${K}.assigneeOperations`) },
                    ]}
                    value={assignee}
                    onValueChange={setAssignee}
                  />
                  <AdminSelect
                    label={t(`${K}.statusLabel`)}
                    options={STATUS_OPTIONS()}
                    value={status}
                    onValueChange={setStatus}
                  />
                  <AdminAlert tone="info" title={t(`${K}.localFieldsTitle`)}>
                    {t(`${K}.localFieldsBody`)}
                  </AdminAlert>
                  <AdminAlert tone="info" title={t(`${K}.macrosTitle`)}>
                    {MACROS.map((macro) => t(`${K}.macro.${macro}`)).join(" · ")}
                  </AdminAlert>
                  <AdminInput
                    label={t(`${K}.replyLabel`)}
                    value={reply}
                    disabled
                    onChange={(e) => setReply(e.target.value)}
                  />
                  <AdminButton variant="primary" disabled title={t(`${K}.noReplyProcedure`)}>
                    {t(`${K}.sendReply`)}
                  </AdminButton>
                  {!selected.isRead ? (
                    <AdminButton
                      variant="secondary"
                      disabled={markReadMutation.isPending}
                      onClick={() => markReadMutation.mutate({ notificationId: selected.id })}
                    >
                      {t(`${K}.markRead`)}
                    </AdminButton>
                  ) : null}
                </>
              )}
            </AdminCard>
          }
        />
      </AdminQueryState>
    </AdminPage>
  );
}
