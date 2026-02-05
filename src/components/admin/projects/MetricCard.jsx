import { motion } from 'framer-motion';
import { ProgressRing } from '../../ui/ProgressRing.jsx';
import { MiniBarChart } from '../../ui/MiniBarChart.jsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * Enhanced metric card with visual indicators and trends
 */
export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  chart,
  icon: Icon,
  color = 'blue',
  size = 'default'
}) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      icon: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      icon: 'text-green-600'
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      icon: 'text-amber-600'
    },
    gray: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-700',
      icon: 'text-gray-600'
    }
  };

  const theme = colorClasses[color] || colorClasses.blue;

  const getTrendIcon = () => {
    if (!trend) return Minus;
    return trend === 'up' ? TrendingUp : TrendingDown;
  };

  const getTrendColor = () => {
    if (!trend) return 'text-gray-500';
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  const TrendIcon = getTrendIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative ${theme.bg} ${theme.border} border-2 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {Icon && <Icon className={`w-5 h-5 ${theme.icon}`} />}
            <h3 className={`text-sm font-medium ${theme.text}`}>{title}</h3>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold text-gray-900 tabular-nums">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {subtitle && (
              <span className="text-sm text-gray-600">{subtitle}</span>
            )}
          </div>

          {(trend || trendValue) && (
            <div className="flex items-center gap-1 text-xs">
              <TrendIcon className={`w-3 h-3 ${getTrendColor()}`} />
              <span className={getTrendColor()}>
                {trendValue && `${trendValue > 0 ? '+' : ''}${trendValue}`}
                {trend === 'up' && '↑'}
                {trend === 'down' && '↓'}
              </span>
            </div>
          )}
        </div>

        {/* Chart */}
        {chart && (
          <div className="flex-shrink-0 ml-4">
            {chart}
          </div>
        )}
      </div>
    </motion.div>
  );
}