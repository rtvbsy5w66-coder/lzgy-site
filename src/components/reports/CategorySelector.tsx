'use client';

import { 
  CategoryType, 
  CATEGORIES, 
  CATEGORY_LABELS, 
  CATEGORY_DESCRIPTIONS 
} from '../../../types/report.types';

interface CategorySelectorProps {
  selectedCategory?: CategoryType;
  onCategoryChange: (category: CategoryType) => void;
  error?: string;
}

export function CategorySelector({ 
  selectedCategory, 
  onCategoryChange, 
  error 
}: CategorySelectorProps) {
  const categoryOptions = Object.values(CATEGORIES).map(categoryKey => ({
    value: categoryKey,
    label: CATEGORY_LABELS[categoryKey],
    description: CATEGORY_DESCRIPTIONS[categoryKey],
  }));

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Kategória *
      </label>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {categoryOptions.map((category) => (
          <div
            key={category.value}
            onClick={() => onCategoryChange(category.value)}
            className={`
              p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
              ${selectedCategory === category.value
                ? 'border-blue-500 bg-blue-50 shadow-sm'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <input
                  type="radio"
                  name="category"
                  value={category.value}
                  checked={selectedCategory === category.value}
                  onChange={() => onCategoryChange(category.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mt-1"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  {category.label}
                </h4>
                <p className="text-xs text-gray-600">
                  {category.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
      
      {selectedCategory && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Kiválasztott kategória:</span>{' '}
            {CATEGORY_LABELS[selectedCategory]}
          </p>
        </div>
      )}
    </div>
  );
}