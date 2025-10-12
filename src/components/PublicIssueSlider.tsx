'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { IssueCategory } from '@/types/issues';
import { useThemeColors } from '@/context/ThemeContext';

interface PublicIssueSliderProps {
  onCategorySelect: (category: IssueCategory) => void;
}

// Alapértelmezett kategóriák (ugyanazok mint korábban)
const defaultCategories: IssueCategory[] = [
  {
    id: 'roads',
    name: 'Úthibák és járdák',
    description: 'Útburkolat károk, járdahibák, kátyúk',
    icon: 'fas fa-road',
    color: '#ef4444',
    isActive: true,
    order: 1,
    formFields: [],
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
    formFields: [],
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
    formFields: [],
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
    formFields: [],
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
    formFields: [],
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
    formFields: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'social',
    name: 'Szociális ügyek',
    description: 'Idősellátás, családsegítés, szociális támogatások',
    icon: 'fas fa-heart',
    color: '#ec4899',
    isActive: true,
    order: 7,
    formFields: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'grants',
    name: 'Pályázatok és támogatások',
    description: 'EU pályázatok, önkormányzati támogatások, civil szervezetek',
    icon: 'fas fa-euro-sign',
    color: '#059669',
    isActive: true,
    order: 8,
    formFields: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'transparency',
    name: 'Átláthatóság és korrupció',
    description: 'Közpénzek felhasználása, beszerzések, átláthatóság',
    icon: 'fas fa-balance-scale',
    color: '#dc2626',
    isActive: true,
    order: 9,
    formFields: [],
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
    order: 10,
    formFields: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default function PublicIssueSlider({ onCategorySelect }: PublicIssueSliderProps) {
  const { data: session, status } = useSession();
  const [categories, setCategories] = useState<IssueCategory[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState('from-top');
  const [autoPlay, setAutoPlay] = useState(true);
  const themeColors = useThemeColors();

  // Random direction generator
  const getRandomDirection = () => {
    const directions = [
      'from-top',      // felülről
      'from-bottom',   // alulról
      'from-left',     // balról
      'from-right',    // jobbról
      'from-top-left', // bal felső sarokból
      'from-top-right',// jobb felső sarokból
      'from-bottom-left', // bal alsó sarokból
      'from-bottom-right' // jobb alsó sarokból
    ];
    return directions[Math.floor(Math.random() * directions.length)];
  };

  useEffect(() => {
    setCategories(defaultCategories);
  }, []);

  const nextSlide = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setAnimationDirection(getRandomDirection());
    
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % categories.length);
      setTimeout(() => {
        setIsAnimating(false);
      }, 100);
    }, 300);
  }, [isAnimating, categories.length]);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || categories.length === 0) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 2500); // 2.5 másodpercenként vált - gyorsabb

    return () => clearInterval(interval);
  }, [currentIndex, autoPlay, categories.length, nextSlide]);

  const prevSlide = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setAnimationDirection(getRandomDirection());
    
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + categories.length) % categories.length);
      setTimeout(() => {
        setIsAnimating(false);
      }, 100);
    }, 300);
  };

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentIndex) return;
    
    setIsAnimating(true);
    setAnimationDirection(getRandomDirection());
    
    setTimeout(() => {
      setCurrentIndex(index);
      setTimeout(() => {
        setIsAnimating(false);
      }, 100);
    }, 300);
  };

  const handleCategoryClick = (category: IssueCategory) => {
    // Pass category ID and name to bejelentes page
    window.location.href = `/bejelentes?categoryId=${category.id}&categoryName=${encodeURIComponent(category.name)}`;
    onCategorySelect(category);
  };

  if (categories.length === 0) return null;

  const currentCategory = categories[currentIndex];

  // Animation CSS classes based on direction
  const getAnimationClasses = () => {
    if (!isAnimating) return 'transition-all duration-700 ease-out';
    
    const baseClasses = 'transition-all duration-300 ease-in';
    
    switch (animationDirection) {
      case 'from-top':
        return `${baseClasses} transform -translate-y-full opacity-0`;
      case 'from-bottom':
        return `${baseClasses} transform translate-y-full opacity-0`;
      case 'from-left':
        return `${baseClasses} transform -translate-x-full opacity-0`;
      case 'from-right':
        return `${baseClasses} transform translate-x-full opacity-0`;
      case 'from-top-left':
        return `${baseClasses} transform -translate-x-full -translate-y-full opacity-0 rotate-12`;
      case 'from-top-right':
        return `${baseClasses} transform translate-x-full -translate-y-full opacity-0 -rotate-12`;
      case 'from-bottom-left':
        return `${baseClasses} transform -translate-x-full translate-y-full opacity-0 -rotate-12`;
      case 'from-bottom-right':
        return `${baseClasses} transform translate-x-full translate-y-full opacity-0 rotate-12`;
      default:
        return baseClasses;
    }
  };

  // Sokkal több emoji kategóriánként
  const getCategoryEmojis = (categoryId: string) => {
    const emojiSets = {
      'roads': ['🚧', '🛣️', '⚠️', '🚗', '🏗️', '🚛', '⛏️', '🔨', '🪓', '🚜', '🏁', '🛤️'],
      'lighting': ['💡', '🌟', '⭐', '🔦', '💫', '✨', '🔆', '☀️', '🌞', '💡', '🕯️', '🔥'],
      'parks': ['🌳', '🌿', '🌺', '🦋', '🐦', '🌲', '🌱', '🌸', '🌹', '🦜', '🐿️', '🍃', '🌻', '🌷'],
      'waste': ['🗑️', '♻️', '🧹', '🚮', '🌱', '🧽', '🪣', '💚', '🌍', '♻️', '🗂️', '🧴'],
      'traffic': ['🚦', '🚙', '🚌', '🛑', '📍', '🚕', '🏎️', '🚓', '🚑', '🚒', '🚐', '⛽', '🛣️'],
      'noise': ['🔊', '🎵', '🔇', '👂', '🎶', '🎧', '📢', '📣', '🔔', '🎤', '🎺', '🥁'],
      'social': ['❤️', '👥', '👴', '👵', '👶', '🤱', '🏠', '🍲', '💊', '🩺', '🤝', '👨‍👩‍👧‍👦'],
      'grants': ['💰', '💶', '💴', '📋', '📊', '🎯', '🏆', '📈', '💼', '🌟', '✅', '📝'],
      'transparency': ['⚖️', '🔍', '📄', '💰', '🚨', '⚠️', '📢', '🔓', '👁️', '📊', '🧾', '💸'],
      'other': ['❓', '💭', '🔧', '📝', '💡', '🔍', '📋', '📊', '⚡', '🔔', '💼', '📞']
    };
    return emojiSets[categoryId as keyof typeof emojiSets] || emojiSets['other'];
  };

  // Random mozgási minták generálása
  const getRandomMovementPattern = (index: number) => {
    const patterns = [
      { // Pattern 1: Lebegő kör
        transform: 'translateY(-20px) translateX(10px) rotate(5deg)',
        timing: '4s',
        type: 'ease-in-out'
      },
      { // Pattern 2: Zigzag
        transform: 'translateY(-30px) translateX(-15px) rotate(-8deg)',
        timing: '5s',
        type: 'ease-out'
      },
      { // Pattern 3: Spirál
        transform: 'translateY(-25px) translateX(20px) rotate(12deg)',
        timing: '6s',
        type: 'ease-in'
      },
      { // Pattern 4: Ugrálós
        transform: 'translateY(-40px) translateX(5px) rotate(-3deg)',
        timing: '3.5s',
        type: 'bounce'
      },
      { // Pattern 5: Lassú hinta
        transform: 'translateY(-15px) translateX(-8px) rotate(6deg)',
        timing: '7s',
        type: 'ease-in-out'
      }
    ];
    return patterns[index % patterns.length];
  };

  return (
    <div className="relative" 
         onMouseEnter={() => setAutoPlay(false)}
         onMouseLeave={() => setAutoPlay(true)}>
      <style jsx>{`
        @keyframes float-pattern-1 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.6; }
          25% { transform: translateY(-20px) translateX(10px) rotate(5deg); opacity: 0.9; }
          50% { transform: translateY(-10px) translateX(-5px) rotate(-3deg); opacity: 1; }
          75% { transform: translateY(-30px) translateX(15px) rotate(8deg); opacity: 0.8; }
        }
        @keyframes float-pattern-2 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.7; }
          33% { transform: translateY(-30px) translateX(-15px) rotate(-8deg); opacity: 1; }
          66% { transform: translateY(-5px) translateX(20px) rotate(10deg); opacity: 0.9; }
        }
        @keyframes float-pattern-3 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.5; }
          20% { transform: translateY(-25px) translateX(20px) rotate(12deg); opacity: 0.8; }
          40% { transform: translateY(-40px) translateX(-10px) rotate(-5deg); opacity: 1; }
          60% { transform: translateY(-15px) translateX(25px) rotate(15deg); opacity: 0.9; }
          80% { transform: translateY(-35px) translateX(-20px) rotate(-10deg); opacity: 0.7; }
        }
        @keyframes float-pattern-4 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.8; }
          50% { transform: translateY(-40px) translateX(5px) rotate(-3deg); opacity: 1; }
        }
        @keyframes float-pattern-5 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.6; }
          25% { transform: translateY(-15px) translateX(-8px) rotate(6deg); opacity: 0.9; }
          50% { transform: translateY(-25px) translateX(12px) rotate(-4deg); opacity: 1; }
          75% { transform: translateY(-10px) translateX(-15px) rotate(8deg); opacity: 0.8; }
        }
        .floating-emoji {
          position: absolute;
          font-size: 1.8rem;
          pointer-events: none;
          z-index: 5;
        }
        .pattern-1 { animation: float-pattern-1 4s ease-in-out infinite; }
        .pattern-2 { animation: float-pattern-2 5s ease-out infinite; }
        .pattern-3 { animation: float-pattern-3 6s ease-in infinite; }
        .pattern-4 { animation: float-pattern-4 3.5s ease-in-out infinite; }
        .pattern-5 { animation: float-pattern-5 7s ease-in-out infinite; }
        
        .slide-enter {
          animation: slideIn 0.6s ease-out forwards;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
      {/* Clean V. kerületi header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center px-4 py-2 rounded-lg mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <span className="text-blue-600 dark:text-blue-400 mr-2">🏛️</span>
          <span className="font-semibold text-blue-900 dark:text-blue-100">V. Kerület</span>
          <span className="text-blue-600 dark:text-blue-400 ml-2">🏆</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Problémakategóriák
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Válassza ki az alábbi kategóriák közül, hogy milyen problémát szeretne bejelenteni
        </p>
      </div>

      {/* Clean Slider Design */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        
        {/* Main Category Card */}
        <div className="relative">
          <div 
            className={`rounded-lg p-8 text-center transition-all duration-500 hover:shadow-lg ${getAnimationClasses()} ${!isAnimating ? 'slide-enter' : ''}`}
            style={{
              background: `linear-gradient(135deg, ${currentCategory.color}08, ${currentCategory.color}03)`,
              border: `2px solid ${currentCategory.color}20`
            }}
          >
            
            {/* Floating Emojis - Random Positions & Patterns */}
            {getCategoryEmojis(currentCategory.id).slice(0, 8).map((emoji, index) => {
              const randomPositions = [
                { top: '10%', left: '5%' },
                { top: '15%', left: '85%' },
                { top: '25%', left: '15%' },
                { top: '35%', left: '90%' },
                { top: '45%', left: '8%' },
                { top: '55%', left: '80%' },
                { top: '70%', left: '12%' },
                { top: '80%', left: '85%' }
              ];
              const position = randomPositions[index] || { top: '50%', left: '50%' };
              const pattern = (index % 5) + 1;
              
              return (
                <span
                  key={`${currentCategory.id}-${index}`}
                  className={`floating-emoji pattern-${pattern}`}
                  style={{
                    top: position.top,
                    left: position.left,
                    animationDelay: `${index * 0.8}s`
                  }}
                >
                  {emoji}
                </span>
              );
            })}
            {/* Simple Icon */}
            <div className="mb-6">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto text-white text-2xl shadow-md"
                style={{ backgroundColor: currentCategory.color }}
              >
                <i className={currentCategory.icon}></i>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {currentCategory.name}
            </h3>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {currentCategory.description}
            </p>

            {/* Simple Features */}
            <div className="flex justify-center items-center space-x-6 mb-6 text-sm text-gray-500 dark:text-gray-400">
              <span>✅ Testreszabott űrlap</span>
              <span>📱 Nyomon követhető</span>
              <span>📧 Értesítések</span>
            </div>

            {/* Simple CTA Button */}
            <button
              onClick={() => handleCategoryClick(currentCategory)}
              className="px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:opacity-90 hover:shadow-lg"
              style={{ backgroundColor: currentCategory.color }}
            >
              {status === 'authenticated' ? 'Bejelentés indítása' : 'Bejelentkezés szükséges'}
              <i className="fas fa-arrow-right ml-2"></i>
            </button>

            {status !== 'authenticated' && (
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                <i className="fas fa-info-circle mr-1"></i>
                Bejelentkezés szükséges a bejelentéshez
              </p>
            )}
          </div>
        </div>

        {/* Simple Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-700 rounded-full p-3 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-600"
        >
          <i className="fas fa-chevron-left text-gray-600 dark:text-gray-300"></i>
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-700 rounded-full p-3 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-600"
        >
          <i className="fas fa-chevron-right text-gray-600 dark:text-gray-300"></i>
        </button>
      </div>

      {/* Simple Indicators */}
      <div className="flex justify-center mt-6 space-x-2">
        {categories.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            disabled={isAnimating}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'scale-110' 
                : 'opacity-40 hover:opacity-70'
            }`}
            style={{
              backgroundColor: index === currentIndex 
                ? currentCategory.color
                : '#9ca3af'
            }}
          />
        ))}
      </div>

      {/* Auto-play indicator only */}
      {autoPlay && (
        <div className="text-center mt-4">
          <span className="text-xs text-green-600 dark:text-green-400">
            🔄 Automata váltás • Hover = szünet
          </span>
        </div>
      )}
    </div>
  );
}