'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { IssueCategory } from '@/types/issues';
import IssuesCategorySlider from './IssuesCategorySlider';
import DynamicIssueForm from './DynamicIssueForm';
import { useThemeColors } from '@/context/ThemeContext';

interface IssueReportingFlowProps {
  onFormSubmit?: (trackingNumber: string) => void;
}

export default function IssueReportingFlow({ onFormSubmit }: IssueReportingFlowProps) {
  const { data: session, status } = useSession();
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    trackingNumber?: string;
    message?: string;
  } | null>(null);
  const themeColors = useThemeColors();

  // Loading állapot
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: themeColors.gradientFrom }}></div>
      </div>
    );
  }

  // Ha nincs bejelentkezve
  if (status === 'unauthenticated') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: `${themeColors.gradientFrom}20` }}
          >
            <i className="fas fa-user-lock text-3xl" style={{ color: themeColors.gradientFrom }}></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Bejelentkezés szükséges
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
            A problémák bejelentéséhez regisztrációra és bejelentkezésre van szükség. 
            Ez biztosítja a bejelentések nyomon követhetőségét és a visszajelzések eljuttatását.
          </p>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Miért szükséges a regisztráció?
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 text-left space-y-1">
              <li>• Személyes tracking szám a bejelentésekhez</li>
              <li>• Email értesítések a státusz változásokról</li>
              <li>• Visszajelzés lehetősége a megoldásokról</li>
              <li>• Korábbi bejelentések nyomon követése</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/login"
              className="px-8 py-3 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
              style={{
                backgroundColor: themeColors.gradientFrom,
                boxShadow: `0 4px 16px ${themeColors.gradientFrom}30`
              }}
            >
              Bejelentkezés
            </a>
            <a
              href="/login"
              className="px-8 py-3 rounded-full transition-all duration-300 hover:scale-105"
              style={{
                border: `2px solid ${themeColors.gradientFrom}`,
                color: themeColors.gradientFrom,
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = themeColors.gradientFrom;
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = themeColors.gradientFrom;
              }}
            >
              Regisztráció
            </a>
          </div>
        </div>
      </div>
    );
  }

  const handleCategorySelect = (category: IssueCategory) => {
    setSelectedCategory(category);
    setSubmitResult(null); // Reset previous results
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSubmitResult(null);
  };

  const handleFormSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/issues/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          categoryId: selectedCategory?.id,
          // A bejelentkezett felhasználó adatait automatikusan használjuk
          reporterName: session?.user?.name || formData.reporterName,
          reporterEmail: session?.user?.email || formData.reporterEmail,
        }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setSubmitResult({
          success: true,
          trackingNumber: result.trackingNumber,
          message: result.message
        });
        onFormSubmit?.(result.trackingNumber);
      } else {
        setSubmitResult({
          success: false,
          message: result.error || 'Hiba történt a bejelentés küldése során.'
        });
      }
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitResult({
        success: false,
        message: 'Hálózati hiba történt. Kérjük, próbálja újra később.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitResult) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
        {submitResult.success ? (
          // Sikeres bejelentés
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-check-circle text-3xl text-green-500"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Bejelentés sikeresen elküldve!
            </h2>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 mb-6">
              <p className="text-green-800 dark:text-green-200 font-semibold mb-2">
                Tracking szám:
              </p>
              <div 
                className="text-2xl font-mono font-bold p-3 rounded-md border-2 border-dashed"
                style={{ 
                  borderColor: themeColors.gradientFrom,
                  color: themeColors.gradientFrom 
                }}
              >
                {submitResult.trackingNumber}
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Köszönjük a bejelentését! Email értesítést küldtünk a megadott címre a visszaigazolással.
              A tracking számmal bármikor nyomon követheti a bejelentés állapotát.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleBackToCategories}
                className="px-6 py-3 rounded-full border-2 transition-all duration-300 hover:scale-105"
                style={{
                  borderColor: themeColors.gradientFrom,
                  color: themeColors.gradientFrom,
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = themeColors.gradientFrom;
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = themeColors.gradientFrom;
                }}
              >
                Új bejelentés
              </button>
              <a
                href="/nyomkovetes"
                className="px-6 py-3 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                style={{
                  backgroundColor: themeColors.gradientFrom,
                  boxShadow: `0 4px 16px ${themeColors.gradientFrom}30`
                }}
              >
                Nyomonkövetés
              </a>
            </div>
          </div>
        ) : (
          // Hiba esetén
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-exclamation-triangle text-3xl text-red-500"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Hiba történt
            </h2>
            <p className="text-red-600 dark:text-red-400 mb-6">
              {submitResult.message}
            </p>
            <button
              onClick={() => setSubmitResult(null)}
              className="px-6 py-3 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105"
              style={{ backgroundColor: themeColors.gradientFrom }}
            >
              Próbálja újra
            </button>
          </div>
        )}
      </div>
    );
  }

  if (selectedCategory) {
    return (
      <div className="space-y-6">
        {/* Vissza gomb */}
        <div className="flex items-center">
          <button
            onClick={handleBackToCategories}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Vissza a kategóriákhoz
          </button>
        </div>

        {/* Kiválasztott kategória info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center mr-3 text-white text-sm"
              style={{ backgroundColor: selectedCategory.color }}
            >
              <i className={selectedCategory.icon}></i>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                {selectedCategory.name}
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {selectedCategory.description}
              </p>
            </div>
          </div>
        </div>

        {/* Űrlap */}
        <DynamicIssueForm
          category={selectedCategory}
          onSubmit={handleFormSubmit}
          onBack={() => setSelectedCategory(null)}
          isSubmitting={isSubmitting}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Bevezető szöveg */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Közösségi problémák bejelentése
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Segítsen javítani városrészünket! Jelentse be az Ön által észlelt problémákat,
          és mi gondoskodunk arról, hogy az illetékes hatóságokhoz eljusson a bejelentés.
        </p>
      </div>

      {/* Kategória slider */}
      <IssuesCategorySlider
        onCategorySelect={handleCategorySelect}
        selectedCategory={selectedCategory}
      />

      {/* Jellemzők */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="text-center p-6">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-white"
            style={{ backgroundColor: themeColors.gradientFrom }}
          >
            <i className="fas fa-clock text-xl"></i>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Gyors bejelentés
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Néhány kattintással leadhatja bejelentését
          </p>
        </div>

        <div className="text-center p-6">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-white"
            style={{ backgroundColor: themeColors.gradientTo }}
          >
            <i className="fas fa-search text-xl"></i>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Nyomonkövetés
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Kövesse nyomon bejelentése állapotát
          </p>
        </div>

        <div className="text-center p-6">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-white"
            style={{ backgroundColor: `${themeColors.gradientFrom}cc` }}
          >
            <i className="fas fa-bell text-xl"></i>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Automatikus értesítés
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Email értesítést kap a státusz változásokról
          </p>
        </div>
      </div>
    </div>
  );
}