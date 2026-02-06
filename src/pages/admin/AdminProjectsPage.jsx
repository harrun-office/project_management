import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore.jsx';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { ProjectModal } from '../../components/admin/projects/ProjectModal.jsx';
import { ProjectCard } from '../../components/admin/projects/ProjectCard.jsx';
import { BulkActionsToolbar } from '../../components/admin/projects/BulkActionsToolbar.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { IconButton } from '../../components/ui/IconButton.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { MotionPage } from '../../components/motion/MotionPage.jsx';
import { MotionModal } from '../../components/motion/MotionModal.jsx';
import {
  FolderKanban,
  Eye,
  Pencil,
  Trash2,
  Search,
  Filter,
  Plus,
  Calendar,
  PlayCircle,
  PauseCircle,
  ArrowRight,
} from 'lucide-react';

/**
 * Admin Projects: list, filter, create/edit, status, delete.
 * Improved layout, stats strip, and clearer UX.
 */
export function AdminProjectsPage() {
  const { state, setProjectStatus, deleteProject } = useDataStore();
  const [statusFilter, setStatusFilter] = useState('');
  const [searchName, setSearchName] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [selectedProjects, setSelectedProjects] = useState(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingProject, setEditingProject] = useState(null);
  const [statusChangeId, setStatusChangeId] = useState(null);
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);

  const projects = state.projects || [];
  const users = state.users || [];

  // Create a map of user IDs to departments for quick lookup
  const userDepartmentMap = useMemo(() => {
    const map = new Map();
    users.forEach((u) => {
      if (u.department) map.set(u.id, u.department);
    });
    return map;
  }, [users]);

  const filteredProjects = useMemo(() => {
    let list = projects;
    if (statusFilter) list = list.filter((p) => p.status === statusFilter);
    if (searchName.trim()) {
      const q = searchName.trim().toLowerCase();
      list = list.filter((p) => (p.name || '').toLowerCase().includes(q));
    }
    if (departmentFilter) {
      list = list.filter((p) => {
        const assignedUserIds = p.assignedUserIds || [];
        return assignedUserIds.some((userId) => userDepartmentMap.get(userId) === departmentFilter);
      });
    }
    return list;
  }, [projects, statusFilter, searchName, departmentFilter, userDepartmentMap]);

  const hasActiveFilters = !!statusFilter || !!searchName.trim() || !!departmentFilter;

  // Calculate project counts
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === 'ACTIVE').length;
  const onHoldProjects = projects.filter((p) => p.status === 'ON_HOLD').length;

  // Find projects due within 14 days
  const projectsDueWithin14Days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fourteenDaysFromNow = new Date(today);
    fourteenDaysFromNow.setDate(fourteenDaysFromNow.getDate() + 14);

    return projects
      .filter(p => {
        if (!p.endDate || p.status === 'COMPLETED') return false;
        const endDate = new Date(p.endDate);
        endDate.setHours(0, 0, 0, 0);
        return endDate >= today && endDate <= fourteenDaysFromNow;
      })
      .map(p => ({
        ...p,
        daysUntilDeadline: Math.ceil((new Date(p.endDate) - today) / (1000 * 60 * 60 * 24))
      }))
      .sort((a, b) => a.daysUntilDeadline - b.daysUntilDeadline); // Sort by closest deadline first
  }, [projects]);

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
    setDepartmentFilter('');
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

      {/* Project Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projects */}
        <Card className="p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--fg-muted)] mb-1">Total Projects</p>
              <p className="text-2xl font-bold text-[var(--fg)]">{totalProjects}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-[var(--info-light)] flex items-center justify-center">
              <FolderKanban className="w-6 h-6 text-[var(--info)]" />
            </div>
          </div>
        </Card>

        {/* Active Projects */}
        <Card className="p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--fg-muted)] mb-1">Active Projects</p>
              <p className="text-2xl font-bold text-[var(--fg)]">{activeProjects}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-[var(--success-light)] flex items-center justify-center">
              <PlayCircle className="w-6 h-6 text-[var(--success)]" />
            </div>
          </div>
        </Card>

        {/* On Hold Projects */}
        <Card className="p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--fg-muted)] mb-1">On Hold</p>
              <p className="text-2xl font-bold text-[var(--fg)]">{onHoldProjects}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-[var(--warning-light)] flex items-center justify-center">
              <PauseCircle className="w-6 h-6 text-[var(--warning)]" />
            </div>
          </div>
        </Card>

        {/* Projects Due Within 14 Days */}
        <Card 
          className="p-5 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setShowDeadlineModal(true)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--fg-muted)] mb-1">Due in 14 Days</p>
              <p className="text-2xl font-bold text-[var(--fg)]">{projectsDueWithin14Days.length}</p>
              {projectsDueWithin14Days.length > 0 && (
                <p className="text-xs text-[var(--fg-muted)] mt-1">
                  {projectsDueWithin14Days[0].daysUntilDeadline === 0 
                    ? 'Due today' 
                    : projectsDueWithin14Days[0].daysUntilDeadline === 1
                    ? 'Due tomorrow'
                    : `${projectsDueWithin14Days[0].daysUntilDeadline} days left`}
                </p>
              )}
            </div>
            <div className="w-12 h-12 rounded-lg bg-[var(--warning-light)] flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[var(--warning)]" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <section aria-labelledby="projects-filters-heading">
        <Card>
          <h2 id="projects-filters-heading" className="flex items-center gap-2 text-sm font-semibold text-[var(--fg)] uppercase tracking-wider mb-4">
            <Filter className="w-4 h-4 text-[var(--fg-muted)]" aria-hidden />
            Search & filter
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
            <div>
              <label htmlFor="projects-department-filter" className="block text-xs font-medium text-[var(--fg-muted)] mb-1.5">
                Department
              </label>
              <Select
                id="projects-department-filter"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="">All</option>
                <option value="DEV">DEV</option>
                <option value="PRESALES">PRESALES</option>
                <option value="TESTER">TESTER</option>
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

      {/* Projects Due Within 14 Days Modal */}
      <MotionModal
        open={showDeadlineModal}
        onClose={() => setShowDeadlineModal(false)}
        title="Projects Due Within 14 Days"
      >
        {projectsDueWithin14Days.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-[var(--fg-muted)] mx-auto mb-4" />
            <p className="text-base font-medium text-[var(--fg)] mb-1">No projects due within 14 days</p>
            <p className="text-sm text-[var(--fg-muted)]">All projects have deadlines beyond 14 days.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projectsDueWithin14Days.map((project) => {
              const deadlineDate = new Date(project.endDate);
              const isToday = project.daysUntilDeadline === 0;
              const isTomorrow = project.daysUntilDeadline === 1;
              
              return (
                <Link
                  key={project.id}
                  to={`/admin/projects/${project.id}`}
                  onClick={() => setShowDeadlineModal(false)}
                  className="flex items-start gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--hover)] hover:border-[var(--border-focus)] hover:shadow-[var(--shadow-sm)] transition-all duration-200 group"
                >
                  <div className={`flex items-center justify-center w-12 h-12 rounded-xl shrink-0 ${
                    isToday 
                      ? 'bg-[var(--danger-light)] text-[var(--danger)]' 
                      : isTomorrow
                      ? 'bg-[var(--warning-light)] text-[var(--warning)]'
                      : 'bg-[var(--primary-light)] text-[var(--primary)]'
                  }`}>
                    <FolderKanban className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-[var(--fg)] group-hover:text-[var(--primary)] transition-colors truncate">
                          {project.name}
                        </h4>
                        {project.description && (
                          <p className="text-sm text-[var(--fg-muted)] mt-1 line-clamp-2">
                            {project.description}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          isToday
                            ? 'bg-[var(--danger-light)] text-[var(--danger)]'
                            : isTomorrow
                            ? 'bg-[var(--warning-light)] text-[var(--warning)]'
                            : 'bg-[var(--primary-light)] text-[var(--primary)]'
                        }`}>
                          {isToday 
                            ? 'Due Today' 
                            : isTomorrow
                            ? 'Due Tomorrow'
                            : `${project.daysUntilDeadline} days left`}
                        </span>
                        <span className="text-xs text-[var(--fg-muted)]">
                          {deadlineDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        project.status === 'ACTIVE'
                          ? 'bg-[var(--success-light)] text-[var(--success)]'
                          : project.status === 'ON_HOLD'
                          ? 'bg-[var(--warning-light)] text-[var(--warning)]'
                          : 'bg-[var(--muted)] text-[var(--fg-muted)]'
                      }`}>
                        {project.status === 'ACTIVE' ? 'Active' : project.status === 'ON_HOLD' ? 'On Hold' : 'Completed'}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[var(--fg-muted)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                </Link>
              );
            })}
          </div>
        )}
      </MotionModal>
    </MotionPage>
  );
}
