# PHASE 2 — Step 3.0 Testing (Elite UI Upgrade)

Follow these steps exactly to verify the Elite UI upgrade.

---

## 1) Build check

- Open a terminal in `client/`.
- Run: `npm run dev`
  - Confirm the dev server starts without errors.
- In another terminal, run: `npm run build`
  - Confirm the build completes successfully (exit code 0).

---

## 2) Theme toggle

- With the app running (`npm run dev`), open the app in the browser.
- Log in as Admin or Employee.
- In the **Topbar**, find the **theme toggle** (sun/moon icon).
- Click to switch to **dark** mode:
  - Background, cards, and text should use dark theme tokens.
- **Refresh the browser** (F5 or Ctrl+R).
  - **Expected:** Theme remains dark (no flicker to light then back).
- Click the toggle again to switch to **light** mode.
- Refresh again.
  - **Expected:** Theme remains light.
- **Conclusion:** Theme persists via `localStorage` and there is no visible flicker on refresh.

---

## 3) Motion

- **Page transitions:** Navigate between Admin Dashboard → Projects → Tasks → Notifications.
  - **Expected:** Subtle enter animation (e.g. opacity + small vertical translate) on each page.
- **Modal open/close:** From Admin → Projects, click **Create Project**. Then close the modal (X or Cancel).
  - **Expected:** Modal opens with scale + fade; closes with reverse animation.
- **Reduced motion:** Enable the OS “Reduce motion” preference (e.g. Windows: Settings → Accessibility → Visual effects → Animation effects → Off).
  - Reload the app and repeat the above.
  - **Expected:** Animations are reduced or absent (no or minimal motion).

---

## 4) UI regression

- **Admin — Projects**
  - Create a new project (name, dates, at least one member). Save.
  - Edit an existing project. Change status via dropdown (e.g. Active → On Hold).
  - Open a project detail; verify members and status.
- **Admin — Tasks**
  - Create a task (project, title, assignee, priority). Save.
  - Move a task between columns (Kanban) or change status (Table).
  - Edit a task; save and confirm updates.
- **Employee**
  - Log in as Employee. From **My Projects**, open a project.
  - Create a task under that project. Confirm it appears in **My Tasks Today** or **My Tasks**.
- **Notifications**
  - As Admin or Employee, open **Notifications**.
  - Confirm unread badge in Topbar matches list.
  - Mark one as read; mark all as read. Run **Run Deadline Check** and confirm behavior.
- **Logout**
  - Click **Logout** in the Topbar. **Expected:** Redirect to login; session cleared.

---

## 5) Responsive

- Resize the browser to **mobile width** (e.g. &lt; 768px) or use DevTools device toolbar.
  - **Expected:** Topbar shows **hamburger** icon; Sidebar is hidden by default.
- Click the **hamburger**.
  - **Expected:** Sidebar opens as a drawer (overlay or slide-in). Clicking a nav link or overlay closes it.
- On **desktop** width, Sidebar is always visible; hamburger hidden.
- Open **Admin → Projects** or **Tasks** and view the table on a narrow screen.
  - **Expected:** No critical overflow (horizontal scroll is acceptable); layout remains usable.

---

## Sign-off

- [ ] Build: `npm run dev` and `npm run build` pass.
- [ ] Theme toggle works; theme persists after refresh with no flicker.
- [ ] Page and modal motion present; reduced when OS “Reduce motion” is on.
- [ ] Admin and Employee flows (projects, tasks, notifications, logout) work as before.
- [ ] Mobile: Sidebar toggles via hamburger; tables/layout usable.
