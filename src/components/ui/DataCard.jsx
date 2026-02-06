import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, MoreVertical } from 'lucide-react';
import { Card } from './Card.jsx';
import { IconButton } from './IconButton.jsx';
import { Badge } from './Badge.jsx';

/**
 * Responsive data card component that replaces table rows on mobile
 * Displays information in a card format with expandable details
 */
export function DataCard({
  data,
  fields,
  actions = [],
  primaryField = 'name',
  secondaryField = 'description',
  avatar,
  status,
  badges = [],
  expandable = false,
  expandedContent,
  className = '',
  onClick,
  variant = 'default'
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const variants = {
    default: 'bg-[var(--surface)] border-[var(--border)] hover:shadow-[var(--shadow-md)]',
    primary: 'bg-[var(--info-light)] border-[var(--info-muted)]',
    success: 'bg-[var(--success-light)] border-[var(--success-muted)]',
    warning: 'bg-[var(--warning-light)] border-[var(--warning-muted)]',
    danger: 'bg-[var(--danger-light)] border-[var(--danger-muted)]'
  };

  const handleCardClick = (e) => {
    // Don't trigger if clicking on interactive elements
    if (e.target.closest('button, a, input, select')) {
      return;
    }
    if (onClick) {
      onClick(data);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`rounded-lg border transition-all duration-200 ${variants[variant]} ${onClick ? 'cursor-pointer hover:shadow-lg' : ''} ${className}`}
      onClick={handleCardClick}
    >
      <div className="p-4">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Avatar/Icon */}
            {avatar && (
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--muted)] flex items-center justify-center text-sm font-medium text-[var(--fg)]">
                {avatar}
              </div>
            )}

            {/* Primary Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[var(--fg)] truncate">
                    {data[primaryField] || 'Untitled'}
                  </h3>
                  {secondaryField && data[secondaryField] && (
                    <p className="text-sm text-[var(--fg-muted)] line-clamp-2 mt-1">
                      {data[secondaryField]}
                    </p>
                  )}
                </div>

                {/* Status Badge */}
                {status && (
                  <Badge variant={status.variant} className="flex-shrink-0">
                    {status.label}
                  </Badge>
                )}
              </div>

              {/* Badges Row */}
              {badges.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {badges.map((badge, index) => (
                    <Badge key={index} variant={badge.variant} size="sm">
                      {badge.label}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {expandable && (
              <IconButton
                icon={isExpanded ? ChevronUp : ChevronDown}
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
              />
            )}

            {actions.length > 0 && (
              <div className="flex gap-1">
                {actions.slice(0, 2).map((action, index) => (
                  <IconButton
                    key={index}
                    icon={action.icon}
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick(data);
                    }}
                    aria-label={action.label}
                    className={action.className}
                  />
                ))}

                {actions.length > 2 && (
                  <IconButton
                    icon={MoreVertical}
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      // TODO: Implement dropdown menu for additional actions
                    }}
                    aria-label="More actions"
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Additional Fields Grid */}
        {fields && fields.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[var(--border)]">
            {fields.map((field, index) => (
              <div key={index} className="min-w-0">
                <div className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider">
                  {field.label}
                </div>
                <div className="text-sm text-[var(--fg)] mt-1 truncate">
                  {field.value || '—'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Expanded Content */}
        {expandable && isExpanded && expandedContent && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 pt-4 border-t border-[var(--border)]"
          >
            {expandedContent(data)}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Responsive data grid that switches between table and cards based on screen size
 */
export function ResponsiveDataGrid({
  data = [],
  columns = [],
  cardConfig = {},
  emptyState,
  loading = false,
  className = ''
}) {
  const [viewMode, setViewMode] = useState('auto'); // 'auto', 'cards', 'table'

  const shouldUseCards = () => {
    if (viewMode === 'cards') return true;
    if (viewMode === 'table') return false;
    // Auto mode: use cards on mobile/tablet, table on desktop
    return window.innerWidth < 1024;
  };

  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-[var(--border)]">
        <thead className="bg-[var(--muted)]">
          <tr>
            {columns.map((col, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-[var(--surface)] divide-y divide-[var(--border)]">
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-[var(--muted)]/50">
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-[var(--fg)]">
                  {col.render ? col.render(item) : item[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderCardView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((item, index) => {
        // Evaluate functions in cardConfig for this item
        const evaluatedConfig = {
          ...cardConfig,
          avatar: typeof cardConfig.avatar === 'function' ? cardConfig.avatar(item) : cardConfig.avatar,
          status: typeof cardConfig.status === 'function' ? cardConfig.status(item) : cardConfig.status,
          fields: typeof cardConfig.fields === 'function' ? cardConfig.fields(item) : cardConfig.fields,
          actions: typeof cardConfig.actions === 'function' ? cardConfig.actions(item) : cardConfig.actions,
          expandedContent: typeof cardConfig.expandedContent === 'function' ? cardConfig.expandedContent(item) : cardConfig.expandedContent,
        };

        return (
          <DataCard
            key={index}
            data={item}
            {...evaluatedConfig}
          />
        );
      })}
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[var(--muted)] rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[var(--muted)] rounded w-3/4"></div>
                  <div className="h-3 bg-[var(--muted)] rounded w-1/2"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-3 bg-[var(--muted)] rounded"></div>
                <div className="h-3 bg-[var(--muted)] rounded"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return emptyState;
  }

  return (
    <div className={className}>
      {/* View Mode Toggle (optional) */}
      <div className="flex justify-end mb-4">
        <div className="flex rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              shouldUseCards() ? 'bg-[var(--primary-muted)] text-[var(--primary-muted-fg)]' : 'text-[var(--fg-muted)] hover:bg-[var(--muted)]'
            }`}
          >
            Cards
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              !shouldUseCards() ? 'bg-[var(--primary-muted)] text-[var(--primary-muted-fg)]' : 'text-[var(--fg-muted)] hover:bg-[var(--muted)]'
            }`}
          >
            Table
          </button>
        </div>
      </div>

      {shouldUseCards() ? renderCardView() : renderTableView()}
    </div>
  );
}