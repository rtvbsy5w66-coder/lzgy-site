"use client";

import React from 'react';
import { useThemeColors } from '@/context/ThemeContext';

interface ThemedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function ThemedInput({ label, className = '', ...props }: ThemedInputProps) {
  const themeColors = useThemeColors();

  return (
    <div className="space-y-2">
      {label && (
        <label 
          className="block text-sm font-medium"
          style={{ color: themeColors.text }}
        >
          {label}
        </label>
      )}
      <input
        {...props}
        className={`
          w-full px-3 py-2 rounded-lg border transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-opacity-50
          ${className}
        `}
        style={{
          backgroundColor: themeColors.input,
          borderColor: themeColors.border,
          color: themeColors.text,
        }}
      />
    </div>
  );
}

interface ThemedCardProps {
  children: React.ReactNode;
  className?: string;
}

export function ThemedCard({ children, className = '' }: ThemedCardProps) {
  const themeColors = useThemeColors();

  return (
    <div
      className={`rounded-lg border p-6 shadow-sm transition-colors duration-200 ${className}`}
      style={{
        backgroundColor: themeColors.cardBg,
        borderColor: themeColors.border,
        color: themeColors.text,
      }}
    >
      {children}
    </div>
  );
}

interface ThemedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'gradient';
  children: React.ReactNode;
}

export function ThemedButton({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}: ThemedButtonProps) {
  const themeColors = useThemeColors();

  const getButtonStyle = () => {
    switch (variant) {
      case 'gradient':
        return {
          background: themeColors.gradient,
          color: themeColors.accent,
          border: 'none',
        };
      case 'secondary':
        return {
          backgroundColor: 'transparent',
          color: themeColors.gradientFrom,
          borderColor: themeColors.gradientFrom,
          border: '1px solid',
        };
      default:
        return {
          backgroundColor: themeColors.gradientFrom,
          color: themeColors.accent,
          border: 'none',
        };
    }
  };

  return (
    <button
      {...props}
      className={`
        px-4 py-2 rounded-lg font-medium transition-all duration-200
        hover:shadow-lg hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-opacity-50
        ${className}
      `}
      style={getButtonStyle()}
    >
      {children}
    </button>
  );
}