'use client';

// PONTOSAN UGYANAZOK A KATEGÓRIÁK mint a PublicIssueSlider-ben!
const SLIDER_CATEGORIES = [
  {
    id: 'roads',
    name: 'Úthibák és járdák',
    description: 'Útburkolat károk, járdahibák, kátyúk',
    icon: 'fas fa-road',
    color: '#ef4444',
  },
  {
    id: 'lighting',
    name: 'Közvilágítás',
    description: 'Utcai világítás hibák, kiégett lámpák',
    icon: 'fas fa-lightbulb',
    color: '#f59e0b',
  },
  {
    id: 'parks',
    name: 'Parkok és zöldterületek',
    description: 'Park karbantartás, játszóterek, növényzet',
    icon: 'fas fa-tree',
    color: '#10b981',
  },
  {
    id: 'waste',
    name: 'Hulladékkezelés',
    description: 'Szemétszállítás, konténerek, illegális lerakás',
    icon: 'fas fa-trash',
    color: '#6b7280',
  },
  {
    id: 'traffic',
    name: 'Közlekedés',
    description: 'KRESZ táblák, zebra, parkolás, dugók',
    icon: 'fas fa-traffic-light',
    color: '#3b82f6',
  },
  {
    id: 'noise',
    name: 'Zajszennyezés',
    description: 'Túlzott zaj, építkezési zajok',
    icon: 'fas fa-volume-up',
    color: '#f97316',
  },
  {
    id: 'social',
    name: 'Szociális ügyek',
    description: 'Idősellátás, családsegítés, szociális támogatások',
    icon: 'fas fa-heart',
    color: '#ec4899',
  },
  {
    id: 'grants',
    name: 'Pályázatok és támogatások',
    description: 'EU pályázatok, önkormányzati támogatások, civil szervezetek',
    icon: 'fas fa-euro-sign',
    color: '#059669',
  },
  {
    id: 'transparency',
    name: 'Átláthatóság és korrupció',
    description: 'Közpénzek felhasználása, beszerzések, átláthatóság',
    icon: 'fas fa-balance-scale',
    color: '#dc2626',
  },
  {
    id: 'other',
    name: 'Egyéb probléma',
    description: 'Minden más önkormányzati ügy',
    icon: 'fas fa-question-circle',
    color: '#8b5cf6',
  }
];

interface SliderCategorySelectorProps {
  selectedCategoryId?: string;
  onCategoryChange: (categoryId: string) => void;
  error?: string;
}

export function SliderCategorySelector({
  selectedCategoryId,
  onCategoryChange,
  error
}: SliderCategorySelectorProps) {
  const selectedCategory = SLIDER_CATEGORIES.find(c => c.id === selectedCategoryId);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Kategória *
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SLIDER_CATEGORIES.map((category) => {
          const isSelected = selectedCategoryId === category.id;

          return (
            <div
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`
                p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                ${isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md scale-105'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                }
              `}
              style={isSelected ? { borderColor: category.color } : {}}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: category.color }}
                  >
                    <i className={category.icon}></i>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {category.name}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {category.description}
                  </p>
                </div>
                {isSelected && (
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5" style={{ color: category.color }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {selectedCategory && (
        <div
          className="mt-3 p-3 rounded-lg border-2"
          style={{
            borderColor: selectedCategory.color,
            backgroundColor: `${selectedCategory.color}10`
          }}
        >
          <p className="text-sm font-medium" style={{ color: selectedCategory.color }}>
            ✓ Kiválasztott kategória: {selectedCategory.name}
          </p>
        </div>
      )}
    </div>
  );
}
