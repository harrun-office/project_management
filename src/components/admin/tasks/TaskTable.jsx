import { PriorityBadge } from './PriorityBadge.jsx';

/**
 * Table view: Title, Project, Assignee, Priority, Status, Assigned At, Actions.
 * Props: tasks, users, projects, onEdit(task), onMoveStatus(taskId, newStatus), readOnly, getTaskReadOnly.
 * onDelete(task), canDelete(task) optional - show Delete button when canDelete returns true.
 */
export function TaskTable({ tasks = [], users = [], projects = [], onEdit, onMoveStatus, readOnly, getTaskReadOnly, onDelete, canDelete, onNavigateToProject }) {
  function getUserName(userId) {
    const u = users.find((x) => x.id === userId);
    return u ? u.name : '—';
  }

  function getProjectName(projectId) {
    const p = projects.find((x) => x.id === projectId);
    return p ? p.name : '—';
  }

  const statusLabels = { TODO: 'To Do', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed' };

  return (
    <div className="border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden bg-[var(--card)] shadow-[var(--shadow-sm)]">
      <table className="min-w-full divide-y divide-[var(--border)]">
        <thead className="bg-[var(--muted)]/60">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-fg)] uppercase tracking-wider">Task Title</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-fg)] uppercase tracking-wider">Project</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-fg)] uppercase tracking-wider">Assignee</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-fg)] uppercase tracking-wider">Priority</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-fg)] uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-fg)] uppercase tracking-wider">Assigned At</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-fg)] uppercase tracking-wider">Deadline</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-[var(--muted-fg)] uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-[var(--card)] divide-y divide-[var(--border)]">
          {tasks.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-[var(--muted-fg)]">
                No tasks match the filter.
              </td>
            </tr>
          ) : (
            tasks.map((task) => {
              const rowReadOnly = getTaskReadOnly ? getTaskReadOnly(task) : readOnly;
              return (
                <tr key={task.id} className="hover:bg-[var(--muted)]/50 transition-colors">
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => onNavigateToProject && onNavigateToProject(task.projectId)}
                      className="font-medium text-[var(--fg)] hover:text-[var(--primary)] transition-colors cursor-pointer"
                    >
                      {task.title}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => onNavigateToProject && onNavigateToProject(task.projectId)}
                      className="text-[var(--fg-secondary)] hover:text-[var(--primary)] transition-colors cursor-pointer"
                    >
                      {getProjectName(task.projectId)}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--fg-secondary)]">{getUserName(task.assigneeId)}</td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--fg-secondary)]">{statusLabels[task.status] ?? task.status}</td>
                  <td className="px-4 py-3 text-sm text-[var(--fg-secondary)]">
                    {task.assignedAt ? task.assignedAt.slice(0, 10) : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--fg-secondary)]">
                    {task.deadline ? (
                      <span className={(() => {
                        const deadline = new Date(task.deadline);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        deadline.setHours(0, 0, 0, 0);
                        const daysUntil = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
                        if (daysUntil < 0) {
                          return 'text-[var(--danger)] font-medium';
                        } else if (daysUntil === 0) {
                          return 'text-[var(--warning)] font-medium';
                        } else if (daysUntil <= 2) {
                          return 'text-[var(--warning)]';
                        }
                        return '';
                      })()}>
                        {task.deadline.slice(0, 10)}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!rowReadOnly ? (
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        <select
                          value={task.status}
                          onChange={(e) => onMoveStatus && onMoveStatus(task.id, e.target.value)}
                          className="text-xs border border-[var(--border)] rounded-[var(--radius)] px-2 py-1 bg-[var(--card)] text-[var(--fg)] focus:ring-2 focus:ring-[var(--ring)]/20 focus:border-[var(--border-focus)] transition-colors"
                        >
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => onEdit && onEdit(task)}
                          className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] hover:underline transition-colors"
                        >
                          Edit
                        </button>
                        {canDelete && canDelete(task) && onDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete(task)}
                            className="text-sm text-[var(--danger)] hover:text-[var(--danger-hover)] hover:underline transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-[var(--muted-fg)]">Read-only</span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
