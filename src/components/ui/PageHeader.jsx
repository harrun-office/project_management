/**
 * Page header: clear hierarchy, optional badge, subtitle/description, actions. Token-based.
 * Description uses --content-narrow for readable line length.
 */
export function PageHeader({ title, subtitle, description, badge, rightActions, className = '' }) {
  return (
    <header
      className={`flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6 mb-6 sm:mb-8 pb-5 sm:pb-6 border-b border-[var(--border)] ${className}`.trim()}
      aria-label="Page header"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 gap-y-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--fg)]">{title}</h1>
          {badge != null && badge !== '' && (
            <span className="inline-flex items-center rounded-[var(--radius-sm)] px-2 py-0.5 text-xs font-medium bg-[var(--primary-muted)] text-[var(--primary-muted-fg)] ring-1 ring-[var(--primary)]/10">
              {badge}
            </span>
          )}
        </div>
        {subtitle != null && subtitle !== '' && (
          <p className="text-sm text-[var(--fg-muted)] mt-1.5" aria-hidden="true">{subtitle}</p>
        )}
        {description != null && description !== '' && (
          <p className="text-sm text-[var(--fg-muted)] mt-2 max-w-[var(--content-narrow)] leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {rightActions != null && (
        <div className="flex flex-wrap items-center gap-2 shrink-0 sm:pt-0.5">{rightActions}</div>
      )}
    </header>
  );
}
