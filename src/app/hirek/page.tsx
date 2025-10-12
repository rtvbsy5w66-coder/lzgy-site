// src/app/hirek/page.tsx
"use client";
import HirekSzekcio from "@/components/HirekSzekcio";
import { useThemeColors } from "@/context/ThemeContext";

export default function HirekOldal() {
  const themeColors = useThemeColors('NEWS');
  
  return (
    // ELTÁVOLÍTVA: Saját main wrapper
    // MainLayout automatikusan biztosítja a struktúrát
    <div className="min-h-screen -mx-4 -mt-24 md:-mt-28">
      {/* Hero Section - Theme Integrated */}
      <div
        className="relative pt-24 md:pt-28 transition-colors duration-300"
        style={{ background: themeColors.gradient }}
      >
        <div className="absolute inset-0 bg-grid-white/[0.1] bg-[size:20px_20px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 
              className="text-4xl md:text-6xl font-bold mb-4 transition-colors duration-300"
              style={{ color: themeColors.accent }}
            >
              Hírek
            </h1>
            <p 
              className="text-xl max-w-2xl mx-auto transition-colors duration-300"
              style={{ color: `${themeColors.accent}cc` }}
            >
              Legfrissebb hírek és események a kampányból
            </p>
          </div>
        </div>

        {/* HirekSzekcio komponens */}
        <HirekSzekcio />
      </div>
    </div>
  );
}
