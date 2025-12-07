import { Calendar } from 'lucide-react';

export type DateRange = 'week' | 'month' | 'year' | 'all';

interface DateFilterProps {
  selected: DateRange;
  onSelect: (range: DateRange) => void;
}

export function DateFilter({ selected, onSelect }: DateFilterProps) {
  const options: { value: DateRange; label: string }[] = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
    { value: 'all', label: 'All Time' },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Calendar size={20} className="text-gray-500" />
      <div className="flex gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              selected === option.value
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
