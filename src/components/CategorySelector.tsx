import React from 'react';
import { Segmented } from './Segmented';

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
}) => (
  <Segmented options={CATEGORIES} value={selectedCategory} onChange={onCategoryChange} />
);

export default CategorySelector;
