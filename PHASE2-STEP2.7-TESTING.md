# Phase 2 — Step 2.7: Admin User Management — Testing

Step-by-step tests for the Admin Users module at `/admin/users`.

---

## Prerequisites

- Build passes: `npm run build` (from `client/`)
- Dev server running: `npm run dev`
- Demo seed loaded (login as Admin or Employee to ensure data exists)

---

## 1) Login as Admin → /admin/users loads

1. Open app root (e.g. `http://localhost:5173/`).
2. Click **Login** (or go to `/login`).
3. Click **Login as Admin**.
4. Navigate to `/admin/users` (e.g. from Home link "Admin Users" or by URL).
5. **Expected:** Page loads with title "Users" and subtitle "Manage team access and availability". Table shows users (e.g. Admin Demo, Employee Demo, Jane Dev, etc.). No redirect to `/login` or `/app`.

---

## 2) Search by name/email works

1. On `/admin/users`, focus the search input.
2. Type part of a user name (e.g. `Jane`).
3. **Expected:** Table shows only users whose name or email matches (e.g. "Jane Dev").
4. Clear search and type an email fragment (e.g. `@demo`).
5. **Expected:** Table shows users with matching email (e.g. admin@demo.com, employee@demo.com).
6. Type something that matches no user (e.g. `zzz`).
7. **Expected:** Table is empty or shows "No users match the filters."

---

## 3) Department filter works

1. On `/admin/users`, set **Department** to **DEV**.
2. **Expected:** Only users with department DEV are shown.
3. Set **Department** to **PRESALES**.
4. **Expected:** Only users with department PRESALES are shown (e.g. Bob Presales, Charlie Presales).
5. Set **Department** to **All**.
6. **Expected:** All users are shown again.

---

## 4) Status filter works

1. Set **Status** to **Active**.
2. **Expected:** Only active users (green "Active" badge) are shown.
3. Set **Status** to **Inactive**.
4. **Expected:** Only inactive users are shown (if none exist yet, table may be empty).
5. Set **Status** to **All**.
6. **Expected:** All users are shown.

---

## 5) Toggle Employee active → inactive: row muted, persists after refresh

1. On `/admin/users`, find an **Employee** user who is **Active** (e.g. "Jane Dev"). Do **not** use the currently logged-in admin.
2. Click **Deactivate** for that user.
3. **Expected:** Row becomes muted/greyed; status badge changes to "Inactive"; button label changes to "Activate".
4. Refresh the page (F5 or reload).
5. **Expected:** Same user still shows as Inactive and row remains muted. Data persisted (e.g. in localStorage).

---

## 6) Attempt to deactivate current admin → blocked/disabled

1. Log in as **Admin** and go to `/admin/users`.
2. Find the row for the current admin (e.g. "Admin Demo" if you logged in as admin).
3. **Expected:** The **Deactivate** button for that row is disabled (greyed, not clickable).
4. Hover over the button.
5. **Expected:** Tooltip or title text indicates you cannot deactivate yourself (e.g. "You cannot deactivate yourself").

---

## 7) Open tasks & due soon counts change after creating tasks and refreshing

1. On `/admin/users`, note **Open Tasks** and **Due Soon** for one user (e.g. "Employee Demo").
2. Go to **Admin Tasks** (or a project with tasks). Create a new task assigned to that user, with status **TODO** and a deadline within 7 days (or overdue).
3. Go back to `/admin/users` and refresh if needed.
4. **Expected:** **Open Tasks** for that user increased by 1; **Due Soon** increased by 1 if the new task is due within 7 days or overdue.
5. (Optional) Complete that task from Admin Tasks, then return to `/admin/users` and refresh.
6. **Expected:** **Open Tasks** for that user decreased by 1.

---

## Optional: User detail drawer

1. On `/admin/users`, click a user **name** (e.g. "Jane Dev").
2. **Expected:** A side panel (drawer) opens showing:
   - Assigned projects (list of project names)
   - Top 5 open tasks (title, project name, status, deadline)
3. Click outside the panel or the close control.
4. **Expected:** Drawer closes.

---

*End of PHASE2-STEP2.7-TESTING.md*
