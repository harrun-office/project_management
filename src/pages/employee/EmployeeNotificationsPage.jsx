import { useDataStore } from '../../store/dataStore.jsx';
import { getSession } from '../../store/sessionStore.js';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { MotionPage } from '../../components/motion/MotionPage.jsx';
import { NotificationsList } from '../../components/notifications/NotificationsList.jsx';

/**
 * Employee notifications: only notifications where userId === session.userId.
 * Guard via RequireAuth + AppLayout. "Run Deadline Check" allowed for demo.
 */
export function EmployeeNotificationsPage() {
  const { state, runDeadlineCheck, markNotificationRead, markAllRead } = useDataStore();
  const session = getSession();

  const allNotifications = state.notifications || [];
  const myNotifications = session
    ? allNotifications.filter((n) => n.userId === session.userId)
    : [];

  function handleMarkRead(id) {
    if (session) markNotificationRead(id, session.userId);
  }

  function handleMarkAllRead() {
    if (session) markAllRead(session.userId);
  }

  if (!session) return null;

  return (
    <MotionPage className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Notifications"
        subtitle="Deadline alerts are generated up to 7 days before due date."
        description="View and manage your task assignments and deadline reminders. Use filters to show all, unread, or by type."
        rightActions={
          <Button variant="primary" size="sm" onClick={() => runDeadlineCheck()} className="bg-[var(--warning)] hover:opacity-90 text-[var(--warning-fg)]">
            Run Deadline Check
          </Button>
        }
      />

      <NotificationsList
        notifications={myNotifications}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
        emptyMessage="No notifications."
        showFilters
      />
    </MotionPage>
  );
}
