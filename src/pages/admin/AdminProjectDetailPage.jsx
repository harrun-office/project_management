import { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore.jsx';
import { getSession } from '../../store/sessionStore.js';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { ReadOnlyBanner } from '../../components/ui/ReadOnlyBanner.jsx';
import { ProjectModal } from '../../components/admin/projects/ProjectModal.jsx';
import { ProjectMembersPanel } from '../../components/admin/projects/ProjectMembersPanel.jsx';
import { KanbanBoard } from '../../components/admin/tasks/KanbanBoard.jsx';
import { TaskTable } from '../../components/admin/tasks/TaskTable.jsx';
import { TaskModal } from '../../components/admin/tasks/TaskModal.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Trash2 } from 'lucide-react';

const TAB_OVERVIEW = 'overview';
const TAB_MEMBERS = 'members';
const TAB_TASKS = 'tasks';

const VIEW_KANBAN = 'kanban';
const VIEW_TABLE = 'table';

const STATUS_LABELS = { ACTIVE: 'Active', ON_HOLD: 'On Hold', COMPLETED: 'Completed' };

/**
 * Admin Project Detail: header + tabs (Overview, Members, Tasks placeholder).
 * Edit and status change only when ACTIVE; ON_HOLD/COMPLETED read-only with tooltip.
 */
export function AdminProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, setProjectStatus, moveTaskStatus, deleteProject } = useDataStore();
  const session = getSession();
  const sessionForRepo = session ? { userId: session.userId, role: session.role } : null;
  const [activeTab, setActiveTab] = useState(TAB_OVERVIEW);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusDropdownId, setStatusDropdownId] = useState(null);
  const [tasksView, setTasksView] = useState(VIEW_KANBAN);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [assigneeNotifyMessage, setAssigneeNotifyMessage] = useState('');

  useEffect(() => {
    if (!session) navigate('/login', { replace: true });
  }, [session, navigate]);

  const projects = state.projects || [];
  const users = state.users || [];
  const tasks = state.tasks || [];
  const project = projects.find((p) => p.id === id);

  const projectTasks = useMemo(
    () => (project ? tasks.filter((t) => t.projectId === project.id) : []),
    [project, tasks]
  );
  const taskCountByStatus = useMemo(() => {
    const m = { TODO: 0, IN_PROGRESS: 0, COMPLETED: 0 };
    projectTasks.forEach((t) => {
      if (t.status in m) m[t.status]++;
    });
    return m;
  }, [projectTasks]);

  const assignedMembers = useMemo(() => {
    if (!project || !Array.isArray(project.assignedUserIds)) return [];
    return project.assignedUserIds
      .map((uid) => users.find((u) => u.id === uid))
      .filter(Boolean);
  }, [project, users]);

  const isReadOnly = project && (project.status === 'ON_HOLD' || project.status === 'COMPLETED');

  function handleMoveTaskStatus(taskId, newStatus) {
    if (!sessionForRepo || isReadOnly) return;
    moveTaskStatus(taskId, newStatus, sessionForRepo);
  }

  function handleEditTask(task) {
    setEditingTask(task);
    setTaskModalOpen(true);
  }

  function handleAssigneeNotify(message) {
    setAssigneeNotifyMessage(message || '');
    setTimeout(() => setAssigneeNotifyMessage(''), 4000);
  }

  function handleStatusChange(newStatus) {
    if (project) {
      setProjectStatus(project.id, newStatus);
      setStatusDropdownId(null);
    }
  }

  function handleDelete() {
    if (!project) return;
    if (window.confirm(`Are you sure you want to delete "${project.name}"? This will also delete all associated tasks. This action cannot be undone.`)) {
      const result = deleteProject(project.id);
      if (result.ok) {
        navigate('/admin/projects', { replace: true });
      } else {
        alert(result.error || 'Failed to delete project');
      }
    }
  }

  if (!project) {
    return (
      <div className="max-w-[var(--content-narrow)]">
        <p className="text-[var(--danger)] font-medium">Project not found.</p>
        <Link to="/admin/projects" className="text-[var(--primary)] hover:text-[var(--primary-hover)] hover:underline mt-2 inline-block transition-colors">Back to Projects</Link>
      </div>
    );
  }

  const tabs = [
    { id: TAB_OVERVIEW, label: 'Overview' },
    { id: TAB_MEMBERS, label: 'Members' },
    { id: TAB_TASKS, label: 'Tasks' },
  ];

  return (
    <div className="max-w-[var(--content-max)]">
      <Link to="/admin/projects" className="text-sm text-[var(--primary)] hover:text-[var(--primary-hover)] hover:underline mb-4 inline-block transition-colors">← Back to Projects</Link>

      <PageHeader
        title={project.name}
        subtitle={project.description || undefined}
        rightActions={
          <>
            <StatusBadge status={project.status} />
            {statusDropdownId === project.id ? (
              <select
                value={project.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                onBlur={() => setStatusDropdownId(null)}
                autoFocus
                className="text-sm border border-[var(--border)] rounded px-3 py-1.5 focus:ring-2 focus:ring-[var(--ring)] bg-[var(--surface)] text-[var(--fg)]"
              >
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
              </select>
            ) : (
              <button
                type="button"
                onClick={() => setStatusDropdownId(project.id)}
                className="text-sm border border-[var(--border)] rounded px-3 py-1.5 hover:bg-[var(--muted)] bg-[var(--surface)] text-[var(--fg)]"
              >
                Change status
              </button>
            )}
            {isReadOnly ? (
              <span
                title="Project is read-only in this status"
                aria-label="Project is read-only in this status"
                className="inline-flex items-center px-3 py-1.5 text-sm border border-[var(--border)] rounded-[var(--radius)] text-[var(--muted-fg)] cursor-not-allowed"
              >
                Edit Project
              </span>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalOpen(true)}
              >
                Edit Project
              </Button>
            )}
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleDelete}
              leftIcon={Trash2}
            >
              Delete
            </Button>
          </>
        }
      />
      <div className="flex flex-wrap gap-4 text-sm text-[var(--fg-muted)] mb-6">
        <span>Start: {project.startDate ? project.startDate.slice(0, 10) : '—'}</span>
        <span>End: {project.endDate ? project.endDate.slice(0, 10) : '—'}</span>
      </div>

      <nav className="border-b border-[var(--border)] mb-4">
        <ul className="flex gap-4">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'border-[var(--primary)] text-[var(--primary)]'
                    : 'border-transparent text-[var(--fg-muted)] hover:text-[var(--fg)] hover:border-[var(--border-focus)]'
                }`}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {activeTab === TAB_OVERVIEW && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--fg-muted)]">
            Status: <StatusBadge status={project.status} /> — {STATUS_LABELS[project.status] ?? project.status}.
          </p>
          <p className="text-sm text-[var(--fg-muted)]">
            Start date: {project.startDate ? project.startDate.slice(0, 10) : '—'} · End date: {project.endDate ? project.endDate.slice(0, 10) : '—'}
          </p>
          <p className="text-sm text-[var(--fg-muted)]">
            Assigned members: {assignedMembers.length}
          </p>
          {assignedMembers.length > 0 && (
            <ul className="list-disc list-inside text-sm text-[var(--fg-muted)] space-y-1">
              {assignedMembers.map((u) => (
                <li key={u.id}>{u.name} · {u.department ?? '—'}</li>
              ))}
            </ul>
          )}
          <p className="text-sm text-[var(--fg-muted)]">
            Tasks: {projectTasks.length} total (TODO: {taskCountByStatus.TODO}, In progress: {taskCountByStatus.IN_PROGRESS}, Completed: {taskCountByStatus.COMPLETED})
          </p>
        </div>
      )}

      {activeTab === TAB_MEMBERS && (
        <ProjectMembersPanel project={project} />
      )}

      {activeTab === TAB_TASKS && (
        <div className="space-y-4">
          {isReadOnly && <ReadOnlyBanner />}
          {assigneeNotifyMessage && (
            <div className="px-4 py-2 bg-[var(--info-light)] text-[var(--info-muted-fg)] rounded-lg text-sm">{assigneeNotifyMessage}</div>
          )}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex rounded border border-[var(--border)] overflow-hidden">
              <button
                type="button"
                onClick={() => setTasksView(VIEW_KANBAN)}
                className={`px-3 py-1.5 text-sm font-medium ${tasksView === VIEW_KANBAN ? 'bg-[var(--primary)] text-[var(--primary-fg)]' : 'bg-[var(--surface)] text-[var(--fg)] hover:bg-[var(--muted)]'}`}
              >
                Kanban
              </button>
              <button
                type="button"
                onClick={() => setTasksView(VIEW_TABLE)}
                className={`px-3 py-1.5 text-sm font-medium ${tasksView === VIEW_TABLE ? 'bg-[var(--primary)] text-[var(--primary-fg)]' : 'bg-[var(--surface)] text-[var(--fg)] hover:bg-[var(--muted)]'}`}
              >
                Table
              </button>
            </div>
            {!isReadOnly && (
              <button
                type="button"
                onClick={() => { setEditingTask(null); setTaskModalOpen(true); }}
                className="px-3 py-1.5 text-sm bg-[var(--primary)] text-[var(--primary-fg)] rounded-lg hover:bg-[var(--primary-hover)] transition-colors"
              >
                Create Task
              </button>
            )}
          </div>
          {tasksView === VIEW_KANBAN ? (
            <KanbanBoard
              tasks={projectTasks}
              users={users}
              onMoveStatus={handleMoveTaskStatus}
              onEdit={handleEditTask}
              readOnly={isReadOnly}
            />
          ) : (
            <TaskTable
              tasks={projectTasks}
              users={users}
              projects={projects}
              onEdit={handleEditTask}
              onMoveStatus={handleMoveTaskStatus}
              readOnly={isReadOnly}
            />
          )}
        </div>
      )}

      <ProjectModal
        open={modalOpen}
        mode="edit"
        project={project}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {}}
        onDelete={() => {
          setModalOpen(false);
          navigate('/admin/projects', { replace: true });
        }}
      />

      <TaskModal
        open={taskModalOpen}
        mode={editingTask ? 'edit' : 'create'}
        task={editingTask}
        preselectedProjectId={project?.id}
        onClose={() => { setTaskModalOpen(false); setEditingTask(null); }}
        onSuccess={() => {}}
        onAssigneeNotify={handleAssigneeNotify}
      />
    </div>
  );
}
