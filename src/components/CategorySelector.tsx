import React from 'react';

type Category = 'all' | 'top100' | 'top500' | 'top1000';

interface CategorySelectorProps {
  selectedCategory: Category;
  onCategoryChange: (category: Category) => void;
  // Words and already-studied cards per category
  counts: Record<Category, { words: number; learned: number }>;
}

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'top100', label: 'Top 100' },
  { id: 'top500', label: 'Top 500' },
  { id: 'top1000', label: 'Top 1000' },
  { id: 'all', label: 'Alle' },
];

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onCategoryChange,
  counts,
}) => (
  <div className="grid grid-cols-2 gap-2.5">
    {CATEGORIES.map(({ id, label }) => {
      const active = selectedCategory === id;
      const { words, learned } = counts[id];
      const pct = words > 0 ? Math.round((learned / words) * 100) : 0;
      return (
        <button
          key={id}
          aria-pressed={active}
          onClick={() => onCategoryChange(id)}
          className={`${active ? 'glass-active border-2 border-forest-600! dark:border-forest-400!' : 'glass border-2'} min-h-[92px] rounded-[20px] px-4 py-3.5 flex flex-col gap-0.5 text-left text-ink dark:text-white transition`}
        >
          <span className="font-display font-bold text-xl">{label}</span>
          <span className="text-xs font-semibold text-muted dark:text-gray-300">
            {learned} von {words} gelernt
          </span>
          <span className="block h-1 mt-1.5 rounded-sm bg-ink/10 dark:bg-white/15 overflow-hidden">
            <span
              className={`block h-full rounded-sm ${active ? 'bg-forest-600 dark:bg-forest-400' : 'bg-ink dark:bg-white/70'}`}
              style={{ width: `${pct}%` }}
            />
          </span>
        </button>
      );
    })}
  </div>
);

export default CategorySelector;
