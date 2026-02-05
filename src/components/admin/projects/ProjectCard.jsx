import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StatusBadge } from '../../ui/StatusBadge.jsx';
import { Progress } from '../../ui/Progress.jsx';
import { Avatar } from '../../ui/Avatar.jsx';
import { ActionMenu } from '../../ui/ActionMenu.jsx';
import {
  Calendar,
  Users,
  CheckCircle2,
  PlayCircle,
  PauseCircle,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  Check
} from 'lucide-react';
import { IconButton } from '../../ui/IconButton.jsx';
import { format, differenceInDays, isAfter, isBefore } from 'date-fns';

// Status-based themes with gradients and colors
const STATUS_THEMES = {
  ACTIVE: {
    bg: 'bg-gradient-to-br from-emerald-50 to-green-50',
    border: 'border-emerald-200',
    shadow: 'shadow-emerald-100/50',
    icon: PlayCircle,
    iconColor: 'text-emerald-600',
    labelColor: 'text-emerald-700',
    progressColor: 'bg-emerald-500'
  },
  ON_HOLD: {
    bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
    border: 'border-amber-200',
    shadow: 'shadow-amber-100/50',
    icon: PauseCircle,
    iconColor: 'text-amber-600',
    labelColor: 'text-amber-700',
    progressColor: 'bg-amber-500'
  },
  COMPLETED: {
    bg: 'bg-gradient-to-br from-slate-50 to-gray-50',
    border: 'border-slate-200',
    shadow: 'shadow-slate-100/50',
    icon: CheckCircle2,
    iconColor: 'text-slate-600',
    labelColor: 'text-slate-700',
    progressColor: 'bg-slate-500'
  }
};

// Project type categorization for avatars
const PROJECT_TYPES = {
  'Portal': { icon: '🌐', color: 'bg-blue-500' },
  'API': { icon: '🔌', color: 'bg-purple-500' },
  'Sales': { icon: '📈', color: 'bg-green-500' },
  'Legacy': { icon: '🏛️', color: 'bg-amber-500' },
  'Mobile': { icon: '📱', color: 'bg-pink-500' },
  'Learning': { icon: '📚', color: 'bg-indigo-500' },
  'default': { icon: '📁', color: 'bg-gray-500' }
};

function getProjectType(name) {
  const lowerName = name.toLowerCase();
  for (const [key, value] of Object.entries(PROJECT_TYPES)) {
    if (lowerName.includes(key.toLowerCase())) {
      return value;
    }
  }
  return PROJECT_TYPES.default;
}

function calculateProgress(project, tasks) {
  if (!tasks || tasks.length === 0) return 0;

  const projectTasks = tasks.filter(task => task.projectId === project.id);
  if (projectTasks.length === 0) return 0;

  const completedTasks = projectTasks.filter(task => task.status === 'COMPLETED').length;
  return Math.round((completedTasks / projectTasks.length) * 100);
}

function getProjectTimelineStatus(project) {
  const now = new Date();
  const startDate = new Date(project.startDate);
  const endDate = new Date(project.endDate);

  if (isAfter(now, endDate)) {
    return { status: 'overdue', days: differenceInDays(now, endDate) };
  } else if (isBefore(now, startDate)) {
    return { status: 'upcoming', days: differenceInDays(startDate, now) };
  } else {
    const totalDays = differenceInDays(endDate, startDate);
    const elapsedDays = differenceInDays(now, startDate);
    const progress = Math.min((elapsedDays / totalDays) * 100, 100);
    return { status: 'in-progress', progress: Math.round(progress) };
  }
}

