import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { getSession, clearSession } from '../../store/sessionStore.js';
import { getTheme, toggleTheme } from '../../store/themeStore.js';
import { useSidebar } from '../../context/SidebarContext.jsx';
import { Badge } from '../ui/Badge.jsx';

const HEADER_HEIGHT = 72;

/**
 * Premium header: clear layout (brand | spacer | actions), refined typography, glass-style bar.
 */
export function Topbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = getSession();
  const isDark = getTheme() === 'dark';
  const { collapsed } = useSidebar();
  const roleLabel = session?.role === 'ADMIN' ? 'Admin' : 'Employee';
  const userInitial = session?.name?.charAt(0)?.toUpperCase() ?? '?';

  function handleLogout() {
    clearSession();
    navigate('/login', { replace: true });
  }

  if (!session) return null;

  return (
    <header
      className="sticky top-0 z-50 flex w-full flex-shrink-0 items-center border-b border-gray-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 shadow-sm animate-fadeIn"
      style={{ minHeight: HEADER_HEIGHT, height: HEADER_HEIGHT }}
      aria-label="App header"
    >
      {/* Enhanced top accent gradient */}
      <div
        className="absolute left-0 right-0 top-0 h-1 rounded-b-md opacity-60 transition-all duration-700 ease-out hover:opacity-80 hover:h-1.5"
        style={{
          background: 'linear-gradient(90deg, var(--primary) 0%, var(--accent) 25%, var(--info) 50%, var(--accent) 75%, var(--primary) 100%)',
          filter: 'blur(0.5px)',
          animation: 'shimmer 3s ease-in-out infinite'
        }}
        aria-hidden
      />

      <div className="mx-auto flex h-full w-full max-w-[1400px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        {/* —— Left: brand —— */}
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {/* Show Project Management text when sidebar is collapsed */}
          {collapsed && (
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900 tracking-tight">
                Project Management
              </span>
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                Enterprise
              </span>
            </div>
          )}
        </div>

        {/* —— Center: spacer —— */}
        <div className="hidden flex-1 lg:block" aria-hidden />

        {/* —— Right: actions strip —— */}
        <div className="flex flex-shrink-0 items-center gap-3">
          {/* Theme toggle */}
          <button
            type="button"
            onClick={() => toggleTheme()}
            className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-gray-300 bg-gray-100 text-gray-700 shadow-md transition-all duration-300 ease-out hover:border-gray-400 hover:bg-gray-200 hover:shadow-lg hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <svg
              className="h-5 w-5 transition-all duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              {isDark ? (
                // Sun icon for light mode
                <>
                  <circle cx="12" cy="12" r="5"></circle>
                  <path d="m12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
                </>
              ) : (
                // Moon icon for dark mode
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              )}
            </svg>
          </button>

          {/* Elegant divider */}
          <div className="hidden h-10 w-px bg-gradient-to-b from-transparent via-[var(--border)] to-transparent sm:block transition-all duration-300 hover:bg-gradient-to-b hover:from-[var(--primary)]/20 hover:via-[var(--primary)] hover:to-[var(--primary)]/20" aria-hidden />

          {/* User info + Logout */}
          <div className="flex items-center gap-3">
            {/* User avatar and name (desktop) */}
            <div className="hidden items-center gap-1.5 sm:flex">
              <div className="group flex items-center gap-1 rounded-md border border-[var(--border)] bg-gradient-to-r from-[var(--surface)] to-[var(--card-tint)] px-1 py-0.5 transition-all duration-500 ease-out shadow-[var(--shadow-sm)] hover:border-[var(--border-focus)] hover:bg-[var(--hover)] hover:shadow-[var(--shadow-md)] hover:scale-[1.02] cursor-pointer">
                <span
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-[10px] font-bold text-white shadow-[var(--shadow-sm)] ring-1 ring-white/20 transition-all duration-300 ease-out group-hover:scale-110 group-hover:shadow-[var(--shadow-md)] group-hover:ring-white/40"
                  title={session.name}
                  aria-hidden
                >
                  {userInitial}
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-xs font-semibold text-[var(--fg)] transition-all duration-300 group-hover:text-[var(--primary)]" title={session.name}>
                    {session.name}
                  </span>
                  <Badge variant={session.role === 'ADMIN' ? 'primary' : 'info'} className="mt-0.5 w-fit text-[9px] font-semibold px-1 py-0.5 shadow-[var(--shadow-sm)] transition-all duration-300 group-hover:shadow-[var(--shadow-md)] group-hover:scale-105">
                    {roleLabel}
                  </Badge>
                </div>
              </div>
            </div>

            {/* User avatar (mobile only) */}
            <div className="flex items-center sm:hidden">
              <span
                className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-[10px] font-bold text-white shadow-[var(--shadow-md)] ring-1 ring-white/20 transition-all duration-300 ease-out hover:scale-110 hover:shadow-[var(--shadow-lg)] hover:ring-white/40 cursor-pointer"
                title={session.name}
                aria-hidden
              >
                {userInitial}
              </span>
            </div>

            {/* Logout button */}
            <button
              type="button"
              onClick={handleLogout}
              className="group flex h-8 items-center gap-2 rounded-lg border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] to-[var(--muted)] px-2 text-sm font-semibold text-[var(--fg-secondary)] shadow-[var(--shadow-sm)] transition-all duration-500 ease-out hover:border-[var(--danger)] hover:bg-gradient-to-br hover:from-[var(--danger)]/10 hover:to-[var(--danger)]/5 hover:text-[var(--danger)] hover:shadow-[var(--shadow-md)] hover:scale-105 active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ring-offset)]"
              aria-label="Log out"
            >
              <LogOut className="h-3 w-3 flex-shrink-0 transition-all duration-300 ease-out group-hover:rotate-12 group-hover:scale-110" aria-hidden />
              <span className="hidden md:inline transition-all duration-300 group-hover:translate-x-0.5">Log out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
