# PHASE 2 — Step 2.9: Premium UI Upgrade — Testing

**Stack:** React 19 + Vite + Tailwind. JSX only. Framer Motion for animations.

---

## 1) Build passes

### 1.1 Dev server

```bash
cd client
npm run dev
```

- [ ] Dev server starts without errors.
- [ ] App loads at the configured port (e.g. http://localhost:5173).

### 1.2 Production build

```bash
cd client
npm run build
```

- [ ] Build completes with exit code 0.
- [ ] No missing imports or module resolution errors.

---

## 2) Theme tokens applied

### 2.1 Token usage

- [ ] Layout and main UI use CSS variables: `var(--bg)`, `var(--fg)`, `var(--card)`, `var(--border)`, `var(--primary)`, etc.
- [ ] No (or minimal) hardcoded Tailwind color classes like `blue-600`, `gray-100` in layout/shell.

**Quick check (optional):**

```bash
# From repo root
rg "blue-[0-9]|gray-[0-9]" client/src --glob "*.jsx" | head -20
```

- [ ] Matches are only in low-impact or legacy spots; main layout, Sidebar, Topbar, PageHeader, Login, Dashboard use tokens.

---

## 3) Animations

### 3.1 Page transitions

- [ ] Navigate **Login → Admin Dashboard**: page content does a gentle **fade + slide-up** on mount.
- [ ] Navigate **Admin Dashboard → Users** (or Projects/Tasks): same **fade + slide-up** on new page.
- [ ] Navigate **Admin → App (Employee)** (e.g. logout, then login as Employee): Employee dashboard also has **fade + slide-up**.

### 3.2 Modals

- [ ] **Open** Create Task (or Edit Task): **backdrop fades in**, **modal panel** scales/fades in.
- [ ] **Close** modal (Cancel or overlay): **backdrop fades out**, **panel** scales/fades out (no instant disappear).

### 3.3 List / stagger (if implemented)

- [ ] On **Projects** or **Tasks** or **Users** list: list items **stagger in** on first load (if MotionList/MotionListItem used).
- [ ] If filter/search changes list: transition is **smooth** (e.g. fade), not jumpy.

### 3.4 Reduced motion

- [ ] Enable **Reduce motion** in OS:
  - **Windows:** Settings → Accessibility → Visual effects → Animation effects → Off.
  - **macOS:** System Preferences → Accessibility → Display → Reduce motion.
- [ ] Reload app.
- [ ] **Page transition**: either no movement or very subtle (no strong slide).
- [ ] **Modal**: open/close still works; animation is minimal or instant.
- [ ] **List stagger**: reduced or no stagger.
- [ ] **Button/card hover**: no or minimal scale/lift.

---

## 4) UI regression checks

### 4.1 Create Project

- [ ] Admin: **Projects** → **Create project** (or equivalent).
- [ ] Fill name, dates, assign at least one member.
- [ ] Submit: project is created and appears in the list.
- [ ] No console errors; modal closes as expected.

### 4.2 Create Task (Admin)

- [ ] Admin: **Tasks** (or from a project) → **Create task**.
- [ ] Select project, title, assignee, priority, etc.
- [ ] Submit: task is created and visible.
- [ ] Modal closes; no errors.

### 4.3 Employee create task

- [ ] Log in as **Employee**.
- [ ] Open a project (or Tasks) and **Create task**.
- [ ] Form shows; assignee is fixed to current user; project list is restricted.
- [ ] Submit: task is created; modal closes; task appears where expected.

### 4.4 Notifications badge

- [ ] As a user with unread notifications: **Topbar** shows correct **unread count** (e.g. bell icon with number).
- [ ] After opening **Notifications** and reading: count updates or clears as expected.

### 4.5 Logout

- [ ] Click **Logout** in Topbar.
- [ ] Session clears; redirect to **Login** page.
- [ ] No errors; login again works (Admin and Employee).

---

## 5) Visual / UX spot checks

- [ ] **Sidebar**: hover and active states use token colors; active item is clearly indicated.
- [ ] **Topbar**: sticky; “Project Management” on the left; user name and actions on the right; backdrop/blur (if implemented) looks correct.
- [ ] **Dashboard (Admin)**: KPI cards use tokens; optional hover lift on cards; task status bars use semantic colors (e.g. success/warning/muted).
- [ ] **EmptyState**: has icon (e.g. Inbox); message and optional action are readable and use tokens.
- [ ] **Status/Priority badges**: ACTIVE → success; ON_HOLD → warning; COMPLETED → muted; HIGH → danger; MEDIUM → warning; LOW → neutral (token-based).

---

## Sign-off

| Step | Status |
|------|--------|
| 1) Build passes (dev + build) | ☐ |
| 2) Theme tokens in use | ☐ |
| 3) Animations (pages, modals, lists, reduced motion) | ☐ |
| 4) UI regression (project, task, employee task, notifications, logout) | ☐ |
| 5) Visual spot checks | ☐ |

**Tester:** _________________  
**Date:** _________________
