"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useThemeColors } from "@/context/ThemeContext";

export default function RolamPage() {
  const themeColors = useThemeColors();
  const isDarkMode = themeColors.mode === 'dark';

  return (
    // ELTÁVOLÍTVA: <NavBar /> - MainLayout automatikusan hozzáadja
    <div className="min-h-screen -mx-4 -mt-24 md:-mt-28">
      {/* Hero Section - Global Theme Integration */}
      <div 
        className="relative pt-24 md:pt-28 transition-colors duration-300"
        style={{
          background: themeColors.gradient
        }}
      >
        <div className="absolute inset-0 bg-grid-white/[0.1] bg-[size:20px_20px]" />
        <div className="max-w-7xl mx-auto px-4 py-24">
          <div className="text-center relative z-10">
            <h1 
              className="text-5xl md:text-7xl font-bold mb-8 transition-colors duration-300"
              style={{ color: themeColors.accent }}
            >
              Rólam
            </h1>
            <p 
              className="mt-6 text-xl max-w-3xl mx-auto transition-colors duration-300"
              style={{ color: `${themeColors.accent}cc` }}
            >
              Elkötelezett vagyok egy jobb, élhetőbb és igazságosabb
              Magyarország megteremtése mellett
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Modern Card Layout */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mission Section - Card Style */}
          <div 
            className="p-8 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] space-y-6"
            style={{
              backgroundColor: isDarkMode ? `${themeColors.gradientFrom}15` : `${themeColors.gradientFrom}08`,
              border: `2px solid ${themeColors.gradientFrom}30`,
              boxShadow: `0 20px 25px -5px ${themeColors.gradientFrom}20`
            }}
          >
            <h2 
              className="text-3xl font-bold transition-colors duration-300"
              style={{ color: themeColors.gradientFrom }}
            >
              Célkitűzéseim
            </h2>
            <p 
              className="leading-relaxed transition-colors duration-300"
              style={{ color: isDarkMode ? themeColors.text : `${themeColors.text}dd` }}
            >
              Politikusként és közéleti személyiségként célom, hogy olyan
              változásokat érjek el, amelyek valódi javulást hoznak az emberek
              mindennapi életében. Hiszek abban, hogy a szakértelem és az
              őszinte párbeszéd útján érhetünk el tartós eredményeket.
            </p>

            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 rounded-lg transition-all duration-300 hover:bg-white/10">
                <ChevronRight 
                  className="w-5 h-5 mt-1 flex-shrink-0 transition-colors duration-300" 
                  style={{ color: themeColors.gradientFrom }}
                />
                <span style={{ color: isDarkMode ? themeColors.text : `${themeColors.text}dd` }}>
                  <strong style={{ color: themeColors.gradientFrom }}>
                    Átlátható és hatékony közigazgatás:
                  </strong>{" "}
                  Modern digitális megoldások bevezetése
                </span>
              </div>

              <div className="flex items-start space-x-3 p-4 rounded-lg transition-all duration-300 hover:bg-white/10">
                <ChevronRight 
                  className="w-5 h-5 mt-1 flex-shrink-0 transition-colors duration-300" 
                  style={{ color: themeColors.gradientFrom }}
                />
                <span style={{ color: isDarkMode ? themeColors.text : `${themeColors.text}dd` }}>
                  <strong style={{ color: themeColors.gradientFrom }}>
                    Fenntartható fejlődés:
                  </strong>{" "}
                  Környezettudatos és gazdaságilag fenntartható politikák
                </span>
              </div>

              <div className="flex items-start space-x-3 p-4 rounded-lg transition-all duration-300 hover:bg-white/10">
                <ChevronRight 
                  className="w-5 h-5 mt-1 flex-shrink-0 transition-colors duration-300" 
                  style={{ color: themeColors.gradientFrom }}
                />
                <span style={{ color: isDarkMode ? themeColors.text : `${themeColors.text}dd` }}>
                  <strong style={{ color: themeColors.gradientFrom }}>
                    Társadalmi kohézió:
                  </strong>{" "}
                  Minden réteg számára elérhető lehetőségek teremtése
                </span>
              </div>
            </div>
          </div>

          {/* Values Section - Card Style */}
          <div 
            className="p-8 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] space-y-6"
            style={{
              backgroundColor: isDarkMode ? `${themeColors.gradientTo}15` : `${themeColors.gradientTo}08`,
              border: `2px solid ${themeColors.gradientTo}30`,
              boxShadow: `0 20px 25px -5px ${themeColors.gradientTo}20`
            }}
          >
            <h2 
              className="text-3xl font-bold transition-colors duration-300"
              style={{ color: themeColors.gradientTo }}
            >
              Alapértékeim
            </h2>

            <div className="space-y-8">
              <div className="p-6 rounded-xl transition-all duration-300 hover:bg-white/10">
                <h3 
                  className="text-xl font-semibold mb-3 transition-colors duration-300"
                  style={{ color: themeColors.gradientTo }}
                >
                  Tisztesség
                </h3>
                <p 
                  className="leading-relaxed transition-colors duration-300"
                  style={{ color: isDarkMode ? themeColors.text : `${themeColors.text}dd` }}
                >
                  Munkám során az átláthatóság és a nyílt kommunikáció vezérel.
                  Hiszek abban, hogy a választóknak joguk van tudni, hogyan és
                  miért hozom meg a döntéseimet.
                </p>
              </div>

              <div className="p-6 rounded-xl transition-all duration-300 hover:bg-white/10">
                <h3 
                  className="text-xl font-semibold mb-3 transition-colors duration-300"
                  style={{ color: themeColors.gradientTo }}
                >
                  Szakértelem
                </h3>
                <p 
                  className="leading-relaxed transition-colors duration-300"
                  style={{ color: isDarkMode ? themeColors.text : `${themeColors.text}dd` }}
                >
                  Csak olyan területeken vállalok szerepet, ahol megfelelő
                  ismeretekkel rendelkezem, vagy ahol hajlandó vagyok
                  szakértőktől tanulni.
                </p>
              </div>

              <div className="p-6 rounded-xl transition-all duration-300 hover:bg-white/10">
                <h3 
                  className="text-xl font-semibold mb-3 transition-colors duration-300"
                  style={{ color: themeColors.gradientTo }}
                >
                  Szolgálat
                </h3>
                <p 
                  className="leading-relaxed transition-colors duration-300"
                  style={{ color: isDarkMode ? themeColors.text : `${themeColors.text}dd` }}
                >
                  A politika számomra szolgálat - a közösség szolgálata. Minden
                  döntésnél az a kérdés vezérel: ez jó-e az embereknek?
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action Section - Theme Integrated */}
        <div 
          className="mt-16 rounded-2xl p-8 text-center shadow-2xl transition-all duration-300 hover:shadow-3xl"
          style={{
            background: `linear-gradient(135deg, ${themeColors.gradientFrom}15 0%, ${themeColors.gradientTo}15 100%)`,
            border: `2px solid ${themeColors.gradientFrom}20`,
            boxShadow: `0 25px 30px -5px ${themeColors.gradientFrom}25`
          }}
        >
          <h2 
            className="text-2xl md:text-3xl font-bold mb-4 transition-colors duration-300"
            style={{ color: isDarkMode ? themeColors.gradientFrom : themeColors.gradientTo }}
          >
            Együtt alakíthatjuk jövőnket
          </h2>
          <p 
            className="mb-8 max-w-2xl mx-auto transition-colors duration-300"
            style={{ color: isDarkMode ? themeColors.text : `${themeColors.text}dd` }}
          >
            Ha osztod az értékeimet és támogatnád a munkámat, várom a
            kapcsolatfelvételt. Minden vélemény és ötlet fontos számomra.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/kapcsolat"
              className="px-8 py-3 text-white rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-semibold"
              style={{
                background: themeColors.gradient,
                boxShadow: `0 8px 16px ${themeColors.gradientFrom}30`
              }}
            >
              Kapcsolatfelvétel
            </Link>
            <Link
              href="/program"
              className="px-8 py-3 rounded-full transition-all duration-300 font-semibold hover:shadow-lg transform hover:scale-105"
              style={{
                border: `2px solid ${themeColors.gradientTo}`,
                color: themeColors.gradientTo,
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = themeColors.gradientTo;
                e.currentTarget.style.color = themeColors.accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = themeColors.gradientTo;
              }}
            >
              Program megtekintése
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
