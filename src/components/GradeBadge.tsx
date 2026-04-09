import { gradeColor } from '@/lib/friction';

interface GradeBadgeProps {
  grade: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function GradeBadge({ grade, size = 'md' }: GradeBadgeProps) {
  const color = gradeColor(grade);
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${sizeClasses[size]}`}
      style={{ backgroundColor: color + '20', color }}
    >
      {grade}
    </span>
  );
}
