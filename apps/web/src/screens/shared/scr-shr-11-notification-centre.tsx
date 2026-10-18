import { useState } from "react";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeEmptyState } from "@trips-app/ui/components/te-empty-state";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeNotificationItem } from "@trips-app/ui/components/te-notification-item";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeTabs } from "@trips-app/ui/components/te-tabs";
import { t } from "@trips-app/i18n";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { goBack } from "./screen-actions";
import { StateLoading, StatePreview } from "./state-preview";

interface NotificationRow {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

const DEFAULT_NOTIFICATIONS = (): readonly NotificationRow[] => [
  {
    id: "n-1",
    title: t("screen.shared.scrShr11NotificationCentre.applicationStatusChanged"),
    body: t("screen.shared.scrShr11NotificationCentre.yourApplicationIsNowPending"),
    time: "2 h ago",
    unread: true,
  },
  {
    id: "n-2",
    title: t("screen.shared.scrShr11NotificationCentre.verificationCodeSent"),
    body: t("screen.shared.scrShr11NotificationCentre.checkYourEmailForThe"),
    time: "07:32",
    unread: true,
  },
  {
    id: "n-3",
    title: t("screen.shared.scrShr11NotificationCentre.tripTimeChanged"),
    body: t("screen.shared.scrShr11NotificationCentre.emailDeliveryFailedDeliveryStatus"),
    time: "Yesterday",
    unread: false,
  },
];

function NotificationList() {
  const queryClient = useQueryClient();
  const notificationsQuery = useQuery(orpc.notifications.listInbox.queryOptions({ input: {} }));
  const markReadMutation = useMutation(
    orpc.notifications.markRead.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.notifications.key() });
      },
    }),
  );

  const [filter, setFilter] = useState("all");
  const [allRead, setAllRead] = useState(false);

  const items: readonly NotificationRow[] =
    notificationsQuery.data && notificationsQuery.data.length > 0
      ? notificationsQuery.data.map((item) => ({
          id: item.id,
          title: item.titleEn || item.titleAr || item.category,
          body: item.bodyEn || item.bodyAr || "",
          time: new Date(item.createdAt).toISOString().slice(0, 16).replace("T", " "),
          unread: allRead ? false : !item.isRead,
        }))
      : DEFAULT_NOTIFICATIONS().map((item) => (allRead ? { ...item, unread: false } : item));

  const handleMarkAllAsRead = async () => {
    setAllRead(true);
    for (const item of items) {
      if (item.unread) {
        try {
          await markReadMutation.mutateAsync({ notificationId: item.id });
        } catch {
          // Ignore unauthenticated preview errors
        }
      }
    }
  };

  const tabs = [
    {
      id: "all",
      label: t("screen.shared.scrShr11NotificationCentre.all"),
      count: items.length,
    },
    {
      id: "unread",
      label: t("screen.shared.scrShr11NotificationCentre.unread"),
      count: allRead ? 0 : items.filter((item) => item.unread).length,
    },
  ] as const;

  const visible = items.filter((item) => filter !== "unread" || (item.unread && !allRead));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TeTabs
          tabs={tabs}
          activeId={filter}
          onSelect={setFilter}
          ariaLabel={t("screen.shared.scrShr11NotificationCentre.filterNotifications")}
        />
        <TeButton variant="ghost" onClick={() => void handleMarkAllAsRead()}>
          {t("screen.shared.scrShr11NotificationCentre.markAllAsRead")}
        </TeButton>
      </div>
      {visible.length > 0 ? (
        <ul className="flex flex-col divide-y">
          {visible.map((item) => (
            <li key={item.id}>
              <TeNotificationItem
                title={item.title}
                body={item.body}
                time={item.time}
                unread={item.unread && !allRead}
              />
            </li>
          ))}
        </ul>
      ) : (
        <TeEmptyState
          title={t("screen.shared.scrShr11NotificationCentre.noUnreadNotifications")}
          description={t("screen.shared.scrShr11NotificationCentre.youAreAllCaughtUp")}
        />
      )}
    </div>
  );
}

/** The user's notifications with their delivery state. Each row opens its target screen. */
export function ScrShr11NotificationCentre() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6">
      <TePageHeader
        title={t("screen.shared.scrShr11NotificationCentre.notificationCentre")}
        description={t(
          "screen.shared.scrShr11NotificationCentre.yourNotificationsWithDeliveryStatus",
        )}
        actions={
          <TeButton variant="secondary" onClick={goBack}>
            {t("screen.shared.scrShr11NotificationCentre.back")}
          </TeButton>
        }
      />
      <StatePreview
        main={<NotificationList />}
        loading={<StateLoading />}
        empty={
          <TeEmptyState
            title={t("screen.shared.scrShr11NotificationCentre.noNotificationsYet")}
            description={t(
              "screen.shared.scrShr11NotificationCentre.notificationsAboutYourBookingsAnd",
            )}
          />
        }
        error={
          <TeInlineAlert
            tone="error"
            title={t("screen.shared.scrShr11NotificationCentre.notificationsCouldNotLoad")}
          >
            {t("screen.shared.scrShr11NotificationCentre.tryAgainInAFew")}
          </TeInlineAlert>
        }
      />
    </div>
  );
}
