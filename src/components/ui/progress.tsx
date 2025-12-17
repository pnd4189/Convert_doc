/**
 * Progress Component - Display progress bar with percentage
 */

export interface ProgressProps {
  value: number; // 0-100
  label?: string;
  showPercent?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export function Progress({ value, label, showPercent = true, size = 'md' }: ProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between mb-1 text-sm">
          {label && <span className="text-gray-700">{label}</span>}
          {showPercent && <span className="text-gray-500">{Math.round(clampedValue)}%</span>}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeStyles[size]}`}>
        <div
          className={`bg-blue-600 ${sizeStyles[size]} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
