import { NavLink, useMatch, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, FolderKanban, X, Menu } from 'lucide-react';
import { getSession } from '../../store/sessionStore.js';
import { useDataStore } from '../../store/dataStore.jsx';
import { getNavGroups } from './navConfig.js';
import { useSidebar } from '../../context/SidebarContext.jsx';

/**
 * Simple sidebar: basic vertical navigation with clean styling.
 */
function NavItem({ to, label, icon: Icon, basePath, unreadCount = 0, collapsed, delay = 0 }) {
  const match = useMatch({ path: to, end: to === basePath });
  const isActive = !!match;

  return (
    <NavLink
      to={to}
      end={to === basePath}
      aria-current={isActive ? 'page' : undefined}
      title={collapsed ? label : undefined}
      className={({ isActive: active }) =>
        `flex items-center gap-3 ${collapsed ? 'px-2 py-2 justify-center' : 'px-4 py-3'} text-sm font-medium border-l-4 transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          active
            ? `bg-[var(--primary-muted)] border-[var(--primary)] text-[var(--primary-muted-fg)] shadow-[var(--shadow-md)] ring-1 ring-[var(--primary)]/20 ${collapsed ? 'rounded-lg' : ''}`
            : 'border-transparent text-[var(--fg-muted)] hover:bg-[var(--hover)] hover:text-[var(--fg)] hover:translate-x-1 hover:shadow-[var(--shadow-sm)]'
        }`
      }
      style={{
        transitionDelay: `${delay}ms`,
        opacity: 1, // Always visible, just transform for animation
        transform: collapsed ? 'translateX(0)' : 'translateX(0)'
      }}
    >
      <Icon className={`${collapsed ? 'h-4 w-4' : 'h-5 w-5'} flex-shrink-0 transition-all duration-300 ${isActive ? 'scale-110 drop-shadow-sm' : ''}`} aria-hidden />
      {!collapsed && (
        <>
          <span
            className="flex-1 truncate transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{ transitionDelay: `${delay + 50}ms` }}
          >
            {label}
          </span>
          {unreadCount > 0 && (
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold text-[var(--danger-fg)] animate-pulse transition-all duration-300 ${
              isActive ? 'bg-[var(--danger)] shadow-[var(--shadow-lg)] scale-110' : 'bg-[var(--danger)]'
            }`}
                  style={{ transitionDelay: `${delay + 100}ms` }}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

function SidebarNavContent({ groups, basePath, unreadCount, collapsed, toggleCollapsed }) {
  return (
    <nav className="flex-1 overflow-y-auto" aria-label="Main navigation">
      {/* Hamburger menu button - positioned above dashboard */}
      {collapsed && (
        <div className="px-4 py-2 border-b border-[var(--border)] animate-in slide-in-from-left-2 duration-300">
          <button
            onClick={toggleCollapsed}
            className="group flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--primary-muted)] border border-[var(--primary)]/30 text-[var(--primary-muted-fg)] hover:text-[var(--primary)] hover:bg-[var(--primary-muted)] hover:border-[var(--primary)]/50 hover:shadow-[var(--shadow-md)] active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[var(--shadow-sm)]"
            title="Open sidebar"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5 group-hover:scale-110 group-hover:rotate-12 transition-all duration-200" />
          </button>
        </div>
      )}

      {groups.map((group, groupIndex) => (
        <div key={group.label} className="mb-8">
          {!collapsed && (
            <h2 className={`mb-4 px-4 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)] transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              collapsed ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0'
            }`}
                style={{ transitionDelay: `${groupIndex * 100}ms` }}>
              {group.label}
            </h2>
          )}
          <ul className={collapsed ? "space-y-1" : "space-y-1"}>
            {group.links.map((link, linkIndex) => (
              <li key={link.to}>
                <NavItem
                  to={link.to}
                  label={link.label}
                  icon={link.icon}
                  basePath={basePath}
                  unreadCount={link.showUnread ? unreadCount : 0}
                  collapsed={collapsed}
                  delay={(groupIndex * 100) + (linkIndex * 50)}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function Sidebar() {
  const session = getSession();
  const { state } = useDataStore();
  const { collapsed, toggleCollapsed } = useSidebar();

  const isAdmin = session?.role === 'ADMIN';
  const basePath = isAdmin ? '/admin' : '/app';
  const groups = getNavGroups(isAdmin);

  const unreadCount = session
    ? (state.notifications || []).filter((n) => n.userId === session.userId && !n.read).length
    : 0;

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-[var(--surface)] border-r border-[var(--border)] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[var(--shadow-xl)] ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex-shrink-0 pt-6 pb-4 px-4 border-b border-[var(--border)] relative">
          <Link
            to={basePath}
            className="flex items-center gap-3 hover:opacity-80 transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]"
            title={collapsed ? "Project Management" : undefined}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg text-white flex-shrink-0 transition-all duration-300"
                 style={{ background: 'var(--primary-gradient)' }}>
              <FolderKanban className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1 transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]"
                   style={{
                     opacity: collapsed ? 0 : 1,
                     transform: collapsed ? 'translateX(-10px)' : 'translateX(0)',
                     transitionDelay: collapsed ? '0ms' : '100ms'
                   }}>
                <span className="block text-sm font-semibold text-[var(--fg)] truncate transition-all duration-300"
                      style={{ transitionDelay: collapsed ? '0ms' : '150ms' }}>
                  Project Management
                </span>
                <span className="block text-xs text-[var(--fg-muted)] uppercase tracking-wide transition-all duration-300"
                      style={{ transitionDelay: collapsed ? '0ms' : '200ms' }}>
                  Enterprise
                </span>
              </div>
            )}
          </Link>

          {/* Close button - only visible when sidebar is expanded */}
          {!collapsed && (
            <button
              onClick={() => collapsed || toggleCollapsed()}
              className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--surface)]/80 backdrop-blur-sm border border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-light)] hover:border-[var(--danger-muted)] hover:shadow-[var(--shadow-lg)] active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[var(--shadow-sm)] animate-in fade-in slide-in-from-right-2 duration-300"
              title="Close sidebar"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4 hover:scale-110 hover:rotate-90 transition-all duration-200" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 py-4">
          <SidebarNavContent
            groups={groups}
            basePath={basePath}
            unreadCount={unreadCount}
            collapsed={collapsed}
            toggleCollapsed={toggleCollapsed}
          />
        </div>
      </div>
    </aside>
  );
}
