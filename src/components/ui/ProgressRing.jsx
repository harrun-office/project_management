import { useMemo } from 'react';

/**
 * Circular progress ring component
 */
export function ProgressRing({ percentage = 0, size = 80, strokeWidth = 8, color = 'text-blue-500' }) {
  const normalizedRadius = (size - strokeWidth) / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const center = size / 2;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        height={size}
        width={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={center}
          cy={center}
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={center}
          cy={center}
          className={color}
          style={{
            strokeDasharray,
            strokeDashoffset,
            transition: 'stroke-dashoffset 0.8s ease-in-out',
          }}
        />
      </svg>
      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-gray-700">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
}