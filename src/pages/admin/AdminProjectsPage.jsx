import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore.jsx';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { ProjectModal } from '../../components/admin/projects/ProjectModal.jsx';
import { ProjectCard } from '../../components/admin/projects/ProjectCard.jsx';
import { MetricCard } from '../../components/admin/projects/MetricCard.jsx';
import { BulkActionsToolbar } from '../../components/admin/projects/BulkActionsToolbar.jsx';
import { ProgressRing } from '../../components/ui/ProgressRing.jsx';
import { MiniBarChart } from '../../components/ui/MiniBarChart.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { IconButton } from '../../components/ui/IconButton.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { MotionPage } from '../../components/motion/MotionPage.jsx';
import {
  FolderKanban,
  Eye,
  Pencil,
  Trash2,
  Search,
  Filter,
  Plus,
  Users,
  Calendar,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  BarChart3,
  Target,
  Clock,
} from 'lucide-react';

/**
 * Admin Projects: list, filter, create/edit, status, delete.
 * Improved layout, stats strip, and clearer UX.
 */
export function AdminProjectsPage() {
  const { state, setProjectStatus, deleteProject } = useDataStore();
  const [statusFilter, setStatusFilter] = useState('');
  const [searchName, setSearchName] = useState('');
  const [selectedProjects, setSelectedProjects] = useState(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingProject, setEditingProject] = useState(null);
  const [statusChangeId, setStatusChangeId] = useState(null);

  const projects = state.projects || [];

  const filteredProjects = useMemo(() => {
    let list = projects;
    if (statusFilter) list = list.filter((p) => p.status === statusFilter);
    if (searchName.trim()) {
      const q = searchName.trim().toLowerCase();
      list = list.filter((p) => (p.name || '').toLowerCase().includes(q));
    }
    return list;
  }, [projects, statusFilter, searchName]);

  const hasActiveFilters = !!statusFilter || !!searchName.trim();
  const activeCount = projects.filter((p) => p.status === 'ACTIVE').length;
  const onHoldCount = projects.filter((p) => p.status === 'ON_HOLD').length;
  const completedCount = projects.filter((p) => p.status === 'COMPLETED').length;

  // Calculate on-track percentage (projects with progress > 50%)
  const onTrackCount = projects.filter((p) => {
    if (p.status !== 'ACTIVE') return false;
    const projectTasks = state.tasks?.filter(task => task.projectId === p.id) || [];
    if (projectTasks.length === 0) return true; // Consider on-track if no tasks
    const completedTasks = projectTasks.filter(task => task.status === 'COMPLETED').length;
    return (completedTasks / projectTasks.length) > 0.5;
  }).length;

  const onTrackPercentage = activeCount > 0 ? (onTrackCount / activeCount) * 100 : 0;

  // Mock trend data (in a real app, this would come from analytics)
  const mockTrends = {
    active: { trend: 'up', value: 12 },
    onTrack: { trend: 'up', value: 8 },
    completed: { trend: 'down', value: -5 }
  };

  // Mock chart data
  const activeProjectsData = [12, 15, 18, 16, 20, 22, activeCount];
  const onTrackData = [8, 10, 12, 11, 15, 16, onTrackCount];
  const completedData = [5, 7, 6, 8, 9, 7, completedCount];

  function handleCreate() {
    setModalMode('create');
    setEditingProject(null);
    setModalOpen(true);
  }

  function handleEdit(project) {
    setModalMode('edit');
    setEditingProject(project);
    setModalOpen(true);
  }

  function handleStatusChange(projectId, newStatus) {
    setProjectStatus(projectId, newStatus);
    setStatusChangeId(null);
  }

  function handleDelete(project) {
    if (
      window.confirm(
        `Are you sure you want to delete "${project.name}"? This will also delete all associated tasks. This action cannot be undone.`
      )
    ) {
      const result = deleteProject(project.id);
      if (!result.ok) alert(result.error || 'Failed to delete project');
    }
  }

  function clearFilters() {
    setStatusFilter('');
    setSearchName('');
  }

  function handleProjectSelect(projectId, selected) {
    const newSelected = new Set(selectedProjects);
    if (selected) {
      newSelected.add(projectId);
    } else {
      newSelected.delete(projectId);
    }
    setSelectedProjects(newSelected);
  }

  function handleSelectAll(selected) {
    if (selected) {
      setSelectedProjects(new Set(filteredProjects.map(p => p.id)));
    } else {
      setSelectedProjects(new Set());
    }
  }

  function handleBulkStatusChange(newStatus) {
    if (selectedProjects.size === 0) return;

    selectedProjects.forEach(projectId => {
      setProjectStatus(projectId, newStatus);
    });

    setSelectedProjects(new Set());
  }

  function clearSelection() {
    setSelectedProjects(new Set());
  }

  const isReadOnly = (project) => project.status === 'ON_HOLD' || project.status === 'COMPLETED';

  function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <MotionPage className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Projects"
        subtitle={`${projects.length} project${projects.length !== 1 ? 's' : ''} in total`}
        description="Create and manage projects, assign members, and track status. Use filters to find projects by name or status."
        rightActions={
          <Button variant="primary" onClick={handleCreate} leftIcon={Plus}>
            Create project
          </Button>
        }
      />

      {/* Enhanced Metrics Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Projects"
          value={projects.length}
          subtitle="All time"
          icon={BarChart3}
          color="blue"
          trend={mockTrends.active.trend}
          trendValue={mockTrends.active.value}
          chart={<MiniBarChart data={activeProjectsData} color="bg-blue-500" />}
        />
        <MetricCard
          title="Active Projects"
          value={activeCount}
          subtitle={`${Math.round((activeCount / projects.length) * 100) || 0}% of total`}
          icon={PlayCircle}
          color="green"
          trend={mockTrends.active.trend}
          trendValue={mockTrends.active.value}
          chart={<MiniBarChart data={activeProjectsData} color="bg-green-500" />}
        />
        <MetricCard
          title="On Track"
          value={onTrackCount}
          subtitle={`${Math.round(onTrackPercentage)}% of active`}
          icon={Target}
          color="blue"
          trend={mockTrends.onTrack.trend}
          trendValue={mockTrends.onTrack.value}
          chart={<ProgressRing percentage={onTrackPercentage} color="text-blue-500" />}
        />
        <MetricCard
          title="Completed"
          value={completedCount}
          subtitle="This period"
          icon={CheckCircle2}
          color="gray"
          trend={mockTrends.completed.trend}
          trendValue={mockTrends.completed.value}
          chart={<MiniBarChart data={completedData} color="bg-gray-500" />}
        />
      </div>

      {/* Filters */}
      <section aria-labelledby="projects-filters-heading">
        <Card>
          <h2 id="projects-filters-heading" className="flex items-center gap-2 text-sm font-semibold text-[var(--fg)] uppercase tracking-wider mb-4">
            <Filter className="w-4 h-4 text-[var(--fg-muted)]" aria-hidden />
            Search & filter
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label htmlFor="projects-search" className="block text-xs font-medium text-[var(--fg-muted)] mb-1.5">
                Project name
              </label>
              <Input
                id="projects-search"
                type="search"
                placeholder="Search projects…"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                leftIcon={Search}
              />
            </div>
            <div>
              <label htmlFor="projects-status-filter" className="block text-xs font-medium text-[var(--fg-muted)] mb-1.5">
                Status
              </label>
              <Select
                id="projects-status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All</option>
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
              </Select>
            </div>
            {hasActiveFilters && (
              <div className="flex items-end">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            )}
          </div>
          {hasActiveFilters && (
            <p className="text-sm text-[var(--fg-muted)] mt-3 pt-3 border-t border-[var(--border)]">
              Showing {filteredProjects.length} of {projects.length} projects
            </p>
          )}
        </Card>
      </section>

      {/* Projects list */}
      <section aria-labelledby="projects-list-heading">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <h2 id="projects-list-heading" className="flex items-center gap-2 text-lg font-semibold text-[var(--fg)]">
              <FolderKanban className="w-5 h-5 text-[var(--accent)] shrink-0" aria-hidden />
              {hasActiveFilters ? `Results (${filteredProjects.length})` : 'All projects'}
            </h2>
            {filteredProjects.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectAll(selectedProjects.size !== filteredProjects.length)}
                className="text-xs"
              >
                {selectedProjects.size === filteredProjects.length ? 'Deselect All' : 'Select All'}
              </Button>
            )}
          </div>
          {hasActiveFilters && (
            <span className="text-sm text-[var(--fg-muted)]">
              {filteredProjects.length} of {projects.length} shown
            </span>
          )}
        </div>

        {/* Bulk Actions Toolbar */}
        <BulkActionsToolbar
          selectedCount={selectedProjects.size}
          onBulkStatusChange={handleBulkStatusChange}
          onBulkDelete={() => {
            if (window.confirm(`Delete ${selectedProjects.size} selected projects?`)) {
              selectedProjects.forEach(projectId => {
                const project = projects.find(p => p.id === projectId);
                if (project) handleDelete(project);
              });
              clearSelection();
            }
          }}
          onClearSelection={clearSelection}
        />

        {filteredProjects.length === 0 ? (
          <EmptyState
            title={projects.length === 0 ? 'No projects yet' : 'No results match your filters'}
            message={
              projects.length === 0
                ? 'Create your first project to get started managing your team\'s work effectively.'
                : 'Try adjusting your search terms or clearing some filters to see more results.'
            }
            actionLabel={projects.length === 0 ? 'Create project' : 'Clear filters'}
            onAction={projects.length === 0 ? handleCreate : clearFilters}
            icon={FolderKanban}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                tasks={state.tasks || []}
                users={state.users || []}
                selected={selectedProjects.has(project.id)}
                onSelect={(selected) => handleProjectSelect(project.id, selected)}
                onEdit={handleEdit}
                onStatusChange={setStatusChangeId}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>

      <ProjectModal
        open={modalOpen}
        mode={modalMode}
        project={editingProject}
        onClose={() => {
          setModalOpen(false);
          setEditingProject(null);
        }}
        onSuccess={() => {}}
        onDelete={() => {
          setModalOpen(false);
          setEditingProject(null);
        }}
      />
    </MotionPage>
  );
}
