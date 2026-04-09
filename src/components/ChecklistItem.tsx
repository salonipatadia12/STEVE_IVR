interface ChecklistItemProps {
  label: string;
  checked: boolean;
  description?: string;
}

export default function ChecklistItem({ label, checked, description }: ChecklistItemProps) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
        checked ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
      }`}>
        {checked ? '✓' : '✕'}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
    </div>
  );
}
