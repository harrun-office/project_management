import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { PriorityBadge } from './PriorityBadge.jsx';
import { MotionCard } from '../../motion/MotionCard.jsx';
import { daysUntil, isOverdue } from '../../../utils/date.js';
import { MoreHorizontal, Edit, Trash2, Calendar, User, Tag, GripVertical, CheckSquare, Square, X } from 'lucide-react';
import { IconButton } from '../../ui/IconButton.jsx';
import { Button } from '../../ui/Button.jsx';
import { Skeleton } from '../../ui/Skeleton.jsx';

const COLUMNS = [
  { id: 'TODO', label: 'To Do', color: 'bg-[var(--info-light)] border-[var(--info-muted)] shadow-[var(--shadow-sm)]' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-[var(--warning-light)] border-[var(--warning-muted)] shadow-[var(--shadow-sm)]' },
  { id: 'COMPLETED', label: 'Completed', color: 'bg-[var(--success-light)] border-[var(--success-muted)] shadow-[var(--shadow-sm)]' },
];

// Enhanced project color palette with more sophisticated colors and gradients
const PROJECT_COLORS = [
  // Frontend/UI Projects - Warm, creative colors
  { bg: 'bg-[var(--danger-light)]', border: 'border-[var(--danger-muted)]', shadow: 'shadow-[var(--shadow-sm)]', text: 'text-[var(--danger-muted-fg)]' },
  { bg: 'bg-[var(--warning-light)]', border: 'border-[var(--warning-muted)]', shadow: 'shadow-[var(--shadow-sm)]', text: 'text-[var(--warning-muted-fg)]' },
  { bg: 'bg-[var(--warning-light)]', border: 'border-[var(--warning-muted)]', shadow: 'shadow-[var(--shadow-sm)]', text: 'text-[var(--warning-muted-fg)]' },

  // Backend/API Projects - Cool, technical colors
  { bg: 'bg-[var(--info-light)]', border: 'border-[var(--info-muted)]', shadow: 'shadow-[var(--shadow-sm)]', text: 'text-[var(--info-muted-fg)]' },
  { bg: 'bg-[var(--info-light)]', border: 'border-[var(--info-muted)]', shadow: 'shadow-[var(--shadow-sm)]', text: 'text-[var(--info-muted-fg)]' },
  { bg: 'bg-[var(--muted)]', border: 'border-[var(--border)]', shadow: 'shadow-[var(--shadow-sm)]', text: 'text-[var(--fg-muted)]' },

  // Business/Sales Projects - Professional colors
  { bg: 'bg-[var(--success-light)]', border: 'border-[var(--success-muted)]', shadow: 'shadow-[var(--shadow-sm)]', text: 'text-[var(--success-muted-fg)]' },
  { bg: 'bg-[var(--purple-light)]', border: 'border-[var(--purple-muted)]', shadow: 'shadow-[var(--shadow-sm)]', text: 'text-[var(--purple-fg)]' },
  { bg: 'bg-[var(--danger-light)]', border: 'border-[var(--danger-muted)]', shadow: 'shadow-[var(--shadow-sm)]', text: 'text-[var(--danger-muted-fg)]' },
];

/**
 * Enhanced Kanban board with improved UI/UX and drag & drop.
 * Props: tasks, users, projects, onMoveStatus(taskId, newStatus), onEdit(task), readOnly, getTaskReadOnly(task).
 * onDelete(task), canDelete(task) optional - show Delete when canDelete returns true.
 */
export function KanbanBoard({
  tasks = [],
  users = [],
  projects = [],
  onMoveStatus,
  onEdit,
  readOnly,
  getTaskReadOnly,
  onDelete,
  canDelete,
  selectedTasks = new Set(),
  onSelectTask,
  onSelectAll,
  onBulkStatusChange,
  onClearSelection,
  loading = false,
  onNavigateToProject,
  selectedProjects = new Set(),
  onSelectProject
}) {
  const [quickActionsTask, setQuickActionsTask] = useState(null);

  function handleDragEnd(result) {
    const { destination, source, draggableId } = result;

    // Dropped outside a droppable area
    if (!destination) return;

    // Dropped in the same position
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Move the task to the new status
    const newStatus = destination.droppableId;
    onMoveStatus && onMoveStatus(draggableId, newStatus);
  }

  const byStatus = useMemo(() => {
    const m = { TODO: [], IN_PROGRESS: [], COMPLETED: [] };
    tasks.forEach((t) => {
      if (m[t.status]) m[t.status].push(t);
    });
    return m;
  }, [tasks]);

  const projectColorMap = useMemo(() => {
    const map = {};
    projects.forEach((project, index) => {
      map[project.id] = PROJECT_COLORS[index % PROJECT_COLORS.length];
    });
    return map;
  }, [projects]);

  function getUserName(userId) {
    const u = users.find((x) => x.id === userId);
    return u ? u.name : '—';
  }

  function getUserInitials(userId) {
    const u = users.find((x) => x.id === userId);
    if (!u) return '?';
    return u.name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  function getProjectName(projectId) {
    const p = projects.find((x) => x.id === projectId);
    return p ? p.name : '—';
  }

  function getDeadlineStatus(task) {
    if (!task.deadline) return null;

    const days = daysUntil(task.deadline);
    const overdue = isOverdue(task.deadline);

    if (overdue) {
      return { status: 'overdue', text: `${Math.abs(days)} days overdue`, color: 'text-[var(--danger)] bg-[var(--danger-light)] border-[var(--danger-muted)]' };
    } else if (days === 0) {
      return { status: 'due-today', text: 'Due today', color: 'text-[var(--warning)] bg-[var(--warning-light)] border-[var(--warning-muted)]' };
    } else if (days <= 2) {
      return { status: 'due-soon', text: `Due in ${days} day${days > 1 ? 's' : ''}`, color: 'text-[var(--warning)] bg-[var(--warning-light)] border-[var(--warning-muted)]' };
    } else if (days <= 7) {
      return { status: 'due-week', text: `Due in ${days} days`, color: 'text-[var(--info)] bg-[var(--info-light)] border-[var(--info-muted)]' };
    }
    return null;
  }

  function truncateText(text, maxLength = 80) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  function renderSkeletonCard() {
    return (
      <div className="bg-[var(--surface)] rounded-lg border-2 p-4 shadow-[var(--shadow-sm)] border-[var(--border)]">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-3" />
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-5 w-12" />
        </div>
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      {/* Bulk Actions Bar */}
      {selectedTasks.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-[var(--info-light)] border border-[var(--info-muted)] rounded-lg p-4 mb-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <CheckSquare className="w-5 h-5 text-[var(--info)]" />
            <span className="text-sm font-medium text-[var(--info-muted-fg)]">
              {selectedTasks.size} task{selectedTasks.size > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <select
              onChange={(e) => onBulkStatusChange && onBulkStatusChange(e.target.value)}
              className="text-sm border border-[var(--info-muted)] rounded px-3 py-1 bg-[var(--surface)] text-[var(--fg)]"
              defaultValue=""
            >
              <option value="" disabled>Bulk actions...</option>
              <option value="TODO">Move to To Do</option>
              <option value="IN_PROGRESS">Move to In Progress</option>
              <option value="COMPLETED">Move to Completed</option>
            </select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onClearSelection && onClearSelection()}
              className="text-[var(--info-muted-fg)] hover:bg-[var(--info-muted)]"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {COLUMNS.map((col) => {
          const columnTasks = byStatus[col.id] || [];
          return (
            <Droppable key={col.id} droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`rounded-xl border-2 p-3 sm:p-4 min-h-[300px] sm:min-h-[400px] transition-colors duration-200 ${
                    col.color
                  } ${snapshot.isDraggingOver ? 'ring-2 ring-[var(--primary)]' : ''}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          const allSelected = columnTasks.every(task => selectedTasks.has(task.id));
                          const noneSelected = columnTasks.every(task => !selectedTasks.has(task.id));
                          if (allSelected) {
                            // Deselect all in this column
                            columnTasks.forEach(task => {
                              if (selectedTasks.has(task.id)) {
                                onSelectTask && onSelectTask(task.id, false);
                              }
                            });
                          } else {
                            // Select all in this column
                            columnTasks.forEach(task => {
                              if (!selectedTasks.has(task.id)) {
                                onSelectTask && onSelectTask(task.id, true);
                              }
                            });
                          }
                        }}
                        className="flex items-center justify-center w-6 h-6 border-2 border-[var(--surface)]/40 rounded-md hover:border-[var(--surface)]/60 transition-colors bg-[var(--surface)]/20 backdrop-blur-sm"
                        aria-label={`Select all tasks in ${col.label}`}
                      >
                        {columnTasks.length > 0 && columnTasks.every(task => selectedTasks.has(task.id)) && (
                          <CheckSquare className="w-4 h-4 text-[var(--fg)]" />
                        )}
                      </button>
                      <h3 className="text-lg font-bold text-[var(--fg)] drop-shadow-sm">{col.label}</h3>
                    </div>
                    <div className="bg-[var(--surface)]/80 backdrop-blur-sm text-[var(--fg)] text-sm font-semibold px-3 py-1 rounded-full border border-[var(--surface)]/40 shadow-[var(--shadow-sm)]">
                      {columnTasks.length}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {loading ? (
                      // Show skeleton cards when loading
                      Array.from({ length: 3 }).map((_, index) => (
                        <div key={`skeleton-${col.id}-${index}`}>
                          {renderSkeletonCard()}
                        </div>
                      ))
                    ) : columnTasks.length === 0 ? (
                      <div className="text-center py-8 text-[var(--fg-muted)]">
                        {col.id === 'COMPLETED' ? (
                          <div className="space-y-2">
                            <div className="text-2xl">🎉</div>
                            <p className="text-sm">All caught up!</p>
                            <p className="text-xs">Great job on completing your tasks</p>
                          </div>
                        ) : (
                          <p className="text-sm">No tasks in {col.label.toLowerCase()}</p>
                        )}
                      </div>
                    ) : (
                      columnTasks.map((task, index) => {
                        const taskReadOnly = getTaskReadOnly ? getTaskReadOnly(task) : readOnly;
                        const deadlineStatus = getDeadlineStatus(task);
                        const projectColor = projectColorMap[task.projectId] || { bg: 'bg-[var(--muted)]', border: 'border-[var(--border)]', shadow: 'shadow-[var(--shadow-sm)]', text: 'text-[var(--fg-muted)]' };

                        return (
                          <Draggable
                            key={task.id}
                            draggableId={task.id}
                            index={index}
                            isDragDisabled={taskReadOnly}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="group relative"
                              >
                                <div
                                  className={`bg-[var(--surface)]/95 backdrop-blur-sm rounded-xl border-2 p-4 shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:scale-[1.02] ${projectColor.bg} ${projectColor.border} ${
                                    snapshot.isDragging ? 'rotate-3 shadow-[var(--shadow-2xl)] scale-105' : ''
                                  } ${selectedTasks.has(task.id) ? 'ring-2 ring-[var(--primary)] ring-offset-2' : ''}`}
                                  onClick={(e) => {
                                    // Don't navigate if clicking on interactive elements
                                    if (e.target.closest('button, select, input, textarea')) {
                                      return;
                                    }
                                    if (onNavigateToProject) {
                                      onNavigateToProject(task.projectId);
                                    }
                                  }}
                                >
                                  {/* Checkbox and Project indicator */}
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onSelectTask && onSelectTask(task.id, !selectedTasks.has(task.id));
                                        }}
                                        className="flex items-center justify-center w-5 h-5 border-2 border-[var(--border)] rounded hover:border-[var(--primary)] transition-colors"
                                        aria-label={`Select task ${task.title}`}
                                      >
                                        {selectedTasks.has(task.id) && (
                                          <CheckSquare className="w-4 h-4 text-[var(--primary)]" />
                                        )}
                                      </button>
                                      <span className={`text-xs font-medium px-2 py-1 rounded-full border ${projectColor.text} ${projectColor.bg} ${projectColor.border}`}>
                                        {getProjectName(task.projectId)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {/* Deadline indicator */}
                                      {deadlineStatus && (
                                        <span className={`text-xs px-2 py-1 rounded border ${deadlineStatus.color}`}>
                                          <Calendar className="w-3 h-3 inline mr-1" />
                                          {deadlineStatus.text}
                                        </span>
                                      )}

                                      {/* Drag handle */}
                                      {!taskReadOnly && (
                                        <div
                                          {...provided.dragHandleProps}
                                          className="cursor-grab active:cursor-grabbing p-1 hover:bg-[var(--muted)] rounded opacity-60 group-hover:opacity-100 transition-opacity"
                                        >
                                          <GripVertical className="w-4 h-4 text-[var(--fg-muted)]" />
                                        </div>
                                      )}

                                      {/* Quick actions menu */}
                                      {!taskReadOnly && (
                                        <div className="relative">
                                          <IconButton
                                            icon={MoreHorizontal}
                                            variant="ghost"
                                            size="sm"
                                            aria-label="Task actions"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setQuickActionsTask(quickActionsTask === task.id ? null : task.id);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                          />
                                          <AnimatePresence>
                                            {quickActionsTask === task.id && (
                                              <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="absolute right-0 top-8 z-10 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-[var(--shadow-lg)] py-1 min-w-[120px]"
                                              >
                                                <button
                                                  onClick={() => {
                                                    onEdit && onEdit(task);
                                                    setQuickActionsTask(null);
                                                  }}
                                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--fg)] hover:bg-[var(--muted)]"
                                                >
                                                  <Edit className="w-4 h-4" />
                                                  Edit
                                                </button>
                                                <select
                                                  value={task.status}
                                                  onChange={(e) => {
                                                    onMoveStatus && onMoveStatus(task.id, e.target.value);
                                                    setQuickActionsTask(null);
                                                  }}
                                                  className="w-full px-3 py-2 text-sm text-[var(--fg)] hover:bg-[var(--muted)] border-none bg-transparent"
                                                >
                                                  <option value="TODO">Move to To Do</option>
                                                  <option value="IN_PROGRESS">Move to In Progress</option>
                                                  <option value="COMPLETED">Move to Completed</option>
                                                </select>
                                                {canDelete && canDelete(task) && onDelete && (
                                                  <button
                                                    onClick={() => {
                                                      onDelete(task);
                                                      setQuickActionsTask(null);
                                                    }}
                                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--danger)] hover:bg-[var(--danger-light)]"
                                                  >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete
                                                  </button>
                                                )}
                                              </motion.div>
                                            )}
                                          </AnimatePresence>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Task title */}
                                  <h4 className="font-semibold text-[var(--fg)] mb-2 leading-tight">
                                    {task.title}
                                  </h4>

                                  {/* Task description preview */}
                                  {task.description && (
                                    <p className="text-sm text-[var(--fg-muted)] mb-3 leading-relaxed">
                                      {truncateText(task.description)}
                                    </p>
                                  )}

                                  {/* Task metadata */}
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 bg-[var(--muted)] rounded-full flex items-center justify-center text-xs font-medium text-[var(--fg)]">
                                        {getUserInitials(task.assigneeId)}
                                      </div>
                                      <span className="text-sm text-[var(--fg-muted)]">{getUserName(task.assigneeId)}</span>
                                    </div>
                                    <PriorityBadge priority={task.priority} />
                                  </div>

                                  {/* Tags */}
                                  {(task.tags || []).length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-3 max-h-16 overflow-hidden">
                                      {(task.tags || []).includes('Learning') && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--info-light)] text-[var(--info-muted-fg)] px-2 py-1 text-xs font-medium">
                                          <Tag className="w-3 h-3" />
                                          Learning
                                        </span>
                                      )}
                                      {(task.tags || []).filter((t) => t !== 'Learning').map((tag) => (
                                        <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-[var(--muted)] text-[var(--fg)] px-2 py-1 text-xs font-medium">
                                          <Tag className="w-3 h-3" />
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  {/* Assigned date and Deadline */}
                                  <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-1 text-xs text-[var(--fg-muted)]">
                                      <Calendar className="w-3 h-3" />
                                      Assigned: {task.assignedAt ? task.assignedAt.slice(0, 10) : '—'}
                                    </div>
                                    {task.deadline && (
                                      <div className={`flex items-center gap-1 text-xs ${
                                        (() => {
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
                                          return 'text-[var(--fg-muted)]';
                                        })()
                                      }`}>
                                        <Calendar className="w-3 h-3" />
                                        Deadline: {task.deadline.slice(0, 10)}
                                      </div>
                                    )}
                                  </div>

                                  {/* Read-only indicator */}
                                  {taskReadOnly && (
                                    <div className="mt-2 text-xs text-[var(--fg-muted)] bg-[var(--muted)] px-2 py-1 rounded">
                                      Read-only (Project is {projects.find(p => p.id === task.projectId)?.status?.toLowerCase()})
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })
                    )}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}
