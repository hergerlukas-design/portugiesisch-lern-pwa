import React from 'react';
import { getWordsByCategory } from '../data/words';

interface CategorySelectorProps {
  selectedCategory: 'all' | 'top100' | 'top500' | 'top1000';
  onCategoryChange: (category: 'all' | 'top100' | 'top500' | 'top1000') => void;
}

const CATEGORIES = [
  { id: 'all', label: 'Alle', description: 'Alle Wörter' },
  { id: 'top100', label: 'Top 100', description: 'Häufigste 100 Wörter' },
  { id: 'top500', label: 'Top 500', description: 'Häufigste 500 Wörter' },
  { id: 'top1000', label: 'Top 1000', description: 'Häufigste 1000 Wörter' },
] as const;

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {CATEGORIES.map((cat) => {
          const wordCount = getWordsByCategory(cat.id as any).length;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id as any)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedCategory === cat.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
              }`}
            >
              <p className="font-semibold text-gray-900 dark:text-white">
                {cat.label}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {wordCount} Wörter
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
                {cat.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySelector;
