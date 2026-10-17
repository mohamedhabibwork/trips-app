import { useState } from "react";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeEmptyState } from "@trips-app/ui/components/te-empty-state";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeNotificationItem } from "@trips-app/ui/components/te-notification-item";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeTabs } from "@trips-app/ui/components/te-tabs";
import { goBack } from "./screen-actions";
import { StateLoading, StatePreview } from "./state-preview";

interface NotificationRow {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

const NOTIFICATIONS: readonly NotificationRow[] = [
  {
    id: "n-1",
    title: "Application status changed",
    body: "Your application is now pending review.",
    time: "2 h ago",
    unread: true,
  },
  {
    id: "n-2",
    title: "Verification code sent",
    body: "Check your email for the code. Codes expire after 5 minutes.",
    time: "07:32",
    unread: true,
  },
  {
    id: "n-3",
    title: "Trip time changed",
    body: "Email delivery failed. Delivery status: retry scheduled.",
    time: "Yesterday",
    unread: false,
  },
];

const FILTER_TABS = [
  { id: "all", label: "All", count: NOTIFICATIONS.length },
  {
    id: "unread",
    label: "Unread",
    count: NOTIFICATIONS.filter((item) => item.unread).length,
  },
] as const;

function NotificationList() {
  const [filter, setFilter] = useState("all");
  const [allRead, setAllRead] = useState(false);

  const visible = NOTIFICATIONS.filter((item) => filter !== "unread" || (item.unread && !allRead));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TeTabs
          tabs={FILTER_TABS}
          activeId={filter}
          onSelect={setFilter}
          ariaLabel="Filter notifications"
        />
        <TeButton variant="ghost" onClick={() => setAllRead(true)}>
          Mark all as read
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
        <TeEmptyState title="No unread notifications" description="You are all caught up." />
      )}
    </div>
  );
}

/** The user's notifications with their delivery state. Each row opens its target screen. */
export function ScrShr11NotificationCentre() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6">
      <TePageHeader
        title="Notification centre"
        description="Your notifications, with delivery status for each one."
        actions={
          <TeButton variant="secondary" onClick={goBack}>
            Back
          </TeButton>
        }
      />
      <StatePreview
        main={<NotificationList />}
        loading={<StateLoading />}
        empty={
          <TeEmptyState
            title="No notifications yet"
            description="Notifications about your bookings and applications appear here."
          />
        }
        error={
          <TeInlineAlert tone="error" title="Notifications could not load">
            Try again in a few minutes.
          </TeInlineAlert>
        }
      />
    </div>
  );
}
