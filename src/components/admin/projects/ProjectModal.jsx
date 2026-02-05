import { useState, useEffect } from 'react';
import { useDataStore } from '../../../store/dataStore.jsx';
import { MotionModal } from '../../motion/MotionModal.jsx';
import { Button } from '../../ui/Button.jsx';
import { Input } from '../../ui/Input.jsx';
import { Field } from '../../ui/Field.jsx';
import { IconButton } from '../../ui/IconButton.jsx';
import { X, Trash2 } from 'lucide-react';

/**
 * Create / Edit project modal. Token-based, MotionModal, ESC closes, close button top-right.
 */
export function ProjectModal({ open, mode, project, onClose, onSuccess, onDelete }) {
  const { state, createProject, updateProject, assignMembers, deleteProject } = useDataStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const users = (state.users || []).filter((u) => u.isActive !== false && u.role !== 'ADMIN');
  const isEdit = mode === 'edit';

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSuccessMessage('');
    if (isEdit && project) {
      setName(project.name ?? '');
      setDescription(project.description ?? '');
      setStartDate(project.startDate ? project.startDate.slice(0, 10) : '');
      setEndDate(project.endDate ? project.endDate.slice(0, 10) : '');
      setSelectedUserIds(Array.isArray(project.assignedUserIds) ? [...project.assignedUserIds] : []);
    } else {
      setName('');
      setDescription('');
      const today = new Date().toISOString().slice(0, 10);
      setStartDate(today);
      setEndDate(today);
      setSelectedUserIds([]);
    }
  }, [open, mode, project, isEdit]);

  useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [open, onClose]);

  function validate() {
    const err = {};
    if (!name.trim()) err.name = 'Project name is required';
    if (!startDate) err.startDate = 'Start date is required';
    if (!endDate) err.endDate = 'End date is required';
    if (startDate && endDate && startDate > endDate) {
      err.endDate = 'End date must be on or after start date';
    }
    if (selectedUserIds.length === 0) err.members = 'At least one member must be assigned';
    setErrors(err);
    return Object.keys(err).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const startISO = startDate ? `${startDate}T00:00:00.000Z` : startDate;
    const endISO = endDate ? `${endDate}T00:00:00.000Z` : endDate;

    if (isEdit && project) {
      updateProject(project.id, { name: name.trim(), description: description.trim(), startDate: startISO, endDate: endISO });
      assignMembers(project.id, selectedUserIds);
      setSuccessMessage('Project updated.');
    } else {
      createProject({
        name: name.trim(),
        description: description.trim(),
        startDate: startISO,
        endDate: endISO,
        assignedUserIds: selectedUserIds,
      });
      setSuccessMessage('Project created.');
    }

    setTimeout(() => {
      onSuccess?.();
      onClose();
    }, 800);
  }

  function toggleUser(id) {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  }

  function handleDelete() {
    if (!project) return;
    if (window.confirm(`Are you sure you want to delete "${project.name}"? This will also delete all associated tasks. This action cannot be undone.`)) {
      const result = deleteProject(project.id);
      if (result.ok) {
        setSuccessMessage('Project deleted.');
        setTimeout(() => {
          onDelete?.();
          onSuccess?.();
          onClose();
        }, 800);
      } else {
        setErrors({ delete: result.error || 'Failed to delete project' });
      }
    }
  }

  return (
    <MotionModal open={open} onClose={onClose}>
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-lg)] max-w-lg w-full max-h-[90vh] overflow-y-auto text-[var(--card-fg)]">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold text-[var(--fg)]">{isEdit ? 'Edit Project' : 'Create Project'}</h2>
          <IconButton icon={X} aria-label="Close" variant="ghost" size="sm" onClick={onClose} />
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {successMessage && (
            <p className="text-sm text-[var(--success-muted-fg)] bg-[var(--success-muted)] px-3 py-2 rounded-[var(--radius)]">{successMessage}</p>
          )}

          <Field label="Project Name" htmlFor="project-name" required>
            <Input
              id="project-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name"
              error={errors.name}
            />
          </Field>

          <Field label="Description" htmlFor="project-desc">
            <textarea
              id="project-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-[var(--fg)] placeholder:text-[var(--muted-fg)] shadow-[var(--shadow-sm)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)]/20 focus:shadow-[var(--shadow)] transition-all duration-150"
              placeholder="Optional description"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Date" htmlFor="project-start" required>
              <Input
                id="project-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                error={errors.startDate}
              />
            </Field>
            <Field label="End Date" htmlFor="project-end" required>
              <Input
                id="project-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                error={errors.endDate}
              />
            </Field>
          </div>

          <Field label="Assigned Members" required>
            <div
              className={`rounded-[var(--radius)] border px-3 py-2.5 max-h-40 overflow-y-auto space-y-2 ${
                errors.members ? 'border-[var(--danger)]' : 'border-[var(--border)] bg-[var(--card)]'
              } shadow-[var(--shadow-sm)]`}
            >
              {users.length === 0 ? (
                <p className="text-sm text-[var(--muted-fg)]">No active employees.</p>
              ) : (
                users.map((u) => (
                  <label key={u.id} className="flex items-center gap-2 cursor-pointer text-[var(--fg)]">
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(u.id)}
                      onChange={() => toggleUser(u.id)}
                      className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--ring)]"
                    />
                    <span className="text-sm">{u.name} ({u.email})</span>
                  </label>
                ))
              )}
            </div>
            {errors.members && <p className="text-xs text-[var(--danger)] font-medium mt-1" role="alert">{errors.members}</p>}
          </Field>

          <div className="flex justify-between items-center pt-2 border-t border-[var(--border)]">
            {isEdit && (
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                leftIcon={Trash2}
              >
                Delete
              </Button>
            )}
            <div className={`flex justify-end gap-2 ${isEdit ? '' : 'w-full'}`}>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="primary">{isEdit ? 'Save' : 'Create'}</Button>
            </div>
          </div>
        </form>
      </div>
    </MotionModal>
  );
}
