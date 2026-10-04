interface SegmentedProps<T extends string> {
  options: { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
}

export function Segmented<T extends string>({ options, value, onChange, label }: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="glass-track grid gap-1 p-1 rounded-[18px]"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const active = value === option.id;
        return (
          <button
            key={option.id}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.id)}
            className={`h-11 rounded-xl text-[15px] font-bold transition ${
              active
                ? 'glass-active text-ink dark:text-white'
                : 'text-muted dark:text-gray-300 hover:text-ink dark:hover:text-white'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default Segmented;
