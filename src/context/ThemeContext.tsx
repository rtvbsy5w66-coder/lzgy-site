"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeConfig {
  light: {
    bg: string;
    text: string;
    cardBg: string;
    border: string;
    input: string;
  };
  dark: {
    bg: string;
    text: string;
    cardBg: string;
    border: string;
    input: string;
  };
}

interface ActiveTheme {
  id: string;
  name: string;
  fromColor: string;
  toColor: string;
  textColor: string;
  type: string;
  config?: ThemeConfig;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  // New global theme properties
  activeThemes: Record<string, ActiveTheme>;
  globalTheme: ActiveTheme | null;
  isThemeLoading: boolean;
  refreshThemes: () => Promise<void>;
  getThemeConfig: (mode: 'light' | 'dark') => ThemeConfig[keyof ThemeConfig];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Default theme configuration
const DEFAULT_THEME_CONFIG: ThemeConfig = {
  light: {
    bg: "#ffffff",
    text: "#111111", 
    cardBg: "#f9fafb",
    border: "#e5e7eb",
    input: "#ffffff"
  },
  dark: {
    bg: "#0f172a",
    text: "#f1f5f9",
    cardBg: "#1e293b",
    border: "#334155",
    input: "#1e293b"
  }
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);
  
  // Global theme state
  const [activeThemes, setActiveThemes] = useState<Record<string, ActiveTheme>>({});
  const [isThemeLoading, setIsThemeLoading] = useState(true);

  // Global theme functions
  const refreshThemes = async () => {
    try {
      const response = await fetch('/api/themes/active');
      if (!response.ok) {
        console.warn(`[THEME_PROVIDER] API responded with status ${response.status}`);
        // Don't throw here, just use default themes
        setActiveThemes({
          GLOBAL: {
            id: 'default-global',
            name: 'Default Theme',
            fromColor: '#3b82f6',
            toColor: '#1d4ed8',
            textColor: '#ffffff',
            type: 'GLOBAL',
            config: DEFAULT_THEME_CONFIG
          }
        });
        setIsThemeLoading(false);
        return;
      }
      
      const themes = await response.json();
      
      // Ensure themes is an object, handle potential error responses
      if (!themes || typeof themes !== 'object' || themes.error) {
        console.warn('[THEME_PROVIDER] Invalid themes response:', themes);
        // Use default themes instead of empty
        setActiveThemes({
          GLOBAL: {
            id: 'default-global',
            name: 'Default Theme',
            fromColor: '#3b82f6',
            toColor: '#1d4ed8',
            textColor: '#ffffff',
            type: 'GLOBAL',
            config: DEFAULT_THEME_CONFIG
          }
        });
        setIsThemeLoading(false);
        return;
      }
      
      // Parse config from description field (temporary until we add proper config column)
      const processedThemes: Record<string, ActiveTheme> = {};
      
      Object.keys(themes).forEach(type => {
        const themeData = themes[type];
        if (!themeData) return; // Skip null/undefined themes
        
        let config = DEFAULT_THEME_CONFIG;
        
        try {
          // Try to extract config from description
          if (themeData.description && themeData.description.includes('Config:')) {
            const configMatch = themeData.description.match(/Config: (.+)/);
            if (configMatch) {
              config = JSON.parse(configMatch[1]);
            }
          }
        } catch (error) {
          console.warn(`Failed to parse config for theme ${themeData.name}:`, error);
        }
        
        processedThemes[type] = {
          ...themeData,
          config
        };
      });
      
      // If no themes found, add a default global theme
      if (Object.keys(processedThemes).length === 0) {
        processedThemes.GLOBAL = {
          id: 'default-global',
          name: 'Default Theme',
          fromColor: '#3b82f6',
          toColor: '#1d4ed8',
          textColor: '#ffffff',
          type: 'GLOBAL',
          config: DEFAULT_THEME_CONFIG
        };
      }
      
      setActiveThemes(processedThemes);
      console.log('[THEME_PROVIDER] Active themes loaded:', Object.keys(processedThemes));
    } catch (error) {
      console.warn('[THEME_PROVIDER] Failed to fetch active themes:', error);
      // Set default themes on error to prevent crashes
      setActiveThemes({
        GLOBAL: {
          id: 'default-global',
          name: 'Default Theme',
          fromColor: '#3b82f6',
          toColor: '#1d4ed8',
          textColor: '#ffffff',
          type: 'GLOBAL',
          config: DEFAULT_THEME_CONFIG
        }
      });
    } finally {
      setIsThemeLoading(false);
    }
  };

