# Phase 2 Step 2.5 — Notifications UI + Deadline Check Integration — Testing Checklist

Run tests after implementation. Session from `sessionStore.getSession()`. Notifications filtered by `notification.userId === session.userId`.

---

**Test 1: Assigned notifications visible**
- [ ] Log in as **Admin**
- [ ] Create a task assigned to an employee (e.g. employee@demo.com)
- [ ] Log out (or use another browser/incognito) and log in as **Employee**
- [ ] Go to `/app/notifications`
- [ ] Confirm an **ASSIGNED** notification exists for the new task and is **unread**

**Test 2: Mark read + mark all**
- [ ] On notifications page, click **Mark as read** on one notification
- [ ] Confirm that notification shows as read (no “Mark as read” button, styling change)
- [ ] Confirm **Topbar** bell badge unread count decreases
- [ ] Click **Mark all as read**
- [ ] Confirm all notifications show as read and bell badge shows **0** (or no badge)

**Test 3: Deadline notifications (controlled)**
- [ ] Log in as **Admin**
- [ ] Open `/admin/notifications`
- [ ] Click **Run Deadline Check**
- [ ] Confirm **DEADLINE** notifications appear for tasks due within 7 days or overdue (assignee only)
- [ ] Click **Run Deadline Check** again on the same day
- [ ] Confirm **duplicates do not occur** (one per task per user per day)

**Test 4: Role isolation**
- [ ] Log in as **Admin** and note admin’s notifications (or create one for admin)
- [ ] Log in as **Employee** and go to `/app/notifications`
- [ ] Confirm **Admin should not see employee’s notifications** (employee sees only their own)
- [ ] Log in as **Admin** and go to `/admin/notifications`
- [ ] Confirm admin sees only notifications where `userId === admin userId` (role isolation)

**Test 5: Persistence**
- [ ] Mark some notifications as read
- [ ] Refresh the browser (F5)
- [ ] Confirm **read/unread status persists** (localStorage)

---

**Optional**
- [ ] Topbar: bell icon and unread badge visible when logged in; clicking bell goes to `/admin/notifications` (admin) or `/app/notifications` (employee)
- [ ] Filters: All / Unread and Type (All / Assigned / Deadline) work on notifications list
