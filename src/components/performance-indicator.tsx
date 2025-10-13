import { getStatusColor } from '../services/dataValidationService';

interface PerformanceIndicatorProps {
  label: string;
  value: number;
  unit?: string;
  showBar?: boolean;
  className?: string;
}

export function PerformanceIndicator({
  label,
  value,
  unit = '%',
  showBar = true,
  className = '',
}: PerformanceIndicatorProps) {
  const color = getStatusColor(value);
  
  const colorClasses = {
    green: 'bg-green-500 text-green-700 dark:text-green-400',
    yellow: 'bg-yellow-500 text-yellow-700 dark:text-yellow-400',
    red: 'bg-red-500 text-red-700 dark:text-red-400',
  };

  const barColorClasses = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };

  const bgColorClasses = {
    green: 'bg-green-100 dark:bg-green-950',
    yellow: 'bg-yellow-100 dark:bg-yellow-950',
    red: 'bg-red-100 dark:bg-red-950',
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`text-2xl ${colorClasses[color]}`}>
            {value.toFixed(1)}
          </span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
      </div>

      {showBar && (
        <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${barColorClasses[color]}`}
            style={{ width: `${Math.min(100, value)}%` }}
          />
        </div>
      )}

      {/* Indicatore visivo stato */}
      <div className={`text-xs px-2 py-1 rounded-md ${bgColorClasses[color]} ${colorClasses[color]}`}>
        {color === 'green' && '✓ OK'}
        {color === 'yellow' && '⚠ Attenzione'}
        {color === 'red' && '⚠ Critico'}
      </div>
    </div>
  );
}
