"use client";

import React from "react";
import ContactForm from "@/components/ContactForm";
import PublicIssueSlider from "@/components/PublicIssueSlider";
import { useThemeColors } from "@/context/ThemeContext";

export default function ContactPage() {
  const themeColors = useThemeColors();
  const isDarkMode = themeColors.mode === 'dark';

  return (
    // ELTÁVOLÍTVA: Saját main wrapper és pt-32 hard-coded padding
    // MainLayout automatikusan biztosítja a struktúrát
    <div className="min-h-screen -mx-4 -mt-24 md:-mt-28">
      {/* Issue Categories Slider - Now at the top */}
      <div className="pt-24 md:pt-28 pb-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <PublicIssueSlider
            onCategorySelect={(category) => {
              // A PublicIssueSlider handleCategoryClick már kezeli a redirect-et paraméterekkel!
              // Ez csak egy callback, nem csinálunk semmit
            }}
          />
        </div>
      </div>


      {/* Separator with Info */}
      <div className="bg-white dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
            <div className="px-6">
              <i className="fas fa-envelope text-2xl text-gray-400"></i>
            </div>
            <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Hagyományos Kapcsolatfelvétel
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Általános kérdések, javaslatok vagy egyéb megkeresések esetén használja az alábbi űrlapot.
          </p>
        </div>
      </div>

      {/* Traditional Contact Form Section */}
      <div className="bg-gray-50 dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <ContactForm />
          </div>
        </div>
      </div>

      {/* Contact Info Section */}
      <div className="bg-white dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Email */}
            <div className="text-center">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300 hover:scale-110"
                style={{ backgroundColor: themeColors.gradientFrom }}
              >
                <svg
                  className="w-6 h-6 transition-colors duration-300"
                  style={{ color: themeColors.accent }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Email
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                lovas.zoltan@mindenki.hu
              </p>
            </div>

            {/* Telefon */}
            <div className="text-center">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300 hover:scale-110"
                style={{ backgroundColor: themeColors.gradientTo }}
              >
                <svg
                  className="w-6 h-6 transition-colors duration-300"
                  style={{ color: themeColors.accent }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Telefon
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                +36 30 123 4567
              </p>
            </div>

            {/* Cím */}
            <div className="text-center">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300 hover:scale-110"
                style={{ backgroundColor: `${themeColors.gradientFrom}cc` }}
              >
                <svg
                  className="w-6 h-6 transition-colors duration-300"
                  style={{ color: themeColors.accent }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Iroda
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                1051 Budapest
                <br />
                Nádor utca 20.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action - Now uses dynamic theme gradient */}
      <div className="bg-theme-gradient py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Csatlakozzon hozzánk!
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Támogassa munkánkat és legyen része a változásnak!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/program"
              className="px-8 py-3 rounded-full transition-all duration-300 font-semibold hover:scale-105 hover:shadow-lg"
              style={{
                backgroundColor: themeColors.accent,
                color: themeColors.gradientFrom,
                boxShadow: `0 8px 16px ${themeColors.accent}30`
              }}
            >
              Program megtekintése
            </a>
            <a
              href="/esemenyek"
              className="px-8 py-3 rounded-full transition-all duration-300 hover:scale-105"
              style={{
                border: `2px solid ${themeColors.accent}`,
                color: themeColors.accent,
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = themeColors.accent;
                e.currentTarget.style.color = themeColors.gradientFrom;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = themeColors.accent;
              }}
            >
              Események
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
