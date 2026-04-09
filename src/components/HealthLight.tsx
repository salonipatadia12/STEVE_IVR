interface HealthLightProps {
  status: 'green' | 'yellow' | 'red';
  label: string;
}

const colorMap = {
  green: { bg: 'bg-green-500', ring: 'ring-green-200', text: 'text-green-700', label: 'Healthy' },
  yellow: { bg: 'bg-yellow-500', ring: 'ring-yellow-200', text: 'text-yellow-700', label: 'Warning' },
  red: { bg: 'bg-red-500', ring: 'ring-red-200', text: 'text-red-700', label: 'Critical' },
};

export default function HealthLight({ status, label }: HealthLightProps) {
  const c = colorMap[status];
  return (
    <div className="flex items-center gap-3">
      <div className={`w-4 h-4 rounded-full ${c.bg} ring-4 ${c.ring}`} />
      <div>
        <p className={`text-sm font-semibold ${c.text}`}>{c.label}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}
