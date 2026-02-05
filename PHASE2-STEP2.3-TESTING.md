# Phase 2 Step 2.3 — Admin Tasks UI (Kanban + Table) — Testing Checklist

Run tests after implementation. Use an admin context (first admin user in seed is used for session).

---

**Test 1: Admin global tasks page loads and shows tasks**
- [ ] Navigate to `/admin/tasks`
- [ ] Confirm page header shows "Tasks" and "Create Task" button
- [ ] Confirm view toggle: Kanban | Table
- [ ] Confirm filters: Project, Assignee, Status, Priority
- [ ] Confirm tasks from seed data appear (Kanban columns or table rows)

**Test 2: Filters work (Project / Assignee / Status / Priority)**
- [ ] Set Project filter to a specific project → only that project’s tasks shown
- [ ] Set Assignee filter → only that assignee’s tasks shown
- [ ] Set Status to "To Do" / "In Progress" / "Completed" → list updates
- [ ] Set Priority to High / Medium / Low → list updates
- [ ] Clear filters → all tasks shown again

**Test 3: Create task (active project)**
- [ ] Click "Create Task"
- [ ] Select an **ACTIVE** project, enter title, assignee, deadline (and optional description, priority, tags)
- [ ] Submit
- [ ] Confirm new task appears in the list immediately (Kanban or Table)
- [ ] Confirm message: "Task assigned notification created for &lt;Assignee&gt;"
- [ ] Open Dev Tools or a Notifications view and confirm notification count increased (ASSIGNED notification for assignee)

**Test 4: Edit task title / deadline / priority**
- [ ] Click "Edit" on a task (under an ACTIVE project)
- [ ] Change title, deadline, or priority and save
- [ ] Confirm changes appear in the list
- [ ] Confirm "Saved" or success feedback

**Test 5: Move task status TODO → IN_PROGRESS → COMPLETED**
- [ ] In Kanban: use status dropdown on a task card to change TODO → In Progress → Completed
- [ ] Confirm card moves to the correct column (or table row updates)
- [ ] In Table: use status dropdown in Actions to move status
- [ ] Confirm changes persist after refresh

**Test 6: Read-only enforcement**
- [ ] Set a project’s status to **ON_HOLD** (from Projects list or Project Detail)
- [ ] On `/admin/tasks`, find tasks that belong to that project
- [ ] Confirm those task cards/rows show "Read-only" (or controls disabled)
- [ ] Confirm you cannot move status or edit those tasks from the UI
- [ ] If the UI allowed an action, the repo would still block it (no state change)
- [ ] Set project back to ACTIVE and confirm controls are enabled again

**Test 7: Persistence**
- [ ] Create or edit a task
- [ ] Refresh the browser (F5)
- [ ] Confirm tasks remain (localStorage); list and filters still show correct data

---

**Optional**
- [ ] **Project Detail → Tasks tab**: View toggle Kanban | Table, "Create Task" (project preselected), read-only banner when project is ON_HOLD/COMPLETED
- [ ] **Tags**: Create task with "Learning task" checked and optional comma-separated tags; confirm they appear on cards/table
