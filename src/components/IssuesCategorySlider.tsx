'use client';

import React, { useState, useEffect } from 'react';
import { IssueCategory } from '@/types/issues';
import { useThemeColors } from '@/context/ThemeContext';

interface IssuesCategorySliderProps {
  onCategorySelect: (category: IssueCategory) => void;
  selectedCategory: IssueCategory | null;
}

// Alapértelmezett kategóriák (később adminból töltjük)
const defaultCategories: IssueCategory[] = [
  {
    id: 'roads',
    name: 'Úthibák és járdák',
    description: 'Útburkolat károk, járdahibák, kátyúk',
    icon: 'fas fa-road',
    color: '#ef4444',
    isActive: true,
    order: 1,
    formFields: [
      {
        id: 'street',
        type: 'text',
        label: 'Utca és házszám',
        required: true,
        placeholder: 'pl. Váci utca 10.'
      },
      {
        id: 'damage_type',
        type: 'select',
        label: 'Károsodás típusa',
        required: true,
        options: ['Kátyú', 'Repedés', 'Járda süllyedés', 'Hiányzó kövezet', 'Egyéb']
      },
      {
        id: 'severity',
        type: 'radio',
        label: 'Sürgősség',
        required: true,
        options: ['Alacsony', 'Közepes', 'Magas', 'Sürgős']
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'lighting',
    name: 'Közvilágítás',
    description: 'Utcai világítás hibák, kiégett lámpák',
    icon: 'fas fa-lightbulb',
    color: '#f59e0b',
    isActive: true,
    order: 2,
    formFields: [
      {
        id: 'location',
        type: 'text',
        label: 'Pontos helyszín',
        required: true,
        placeholder: 'pl. Fő tér 5. előtt'
      },
      {
        id: 'issue_type',
        type: 'select',
        label: 'Probléma típusa',
        required: true,
        options: ['Kiégett lámpa', 'Villogó fény', 'Nem világít', 'Fizikai sérülés', 'Egyéb']
      },
      {
        id: 'lamp_count',
        type: 'number',
        label: 'Érintett lámpák száma',
        required: false
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'parks',
    name: 'Parkok és zöldterületek',
    description: 'Park karbantartás, játszóterek, növényzet',
    icon: 'fas fa-tree',
    color: '#10b981',
    isActive: true,
    order: 3,
    formFields: [
      {
        id: 'park_name',
        type: 'text',
        label: 'Park neve',
        required: true,
        placeholder: 'pl. Szabadság tér'
      },
      {
        id: 'issue_area',
        type: 'select',
        label: 'Érintett terület',
        required: true,
        options: ['Játszótér', 'Padok', 'Növényzet', 'Világítás', 'Járda', 'Szemét', 'Egyéb']
      },
      {
        id: 'description_detailed',
        type: 'textarea',
        label: 'Részletes leírás',
        required: true,
        placeholder: 'Kérjük, írja le részletesen a problémát...'
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'waste',
    name: 'Hulladékkezelés',
    description: 'Szemétszállítás, konténerek, illegális lerakás',
    icon: 'fas fa-trash',
    color: '#6b7280',
    isActive: true,
    order: 4,
    formFields: [
      {
        id: 'waste_location',
        type: 'text',
        label: 'Helyszín megadása',
        required: true,
        placeholder: 'pl. Petőfi utca 15. mögött'
      },
      {
        id: 'waste_type',
        type: 'select',
        label: 'Hulladék típusa',
        required: true,
        options: ['Háztartási hulladék', 'Építési törmelék', 'Zöldhulladék', 'Veszélyes hulladék', 'Egyéb']
      },
      {
        id: 'container_issue',
        type: 'checkbox',
        label: 'Konténer probléma',
        options: ['Túltelített', 'Sérült', 'Hiányzik', 'Rossz helyen áll']
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'traffic',
    name: 'Közlekedés',
    description: 'KRESZ táblák, zebra, parkolás, dugók',
    icon: 'fas fa-traffic-light',
    color: '#3b82f6',
    isActive: true,
    order: 5,
    formFields: [
      {
        id: 'traffic_location',
        type: 'text',
        label: 'Kereszteződés vagy utca',
        required: true,
        placeholder: 'pl. Rákóczi út - Múzeum krt. sarok'
      },
      {
        id: 'traffic_issue',
        type: 'select',
        label: 'Közlekedési probléma',
        required: true,
        options: ['Hibás tábla', 'Kopott zebracsík', 'Parkolási probléma', 'Dugó okozó', 'Bicikliút hiba', 'Egyéb']
      },
      {
        id: 'peak_time',
        type: 'text',
        label: 'Mikor a legrosszabb?',
        required: false,
        placeholder: 'pl. reggeli csúcsidőben'
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'noise',
    name: 'Zajszennyezés',
    description: 'Túlzott zaj, építkezési zajok',
    icon: 'fas fa-volume-up',
    color: '#f97316',
    isActive: true,
    order: 6,
    formFields: [
      {
        id: 'noise_source',
        type: 'text',
        label: 'Zaj forrása',
        required: true,
        placeholder: 'pl. Építkezés, vendéglő, közlekedés'
      },
      {
        id: 'noise_time',
        type: 'select',
        label: 'Mikor jelentkezik?',
        required: true,
        options: ['Hajnalban', 'Reggel', 'Napközben', 'Este', 'Éjszaka', 'Hétvégén', 'Folyamatosan']
      },
      {
        id: 'noise_level',
        type: 'radio',
        label: 'Zaj intenzitása',
        required: true,
        options: ['Enyhe', 'Zavaró', 'Erős', 'Elviselhetetlen']
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'other',
    name: 'Egyéb probléma',
    description: 'Minden más önkormányzati ügy',
    icon: 'fas fa-question-circle',
    color: '#8b5cf6',
    isActive: true,
    order: 7,
    formFields: [
      {
        id: 'custom_title',
        type: 'text',
        label: 'Probléma címe',
        required: true,
        placeholder: 'Röviden foglalja össze a problémát'
      },
      {
        id: 'custom_description',
        type: 'textarea',
        label: 'Részletes leírás',
        required: true,
        placeholder: 'Kérjük, írja le részletesen a problémát, helyszínt, és mit szeretne kérni...'
      },
      {
        id: 'urgency_reason',
        type: 'textarea',
        label: 'Sürgősség indoklása',
        required: false,
        placeholder: 'Ha sürgős, kérjük indokolja miért...'
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default function IssuesCategorySlider({ onCategorySelect, selectedCategory }: IssuesCategorySliderProps) {
  const [categories, setCategories] = useState<IssueCategory[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const themeColors = useThemeColors();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      // API hívás a kategóriákért (később implementáljuk)
      // const response = await fetch('/api/issues/categories');
      // const data = await response.json();
      // setCategories(data.categories);
      
      // Egyelőre alapértelmezett kategóriák
      setCategories(defaultCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories(defaultCategories);
    } finally {
      setIsLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % categories.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + categories.length) % categories.length);
  };

  const selectCategory = (category: IssueCategory) => {
    onCategorySelect(category);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Nincsenek elérhető kategóriák.</p>
      </div>
    );
  }

  const currentCategory = categories[currentIndex];

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Milyen problémával találkozott?
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Válassza ki az alábbi kategóriák közül, ami a legjobban leírja a problémáját
        </p>
      </div>

      {/* Category Slider */}
      <div className="relative">
        {/* Main Category Card */}
        <div 
          className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-lg p-8 text-center border-2 transition-all duration-300 hover:shadow-lg"
          style={{
            borderColor: currentCategory.color || themeColors.gradientFrom,
            boxShadow: `0 4px 20px ${currentCategory.color || themeColors.gradientFrom}20`
          }}
        >
          {/* Icon */}
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl"
            style={{ backgroundColor: currentCategory.color || themeColors.gradientFrom }}
          >
            <i className={currentCategory.icon || 'fas fa-question-circle'}></i>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {currentCategory.name}
          </h3>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {currentCategory.description}
          </p>

          {/* Select Button */}
          <button
            onClick={() => selectCategory(currentCategory)}
            className="px-8 py-3 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style={{
              backgroundColor: currentCategory.color || themeColors.gradientFrom,
              boxShadow: `0 4px 16px ${currentCategory.color || themeColors.gradientFrom}30`
            }}
          >
            Ezt választom
          </button>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white dark:bg-gray-700 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-600"
        >
          <i className="fas fa-chevron-left text-gray-600 dark:text-gray-300"></i>
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white dark:bg-gray-700 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-600"
        >
          <i className="fas fa-chevron-right text-gray-600 dark:text-gray-300"></i>
        </button>
      </div>

      {/* Indicators */}
      <div className="flex justify-center mt-6 space-x-2">
        {categories.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'scale-125' 
                : 'hover:scale-110'
            }`}
            style={{
              backgroundColor: index === currentIndex 
                ? (currentCategory.color || themeColors.gradientFrom)
                : '#d1d5db'
            }}
          />
        ))}
      </div>

      {/* Category Counter */}
      <div className="text-center mt-4">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {currentIndex + 1} / {categories.length} kategória
        </span>
      </div>

      {/* Selected Category Info */}
      {selectedCategory && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
          <div className="flex items-center">
            <i className="fas fa-check-circle text-green-500 mr-2"></i>
            <span className="font-semibold text-green-700 dark:text-green-300">
              Kiválasztva: {selectedCategory.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}