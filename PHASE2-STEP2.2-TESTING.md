# Phase 2 Step 2.2 — Admin Project Detail (Tabs + Member Assignment) — Testing Checklist

Run tests after implementation. Use an admin account if Phase 0 has login; otherwise go directly to `/admin/projects` and open a project.

---

**Test 1: Detail loads**
- [ ] Log in as Admin (or go to `/admin/projects` and open a project)
- [ ] Open `/admin/projects/:id` from the list (e.g. click **View** on a project)
- [ ] Verify header shows: project name, status badge, description (if present), start/end dates
- [ ] Verify tabs: Overview, Members, Tasks

**Test 2: Status change works**
- [ ] Change status from **ACTIVE** to **ON_HOLD** using the status dropdown
- [ ] Verify status badge updates to “On Hold”
- [ ] Verify Edit button and member add/remove controls become disabled
- [ ] Change status back to **ACTIVE**
- [ ] Verify Edit and member controls are enabled again

**Test 3: Edit button disabled in ON_HOLD / COMPLETED**
- [ ] Set project status to **ON_HOLD**
- [ ] Confirm **Edit Project** button is disabled
- [ ] Hover **Edit Project** and confirm tooltip: “Project is read-only in this status”
- [ ] Set project status to **COMPLETED**
- [ ] Confirm **Edit Project** button is still disabled with the same tooltip

**Test 4: Add members (ACTIVE only)**
- [ ] Ensure project status is **ACTIVE**
- [ ] Go to **Members** tab
- [ ] In “Add members”, select at least one user and click **Add selected**
- [ ] Confirm the new member appears in “Assigned members” immediately
- [ ] Refresh the browser
- [ ] Confirm the added member is still in the list (persistence)

**Test 5: Remove members (ACTIVE only)**
- [ ] In **Members** tab, click **Remove** next to a member (when more than one is assigned)
- [ ] Confirm the member is removed and the list updates
- [ ] Remove members until only one remains
- [ ] Attempt to remove that last member
- [ ] Confirm removal is blocked and the message “At least one member is required” appears

**Test 6: Read-only enforcement**
- [ ] Set project status to **ON_HOLD**
- [ ] Go to **Members** tab
- [ ] Confirm banner: “Project is read-only in this status”
- [ ] Confirm **Remove** buttons are not shown (or disabled)
- [ ] Confirm “Add members” section is not shown (or add controls disabled)

---

**Optional**
- [ ] **Overview** tab: status badge, dates, members count, member list preview, task counts
- [ ] **Tasks** tab: placeholder message and task counts (TODO / In progress / Completed)
