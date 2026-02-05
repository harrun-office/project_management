# Phase 2 Step 2.1 — Admin Projects UI — Testing Checklist

Run tests after implementation. (If Phase 0 has login, use admin account; otherwise navigate directly to `/admin/projects`.)

---

**Test 1: Admin can see projects**
- [ ] Login as admin (or go to `/admin/projects` if no login)
- [ ] Navigate to `/admin/projects`
- [ ] Confirm table renders seeded projects

**Test 2: Filter works**
- [ ] Filter status to **Active** → only active projects shown
- [ ] Filter to **On Hold** → only on-hold projects shown
- [ ] Filter to **Completed** → only completed projects shown
- [ ] Filter to **All** → all projects shown

**Test 3: Create project**
- [ ] Click **Create Project**
- [ ] Fill: name, description, start date, end date, assign at least one member
- [ ] Save
- [ ] Confirm new project appears immediately (no page refresh)

**Test 4: Edit project (Active only)**
- [ ] Pick an **ACTIVE** project
- [ ] Click **Edit**, change name/description/members
- [ ] Save
- [ ] Confirm changes appear in the table

**Test 5: On Hold read-only**
- [ ] Change a project status to **On Hold** via the status dropdown
- [ ] Confirm **Edit** button is disabled (grayed out)
- [ ] Hover **Edit** and confirm tooltip: "Project is read-only in this status"
- [ ] Confirm status can still be changed back to **Active** via dropdown

**Test 6: Data persistence**
- [ ] Create or edit a project
- [ ] Refresh the browser (F5)
- [ ] Confirm created/edited projects remain (localStorage)

---

**Optional**
- [ ] **View** opens `/admin/projects/:id` placeholder with project name and “Coming next”
- [ ] **Project not found**: open `/admin/projects/invalid-id` and confirm “Project not found”
