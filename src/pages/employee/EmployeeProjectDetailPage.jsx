import { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore.jsx';
import { getSession } from '../../store/sessionStore.js';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { ReadOnlyBanner } from '../../components/ui/ReadOnlyBanner.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { KanbanBoard } from '../../components/admin/tasks/KanbanBoard.jsx';
import { TaskTable } from '../../components/admin/tasks/TaskTable.jsx';
import { TaskModal } from '../../components/admin/tasks/TaskModal.jsx';

const TAB_OVERVIEW = 'overview';
const TAB_TASKS = 'tasks';

const VIEW_KANBAN = 'kanban';
const VIEW_TABLE = 'table';

/**
 * Employee project detail: header + tabs (Overview, Tasks).
 * Tasks tab: only tasks assigneeId === session.userId for this project.
 * Create Task (employeeMode, preselectedProjectId). Read-only if ON_HOLD/COMPLETED.
 */
export function EmployeeProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, moveTaskStatus, deleteTask } = useDataStore();
  const session = getSession();
  const sessionForRepo = session ? { userId: session.userId, role: session.role } : null;

  const [activeTab, setActiveTab] = useState(TAB_OVERVIEW);
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

  const projectTasks = useMemo(() => {
    if (!project || !session) return [];
    return tasks.filter((t) => t.projectId === project.id && t.assigneeId === session.userId);
  }, [project, tasks, session]);

  const taskCountByStatus = useMemo(() => {
    const m = { TODO: 0, IN_PROGRESS: 0, COMPLETED: 0 };
    const allProjectTasks = project ? tasks.filter((t) => t.projectId === project.id) : [];
    allProjectTasks.forEach((t) => {
      if (t.status in m) m[t.status]++;
    });
    return m;
  }, [project, tasks]);

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

  function handleDeleteTask(task) {
    if (!sessionForRepo || task.createdById !== session.userId || isReadOnly) return;
    deleteTask(task.id, sessionForRepo);
  }

  function handleAssigneeNotify(message) {
    setAssigneeNotifyMessage(message || '');
    setTimeout(() => setAssigneeNotifyMessage(''), 4000);
  }

  if (!session) return null;

  if (!project) {
    return (
      <div className="max-w-[var(--content-narrow)]">
        <p className="text-red-600 font-medium">Project not found.</p>
        <Link to="/app/projects" className="text-primary-600 hover:text-primary-700 hover:underline mt-2 inline-block transition-colors">Back to My Projects</Link>
      </div>
    );
  }

  const tabs = [
    { id: TAB_OVERVIEW, label: 'Overview' },
    { id: TAB_TASKS, label: 'Tasks' },
  ];

  return (
    <div className="max-w-[var(--content-max)]">
      <Link to="/app/projects" className="text-sm text-primary-600 hover:text-primary-700 hover:underline mb-4 inline-block transition-colors">← Back to My Projects</Link>

      <PageHeader
        title={project.name}
        subtitle={project.description || undefined}
        rightActions={<StatusBadge status={project.status} />}
      />
      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
        <span>Start: {project.startDate ? project.startDate.slice(0, 10) : '—'}</span>
        <span>End: {project.endDate ? project.endDate.slice(0, 10) : '—'}</span>
      </div>

      <nav className="border-b border-gray-200 mb-4">
        <ul className="flex gap-4">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
          <p className="text-sm text-gray-600">
            Status: <StatusBadge status={project.status} />
          </p>
          <p className="text-sm text-gray-600">
            Assigned members: {assignedMembers.length}
          </p>
          {assignedMembers.length > 0 && (
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              {assignedMembers.map((u) => (
                <li key={u.id}>{u.name} · {u.department ?? '—'}</li>
              ))}
            </ul>
          )}
          <p className="text-sm text-gray-600">
            Tasks (project total): {taskCountByStatus.TODO + taskCountByStatus.IN_PROGRESS + taskCountByStatus.COMPLETED} (TODO: {taskCountByStatus.TODO}, In progress: {taskCountByStatus.IN_PROGRESS}, Completed: {taskCountByStatus.COMPLETED})
          </p>
        </div>
      )}

      {activeTab === TAB_TASKS && (
        <div className="space-y-4">
          {isReadOnly && <ReadOnlyBanner />}
          {assigneeNotifyMessage && (
            <div className="px-4 py-2 bg-blue-50 text-blue-800 rounded-lg text-sm">{assigneeNotifyMessage}</div>
          )}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex rounded border border-gray-300 overflow-hidden">
              <button
                type="button"
                onClick={() => setTasksView(VIEW_KANBAN)}
                className={`px-3 py-1.5 text-sm font-medium ${tasksView === VIEW_KANBAN ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                Kanban
              </button>
              <button
                type="button"
                onClick={() => setTasksView(VIEW_TABLE)}
                className={`px-3 py-1.5 text-sm font-medium ${tasksView === VIEW_TABLE ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                Table
              </button>
            </div>
            {!isReadOnly && (
              <button
                type="button"
                onClick={() => { setEditingTask(null); setTaskModalOpen(true); }}
                className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Create Task
              </button>
            )}
          </div>
          {projectTasks.length === 0 ? (
            <EmptyState
              title="No tasks"
              message="No tasks assigned to you in this project."
            />
          ) : tasksView === VIEW_KANBAN ? (
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
              onDelete={handleDeleteTask}
              canDelete={(task) => task.createdById === session.userId}
            />
          )}
        </div>
      )}

      <TaskModal
        open={taskModalOpen}
        mode={editingTask ? 'edit' : 'create'}
        task={editingTask}
        preselectedProjectId={project?.id}
        onClose={() => { setTaskModalOpen(false); setEditingTask(null); }}
        onSuccess={() => {}}
        onAssigneeNotify={handleAssigneeNotify}
        employeeMode
      />
    </div>
  );
}
