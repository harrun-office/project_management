# Phase 2 Step 2.6 — Admin Dashboard UI — Testing Checklist

Run tests after implementation. Session from `sessionStore.getSession()`. Data from DataStore state only.

---

**Test 1: Login as Admin → /admin loads**
- [ ] Go to `/login`, click **Login as Admin**
- [ ] Confirm redirect to **/admin** (Admin Dashboard)
- [ ] Confirm header: "Admin Dashboard", today's date
- [ ] Confirm buttons: Run Deadline Check, Go to Projects, Go to Tasks

**Test 2: KPI counts match seeded data (basic sanity)**
- [ ] On `/admin`, confirm **Total Projects** matches number of projects in seed (e.g. 6)
- [ ] Confirm **Active Projects**, **On Hold**, **Completed** sum to Total Projects
- [ ] Confirm **Total Open Tasks** = tasks where status ≠ COMPLETED
- [ ] Confirm **Tasks Due Soon (7 days)** = tasks not completed with deadline within 7 days or overdue

**Test 3: Run Deadline Check → notifications count increases if due tasks exist**
- [ ] Note current notification count (or unread badge in topbar)
- [ ] On `/admin`, click **Run Deadline Check**
- [ ] If there are open tasks with deadline within 7 days or overdue, confirm new **DEADLINE** notifications appear (e.g. in Recent Notifications or /admin/notifications)
- [ ] Confirm unread badge in topbar updates

**Test 4: Upcoming Deadlines shows sorted list, overdue flagged**
- [ ] On `/admin`, scroll to **Upcoming Deadlines (top 10)**
- [ ] Confirm list shows tasks (not completed) sorted by nearest deadline first
- [ ] Confirm **overdue** tasks show deadline in red with "(overdue)" label

**Test 5: Busiest users list updates when you create tasks assigned to users**
- [ ] On `/admin`, note **Top 5 busiest users** (open task counts)
- [ ] Go to **Admin Tasks**, create a new task assigned to a specific user
- [ ] Return to `/admin` (or refresh)
- [ ] Confirm that user’s **Open Tasks** count increased in the busiest users table

**Test 6: Refresh browser → dashboard still accurate**
- [ ] Refresh the browser (F5) on `/admin`
- [ ] Confirm KPIs, team allocation, task status bars, upcoming deadlines, and recent notifications still match data (localStorage persistence)
