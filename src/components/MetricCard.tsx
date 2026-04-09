interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

export default function MetricCard({ label, value, subtitle, color }: MetricCardProps) {
  return (
    <div className="bg-card-bg border border-card-border rounded-xl p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-3xl font-bold mt-1" style={color ? { color } : undefined}>
        {value}
      </p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}