  const getThemeConfig = useCallback((mode: 'light' | 'dark' = 'light') => {
    const globalTheme = activeThemes.GLOBAL;
    if (globalTheme?.config) {
      return globalTheme.config[mode];
    }
    return DEFAULT_THEME_CONFIG[mode];
  }, [activeThemes]);

  // Get current effective theme mode
  const getCurrentMode = useCallback((): 'light' | 'dark' => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  }, [theme]);

  // Első betöltéskor ellenőrizzük a mentett témát és betöltjük a globális témákat
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
    setMounted(true);
    
    // Load global themes
    refreshThemes();
  }, []);

  // Rendszer téma figyelése
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (theme === "system") {
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(
          mediaQuery.matches ? "dark" : "light"
        );
      }
    };

    // Kezdeti beállítás
    handleChange();

    // Figyelő hozzáadása
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, mounted]);

  // Téma váltás kezelése
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  // Apply global theme CSS variables
  useEffect(() => {
    if (!mounted || isThemeLoading) return;

    const currentMode = getCurrentMode();
    const config = getThemeConfig(currentMode);
    const globalTheme = activeThemes.GLOBAL;

    // Apply theme CSS variables
    const root = document.documentElement;
    
    // Basic theme colors
    root.style.setProperty('--theme-bg', config.bg);
    root.style.setProperty('--theme-text', config.text);
    root.style.setProperty('--theme-card-bg', config.cardBg);
    root.style.setProperty('--theme-border', config.border);
    root.style.setProperty('--theme-input', config.input);
    
    // Gradient colors from theme
    if (globalTheme) {
      root.style.setProperty('--theme-gradient-from', globalTheme.fromColor);
      root.style.setProperty('--theme-gradient-to', globalTheme.toColor);
      root.style.setProperty('--theme-accent', globalTheme.textColor);
      
      // Create gradient CSS variable
      root.style.setProperty(
        '--theme-gradient', 
        `linear-gradient(135deg, ${globalTheme.fromColor} 0%, ${globalTheme.toColor} 100%)`
      );
    }

    console.log(`[THEME_PROVIDER] Applied ${currentMode} mode theme:`, config);
  }, [activeThemes, theme, mounted, isThemeLoading, getCurrentMode, getThemeConfig]);

  // Amíg nem töltött be teljesen, ne rendereljünk semmit
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme,
      activeThemes,
      globalTheme: activeThemes.GLOBAL || null,
      isThemeLoading,
      refreshThemes,
      getThemeConfig
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Hook for easy access to theme CSS variables
export function useThemeColors(preferredType?: 'GLOBAL' | 'NEWS' | 'EVENTS' | 'PROGRAM' | 'CATEGORY') {
  const { getThemeConfig, globalTheme, activeThemes, theme } = useTheme();
  
  // Choose the theme to use - prefer specific type if available, fallback to global
  const selectedTheme = preferredType && activeThemes[preferredType] 
    ? activeThemes[preferredType] 
    : globalTheme;
  
  // Determine current mode
  const getCurrentMode = (): 'light' | 'dark' => {
    if (theme === 'system') {
      return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  };
  
  const currentMode = getCurrentMode();
  const config = getThemeConfig(currentMode);
  
  return {
    mode: currentMode,
    bg: config.bg,
    text: config.text,
    cardBg: config.cardBg,
    border: config.border,
    input: config.input,
    gradientFrom: selectedTheme?.fromColor || '#3b82f6',
    gradientTo: selectedTheme?.toColor || '#1d4ed8',
    accent: selectedTheme?.textColor || '#ffffff',
    gradient: `linear-gradient(135deg, ${selectedTheme?.fromColor || '#3b82f6'} 0%, ${selectedTheme?.toColor || '#1d4ed8'} 100%)`
  };
}
