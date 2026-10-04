import React from 'react';

type Category = 'all' | 'top100' | 'top500' | 'top1000';

interface CategorySelectorProps {
  selectedCategory: Category;
  onCategoryChange: (category: Category) => void;
}

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'top100', label: '100' },
  { id: 'top500', label: '500' },
  { id: 'top1000', label: '1000' },
  { id: 'all', label: 'Alle' },
];

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <div className="grid grid-cols-4 gap-1 p-1 rounded-lg bg-gray-100 dark:bg-slate-800">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onCategoryChange(cat.id)}
          className={`py-2 rounded-md text-sm transition-colors ${
            selectedCategory === cat.id
              ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-medium shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
};

export default CategorySelector;
