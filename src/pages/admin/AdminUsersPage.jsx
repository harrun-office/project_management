import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Eye, X, User, Building2, ListTodo, Search, Users, UserCheck, UserX, Filter, CalendarClock, CheckCircle2, Plus, Edit, Trash2 } from 'lucide-react';
import { useDataStore } from '../../store/dataStore.jsx';
import { getSession } from '../../store/sessionStore.js';
import { countOpenTasksByUser, countProjectsByUser } from '../../utils/users.js';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { ResponsiveDataGrid } from '../../components/ui/DataCard.jsx';

function getInitial(name) {
  return (name || '?').charAt(0).toUpperCase();
}

function isToday(isoDateStr) {
  if (!isoDateStr) return false;
  const d = new Date(isoDateStr);
  const today = new Date();
  return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
}

/**
 * Admin Employees: list, search/filter, activate/deactivate, workload summary.
 * Guard: session required, role ADMIN; else redirect /login or /app.
 */
export function AdminUsersPage() {
  const navigate = useNavigate();
  const { state, setUserActive, createUser, updateUser, deleteUser } = useDataStore();
  const session = getSession();
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    if (!session) {
      navigate('/login', { replace: true });
      return;
    }
    if (session.role !== 'ADMIN') {
      navigate('/app', { replace: true });
    }
  }, [session, navigate]);

  const users = (state.users || []).filter((u) => u.role !== 'ADMIN');
  const tasks = state.tasks || [];
  const projects = state.projects || [];

  const filteredUsers = useMemo(() => {
    let list = users;
    const q = (search || '').trim().toLowerCase();
    if (q) {
      list = list.filter(
        (u) =>
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q))
      );
    }
    if (filterDept) list = list.filter((u) => u.department === filterDept);
    if (filterStatus === 'active') list = list.filter((u) => u.isActive !== false);
    if (filterStatus === 'inactive') list = list.filter((u) => u.isActive === false);
    return list;
  }, [users, search, filterDept, filterStatus]);

  function handleToggleActive(user) {
    if (user.id === session?.userId) return;
    setUserActive(user.id, !user.isActive);
  }

  function handleDeleteUser(user) {
    if (user.id === session?.userId) return;
    if (window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      deleteUser(user.id);
    }
  }

  if (!session) return null;
  if (session.role !== 'ADMIN') return null;

  const projectById = useMemo(() => {
    const m = new Map();
    (projects || []).forEach((p) => m.set(p.id, p));
    return m;
  }, [projects]);

  const allTasksForUser = (userId) =>
    (tasks || []).filter((t) => t.assigneeId === userId);
  const assignedProjectsForUser = (userId) =>
    (projects || []).filter((p) => p.assignedUserIds && p.assignedUserIds.includes(userId));

  const hasActiveFilters = search.trim() || filterDept || filterStatus;
  const activeCount = users.filter((u) => u.isActive !== false).length;
  const inactiveCount = users.filter((u) => u.isActive === false).length;

  const clearFilters = () => {
    setSearch('');
    setFilterDept('');
    setFilterStatus('');
    setFilterRole('');
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Employees"
        subtitle={`${users.length} employee${users.length !== 1 ? 's' : ''} in your organization`}
        description="Search, filter, and manage employee access. Click View to see full profile and workload."
        rightActions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={Plus}
          >
            Add Employee
          </Button>
        }
      />

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card padding="p-4" className="flex items-center gap-4">
          <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--primary-muted)] text-[var(--primary-muted-fg)] shrink-0">
            <Users className="w-6 h-6" aria-hidden />
          </span>
          <div>
            <p className="text-2xl font-bold tabular-nums text-[var(--fg)]">{users.length}</p>
            <p className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider">Total</p>
          </div>
        </Card>
        <Card padding="p-4" className="flex items-center gap-4">
          <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--success-light)] text-[var(--success-muted-fg)] shrink-0">
            <UserCheck className="w-6 h-6" aria-hidden />
          </span>
          <div>
            <p className="text-2xl font-bold tabular-nums text-[var(--fg)]">{activeCount}</p>
            <p className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider">Active</p>
          </div>
        </Card>
        <Card padding="p-4" className="flex items-center gap-4">
          <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--muted)] text-[var(--fg-muted)] shrink-0">
            <UserX className="w-6 h-6" aria-hidden />
          </span>
          <div>
            <p className="text-2xl font-bold tabular-nums text-[var(--fg)]">{inactiveCount}</p>
            <p className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider">Inactive</p>
          </div>
        </Card>
        {hasActiveFilters && (
          <Card padding="p-4" className="flex items-center gap-4 col-span-2 sm:col-span-1">
            <span className="text-2xl font-bold tabular-nums text-[var(--primary-muted-fg)]">{filteredUsers.length}</span>
            <div>
              <p className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider">Results</p>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-1 h-auto py-0.5 text-xs">
                Clear filters
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Search & filters */}
      <section aria-labelledby="filters-heading">
        <Card>
          <h2 id="filters-heading" className="flex items-center gap-2 text-sm font-semibold text-[var(--fg)] uppercase tracking-wider mb-4">
            <Filter className="w-4 h-4 text-[var(--fg-muted)]" aria-hidden />
            Search & filter
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <label htmlFor="users-search" className="block text-xs font-medium text-[var(--fg-muted)] mb-1.5">
                Name or email
              </label>
              <Input
                id="users-search"
                type="search"
                placeholder="Search team members…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={Search}
              />
            </div>
            <div>
              <label htmlFor="users-dept" className="block text-xs font-medium text-[var(--fg-muted)] mb-1.5">
                Department
              </label>
              <Select id="users-dept" value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
                <option value="">All</option>
                <option value="DEV">DEV</option>
                <option value="PRESALES">PRESALES</option>
                <option value="TESTER">TESTER</option>
              </Select>
            </div>
            <div>
              <label htmlFor="users-status" className="block text-xs font-medium text-[var(--fg-muted)] mb-1.5">
                Status
              </label>
              <Select id="users-status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
          </div>
        </Card>
      </section>

      {/* Team members list */}
      <section aria-labelledby="team-list-heading">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 id="team-list-heading" className="flex items-center gap-2 text-lg font-semibold text-[var(--fg)]">
            <Users className="w-5 h-5 text-[var(--accent)] shrink-0" aria-hidden />
            {hasActiveFilters ? `Results (${filteredUsers.length})` : 'All team members'}
          </h2>
          {hasActiveFilters && (
            <span className="text-sm text-[var(--fg-muted)]">
              {filteredUsers.length} of {users.length} shown
            </span>
          )}
        </div>

        <ResponsiveDataGrid
          data={filteredUsers}
          columns={[
            {
              key: 'name',
              label: 'Member',
              render: (user) => (
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--primary-muted)] text-[var(--primary-muted-fg)] font-semibold text-sm shrink-0">
                    {getInitial(user.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-[var(--fg)] truncate">{user.name || '—'}</p>
                    <p className="text-xs text-[var(--fg-muted)] truncate">{user.email || '—'}</p>
                  </div>
                </div>
              )
            },
            {
              key: 'employeeId',
              label: 'Employee ID',
              render: (user) => (
                <span className="font-mono text-sm font-medium text-[var(--fg)]">
                  {user.employeeId || '—'}
                </span>
              )
            },
            {
              key: 'department',
              label: 'Department',
              render: (user) => user.department || '—'
            },
            {
              key: 'status',
              label: 'Status',
              render: (user) => (
                <Badge variant={user.isActive !== false ? 'success' : 'neutral'}>
                  {user.isActive !== false ? 'Active' : 'Inactive'}
                </Badge>
              )
            },
            {
              key: 'tasks',
              label: 'Tasks',
              render: (user) => countOpenTasksByUser(user.id, tasks)
            },
            {
              key: 'projects',
              label: 'Projects',
              render: (user) => countProjectsByUser(user.id, projects)
            },
            {
              key: 'actions',
              label: 'Actions',
              render: (user) => {
                const isCurrentUser = user.id === session.userId;
                return (
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedUser(user)}
                      leftIcon={Eye}
                    >
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingUser(user)}
                      leftIcon={Edit}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isCurrentUser}
                      onClick={() => handleDeleteUser(user)}
                      className="border-[var(--danger-muted)] text-[var(--danger-muted-fg)] hover:bg-[var(--danger-light)]"
                      leftIcon={Trash2}
                    >
                      Delete
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isCurrentUser}
                      onClick={() => handleToggleActive(user)}
                      className={
                        user.isActive !== false
                          ? 'border-[var(--warning-muted)] text-[var(--warning-muted-fg)] hover:bg-[var(--warning-light)]'
                          : 'border-[var(--success-muted)] text-[var(--success-muted-fg)] hover:bg-[var(--success-light)]'
                      }
                    >
                      {user.isActive !== false ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                );
              }
            }
          ]}
          cardConfig={{
            primaryField: 'name',
            secondaryField: 'email',
            avatar: (user) => getInitial(user.name),
            status: (user) => ({
              label: user.isActive !== false ? 'Active' : 'Inactive',
              variant: user.isActive !== false ? 'success' : 'neutral'
            }),
            fields: (user) => [
              { label: 'Employee ID', value: user.employeeId || '—' },
              { label: 'Department', value: user.department || '—' },
              { label: 'Tasks', value: countOpenTasksByUser(user.id, tasks).toString() },
              { label: 'Projects', value: countProjectsByUser(user.id, projects).toString() }
            ],
            onClick: (user) => setSelectedUser(user),
            actions: (user) => {
              const isCurrentUser = user.id === session.userId;
              return [
                {
                  icon: Eye,
                  label: 'View user details',
                  onClick: () => setSelectedUser(user)
                },
                {
                  icon: Edit,
                  label: 'Edit user',
                  onClick: () => setEditingUser(user)
                },
                {
                  icon: user.isActive !== false ? UserX : UserCheck,
                  label: user.isActive !== false ? 'Deactivate user' : 'Activate user',
                  onClick: () => handleToggleActive(user),
                  disabled: isCurrentUser
                },
                {
                  icon: Trash2,
                  label: 'Delete user',
                  onClick: () => handleDeleteUser(user),
                  className: 'text-[var(--danger)] hover:text-[var(--danger-hover)]',
                  disabled: isCurrentUser
                }
              ];
            },
            expandable: true,
            expandedContent: (user) => {
              const isCurrentUser = user.id === session.userId;
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider">Email</div>
                      <div className="text-sm text-[var(--fg)] mt-1">{user.email || '—'}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider">Role</div>
                      <div className="text-sm text-[var(--fg)] mt-1">{user.role || '—'}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedUser(user)}
                      leftIcon={Eye}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingUser(user)}
                      leftIcon={Edit}
                    >
                      Edit User
                    </Button>
                    {!isCurrentUser && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(user)}
                          className={
                            user.isActive !== false
                              ? 'border-[var(--warning-muted)] text-[var(--warning-muted-fg)] hover:bg-[var(--warning-light)]'
                              : 'border-[var(--success-muted)] text-[var(--success-muted-fg)] hover:bg-[var(--success-light)]'
                          }
                        >
                          {user.isActive !== false ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user)}
                          className="border-[var(--danger-muted)] text-[var(--danger-muted-fg)] hover:bg-[var(--danger-light)]"
                          leftIcon={Trash2}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            }
          }}
          emptyState={
            <EmptyState
              title={users.length === 0 ? 'No team members yet' : 'No results match your filters'}
              message={
                users.length === 0
                  ? 'Add team members to start assigning tasks and managing projects.'
                  : 'Try adjusting your search terms or clearing filters to see more team members.'
              }
              actionLabel={users.length > 0 ? 'Clear filters' : 'Add Team Member'}
              onAction={users.length > 0 ? clearFilters : () => setIsCreateModalOpen(true)}
              icon={Users}
            />
          }
        />
      </section>

      {selectedUser && (() => {
        const userProjects = assignedProjectsForUser(selectedUser.id);
        const userTasks = [...allTasksForUser(selectedUser.id)].sort(
          (a, b) => (b.assignedAt ? new Date(b.assignedAt).getTime() : 0) - (a.assignedAt ? new Date(a.assignedAt).getTime() : 0)
        );
        const completedProjects = userProjects.filter((p) => p.status === 'COMPLETED');
        const tasksDueToday = userTasks.filter((t) => isToday(t.deadline));
        const profileRows = [
          { label: 'Name', value: selectedUser.name || '—' },
          { label: 'Email', value: selectedUser.email || '—' },
          { label: 'Employee ID', value: selectedUser.employeeId || '—', mono: true },
          { label: 'Department', value: selectedUser.department || '—' },
          { label: 'Status', value: selectedUser.isActive !== false ? 'Active' : 'Inactive' },
        ];
        return createPortal(
          <div
            className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6"
            aria-modal="true"
            role="dialog"
            aria-labelledby="employee-detail-title"
          >
            <div
              className="absolute inset-0 bg-[var(--backdrop)] backdrop-blur-sm"
              onClick={() => setSelectedUser(null)}
              aria-hidden
            />
            <div
              className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-2xl)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 shrink-0 px-6 py-5 border-b border-[var(--border)] bg-[var(--card)] rounded-t-2xl">
                <div className="flex items-start gap-4 min-w-0">
                  <span
                    className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--primary-muted)] text-[var(--primary-muted-fg)] font-bold text-xl shrink-0"
                    aria-hidden
                  >
                    {getInitial(selectedUser.name)}
                  </span>
                  <div className="min-w-0">
                    <h2 id="employee-detail-title" className="text-xl font-bold text-[var(--fg)]">
                      {selectedUser.name || 'Unnamed'}
                    </h2>
                    <p className="text-sm text-[var(--fg-muted)] mt-0.5 truncate">{selectedUser.email || '—'}</p>
                    <p className="text-xs text-[var(--fg-muted)] mt-1">Full profile and workload</p>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--muted)] px-3 py-1.5 text-xs font-medium text-[var(--fg)]">
                        <Building2 className="w-3.5 h-3.5 text-[var(--fg-muted)]" aria-hidden />
                        {userProjects.length} project{userProjects.length !== 1 ? 's' : ''}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--muted)] px-3 py-1.5 text-xs font-medium text-[var(--fg)]">
                        <ListTodo className="w-3.5 h-3.5 text-[var(--fg-muted)]" aria-hidden />
                        {userTasks.length} task{userTasks.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="flex items-center justify-center w-10 h-10 rounded-xl text-[var(--fg-muted)] hover:bg-[var(--muted)] hover:text-[var(--fg)] transition-colors shrink-0"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" aria-hidden />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-6 space-y-8 min-h-0">
                {/* Profile — clear key-value table */}
                <section aria-labelledby="profile-heading">
                  <h3 id="profile-heading" className="flex items-center gap-2 text-base font-semibold text-[var(--fg)] mb-4">
                    <User className="w-5 h-5 text-[var(--accent)] shrink-0" aria-hidden />
                    Profile information
                  </h3>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
                    <table className="min-w-full" role="presentation">
                      <tbody className="divide-y divide-[var(--border)]">
                        {profileRows.map((row) => (
                          <tr key={row.label} className="hover:bg-[var(--muted)]/30 transition-colors">
                            <td className="px-4 py-3 text-sm font-medium text-[var(--fg-muted)] w-36 shrink-0 align-top">
                              {row.label}
                            </td>
                            <td className="px-4 py-3 text-sm text-[var(--fg)] align-top">
                              {row.mono ? (
                                <code className="text-xs font-mono text-[var(--fg-muted)] break-all" title={row.value}>
                                  {row.value}
                                </code>
                              ) : (
                                row.value
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* Tasks due today */}
                <section aria-labelledby="tasks-due-today-heading">
                  <h3 id="tasks-due-today-heading" className="flex items-center gap-2 text-base font-semibold text-[var(--fg)] mb-4">
                    <CalendarClock className="w-5 h-5 text-[var(--warning-muted-fg)] shrink-0" aria-hidden />
                    Tasks due today
                    <span className="text-sm font-normal text-[var(--fg-muted)]">({tasksDueToday.length})</span>
                  </h3>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
                    {tasksDueToday.length === 0 ? (
                      <p className="px-5 py-6 text-sm text-[var(--fg-muted)]">No tasks due today.</p>
                    ) : (
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50">
                            <th className="px-4 py-3 text-left font-semibold text-[var(--fg-secondary)]">Task</th>
                            <th className="px-4 py-3 text-left font-semibold text-[var(--fg-secondary)]">Project</th>
                            <th className="px-4 py-3 text-left font-semibold text-[var(--fg-secondary)]">Status</th>
                            <th className="px-4 py-3 text-left font-semibold text-[var(--fg-secondary)]">Priority</th>
                            <th className="px-4 py-3 text-left font-semibold text-[var(--fg-secondary)]">Due</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                          {tasksDueToday.map((t) => (
                            <tr key={t.id} className="hover:bg-[var(--muted)]/30">
                              <td className="px-4 py-3 font-medium text-[var(--fg)]">{t.title}</td>
                              <td className="px-4 py-3 text-[var(--fg-secondary)]">{projectById.get(t.projectId)?.name || '—'}</td>
                              <td className="px-4 py-3">
                                <Badge variant={t.status === 'COMPLETED' ? 'success' : t.status === 'IN_PROGRESS' ? 'info' : 'neutral'}>
                                  {t.status === 'TODO' ? 'To Do' : t.status === 'IN_PROGRESS' ? 'In Progress' : 'Completed'}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-[var(--fg-muted)]">{t.priority || '—'}</td>
                              <td className="px-4 py-3 text-[var(--fg-muted)]">
                                {t.deadline ? new Date(t.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </section>

                {/* Completed projects */}
                <section aria-labelledby="completed-projects-heading">
                  <h3 id="completed-projects-heading" className="flex items-center gap-2 text-base font-semibold text-[var(--fg)] mb-4">
                    <CheckCircle2 className="w-5 h-5 text-[var(--success-muted-fg)] shrink-0" aria-hidden />
                    Completed projects
                    <span className="text-sm font-normal text-[var(--fg-muted)]">({completedProjects.length})</span>
                  </h3>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
                    {completedProjects.length === 0 ? (
                      <p className="px-5 py-6 text-sm text-[var(--fg-muted)]">No completed projects.</p>
                    ) : (
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50">
                            <th className="px-4 py-3 text-left font-semibold text-[var(--fg-secondary)]">Project name</th>
                            <th className="px-4 py-3 text-left font-semibold text-[var(--fg-secondary)]">Start — End</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                          {completedProjects.map((p) => (
                            <tr key={p.id} className="hover:bg-[var(--muted)]/30">
                              <td className="px-4 py-3 font-medium text-[var(--fg)]">{p.name}</td>
                              <td className="px-4 py-3 text-[var(--fg-muted)]">
                                {p.startDate ? new Date(p.startDate).toLocaleDateString() : '—'}
                                {' — '}
                                {p.endDate ? new Date(p.endDate).toLocaleDateString() : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </section>

                {/* Assigned projects — table with headers */}
                <section aria-labelledby="projects-heading">
                  <h3 id="projects-heading" className="flex items-center gap-2 text-base font-semibold text-[var(--fg)] mb-4">
                    <Building2 className="w-5 h-5 text-[var(--accent)] shrink-0" aria-hidden />
                    All assigned projects
                    <span className="text-sm font-normal text-[var(--fg-muted)]">({userProjects.length})</span>
                  </h3>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
                    {userProjects.length === 0 ? (
                      <p className="px-5 py-6 text-sm text-[var(--fg-muted)]">No projects assigned to this user.</p>
                    ) : (
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50">
                            <th className="px-4 py-3 text-left font-semibold text-[var(--fg-secondary)]">Project name</th>
                            <th className="px-4 py-3 text-left font-semibold text-[var(--fg-secondary)]">Status</th>
                            <th className="px-4 py-3 text-left font-semibold text-[var(--fg-secondary)]">Start — End</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                          {userProjects.map((p) => (
                            <tr key={p.id} className="hover:bg-[var(--muted)]/30">
                              <td className="px-4 py-3 font-medium text-[var(--fg)]">{p.name}</td>
                              <td className="px-4 py-3">
                                <Badge variant={p.status === 'ACTIVE' ? 'success' : p.status === 'ON_HOLD' ? 'warning' : 'neutral'}>
                                  {p.status}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-[var(--fg-muted)]">
                                {p.startDate ? new Date(p.startDate).toLocaleDateString() : '—'}
                                {' — '}
                                {p.endDate ? new Date(p.endDate).toLocaleDateString() : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </section>

                {/* All tasks — table with clear headers */}
                <section aria-labelledby="tasks-heading" className="border-t border-[var(--border)] pt-8">
                  <h3 id="tasks-heading" className="flex items-center gap-2 text-base font-semibold text-[var(--fg)] mb-1">
                    <ListTodo className="w-5 h-5 text-[var(--accent)] shrink-0" aria-hidden />
                    All assigned tasks
                    <span className="text-sm font-normal text-[var(--fg-muted)]">({userTasks.length})</span>
                  </h3>
                  <p className="text-sm text-[var(--fg-muted)] mb-3">
                    {userTasks.length > 0
                      ? 'Scroll the table below to see every task. Columns: task name, project, status, priority, assigned date, due date.'
                      : 'Task name, project, status, priority, and dates.'}
                  </p>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
                    {userTasks.length === 0 ? (
                      <p className="px-5 py-6 text-sm text-[var(--fg-muted)]">No tasks assigned to this user.</p>
                    ) : (
                      <div className="max-h-80 overflow-y-auto">
                        <table className="text-xs border-collapse w-full" role="table">
                          <thead className="sticky top-0 z-10 bg-[var(--muted)] border-b-2 border-[var(--border)]">
                            <tr>
                              <th scope="col" className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[var(--fg-secondary)]">
                                Task
                              </th>
                              <th scope="col" className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[var(--fg-secondary)]">
                                Project
                              </th>
                              <th scope="col" className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[var(--fg-secondary)]">
                                Status
                              </th>
                              <th scope="col" className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[var(--fg-secondary)]">
                                Priority
                              </th>
                              <th scope="col" className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[var(--fg-secondary)]">
                                Assigned
                              </th>
                              <th scope="col" className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[var(--fg-secondary)]">
                                Due
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--border)] bg-[var(--card)]">
                            {userTasks.map((t) => (
                              <tr key={t.id} className="hover:bg-[var(--muted)]/30">
                                <td className="px-2 py-2 font-medium text-[var(--fg)] align-top max-w-[200px] truncate" title={t.title}>
                                  {t.title}
                                </td>
                                <td className="px-2 py-2 text-[var(--fg-secondary)] align-top max-w-[120px] truncate" title={projectById.get(t.projectId)?.name || '—'}>
                                  {projectById.get(t.projectId)?.name || '—'}
                                </td>
                                <td className="px-2 py-2 align-top">
                                  <Badge variant={t.status === 'COMPLETED' ? 'success' : t.status === 'IN_PROGRESS' ? 'info' : 'neutral'} className="text-xs">
                                    {t.status === 'TODO' ? 'To Do' : t.status === 'IN_PROGRESS' ? 'In Progress' : 'Completed'}
                                  </Badge>
                                </td>
                                <td className="px-2 py-2 text-[var(--fg-muted)] align-top text-xs">{t.priority || '—'}</td>
                                <td className="px-2 py-2 text-[var(--fg-muted)] align-top text-xs">
                                  {t.assignedAt ? new Date(t.assignedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                </td>
                                <td className="px-2 py-2 text-[var(--fg-muted)] align-top text-xs">
                                  {t.deadline ? new Date(t.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </div>,
          document.body
        );
      })()}

      {/* Create/Edit User Modal */}
      {(isCreateModalOpen || editingUser) && (
        <UserFormModal
          user={editingUser}
          isOpen={isCreateModalOpen || !!editingUser}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingUser(null);
          }}
          onSave={(userData) => {
            if (editingUser) {
              updateUser(editingUser.id, userData);
            } else {
              createUser(userData);
            }
            setIsCreateModalOpen(false);
            setEditingUser(null);
          }}
        />
      )}
    </div>
  );
}

function UserFormModal({ user, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || 'DEV',
    employeeId: user?.employeeId || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        department: user.department || 'DEV',
        employeeId: user.employeeId || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        department: 'DEV',
        employeeId: '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Add role as EMPLOYEE since this is the employees page
      const userData = { ...formData, role: 'EMPLOYEE' };
      await onSave(userData);
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-[var(--backdrop)] backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-2xl)]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]">
          <h2 className="text-xl font-bold text-[var(--fg)]">
            {user ? 'Edit Employee' : 'Add New Employee'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-[var(--fg-muted)] hover:bg-[var(--muted)] hover:text-[var(--fg)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="user-name" className="block text-sm font-medium text-[var(--fg-muted)] mb-2">
              Full Name
            </label>
            <Input
              id="user-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter full name"
              required
            />
          </div>

          <div>
            <label htmlFor="user-email" className="block text-sm font-medium text-[var(--fg-muted)] mb-2">
              Email Address
            </label>
            <Input
              id="user-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email address"
              required
            />
          </div>

          <div>
            <label htmlFor="user-employeeId" className="block text-sm font-medium text-[var(--fg-muted)] mb-2">
              Employee ID
            </label>
            <Input
              id="user-employeeId"
              type="text"
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              placeholder="Leave blank for auto-generation"
            />
            <p className="text-xs text-[var(--muted-fg)] mt-1">
              Leave empty to auto-generate employee ID
            </p>
          </div>

          <div>
            <label htmlFor="user-department" className="block text-sm font-medium text-[var(--fg-muted)] mb-2">
              Department
            </label>
            <Select
              id="user-department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            >
              <option value="DEV">Development</option>
              <option value="PRESALES">Presales</option>
              <option value="TESTER">Testing</option>
            </Select>
          </div>


          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (user ? 'Update Employee' : 'Add Employee')}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
