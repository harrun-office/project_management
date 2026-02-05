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
  { id: 'TODO', label: 'To Do', color: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-blue-100/50' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-amber-100/50' },
  { id: 'COMPLETED', label: 'Completed', color: 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 shadow-emerald-100/50' },
];

// Enhanced project color palette with more sophisticated colors and gradients
const PROJECT_COLORS = [
  // Frontend/UI Projects - Warm, creative colors
  { bg: 'bg-gradient-to-br from-rose-50 to-pink-50', border: 'border-rose-200', shadow: 'shadow-rose-100/60', text: 'text-rose-700' },
  { bg: 'bg-gradient-to-br from-orange-50 to-red-50', border: 'border-orange-200', shadow: 'shadow-orange-100/60', text: 'text-orange-700' },
  { bg: 'bg-gradient-to-br from-amber-50 to-yellow-50', border: 'border-amber-200', shadow: 'shadow-amber-100/60', text: 'text-amber-700' },

  // Backend/API Projects - Cool, technical colors
  { bg: 'bg-gradient-to-br from-blue-50 to-indigo-50', border: 'border-blue-200', shadow: 'shadow-blue-100/60', text: 'text-blue-700' },
  { bg: 'bg-gradient-to-br from-cyan-50 to-teal-50', border: 'border-cyan-200', shadow: 'shadow-cyan-100/60', text: 'text-cyan-700' },
  { bg: 'bg-gradient-to-br from-slate-50 to-gray-50', border: 'border-slate-200', shadow: 'shadow-slate-100/60', text: 'text-slate-700' },

  // Business/Sales Projects - Professional colors
  { bg: 'bg-gradient-to-br from-emerald-50 to-green-50', border: 'border-emerald-200', shadow: 'shadow-emerald-100/60', text: 'text-emerald-700' },
  { bg: 'bg-gradient-to-br from-purple-50 to-violet-50', border: 'border-purple-200', shadow: 'shadow-purple-100/60', text: 'text-purple-700' },
  { bg: 'bg-gradient-to-br from-fuchsia-50 to-pink-50', border: 'border-fuchsia-200', shadow: 'shadow-fuchsia-100/60', text: 'text-fuchsia-700' },
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
      return { status: 'overdue', text: `${Math.abs(days)} days overdue`, color: 'text-red-600 bg-red-50 border-red-200' };
    } else if (days === 0) {
      return { status: 'due-today', text: 'Due today', color: 'text-orange-600 bg-orange-50 border-orange-200' };
    } else if (days <= 2) {
      return { status: 'due-soon', text: `Due in ${days} day${days > 1 ? 's' : ''}`, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
    } else if (days <= 7) {
      return { status: 'due-week', text: `Due in ${days} days`, color: 'text-blue-600 bg-blue-50 border-blue-200' };
    }
    return null;
  }

  function truncateText(text, maxLength = 80) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  function renderSkeletonCard() {
    return (
      <div className="bg-white rounded-lg border-2 p-4 shadow-sm border-gray-100">
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
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              {selectedTasks.size} task{selectedTasks.size > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <select
              onChange={(e) => onBulkStatusChange && onBulkStatusChange(e.target.value)}
              className="text-sm border border-blue-300 rounded px-3 py-1 bg-white"
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
              className="text-blue-700 hover:bg-blue-100"
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
                  } ${snapshot.isDraggingOver ? 'ring-2 ring-blue-300' : ''}`}
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
                        className="flex items-center justify-center w-6 h-6 border-2 border-white/40 rounded-md hover:border-white/60 transition-colors bg-white/20 backdrop-blur-sm"
                        aria-label={`Select all tasks in ${col.label}`}
                      >
                        {columnTasks.length > 0 && columnTasks.every(task => selectedTasks.has(task.id)) && (
                          <CheckSquare className="w-4 h-4 text-white" />
                        )}
                      </button>
                      <h3 className="text-lg font-bold text-gray-900 drop-shadow-sm">{col.label}</h3>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm text-gray-700 text-sm font-semibold px-3 py-1 rounded-full border border-white/40 shadow-sm">
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
                      <div className="text-center py-8 text-gray-500">
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
                        const projectColor = projectColorMap[task.projectId] || { bg: 'bg-gray-100', border: 'border-gray-300', shadow: 'shadow-gray-100/50', text: 'text-gray-700' };

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
                                  className={`bg-white/95 backdrop-blur-sm rounded-xl border-2 p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:scale-[1.02] ${projectColor.bg} ${projectColor.border} ${
                                    snapshot.isDragging ? 'rotate-3 shadow-2xl scale-105' : ''
                                  } ${selectedTasks.has(task.id) ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}
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
                                        className="flex items-center justify-center w-5 h-5 border-2 border-gray-300 rounded hover:border-blue-400 transition-colors"
                                        aria-label={`Select task ${task.title}`}
                                      >
                                        {selectedTasks.has(task.id) && (
                                          <CheckSquare className="w-4 h-4 text-blue-600" />
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
                                          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded opacity-60 group-hover:opacity-100 transition-opacity"
                                        >
                                          <GripVertical className="w-4 h-4 text-gray-500" />
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
                                                className="absolute right-0 top-8 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px]"
                                              >
                                                <button
                                                  onClick={() => {
                                                    onEdit && onEdit(task);
                                                    setQuickActionsTask(null);
                                                  }}
                                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
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
                                                  className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 border-none bg-transparent"
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
                                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
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
                                  <h4 className="font-semibold text-gray-900 mb-2 leading-tight">
                                    {task.title}
                                  </h4>

                                  {/* Task description preview */}
                                  {task.description && (
                                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                                      {truncateText(task.description)}
                                    </p>
                                  )}

                                  {/* Task metadata */}
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-700">
                                        {getUserInitials(task.assigneeId)}
                                      </div>
                                      <span className="text-sm text-gray-600">{getUserName(task.assigneeId)}</span>
                                    </div>
                                    <PriorityBadge priority={task.priority} />
                                  </div>

                                  {/* Tags */}
                                  {(task.tags || []).length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-3 max-h-16 overflow-hidden">
                                      {(task.tags || []).includes('Learning') && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium">
                                          <Tag className="w-3 h-3" />
                                          Learning
                                        </span>
                                      )}
                                      {(task.tags || []).filter((t) => t !== 'Learning').map((tag) => (
                                        <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-800 px-2 py-1 text-xs font-medium">
                                          <Tag className="w-3 h-3" />
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  {/* Assigned date */}
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Calendar className="w-3 h-3" />
                                    Assigned: {task.assignedAt ? task.assignedAt.slice(0, 10) : '—'}
                                  </div>

                                  {/* Read-only indicator */}
                                  {taskReadOnly && (
                                    <div className="mt-2 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
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
