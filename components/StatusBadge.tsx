import { BatchStatus, statusColors, statusTextColors } from '@/lib/types';

interface StatusBadgeProps {
  status: BatchStatus;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const colorClass = statusColors[status];
  const textColorClass = statusTextColors[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} text-white ${className}`}
    >
      {status.replace('_', ' ')}
    </span>
  );
}
