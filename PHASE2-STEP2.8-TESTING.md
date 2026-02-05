# Phase 2 — Step 2.8: UI/UX Polish + Consistency Pass — Testing

Step-by-step tests for the polish pass: navigation, page headers, empty states, read-only banners, guards, and logout.

---

## Prerequisites

- Build passes: `npm run build` (from `client/`)
- Dev server: `npm run dev`

---

## 1) Sidebar menu correct per role

1. **Admin:** Log in as Admin. Go to `/admin`.
   - **Expected:** Sidebar shows: Dashboard, Users, Projects, Tasks, Notifications (no Dev Tools in sidebar).
2. **Employee:** Log out, then log in as Employee. Go to `/app`.
   - **Expected:** Sidebar shows: Dashboard, My Projects, My Tasks, Notifications.

---

## 2) Active link highlight works

1. As Admin, click **Projects** in the sidebar. URL is `/admin/projects`.
   - **Expected:** "Projects" has a clear active style (e.g. blue background + left border).
2. Click **Tasks**. URL is `/admin/tasks`.
   - **Expected:** "Tasks" is active; "Projects" is not.
3. As Employee, go to `/app/tasks`.
   - **Expected:** "My Tasks" is active in the sidebar.

---

## 3) Empty states render correctly (use filters to force empty lists)

1. **Projects (admin):** Go to `/admin/projects`. Set Status to e.g. **Completed** and type a search that matches nothing (e.g. `zzz`).
   - **Expected:** Table shows an empty state: title like "No results match your filters", message, and a **Clear Filters** button. Clicking it clears filters.
2. **Tasks (admin):** Go to `/admin/tasks`. Set Project/Assignee/Status so no tasks match.
   - **Expected:** Empty state with "No results match your filters" and **Clear Filters**.
3. **Notifications:** Go to `/admin/notifications` or `/app/notifications`. If list is empty (or filter to Unread when none unread).
   - **Expected:** Empty state: "No notifications" with short message.
4. **Users (admin):** Go to `/admin/users`. Search for `zzz` and set filters so no users match.
   - **Expected:** Empty state with "No results match your filters" and **Clear Filters**.

---

## 4) Read-only banners appear and actions disabled

1. Go to **Admin Projects**, open a project with status **On Hold** or **Completed** (or change status to On Hold).
2. Open **Project detail** for that project.
   - **Expected:** No inline "Project is read-only" duplicate; a single **ReadOnlyBanner** is visible (e.g. "Project is read-only in this status.") in the **Members** tab and in the **Tasks** tab.
3. In the **Tasks** tab, try Create Task / Edit / Move.
   - **Expected:** Create Task is hidden or disabled; edit/move are disabled when project is read-only.
4. Open **Task modal** (e.g. from Admin Tasks) and select a project that is **On Hold** or **Completed**.
   - **Expected:** ReadOnlyBanner appears in the modal; save is effectively blocked (validation or disabled).

---

## 5) Logout works and redirects to login

1. Log in as Admin or Employee.
2. In the **top bar**, click **Logout** (with icon).
   - **Expected:** Session is cleared; you are redirected to `/login`. Refreshing stays on login. No sidebar or protected content visible.

---

## 6) No broken imports, build passes

1. Run `npm run build` from `client/`.
   - **Expected:** Build completes with no errors.
2. Click through: Home → Login → Admin (Dashboard, Users, Projects, Tasks, Notifications) and App (Dashboard, My Projects, My Tasks, Notifications).
   - **Expected:** No console errors or missing components; all pages load.

---

## Optional checks

- **Page titles in Topbar:** On `/admin` the top bar shows "Dashboard"; on `/admin/users` it shows "Users"; on `/app/tasks` it shows "My Tasks".
- **Reset Demo Data:** On Admin Dashboard, **Reset Demo Data** button resets data; **Dev Tools** link goes to `/admin/dev-tools`.
- **Employee on admin route:** Log in as Employee and open `/admin` (e.g. manually). You are redirected to `/app`.
- **Admin on app route:** Log in as Admin and open `/app`. You are redirected to `/admin`.

---

*End of PHASE2-STEP2.8-TESTING.md*
