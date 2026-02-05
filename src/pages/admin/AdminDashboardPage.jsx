import { useMemo, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ListTodo,
  FolderKanban,
  Calendar,
  Users,
  Target,
  FolderOpen,
  Pause,
  CheckCircle2,
  Circle,
  Loader2,
  ArrowRight,
  Sparkles,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Zap,
  Activity,
  Plus,
  Search,
  Bell,
  Settings,
  BarChart3,
  Timer,
  UserCheck,
  CheckSquare,
  AlertCircle,
  Eye,
  MoreHorizontal,
  Filter,
  X,
  SlidersHorizontal,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useDataStore } from '../../store/dataStore.jsx';
import { getSession } from '../../store/sessionStore.js';
import { groupCountBy } from '../../utils/dashboard.js';
import { todayKey, toDayKey } from '../../utils/date.js';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { SkeletonCard } from '../../components/ui/Skeleton.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { MotionPage } from '../../components/motion/MotionPage.jsx';
import { MotionCard } from '../../components/motion/MotionCard.jsx';

/**
 * Admin Dashboard: eye-catching, easy to scan. Hero strip, grouped KPIs, clear sections.
 */
const SKELETON_DELAY_MS = 250;

const PROJECT_KPIS = [
  { key: 'totalProjects', label: 'Total', icon: FolderKanban, accent: 'var(--accent)', bg: 'var(--accent-light)' },
  { key: 'activeProjects', label: 'Active', icon: FolderOpen, accent: 'var(--success)', bg: 'var(--success-light)' },
  { key: 'onHoldProjects', label: 'On hold', icon: Pause, accent: 'var(--warning)', bg: 'var(--warning-light)' },
  { key: 'completedProjects', label: 'Done', icon: CheckCircle2, accent: 'var(--purple)', bg: 'var(--purple-light)' },
];

const TASK_KPIS = [
  { key: 'totalTasks', label: 'All tasks', icon: ListTodo, accent: 'var(--info)', bg: 'var(--info-light)' },
  { key: 'totalOpenTasks', label: 'To do', icon: Circle, accent: 'var(--warning)', bg: 'var(--warning-light)' },
  { key: 'tasksInProgress', label: 'In progress', icon: Loader2, accent: 'var(--teal)', bg: 'var(--teal-light)' },
  { key: 'tasksCompleted', label: 'Done', icon: CheckCircle2, accent: 'var(--success)', bg: 'var(--success-light)' },
];

