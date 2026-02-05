# Phase 2 Step 2.4 — Employee Dashboard + My Tasks Today + My Projects — Testing Checklist

Run tests after implementation. Use **Login as Employee** (employee@demo.com) for employee flows. Session comes from `sessionStore.getSession()` (never from "first admin user").

---

**Test 1: Login as employee → /app dashboard loads**
- [ ] Go to `/login`
- [ ] Click **Login as Employee**
- [ ] Confirm redirect to `/app` (Employee Dashboard)
- [ ] Confirm header "Dashboard" and sections: My Open Tasks, My Projects, My Tasks Today, My Projects list

**Test 2: My Tasks Today shows tasks with assignedAt = today**
- [ ] Ensure seed has at least one task with `assigneeId` = employee user and `assignedAt` = today (or use Dev Tools → Reset Demo Data to refresh seed)
- [ ] On `/app`, confirm "My Tasks Today" section shows only tasks assigned to you with assignedAt = today
- [ ] If none: confirm message "No tasks assigned today."

**Test 3: Employee can move status for own tasks**
- [ ] In My Tasks Today (or go to `/app/tasks`), pick a task with status TODO
- [ ] Click **Mark In Progress** (or use status dropdown)
- [ ] Confirm task status updates
- [ ] Click **Mark Completed** (or use dropdown)
- [ ] Confirm task moves to Completed

**Test 4: Employee cannot see tasks assigned to others**
- [ ] On `/app/tasks`, confirm only tasks where assigneeId = current employee are shown
- [ ] Compare with Admin Tasks page (login as Admin): admin sees all tasks; employee sees only own

**Test 5: Employee create a new task under an assigned project**
- [ ] Login as Employee
- [ ] Go to `/app/tasks`, click **Create Task**
- [ ] Select a project you are assigned to (only those appear in dropdown)
- [ ] Fill title, priority, deadline (assignee is fixed to you)
- [ ] Submit
- [ ] Confirm new task appears in My Tasks and in dashboard "My Open Tasks" count
- [ ] Refresh browser; confirm task persists (localStorage)

**Test 6: Employee cannot create task under unassigned project (blocked)**
- [ ] Login as Employee
- [ ] Go to `/app/tasks`, click **Create Task**
- [ ] Confirm Project dropdown shows **only** projects you are assigned to (no other projects)
- [ ] If you have no assigned projects, confirm you cannot create (or project list is empty)

**Test 7: On Hold project blocks create / edit / move**
- [ ] Login as Admin, set a project (that the employee is assigned to) to **ON_HOLD**
- [ ] Login as Employee, go to `/app/projects/:id` for that project, open **Tasks** tab
- [ ] Confirm banner: "Project is read-only in this status. Create, edit, and move tasks are disabled."
- [ ] Confirm **Create Task** is not shown (or disabled)
- [ ] Confirm task cards/rows show "Read-only" and no status dropdown or Edit

**Test 8: Delete rule — employee can delete only tasks where createdById === employeeId**
- [ ] Login as Employee
- [ ] Go to `/app/tasks`, switch to **Table** view
- [ ] Find a task **you created** (createdById = your userId): confirm **Delete** button is shown; click Delete and confirm task is removed
- [ ] Find a task **created by Admin** (or another user): confirm **Delete** button is **not** shown for that task

---

**Optional**
- [ ] **Employee Project Detail** `/app/projects/:id`: Overview tab (members read-only, task counts), Tasks tab (only your tasks for that project, Kanban/Table, Create Task)
- [ ] **Notifications**: If notifications page exists, confirm ASSIGNED notification appears for assignee after task create