export function ProjectCard({
  project,
  tasks = [],
  users = [],
  selected = false,
  onSelect,
  onEdit,
  onStatusChange,
  onDelete,
  compact = false,
  showActions = true
}) {
  const theme = STATUS_THEMES[project.status] || STATUS_THEMES.ACTIVE;
  const StatusIcon = theme.icon;
  const projectType = getProjectType(project.name);
  const progress = calculateProgress(project, tasks);
  const timelineStatus = getProjectTimelineStatus(project);

  const assignedUsers = useMemo(() => {
    return project.assignedUserIds?.map(userId =>
      users.find(user => user.id === userId)
    ).filter(Boolean) || [];
  }, [project.assignedUserIds, users]);

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`group relative ${theme.bg} ${theme.border} border-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
        compact ? 'p-4' : 'p-6'
      } ${selected ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}
    >
      {/* Status indicator stripe */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${theme.progressColor}`} />

      {/* Selection checkbox */}
      {onSelect && (
        <div className="absolute top-3 left-3 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(!selected);
            }}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              selected
                ? 'bg-blue-500 border-blue-500 text-white'
                : 'border-gray-300 hover:border-blue-400'
            }`}
            aria-label={selected ? 'Deselect project' : 'Select project'}
          >
            {selected && <Check className="w-3 h-3" />}
          </button>
        </div>
      )}

      <div className={`flex items-start justify-between mb-4 ${onSelect ? 'ml-8' : ''}`}>
        <div className="flex items-center gap-3">
          {/* Project Avatar */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-lg ${projectType.color}`}>
            {projectType.icon}
          </div>

          <div className="flex-1 min-w-0">
            <Link
              to={`/admin/projects/${project.id}`}
              className="block group-hover:text-blue-600 transition-colors"
            >
              <h3 className="font-semibold text-gray-900 truncate group-hover:underline">
                {project.name}
              </h3>
            </Link>
            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
              {project.description}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${theme.bg} ${theme.labelColor} border ${theme.border}`}>
            <StatusIcon className={`w-3 h-3 ${theme.iconColor}`} />
            {project.status === 'ACTIVE' ? 'Active' :
             project.status === 'ON_HOLD' ? 'On Hold' : 'Completed'}
          </div>

          {showActions && (
            <ActionMenu
              actions={[
                {
                  id: 'view',
                  label: 'View Details',
                  icon: Eye,
                  onClick: () => {
                    // Navigation will be handled by the Link wrapper
                  }
                },
                {
                  id: 'edit',
                  label: 'Edit Project',
                  icon: Pencil,
                  onClick: () => onEdit?.(project),
                  disabled: project.status === 'COMPLETED' || project.status === 'ON_HOLD'
                },
                { type: 'divider' },
                ...(project.status !== 'ACTIVE' ? [{
                  id: 'activate',
                  label: 'Mark as Active',
                  icon: PlayCircle,
                  onClick: () => onStatusChange?.(project.id, 'ACTIVE')
                }] : []),
                ...(project.status !== 'ON_HOLD' ? [{
                  id: 'hold',
                  label: 'Put on Hold',
                  icon: PauseCircle,
                  onClick: () => onStatusChange?.(project.id, 'ON_HOLD')
                }] : []),
                ...(project.status !== 'COMPLETED' ? [{
                  id: 'complete',
                  label: 'Mark as Completed',
                  icon: CheckCircle2,
                  onClick: () => onStatusChange?.(project.id, 'COMPLETED')
                }] : []),
                { type: 'divider' },
                {
                  id: 'delete',
                  label: 'Delete Project',
                  icon: Trash2,
                  onClick: () => onDelete?.(project),
                  destructive: true
                }
              ]}
              trigger={
                <IconButton
                  icon={MoreVertical}
                  variant="ghost"
                  size="sm"
                  aria-label="Project actions"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              }
            />
          )}
        </div>
      </div>

      {/* Progress Section */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium text-gray-900">{progress}%</span>
        </div>
        <div className="w-full bg-white/60 rounded-full h-2 overflow-hidden">
          <motion.div
            className={`h-full ${theme.progressColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </div>
      </div>

      {/* Timeline Status */}
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-4 h-4 text-gray-500" />
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {formatDate(project.startDate)} - {formatDate(project.endDate)}
            </span>
            {timelineStatus.status === 'overdue' && (
              <span className="text-red-600 font-medium">
                {timelineStatus.days} days overdue
              </span>
            )}
            {timelineStatus.status === 'upcoming' && (
              <span className="text-blue-600 font-medium">
                Starts in {timelineStatus.days} days
              </span>
            )}
            {timelineStatus.status === 'in-progress' && (
              <span className="text-gray-600">
                {timelineStatus.progress}% through timeline
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-500" />
          <div className="flex -space-x-1">
            {assignedUsers.slice(0, 3).map((user) => (
              <div
                key={user.id}
                className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-700"
                title={user.name}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            ))}
            {assignedUsers.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                +{assignedUsers.length - 3}
              </div>
            )}
          </div>
          <span className="text-sm text-gray-600 ml-1">
            {assignedUsers.length} member{assignedUsers.length !== 1 ? 's' : ''}
          </span>
        </div>

      </div>

      {/* Hover overlay for better interaction feedback */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200 rounded-xl pointer-events-none" />
    </motion.div>
  );
}