export function AdminDashboardPage() {
  const { state, runDeadlineCheck, resetDemo } = useDataStore();
  const session = getSession();
  const { showToast } = useToast();
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    dateRange: 'all',
    status: 'all',
    department: 'all',
    priority: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [loadingStates, setLoadingStates] = useState({
    kpis: false,
    activity: false,
    search: false
  });
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Debounce search query for performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      if (searchQuery) {
        setLoadingStates(prev => ({ ...prev, search: true }));
        setTimeout(() => {
          setLoadingStates(prev => ({ ...prev, search: false }));
        }, 300);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const t = setTimeout(() => setShowSkeleton(false), SKELETON_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  // Keyboard shortcuts for workflow optimization
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only trigger shortcuts when not typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'p':
            e.preventDefault();
            window.location.href = '/admin/projects';
            break;
          case 't':
            e.preventDefault();
            window.location.href = '/admin/tasks';
            break;
          case 'u':
            e.preventDefault();
            window.location.href = '/admin/users';
            break;
          case 'd':
            e.preventDefault();
            runDeadlineCheck();
            showToast({ title: 'Deadline check', message: 'Completed.' });
            break;
          case 'b':
            e.preventDefault();
            showToast({ title: 'Bulk Actions', message: 'Select multiple items to enable bulk operations' });
            break;
          case '/':
            e.preventDefault();
            showToast({ title: 'Search', message: 'Global search coming soon (Ctrl+K)' });
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [runDeadlineCheck, showToast]);

  const projects = state.projects || [];
  const tasks = state.tasks || [];
  const users = state.users || [];

  const todayLabel = useMemo(() => new Date().toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }), []);

  const kpis = useMemo(() => {
    const active = projects.filter((p) => p.status === 'ACTIVE').length;
    const onHold = projects.filter((p) => p.status === 'ON_HOLD').length;
    const completed = projects.filter((p) => p.status === 'COMPLETED').length;
    const pendingTasks = tasks.filter((t) => t.status === 'TODO').length;
    const tasksInProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const tasksCompleted = tasks.filter((t) => t.status === 'COMPLETED').length;
    return {
      totalProjects: projects.length,
      activeProjects: active,
      onHoldProjects: onHold,
      completedProjects: completed,
      totalTasks: tasks.length,
      totalOpenTasks: pendingTasks,
      tasksInProgress,
      tasksCompleted,
    };
  }, [projects, tasks]);

  const activeUsers = useMemo(() => users.filter((u) => u.isActive !== false && u.role !== 'ADMIN'), [users]);
  const devCount = useMemo(() => activeUsers.filter((u) => u.department === 'DEV').length, [activeUsers]);
  const presalesCount = useMemo(() => activeUsers.filter((u) => u.department === 'PRESALES').length, [activeUsers]);
  const testerCount = useMemo(() => activeUsers.filter((u) => u.department === 'TESTER').length, [activeUsers]);
  const statusCounts = useMemo(() => groupCountBy(tasks, 'status'), [tasks]);
  const totalForBars = tasks.length || 1;
  const todoCount = statusCounts.TODO || 0;
  const inProgressCount = statusCounts.IN_PROGRESS || 0;
  const completedCount = statusCounts.COMPLETED || 0;

  // Enhanced KPI data with trends and insights
  const kpiTrends = useMemo(() => {
    // Mock trend data - in real app, this would come from historical data
    const getRandomTrend = () => Math.floor(Math.random() * 20) - 10; // -10 to +10

    return {
      totalProjects: { change: getRandomTrend(), period: 'vs last month' },
      activeProjects: { change: getRandomTrend(), period: 'vs last month' },
      onHoldProjects: { change: getRandomTrend(), period: 'vs last month' },
      completedProjects: { change: getRandomTrend(), period: 'vs last month' },
      totalTasks: { change: getRandomTrend(), period: 'vs last month' },
      totalOpenTasks: { change: getRandomTrend(), period: 'vs last month' },
      tasksInProgress: { change: getRandomTrend(), period: 'vs last month' },
      tasksCompleted: { change: getRandomTrend(), period: 'vs last week' },
    };
  }, []);

  // Mini chart data for visual representation
  const getMiniChartData = (current, trend) => {
    const points = [];
    const baseValue = Math.max(current - Math.abs(trend.change) * 2, 0);
    for (let i = 0; i < 7; i++) {
      const variation = (Math.random() - 0.5) * (trend.change / 5);
      points.push(Math.max(baseValue + (trend.change * i / 6) + variation, 0));
    }
    return points;
  };

  // Find project with soonest deadline
  const soonestDeadlineProject = useMemo(() => {
    const activeProjects = projects.filter(p => p.status === 'ACTIVE' && p.endDate);
    if (activeProjects.length === 0) return null;

    return activeProjects.reduce((soonest, current) => {
      const currentDate = new Date(current.endDate);
      const soonestDate = new Date(soonest.endDate);
      return currentDate < soonestDate ? current : soonest;
    });
  }, [projects]);

  const todayTasks = useMemo(() => {
    const today = todayKey();
    return tasks.filter((t) => t.assignedAt && toDayKey(t.assignedAt) === today);
  }, [tasks]);

  // Real-time connection monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Simulate real-time updates with performance considerations
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // Only update activity feed if tab is visible to save resources
      if (!document.hidden) {
        setLoadingStates(prev => ({ ...prev, activity: true }));
        setTimeout(() => {
          setLoadingStates(prev => ({ ...prev, activity: false }));
        }, 500);
      }
    }, 30000); // Update every 30 seconds

    // Handle visibility change for performance
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Tab became visible, refresh data
        setLastUpdate(new Date());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);


  // Enhanced insights for hero section
  const urgentTasks = useMemo(() => {
    const today = new Date();
    return tasks.filter(t =>
      t.status !== 'COMPLETED' &&
      t.deadline &&
      new Date(t.deadline).toDateString() === today.toDateString()
    );
  }, [tasks]);

  const overdueTasks = useMemo(() => {
    const today = new Date();
    return tasks.filter(t =>
      t.status !== 'COMPLETED' &&
      t.deadline &&
      new Date(t.deadline) < today
    );
  }, [tasks]);

  const recentActivity = useMemo(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return tasks.filter(t =>
      t.updatedAt &&
      new Date(t.updatedAt) > yesterday
    ).slice(0, 3);
  }, [tasks]);

  const productivityScore = useMemo(() => {
    const completedToday = tasks.filter(t =>
      t.status === 'COMPLETED' &&
      t.completedAt &&
      new Date(t.completedAt).toDateString() === new Date().toDateString()
    ).length;
    const totalTasks = tasks.length;
    return totalTasks > 0 ? Math.round((completedToday / Math.max(totalTasks * 0.1, 1)) * 100) : 0;
  }, [tasks]);

  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  // Filtered data based on search and filters - optimized with debounced search
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // Search filter with debounced query for performance
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.status.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      if (filters.status === 'active') {
        filtered = filtered.filter(p => p.status === 'ACTIVE');
      } else if (filters.status === 'completed') {
        filtered = filtered.filter(p => p.status === 'COMPLETED');
      } else if (filters.status === 'on-hold') {
        filtered = filtered.filter(p => p.status === 'ON_HOLD');
      }
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let startDate;

      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
          break;
        default:
          break;
      }

      if (startDate) {
        filtered = filtered.filter(p => {
          const projectDate = new Date(p.startDate || p.createdAt || p.updatedAt);
          return projectDate >= startDate;
        });
      }
    }

    return filtered;
  }, [projects, debouncedSearchQuery, filters]);

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Search filter with debounced query
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        t.status.toLowerCase().includes(query) ||
        t.priority?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      if (filters.status === 'todo') {
        filtered = filtered.filter(t => t.status === 'TODO');
      } else if (filters.status === 'in-progress') {
        filtered = filtered.filter(t => t.status === 'IN_PROGRESS');
      } else if (filters.status === 'completed') {
        filtered = filtered.filter(t => t.status === 'COMPLETED');
      }
    }

    // Priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(t => t.priority?.toLowerCase() === filters.priority);
    }

    // Date range filter (same logic as projects)
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let startDate;

      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
          break;
        default:
          break;
      }

      if (startDate) {
        filtered = filtered.filter(t => {
          const taskDate = new Date(t.createdAt || t.assignedAt || t.updatedAt);
          return taskDate >= startDate;
        });
      }
    }

    return filtered;
  }, [tasks, debouncedSearchQuery, filters]);

  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Search filter with debounced query
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.department?.toLowerCase().includes(query) ||
        u.role?.toLowerCase().includes(query)
      );
    }

    // Department filter
    if (filters.department !== 'all') {
      filtered = filtered.filter(u => u.department === filters.department);
    }

    return filtered;
  }, [users, debouncedSearchQuery, filters]);

  const priorityAlerts = useMemo(() => {
    const alerts = [];
    if (overdueTasks.length > 0) {
      alerts.push({
        type: 'critical',
        icon: AlertTriangle,
        title: `${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}`,
        message: 'Require immediate attention',
        action: '/admin/tasks',
        color: 'var(--danger)'
      });
    }
    if (urgentTasks.length > 0) {
      alerts.push({
        type: 'warning',
        icon: Clock,
        title: `${urgentTasks.length} due today`,
        message: 'Complete before end of day',
        action: '/admin/tasks',
        color: 'var(--warning)'
      });
    }
    if (productivityScore < 50) {
      alerts.push({
        type: 'info',
        icon: TrendingUp,
        title: 'Low productivity today',
        message: 'Consider task prioritization',
        action: '/admin/tasks',
        color: 'var(--info)'
      });
    }
    return alerts.slice(0, 2); // Show max 2 alerts
  }, [overdueTasks, urgentTasks, productivityScore]);

  const teamRows = [
    { label: 'Total active employees', value: activeUsers.length },
    { label: 'DEV', value: devCount },
    { label: 'PRESALES', value: presalesCount },
    { label: 'TESTER', value: testerCount },
  ];

  const statusBars = [
    { label: 'To Do', count: todoCount, color: 'var(--warning)' },
    { label: 'In Progress', count: inProgressCount, color: 'var(--info)' },
    { label: 'Completed', count: completedCount, color: 'var(--success)' },
  ];

  if (!session) return null;

  return (
    <MotionPage
      className="space-y-8 sm:space-y-10"
      role="main"
      aria-labelledby="dashboard-heading"
    >
      {/* Skip to main content link is handled by App.jsx */}

      {/* Real-time Status Bar - Mobile Optimized */}
      <div
        className="bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-sm overflow-hidden"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="px-3 py-2 sm:px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1.5">
                {isOnline ? (
                  <Wifi className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                ) : (
                  <WifiOff className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                )}
                <span className="text-xs sm:text-sm text-[var(--fg-muted)]">
                  {isOnline ? 'Live' : 'Offline'}
                </span>
              </div>
              <div className="hidden sm:block text-xs sm:text-sm text-[var(--fg-muted)]">
                Updated {lastUpdate.toLocaleTimeString()}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => {
                  setLastUpdate(new Date());
                  showToast({ title: 'Data Refreshed', message: 'Dashboard data has been updated.' });
                }}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
              >
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>

            </div>
          </div>
        </div>

        {/* Mobile-only last updated time */}
        <div className="sm:hidden px-3 pb-2">
          <div className="text-xs text-[var(--fg-muted)]">
            Updated {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </div>

      <PageHeader
        title="Dashboard"
        badge="Admin"
        subtitle={todayLabel}
        description="Overview of projects, tasks, and team allocation."
        rightActions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Actions Dropdown */}
            <div className="relative">
              <Button
                variant="primary"
                size="sm"
                onClick={() => showToast({ title: 'Quick Actions', message: 'Feature coming soon!' })}
                leftIcon={Zap}
              >
                Quick Actions
              </Button>
            </div>

            {/* Workflow Shortcuts */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { runDeadlineCheck(); showToast({ title: 'Deadline check', message: 'Completed.' }); }}
                leftIcon={Target}
                title="Run deadline check (Ctrl+D)"
              >
                Check Deadlines
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => showToast({ title: 'Bulk Actions', message: 'Select multiple items to enable bulk operations' })}
                leftIcon={CheckSquare}
                title="Bulk operations (Ctrl+B)"
              >
                Bulk Actions
              </Button>
            </div>

            {/* Navigation Shortcuts */}
            <div className="flex items-center gap-1 border-l border-[var(--border)] pl-2 ml-2">
              <Link
                to="/admin/projects"
                className="inline-flex items-center justify-center gap-2 font-medium rounded-[var(--radius)] px-3 py-1.5 text-xs bg-[var(--muted)] text-[var(--fg)] hover:bg-[var(--active)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 transition-colors"
                title="Projects (Ctrl+P)"
              >
                <FolderKanban className="w-4 h-4 shrink-0" aria-hidden />
                Projects
              </Link>
              <Link
                to="/admin/tasks"
                className="inline-flex items-center justify-center gap-2 font-medium rounded-[var(--radius)] px-3 py-1.5 text-xs border border-[var(--border)] text-[var(--fg)] hover:bg-[var(--muted)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 transition-colors"
                title="Tasks (Ctrl+T)"
              >
                <ListTodo className="w-4 h-4 shrink-0" aria-hidden />
                Tasks
              </Link>
              <Link
                to="/admin/users"
                className="inline-flex items-center justify-center gap-2 font-medium rounded-[var(--radius)] px-3 py-1.5 text-xs border border-[var(--border)] text-[var(--fg)] hover:bg-[var(--muted)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 transition-colors"
                title="Team (Ctrl+U)"
              >
                <Users className="w-4 h-4 shrink-0" aria-hidden />
                Team
              </Link>
            </div>

            {/* Admin Tools */}
            <div className="flex items-center gap-1 border-l border-[var(--border)] pl-2 ml-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { resetDemo(); showToast({ title: 'Reset Demo', message: 'Demo data has been reset.' }); }}
                leftIcon={Settings}
                title="Reset demo data"
              >
                Reset Demo
              </Button>
              <Link
                to="/admin/dev-tools"
                className="inline-flex items-center justify-center gap-2 font-medium rounded-[var(--radius)] px-3 py-1.5 text-xs text-[var(--fg-muted)] hover:bg-[var(--muted)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 transition-colors"
                title="Developer tools"
              >
                Dev Tools
              </Link>
            </div>
          </div>
        }
      />

      {/* Advanced Search and Filters - Mobile Optimized */}
      <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-row sm:gap-4 mb-6">
        <div className="flex-1 relative">
          <div className="relative">
            <label htmlFor="dashboard-search" className="sr-only">
              Search projects, tasks, and users
            </label>
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--fg-muted)]"
              aria-hidden="true"
            />
            <input
              id="dashboard-search"
              type="search"
              placeholder="Search projects, tasks, users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 sm:pr-4 py-2.5 text-sm sm:text-base border border-[var(--border)] rounded-lg bg-[var(--card)] text-[var(--fg)] placeholder-[var(--fg-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--border-focus)] transition-colors"
              aria-describedby="search-results-count"
              autoComplete="off"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors sm:hidden"
                aria-label="Clear search"
                type="button"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 border rounded-lg transition-colors text-sm ${
              showFilters
                ? 'border-[var(--border-focus)] bg-[var(--muted)] text-[var(--fg)]'
                : 'border-[var(--border)] bg-[var(--card)] text-[var(--fg-muted)] hover:bg-[var(--muted)]'
            }`}
          >
            <SlidersHorizontal className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Filters</span>
            {Object.values(filters).some(f => f !== 'all') && (
              <span className="ml-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[var(--primary)] rounded-full"></span>
            )}
          </button>

          <button
            onClick={() => showToast({ title: 'Export Data', message: 'Data export feature coming soon!' })}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 border border-[var(--border)] bg-[var(--card)] text-[var(--fg-muted)] hover:bg-[var(--muted)] rounded-lg transition-colors text-sm"
          >
            <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Filter Panel - Mobile Optimized */}
      {showFilters && (
        <Card className="p-3 sm:p-4 mb-6 border-2 border-dashed border-[var(--border)]">
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[var(--fg-muted)] mb-1.5 sm:mb-2">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="w-full px-2.5 sm:px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--card)] text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              >
                <option value="all">All time</option>
                <option value="today">Today</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
                <option value="quarter">This quarter</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-[var(--fg-muted)] mb-1.5 sm:mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-2.5 sm:px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--card)] text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On hold</option>
                <option value="todo">To do</option>
                <option value="in-progress">In progress</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-[var(--fg-muted)] mb-1.5 sm:mb-2">
                Department
              </label>
              <select
                value={filters.department}
                onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                className="w-full px-2.5 sm:px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--card)] text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              >
                <option value="all">All departments</option>
                <option value="DEV">Development</option>
                <option value="PRESALES">Presales</option>
                <option value="TESTER">Testing</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-[var(--fg-muted)] mb-1.5 sm:mb-2">
                Priority
              </label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-2.5 sm:px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--card)] text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              >
                <option value="all">All priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-4 border-t border-[var(--border)]">
            <div className="flex items-center gap-2">
              {Object.values(filters).some(f => f !== 'all') && (
                <button
                  onClick={() => setFilters({ dateRange: 'all', status: 'all', department: 'all', priority: 'all' })}
                  className="text-sm text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium"
                >
                  Clear all filters
                </button>
              )}
              <span className="text-xs sm:text-sm text-[var(--fg-muted)]">
                {Object.values(filters).filter(f => f !== 'all').length} filter{Object.values(filters).filter(f => f !== 'all').length !== 1 ? 's' : ''} applied
              </span>
            </div>

            <button
              onClick={() => setShowFilters(false)}
              className="text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors self-end sm:self-auto"
            >
              Hide filters
            </button>
          </div>
        </Card>
      )}

      {/* Search Results Summary */}
      {searchQuery && (
        <div
          className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="flex items-center gap-2 text-blue-800">
            <Search className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm font-medium">
              Search results for "{searchQuery}"
            </span>
          </div>
          <p
            className="text-sm text-blue-700 mt-1"
            id="search-results-count"
          >
            Found {filteredProjects.length} projects, {filteredTasks.length} tasks, and {filteredUsers.length} users
          </p>
        </div>
      )}

      {/* Enhanced Hero: Dynamic welcome + Priority alerts + Quick insights + Actions */}
      <div
        className="relative overflow-hidden rounded-2xl border border-[var(--border)] px-5 py-6 sm:px-6 sm:py-8 shadow-[var(--shadow-md)]"
        style={{
          background: 'linear-gradient(135deg, var(--card) 0%, var(--card-tint) 50%, var(--accent-light) 100%)',
        }}
      >
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} aria-hidden />

        {/* Priority Alerts Banner */}
        {priorityAlerts.length > 0 && (
          <div className="relative z-20 -mx-5 -mt-6 mb-6 sm:-mx-6 sm:-mt-8 sm:mb-8">
            <div className="bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 border-b border-orange-200/50 px-5 py-3 sm:px-6 sm:py-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-orange-800 mb-2">Priority Alerts</h3>
                  <div className="space-y-2">
                    {priorityAlerts.map((alert, index) => (
                      <Link
                        key={index}
                        to={alert.action}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 transition-colors group"
                      >
                        <div
                          className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
                          style={{ backgroundColor: alert.color + '20', color: alert.color }}
                        >
                          <alert.icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-orange-900 group-hover:text-orange-800">
                            {alert.title}
                          </p>
                          <p className="text-xs text-orange-700">{alert.message}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-orange-400 group-hover:text-orange-600 transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="relative z-10 flex flex-col gap-6">
          {/* Header with enhanced greeting and productivity */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <p className="flex items-center gap-2 text-sm font-medium text-[var(--fg-muted)]">
                  <Sparkles className="w-4 h-4 text-[var(--primary)]" aria-hidden />
                  {timeGreeting} · {todayLabel}
                </p>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                  <Activity className="w-3 h-3" />
                  {productivityScore}% productive
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--fg)] tracking-tight mb-1">
                Dashboard Overview
              </h2>
              <p className="text-sm text-[var(--fg-muted)]">
                {recentActivity.length > 0
                  ? `${recentActivity.length} recent update${recentActivity.length > 1 ? 's' : ''} in the last 24 hours`
                  : 'No recent activity'
                }
              </p>
            </div>

            {/* Enhanced quick actions */}
            <div className="flex flex-wrap gap-2 shrink-0">
              <Link
                to="/admin/tasks"
                className="inline-flex items-center justify-center gap-2 font-medium rounded-xl px-4 py-2 text-sm bg-[var(--primary)] text-[var(--primary-fg)] hover:bg-[var(--primary-hover)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 transition-all duration-200"
              >
                <ListTodo className="w-4 h-4 shrink-0" aria-hidden />
                View Tasks
              </Link>
              <Link
                to="/admin/projects"
                className="inline-flex items-center justify-center gap-2 font-medium rounded-xl px-4 py-2 text-sm border-2 border-[var(--border)] bg-[var(--surface)] text-[var(--fg)] hover:bg-[var(--muted)] hover:border-[var(--border-focus)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 transition-all duration-200"
              >
                <FolderKanban className="w-4 h-4 shrink-0" aria-hidden />
                Projects
              </Link>
              <button
                onClick={() => showToast({ title: 'Quick Actions', message: 'Feature coming soon!' })}
                className="inline-flex items-center justify-center gap-2 font-medium rounded-xl px-4 py-2 text-sm border-2 border-dashed border-[var(--border)] bg-[var(--muted)]/50 text-[var(--fg-muted)] hover:bg-[var(--muted)] hover:border-[var(--border-focus)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 transition-all duration-200"
              >
                <Zap className="w-4 h-4 shrink-0" aria-hidden />
                Quick Actions
              </button>
            </div>
          </div>

          {/* Enhanced insight cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Active Projects */}
            <div className="flex items-center gap-4 rounded-xl border-2 border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-sm px-5 py-4 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-200 group cursor-pointer">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 shrink-0 group-hover:scale-110 transition-transform">
                <FolderOpen className="w-6 h-6" aria-hidden />
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-bold tabular-nums text-[var(--fg)]">{kpis.activeProjects}</span>
                <span className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider">Active projects</span>
              </div>
            </div>

            {/* Tasks Due Today */}
            <div className="flex items-center gap-4 rounded-xl border-2 border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-sm px-5 py-4 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-200 group cursor-pointer">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 text-orange-700 shrink-0 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" aria-hidden />
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-bold tabular-nums text-[var(--fg)]">{todayTasks.length}</span>
                <span className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider">Due today</span>
              </div>
            </div>

            {/* Soonest Deadline */}
            {soonestDeadlineProject && (
              <Link
                to={`/admin/projects/${soonestDeadlineProject.id}`}
                className="flex items-center gap-4 rounded-xl border-2 border-[var(--warning)] bg-gradient-to-br from-yellow-50 to-orange-50 backdrop-blur-sm px-5 py-4 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:from-yellow-100 hover:to-orange-100 transition-all duration-200 group"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-200 to-orange-200 text-orange-700 shrink-0 group-hover:scale-110 transition-transform">
                  <Target className="w-6 h-6" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-lg font-bold text-[var(--fg)] truncate" title={soonestDeadlineProject.name}>
                    {soonestDeadlineProject.name}
                  </span>
                  <span className="text-xs font-medium text-[var(--warning)] uppercase tracking-wider">
                    Due {new Date(soonestDeadlineProject.endDate).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            )}

            {/* Team Productivity */}
            <div className="flex items-center gap-4 rounded-xl border-2 border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-sm px-5 py-4 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-200 group cursor-pointer">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-green-200 text-green-700 shrink-0 group-hover:scale-110 transition-transform">
                <UserCheck className="w-6 h-6" aria-hidden />
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-bold tabular-nums text-[var(--fg)]">{activeUsers.length}</span>
                <span className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider">Active team</span>
              </div>
            </div>
          </div>

          {/* Recent Activity Preview */}
          {recentActivity.length > 0 && (
            <div className="border-t border-[var(--border)]/50 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[var(--fg)] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[var(--primary)]" />
                  Recent Activity
                </h3>
                <Link
                  to="/admin/tasks"
                  className="text-xs text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium flex items-center gap-1"
                >
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {recentActivity.map((task) => (
                  <Link
                    key={task.id}
                    to={`/admin/projects/${task.projectId}`}
                    className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)]/50 hover:bg-[var(--surface)] hover:shadow-sm transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] group-hover:scale-110 transition-transform">
                      <CheckSquare className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[var(--fg)] truncate">{task.title}</p>
                      <p className="text-xs text-[var(--fg-muted)]">Updated recently</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Projects KPI Cards */}
      <section aria-labelledby="projects-kpis">
        <div className="flex items-baseline justify-between gap-4 mb-4">
          <div>
            <h2 id="projects-kpis" className="flex items-center gap-2 section-heading mb-0.5">
              <FolderKanban className="w-5 h-5 text-[var(--accent)] shrink-0" aria-hidden="true" />
              Projects Overview
            </h2>
            <p className="text-sm text-[var(--fg-muted)]">Real-time status and performance metrics</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/admin/projects"
              className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)] flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
            <button className="p-1.5 text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--muted)] rounded-lg transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {showSkeleton || loadingStates.kpis ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} lines={3} />)
          ) : (
            PROJECT_KPIS.map(({ key, label, icon: Icon, accent, bg }) => {
              const trend = kpiTrends[key];
              const chartData = getMiniChartData(kpis[key], trend);
              const isPositive = trend.change >= 0;

              return (
                <Link key={key} to="/admin/projects" className="block group">
                  <MotionCard
                    asListItem
                    className="relative overflow-hidden rounded-xl border-2 border-[var(--border)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)] hover:border-[var(--border-focus)] transition-all duration-300 h-full group-hover:-translate-y-1"
                    style={{ background: bg }}
                  >
                    {/* Mini chart background */}
                    <div className="absolute top-0 right-0 w-20 h-12 opacity-10">
                      <svg viewBox="0 0 80 48" className="w-full h-full">
                        <path
                          d={`M 0 ${48 - (chartData[0] / Math.max(...chartData) * 40)} ${chartData.map((point, i) =>
                            `L ${i * 11.5} ${48 - (point / Math.max(...chartData) * 40)}`
                          ).join(' ')} L 80 48 Z`}
                          fill="currentColor"
                          stroke="none"
                        />
                      </svg>
                    </div>

                    <div className="relative z-10 p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider mb-1">{label}</p>
                          <p className="text-2xl sm:text-3xl font-bold tabular-nums truncate" style={{ color: accent }}>
                            {kpis[key]}
                          </p>
                        </div>
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0 opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" style={{ background: accent, color: 'white' }}>
                          <Icon className="w-5 h-5" aria-hidden />
                        </div>
                      </div>

                      {/* Trend indicator */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {isPositive ? (
                            <TrendingUp className="w-3 h-3 text-green-600" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-red-600" />
                          )}
                          <span className={`text-xs font-medium tabular-nums ${
                            isPositive ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {isPositive ? '+' : ''}{trend.change}%
                          </span>
                        </div>
                        <span className="text-xs text-[var(--fg-muted)]">{trend.period}</span>
                      </div>

                      {/* Mini sparkline */}
                      <div className="mt-3 h-8 flex items-end gap-0.5">
                        {chartData.slice(-5).map((point, i) => {
                          const height = (point / Math.max(...chartData)) * 32;
                          return (
                            <div
                              key={i}
                              className="flex-1 rounded-sm transition-all duration-300 group-hover:opacity-80"
                              style={{
                                height: `${Math.max(height, 2)}px`,
                                background: accent,
                                opacity: 0.7
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </MotionCard>
                </Link>
              );
            })
          )}
        </div>
      </section>

      {/* Enhanced Tasks KPI Cards */}
      <section aria-labelledby="tasks-kpis">
        <div className="flex items-baseline justify-between gap-4 mb-4">
          <div>
            <h2 id="tasks-kpis" className="flex items-center gap-2 section-heading mb-0.5">
              <Target className="w-5 h-5 text-[var(--info)] shrink-0" aria-hidden />
              Task Performance
            </h2>
            <p className="text-sm text-[var(--fg-muted)]">Workflow efficiency and completion rates</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/admin/tasks"
              className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)] flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
            <button className="p-1.5 text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--muted)] rounded-lg transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {showSkeleton || loadingStates.kpis ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} lines={3} />)
          ) : (
            TASK_KPIS.map(({ key, label, icon: Icon, accent, bg }) => {
              const trend = kpiTrends[key];
              const chartData = getMiniChartData(kpis[key], trend);
              const isPositive = trend.change >= 0;

              return (
                <Link key={key} to="/admin/tasks" className="block group">
                  <MotionCard
                    asListItem
                    className="relative overflow-hidden rounded-xl border-2 border-[var(--border)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)] hover:border-[var(--border-focus)] transition-all duration-300 h-full group-hover:-translate-y-1"
                    style={{ background: bg }}
                  >
                    {/* Mini chart background */}
                    <div className="absolute top-0 right-0 w-20 h-12 opacity-10">
                      <svg viewBox="0 0 80 48" className="w-full h-full">
                        <path
                          d={`M 0 ${48 - (chartData[0] / Math.max(...chartData) * 40)} ${chartData.map((point, i) =>
                            `L ${i * 11.5} ${48 - (point / Math.max(...chartData) * 40)}`
                          ).join(' ')} L 80 48 Z`}
                          fill="currentColor"
                          stroke="none"
                        />
                      </svg>
                    </div>

                    <div className="relative z-10 p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider mb-1">{label}</p>
                          <p className="text-2xl sm:text-3xl font-bold tabular-nums truncate" style={{ color: accent }}>
                            {kpis[key]}
                          </p>
                        </div>
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0 opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" style={{ background: accent, color: 'white' }}>
                          <Icon className={`w-5 h-5 ${key === 'tasksInProgress' ? 'animate-spin' : ''}`} aria-hidden />
                        </div>
                      </div>

                      {/* Trend indicator */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1">
                          {isPositive ? (
                            <TrendingUp className="w-3 h-3 text-green-600" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-red-600" />
                          )}
                          <span className={`text-xs font-medium tabular-nums ${
                            isPositive ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {isPositive ? '+' : ''}{trend.change}%
                          </span>
                        </div>
                        <span className="text-xs text-[var(--fg-muted)]">{trend.period}</span>
                      </div>

                      {/* Progress bar for completion rate */}
                      {key === 'tasksCompleted' && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-[var(--fg-muted)]">Completion rate</span>
                            <span className="font-medium" style={{ color: accent }}>
                              {Math.round((completedCount / totalForBars) * 100)}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${(completedCount / totalForBars) * 100}%`,
                                background: accent
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Mini sparkline for other metrics */}
                      {key !== 'tasksCompleted' && (
                        <div className="h-6 flex items-end gap-0.5">
                          {chartData.slice(-5).map((point, i) => {
                            const height = (point / Math.max(...chartData)) * 24;
                            return (
                              <div
                                key={i}
                                className="flex-1 rounded-sm transition-all duration-300 group-hover:opacity-80"
                                style={{
                                  height: `${Math.max(height, 2)}px`,
                                  background: accent,
                                  opacity: 0.7
                                }}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </MotionCard>
                </Link>
              );
            })
          )}
        </div>
      </section>

      {/* Two-column: Team + Task Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Team Allocation */}
        <section aria-labelledby="team-allocation">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <h2 id="team-allocation" className="flex items-center gap-2 section-heading mb-0.5">
                <Users className="w-5 h-5 text-[var(--accent)] shrink-0" aria-hidden />
                Your team
              </h2>
              <p className="text-sm text-[var(--fg-muted)]">Active members by department</p>
            </div>
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded shrink-0"
            >
              View users
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>
          <Card padding="p-0" className="overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--muted)]/50">
              <span className="text-sm font-medium text-[var(--fg-muted)]">Total active</span>
              <span className="inline-flex items-center justify-center min-w-[2rem] h-7 rounded-full bg-[var(--primary)] text-[var(--primary-fg)] text-sm font-bold tabular-nums px-2">
                {activeUsers.length}
              </span>
            </div>
            <div className="grid grid-cols-3 divide-x divide-y sm:divide-y-0 divide-[var(--border)]">
              {teamRows.slice(1).map((row) => (
                <div key={row.label} className="flex flex-col items-center justify-center px-4 py-5 text-center hover:bg-[var(--muted)]/50 transition-colors">
                  <span className="text-2xl font-bold tabular-nums text-[var(--fg)]">{row.value}</span>
                  <span className="text-xs font-medium text-[var(--fg-muted)] mt-0.5 uppercase tracking-wider">{row.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Task Status Overview */}
        <section aria-labelledby="task-status">
          <div className="mb-3">
            <h2 id="task-status" className="flex items-center gap-2 section-heading mb-0.5">
              <Target className="w-5 h-5 text-[var(--info)] shrink-0" aria-hidden />
              Task status
            </h2>
            <p className="text-sm text-[var(--fg-muted)]">Progress across all projects</p>
          </div>
          <Card>
            {(() => {
              const completedPct = totalForBars ? Math.round((completedCount / totalForBars) * 100) : 0;
              return (
                <>
                  <div className="flex items-center justify-between gap-4 mb-5">
                    <div>
                      <span className="text-2xl font-bold tabular-nums text-[var(--fg)]">{tasks.length}</span>
                      <span className="text-sm text-[var(--fg-muted)] ml-1.5">total tasks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--fg-muted)]">Completed</span>
                      <span className="text-xl font-bold tabular-nums text-[var(--success)]">{completedPct}%</span>
                    </div>
                  </div>
                  <div
                    className="h-2.5 bg-[var(--muted)] rounded-full overflow-hidden mb-5"
                    role="progressbar"
                    aria-valuenow={completedCount}
                    aria-valuemin={0}
                    aria-valuemax={totalForBars}
                    aria-label={`${completedPct}% of tasks completed`}
                  >
                    <div
                      className="h-full rounded-full bg-[var(--success)] transition-[width] duration-500"
                      style={{ width: `${completedPct}%` }}
                    />
                  </div>
                  <div className="space-y-4">
                    {statusBars.map(({ label, count, color }) => {
                      const pct = totalForBars ? Math.round((count / totalForBars) * 100) : 0;
                      return (
                        <div key={label}>
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="font-medium text-[var(--fg)]">{label}</span>
                            <span className="tabular-nums font-semibold" style={{ color }}>
                              {count} <span className="text-[var(--fg-muted)] font-normal">({pct}%)</span>
                            </span>
                          </div>
                          <div
                            className="h-3 bg-[var(--muted)] rounded-full overflow-hidden"
                            role="progressbar"
                            aria-valuenow={count}
                            aria-valuemin={0}
                            aria-valuemax={totalForBars}
                            aria-label={`${label}: ${count} of ${totalForBars}`}
                          >
                            <div
                              className="h-full rounded-full transition-[width] duration-300"
                              style={{ width: `${pct}%`, background: color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </Card>
        </section>
      </div>

      {/* Workflow Optimization Panel */}
      <section aria-labelledby="workflow-optimization">
        <div className="flex items-baseline justify-between gap-4 mb-4">
          <div>
            <h2 id="workflow-optimization" className="flex items-center gap-2 section-heading mb-0.5">
              <Zap className="w-5 h-5 text-[var(--primary)] shrink-0" aria-hidden />
              Workflow Center
            </h2>
            <p className="text-sm text-[var(--fg-muted)]">Streamline your daily operations</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)] flex items-center gap-1">
              View all workflows <ArrowRight className="w-4 h-4" aria-hidden />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Quick Actions Panel */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card className="p-4 sm:p-6">
              <h3 className="font-semibold text-[var(--fg)] mb-3 sm:mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" />
                Quick Actions
              </h3>
              <div className="space-y-2.5 sm:space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-sm"
                  onClick={() => showToast({ title: 'Create Project', message: 'Opening project creation form...' })}
                  leftIcon={Plus}
                >
                  <span className="truncate">Create New Project</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-sm"
                  onClick={() => showToast({ title: 'Add Team Member', message: 'Opening user invitation form...' })}
                  leftIcon={UserCheck}
                >
                  <span className="truncate">Invite Team Member</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-sm"
                  onClick={() => showToast({ title: 'Generate Report', message: 'Creating performance report...' })}
                  leftIcon={BarChart3}
                >
                  <span className="truncate">Generate Report</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-sm"
                  onClick={() => showToast({ title: 'Schedule Meeting', message: 'Opening calendar...' })}
                  leftIcon={Calendar}
                >
                  <span className="truncate">Schedule Meeting</span>
                </Button>
              </div>

              <div className="mt-4 sm:mt-6 pt-4 border-t border-[var(--border)]">
                <h4 className="text-sm font-medium text-[var(--fg-muted)] mb-3">Keyboard Shortcuts</h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-[var(--fg-muted)]">
                  <div className="flex justify-between items-center">
                    <span>Projects</span>
                    <kbd className="px-1 py-0.5 bg-[var(--muted)] rounded text-[var(--fg)] text-xs">Ctrl+P</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tasks</span>
                    <kbd className="px-1 py-0.5 bg-[var(--muted)] rounded text-[var(--fg)] text-xs">Ctrl+T</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Team</span>
                    <kbd className="px-1 py-0.5 bg-[var(--muted)] rounded text-[var(--fg)] text-xs">Ctrl+U</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Check</span>
                    <kbd className="px-1 py-0.5 bg-[var(--muted)] rounded text-[var(--fg)] text-xs">Ctrl+D</kbd>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Activity & Pending Items */}
          <div className="lg:col-span-2 space-y-6">
          {/* Pending Approvals/Reviews */}
          <Card className="p-4 sm:p-6 order-1 lg:order-2">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="font-semibold text-[var(--fg)] flex items-center gap-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--warning)]" />
                  Pending Actions
                </h3>
                <span className="text-xs text-[var(--fg-muted)] bg-[var(--muted)] px-2 py-1 rounded-full">
                  {overdueTasks.length + urgentTasks.length} items
                </span>
              </div>

              <div className="space-y-3">
                {overdueTasks.length > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-red-900">
                        {overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-red-700">Require immediate attention</p>
                    </div>
                    <Link
                      to="/admin/tasks"
                      className="text-xs font-medium text-red-700 hover:text-red-900 underline"
                    >
                      View tasks →
                    </Link>
                  </div>
                )}

                {urgentTasks.length > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <Timer className="w-5 h-5 text-orange-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-orange-900">
                        {urgentTasks.length} due today
                      </p>
                      <p className="text-xs text-orange-700">Complete before end of day</p>
                    </div>
                    <Link
                      to="/admin/tasks"
                      className="text-xs font-medium text-orange-700 hover:text-orange-900 underline"
                    >
                      View tasks →
                    </Link>
                  </div>
                )}

                {overdueTasks.length === 0 && urgentTasks.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                    <p className="text-sm font-medium text-[var(--fg)]">All caught up!</p>
                    <p className="text-xs text-[var(--fg-muted)]">No pending actions at this time</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Workflow Efficiency Metrics */}
            <Card className="p-4 sm:p-6 order-3">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="font-semibold text-[var(--fg)] flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--success)]" />
                  Workflow Efficiency
                </h3>
                <span className="text-xs text-[var(--fg-muted)] bg-[var(--muted)] px-2 py-1 rounded-full">
                  Last 7 days
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="text-center p-2 sm:p-3">
                  <div className="text-lg sm:text-2xl font-bold text-[var(--success)] tabular-nums">
                    {Math.round((completedCount / Math.max(totalForBars, 1)) * 100)}%
                  </div>
                  <div className="text-xs text-[var(--fg-muted)] mt-1">Completion Rate</div>
                </div>
                <div className="text-center p-2 sm:p-3">
                  <div className="text-lg sm:text-2xl font-bold text-[var(--info)] tabular-nums">
                    {Math.round((inProgressCount / Math.max(totalForBars, 1)) * 100)}%
                  </div>
                  <div className="text-xs text-[var(--fg-muted)] mt-1">In Progress</div>
                </div>
                <div className="text-center p-2 sm:p-3">
                  <div className="text-lg sm:text-2xl font-bold text-[var(--warning)] tabular-nums">
                    {Math.round((todoCount / Math.max(totalForBars, 1)) * 100)}%
                  </div>
                  <div className="text-xs text-[var(--fg-muted)] mt-1">Backlog</div>
                </div>
                <div className="text-center p-2 sm:p-3">
                  <div className="text-lg sm:text-2xl font-bold text-[var(--primary)] tabular-nums">
                    {Math.round((completedCount / Math.max(activeUsers.length, 1)) * 10) / 10}
                  </div>
                  <div className="text-xs text-[var(--fg-muted)] mt-1">Per Team Member</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </MotionPage>
  );
}
