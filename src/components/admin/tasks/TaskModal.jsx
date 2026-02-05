import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDataStore } from '../../../store/dataStore.jsx';
import { getSession } from '../../../store/sessionStore.js';
import { ReadOnlyBanner } from '../../ui/ReadOnlyBanner.jsx';
import { Input } from '../../ui/Input.jsx';
import { Select } from '../../ui/Select.jsx';
import { Field } from '../../ui/Field.jsx';
import { Button } from '../../ui/Button.jsx';
import { modalBackdrop, modalPanel } from '../../motion/motionPresets.js';

/**
 * Create / Edit task modal.
 * Session from sessionStore.getSession() (never guess from seed).
 * employeeMode: assigneeId forced to session.userId, project list = only assigned ACTIVE projects; no assignee dropdown.
 */
export function TaskModal({ open, mode, task, preselectedProjectId, onClose, onSuccess, onAssigneeNotify, employeeMode }) {
  const { state, createTask, updateTask } = useDataStore();
  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [learningTag, setLearningTag] = useState(false);
  const [extraTags, setExtraTags] = useState('');
  const [errors, setErrors] = useState({});
  const [savedMessage, setSavedMessage] = useState('');

  const session = getSession();
  const projects = state.projects || [];
  const users = (state.users || []).filter((u) => u.isActive !== false && u.role !== 'ADMIN');
  const activeProjects = projects.filter((p) => p.status === 'ACTIVE');
  const assignedActiveProjects = employeeMode && session
    ? projects.filter((p) => p.status === 'ACTIVE' && (p.assignedUserIds || []).includes(session.userId))
    : activeProjects;
  const isEdit = mode === 'edit';

  const selectedProject = projects.find((p) => p.id === projectId);
  const projectReadOnly = selectedProject && (selectedProject.status === 'ON_HOLD' || selectedProject.status === 'COMPLETED');

  const effectiveAssigneeId = employeeMode && session ? session.userId : assigneeId;

  // Only initialize form when modal opens or mode/task/preselectedProjectId changes.
  // Do NOT depend on activeProjects/assignedActiveProjects/projects — they are new array refs every render
  // and would re-run this effect and wipe out the user's input (e.g. title, description) while typing.
  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSavedMessage('');
    const projectList = employeeMode ? assignedActiveProjects : (isEdit ? projects : activeProjects);
    if (isEdit && task) {
      setProjectId(task.projectId ?? '');
      setTitle(task.title ?? '');
      setDescription(task.description ?? '');
      setAssigneeId(task.assigneeId ?? '');
      setPriority(task.priority ?? 'MEDIUM');
      const tags = Array.isArray(task.tags) ? task.tags : [];
      setLearningTag(tags.includes('Learning'));
      setExtraTags(tags.filter((t) => t !== 'Learning').join(', '));
    } else {
      setProjectId(preselectedProjectId ?? (projectList[0]?.id ?? ''));
      setTitle('');
      setDescription('');
      setAssigneeId(employeeMode && session ? session.userId : '');
      setPriority('MEDIUM');
      setLearningTag(false);
      setExtraTags('');
    }
  }, [open, mode, task?.id, preselectedProjectId, isEdit, employeeMode, session?.userId]);

  function getTags() {
    const list = learningTag ? ['Learning'] : [];
    const parts = (extraTags || '').split(',').map((s) => s.trim()).filter(Boolean);
    return [...list, ...parts];
  }

  function validate() {
    const err = {};
    if (!projectId) err.projectId = 'Project is required';
    if (!title.trim()) err.title = 'Title is required';
    if (!employeeMode && !assigneeId) err.assigneeId = 'Assignee is required';
    if (projectReadOnly) err.project = 'Project is read-only (On Hold or Completed).';
    setErrors(err);
    return Object.keys(err).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    if (projectReadOnly || !session) return;

    const tags = getTags();

    if (isEdit && task) {
      const patch = { title: title.trim(), description: description.trim(), projectId, priority, tags };
      if (!employeeMode) patch.assigneeId = assigneeId;
      const result = updateTask(task.id, patch, session);
      if (result.ok) {
        setSavedMessage('Saved');
        setTimeout(() => { onSuccess?.(); onClose(); }, 600);
      } else if (result.error) {
        setErrors({ submit: result.error });
      }
    } else {
      const payload = {
        projectId,
        title: title.trim(),
        description: description.trim(),
        assigneeId: effectiveAssigneeId,
        priority,
        tags,
      };
      const result = createTask(payload, session);
      if (result.ok) {
        const assignee = users.find((u) => u.id === effectiveAssigneeId);
        const assigneeName = assignee ? assignee.name : 'assignee';
        if (onAssigneeNotify) onAssigneeNotify(`Task assigned notification created for ${assigneeName}`);
        setSavedMessage('Saved');
        setTimeout(() => { onSuccess?.(); onClose(); }, 600);
      } else if (result.error) {
        setErrors({ submit: result.error });
      }
    }
  }

  const projectOptions = employeeMode ? (isEdit ? assignedActiveProjects : assignedActiveProjects) : (isEdit ? projects : activeProjects);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={modalBackdrop.initial}
          animate={modalBackdrop.animate}
          exit={modalBackdrop.exit}
          transition={modalBackdrop.transition}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'var(--backdrop)' }}
          onClick={onClose}
          aria-modal="true"
          role="dialog"
        >
          <motion.div
            initial={modalPanel.initial}
            animate={modalPanel.animate}
            exit={modalPanel.exit}
            transition={modalPanel.transition}
            className="bg-[var(--card)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[var(--border)]"
            onClick={(e) => e.stopPropagation()}
          >
        <div className="p-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold">{isEdit ? 'Edit Task' : 'Create Task'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {savedMessage && (
            <p className="text-sm text-[var(--success-muted-fg)] bg-[var(--success-muted)] px-3 py-2 rounded-[var(--radius)]">{savedMessage}</p>
          )}
          {errors.submit && (
            <p className="text-sm text-[var(--danger-muted-fg)] bg-[var(--danger-muted)] px-3 py-2 rounded-[var(--radius)]">{errors.submit}</p>
          )}
          {projectReadOnly && <ReadOnlyBanner />}

          <Field label="Project" htmlFor="task-project" required>
            <Select
              id="task-project"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              error={errors.projectId}
              disabled={!!preselectedProjectId}
            >
              <option value="">Select project</option>
              {projectOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.status})
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Title" htmlFor="task-title" required>
            <Input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              error={errors.title}
            />
          </Field>

          <Field label="Description" htmlFor="task-desc">
            <textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-[var(--fg)] placeholder:text-[var(--muted-fg)] shadow-[var(--shadow-sm)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)]/20 focus:shadow-[var(--shadow)] transition-all duration-150"
              placeholder="Optional description"
            />
          </Field>

          {!employeeMode && (
            <Field label="Assignee" htmlFor="task-assignee" required>
              <Select
                id="task-assignee"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                error={errors.assigneeId}
              >
                <option value="">Select assignee</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </Select>
            </Field>
          )}
          {employeeMode && session && (
            <p className="text-sm text-[var(--muted-fg)]">Assigning to: {session.name}</p>
          )}

          <Field label="Priority" htmlFor="task-priority">
            <Select
              id="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </Select>
          </Field>

          <Field label="Tags">
            <label className="flex items-center gap-2 mb-2 cursor-pointer text-[var(--fg)]">
              <input
                type="checkbox"
                checked={learningTag}
                onChange={(e) => setLearningTag(e.target.checked)}
                className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--ring)]"
              />
              <span className="text-sm">Learning task</span>
            </label>
            <Input
              type="text"
              value={extraTags}
              onChange={(e) => setExtraTags(e.target.value)}
              placeholder="Other tags (comma separated)"
            />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={projectReadOnly || !session}
            >
              {isEdit ? 'Save' : 'Create'}
            </Button>
          </div>
        </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
