// SCR-SHR-11 Notification centre (`/notifications`): the inbox, newest first. Unread rows are
// tinted; each row says how it was sent and links to its target.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { TeIcon } from "@trips-app/ui/components/te-icon";
import { cn } from "@trips-app/ui/lib/utils";

import { useAuth } from "@/auth/auth-context";
import { Button, Notice, TextButton, linkClass } from "@/components/kit/controls";
import { formatDateTime } from "@/components/kit/format";
import { orpc } from "@/utils/orpc";

import { SignInRequired } from "./sign-in-required";

/** Only in-app paths are followed; anything else (another origin, a script URL) is dropped. */
function safeInternalPath(url: string | null | undefined): string | null {
  if (!url || !url.startsWith("/") || url.startsWith("//")) return null;
  return url;
}

export function ScrShr11NotificationCentre() {
  const { t, locale, status } = useAuth();
  const queryClient = useQueryClient();
  const signedIn = status === "authenticated";
  const inboxQuery = useQuery({
    ...orpc.notifications.listInbox.queryOptions({ input: {} }),
    enabled: signedIn,
  });
  const onSuccess = () => queryClient.invalidateQueries({ queryKey: orpc.notifications.key() });
  const markReadMutation = useMutation(orpc.notifications.markRead.mutationOptions({ onSuccess }));
  const markAllMutation = useMutation(
    orpc.notifications.markAllRead.mutationOptions({ onSuccess }),
  );

  const items = [...(inboxQuery.data ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const unreadCount = items.filter((item) => !item.isRead).length;
  const pick = (ar: string | null | undefined, en: string | null | undefined) =>
    (locale === "ar" ? ar || en : en || ar) ?? "";

  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-1 flex-col py-2">
      <h1 className="m-0 px-4 pt-4 pb-2 text-2xl leading-8 font-bold">
        {t("screen.shared.notifications.title")}
      </h1>
      {!signedIn ? (
        <div className="px-4 py-4">
          <SignInRequired message={t("screen.shared.notifications.signIn")} />
        </div>
      ) : inboxQuery.isPending ? (
        <p role="status" className="m-0 px-4 py-6 text-sm text-[var(--te-ink-muted)]">
          {t("screen.shared.notifications.loading")}
        </p>
      ) : inboxQuery.isError ? (
        <div className="px-4 py-4">
          <Notice tone="danger">{t("screen.shared.notifications.failed")}</Notice>
        </div>
      ) : items.length === 0 ? (
        <div className="px-4 py-6">
          <p className="m-0 text-base font-semibold">{t("screen.shared.notifications.empty")}</p>
          <p className="m-0 mt-1 text-sm text-[var(--te-ink-muted)]">
            {t("screen.shared.notifications.emptyBody")}
          </p>
        </div>
      ) : (
        <ul className="m-0 list-none p-0">
          {items.map((item) => {
            const target = safeInternalPath(item.actionUrl);
            return (
              <li
                key={item.id}
                className={cn(
                  "flex flex-col gap-1.5 border-b border-[var(--te-hairline)] px-4 py-3.5",
                  !item.isRead && "bg-[var(--te-info-soft)]",
                )}
              >
                <div className="flex justify-between gap-3 text-[13px] font-medium text-[var(--te-ink-muted)]">
                  <span>{t(`screen.shared.notifications.category.${item.category}`)}</span>
                  <time dateTime={new Date(item.createdAt).toISOString()}>
                    {formatDateTime(item.createdAt, locale)}
                  </time>
                </div>
                <h2 className="m-0 text-base leading-6 font-semibold">
                  {pick(item.titleAr, item.titleEn)}
                </h2>
                {pick(item.bodyAr, item.bodyEn) ? (
                  <p className="m-0 text-sm text-[var(--te-ink-muted)]">
                    {pick(item.bodyAr, item.bodyEn)}
                  </p>
                ) : null}
                <div className="flex items-center justify-between gap-3 text-[13px]">
                  <span className="inline-flex items-center gap-1 font-semibold text-[var(--te-success)]">
                    <TeIcon name="check" className="size-4" />
                    {t(`screen.shared.notifications.channel.${item.channel}`)}
                  </span>
                  {target ? (
                    <Link
                      to={target}
                      className={linkClass("brand")}
                      onClick={() => {
                        if (!item.isRead) markReadMutation.mutate({ notificationId: item.id });
                      }}
                    >
                      {t("screen.shared.notifications.open")}
                    </Link>
                  ) : !item.isRead ? (
                    <TextButton
                      tone="brand"
                      disabled={markReadMutation.isPending}
                      onClick={() => markReadMutation.mutate({ notificationId: item.id })}
                    >
                      {t("screen.shared.notifications.markRead")}
                    </TextButton>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {unreadCount > 0 ? (
        <div className="p-4">
          <Button
            block
            disabled={markAllMutation.isPending}
            onClick={() => markAllMutation.mutate(undefined)}
          >
            {t("screen.shared.notifications.markAll")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
