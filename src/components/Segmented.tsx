interface SegmentedProps<T extends string> {
  options: { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
  return (
    <div
      className="grid gap-1 p-1 rounded-xl bg-shell-200/80 dark:bg-slate-900"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          className={`py-2 rounded-lg text-sm transition-colors ${
            value === option.id
              ? 'bg-shell-50 dark:bg-slate-800 text-forest-700 dark:text-forest-300 font-semibold shadow-sm'
              : 'text-stone-500 dark:text-gray-400 hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default Segmented;
