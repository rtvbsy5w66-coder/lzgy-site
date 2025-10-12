"use client";

import React, { useState } from 'react';
import { useTheme, useThemeColors } from '@/context/ThemeContext';
import { ThemedInput, ThemedCard, ThemedButton } from '@/components/theme/ThemedInput';
import { Sun, Moon, Monitor, Palette } from 'lucide-react';

export default function ThemeDemoPage() {
  const { theme, setTheme, globalTheme, refreshThemes, isThemeLoading } = useTheme();
  const themeColors = useThemeColors();
  const [demoText, setDemoText] = useState('Hello, themed world!');

  return (
    <div 
      className="min-h-screen py-16 px-4 transition-colors duration-300"
      style={{ backgroundColor: themeColors.bg, color: themeColors.text }}
    >
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">
            🎨 Dynamic Theme System Demo
          </h1>
          <p className="text-lg opacity-80">
            Experience the power of dynamic themes with dark/light mode support
          </p>
          
          {/* Current Theme Info */}
          {globalTheme && (
            <div 
              className="inline-block px-6 py-3 rounded-lg border-2"
              style={{
                background: themeColors.gradient,
                borderColor: themeColors.gradientFrom,
                color: themeColors.accent
              }}
            >
              <div className="flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span className="font-semibold">
                  Active Theme: {globalTheme.name}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Theme Controls */}
        <ThemedCard className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center">
            <Monitor className="w-6 h-6 mr-2" />
            Theme Controls
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Dark/Light Mode</label>
              <div className="flex space-x-2">
                <ThemedButton
                  variant={theme === 'light' ? 'primary' : 'secondary'}
                  onClick={() => setTheme('light')}
                >
                  <Sun className="w-4 h-4 mr-2" />
                  Light
                </ThemedButton>
                <ThemedButton
                  variant={theme === 'dark' ? 'primary' : 'secondary'}
                  onClick={() => setTheme('dark')}
                >
                  <Moon className="w-4 h-4 mr-2" />
                  Dark
                </ThemedButton>
                <ThemedButton
                  variant={theme === 'system' ? 'primary' : 'secondary'}
                  onClick={() => setTheme('system')}
                >
                  <Monitor className="w-4 h-4 mr-2" />
                  System
                </ThemedButton>
              </div>
            </div>

            <div>
              <ThemedButton
                onClick={refreshThemes}
                disabled={isThemeLoading}

              >
                {isThemeLoading ? 'Loading...' : '🔄 Refresh Themes'}
              </ThemedButton>
            </div>
          </div>
        </ThemedCard>

        {/* Form Demo */}
        <ThemedCard className="space-y-6">
          <h2 className="text-2xl font-bold">📝 Themed Form Components</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ThemedInput
              label="Your Name"
              placeholder="Enter your name"
              value={demoText}
              onChange={(e) => setDemoText(e.target.value)}
            />
            
            <ThemedInput
              label="Email Address"
              type="email"
              placeholder="your.email@example.com"
            />
            
            <ThemedInput
              label="Phone Number"
              type="tel"
              placeholder="+36 30 123 4567"
            />
            
            <ThemedInput
              label="Message"
              placeholder="Your message here..."
            />
          </div>

          <div className="flex space-x-4">
            <ThemedButton>
              Submit Form
            </ThemedButton>
            <ThemedButton>
              Reset
            </ThemedButton>
          </div>
        </ThemedCard>

        {/* Color Palette Display */}
        <ThemedCard className="space-y-6">
          <h2 className="text-2xl font-bold">🎨 Current Theme Colors</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div 
                className="w-full h-16 rounded border"
                style={{ backgroundColor: themeColors.bg, borderColor: themeColors.border }}
              />
              <div className="text-sm">
                <div className="font-medium">Background</div>
                <code className="text-xs opacity-75">{themeColors.bg}</code>
              </div>
            </div>
            
            <div className="space-y-2">
              <div 
                className="w-full h-16 rounded border"
                style={{ backgroundColor: themeColors.cardBg, borderColor: themeColors.border }}
              />
              <div className="text-sm">
                <div className="font-medium">Card Background</div>
                <code className="text-xs opacity-75">{themeColors.cardBg}</code>
              </div>
            </div>
            
            <div className="space-y-2">
              <div 
                className="w-full h-16 rounded border"
                style={{ backgroundColor: themeColors.gradientFrom, borderColor: themeColors.border }}
              />
              <div className="text-sm">
                <div className="font-medium">Gradient From</div>
                <code className="text-xs opacity-75">{themeColors.gradientFrom}</code>
              </div>
            </div>
            
            <div className="space-y-2">
              <div 
                className="w-full h-16 rounded border"
                style={{ backgroundColor: themeColors.gradientTo, borderColor: themeColors.border }}
              />
              <div className="text-sm">
                <div className="font-medium">Gradient To</div>
                <code className="text-xs opacity-75">{themeColors.gradientTo}</code>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-sm font-medium mb-2">Current Mode: 
              <span className="ml-2 px-2 py-1 rounded bg-opacity-20" 
                    style={{ backgroundColor: themeColors.gradientFrom }}>
                {themeColors.mode}
              </span>
            </div>
          </div>
        </ThemedCard>

        {/* Gradient Showcase */}
        <ThemedCard className="space-y-6">
          <h2 className="text-2xl font-bold">✨ Dynamic Gradient Showcase</h2>
          
          <div className="space-y-4">
            <div 
              className="h-32 rounded-lg flex items-center justify-center text-white font-bold text-2xl"
              style={{ background: themeColors.gradient }}
            >
              Active Theme Gradient
            </div>
            
            {globalTheme && (
              <div className="text-center space-y-2">
                <div className="text-lg font-semibold">{globalTheme.name}</div>
                <div className="text-sm opacity-75">
                  {globalTheme.fromColor} → {globalTheme.toColor}
                </div>
              </div>
            )}
          </div>
        </ThemedCard>

        {/* Instructions */}
        <ThemedCard className="space-y-4">
          <h2 className="text-2xl font-bold">📋 How to Test</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Switch between Light/Dark/System modes using the buttons above</li>
            <li>Go to <code className="px-1 py-0.5 rounded bg-opacity-20" style={{ backgroundColor: themeColors.gradientFrom }}>/admin/themes/global</code> to activate different themes</li>
            <li>Watch how form inputs, cards, and gradients adapt to both the active theme and dark/light mode</li>
            <li>Notice how the CSS variables update in real-time</li>
          </ol>
        </ThemedCard>

      </div>
    </div>
  );
}