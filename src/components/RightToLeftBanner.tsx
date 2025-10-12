"use client";

import React, { useState, useEffect, useRef } from "react";
import { Pause, Play, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useThemeColors } from "@/context/ThemeContext";

interface BannerItem {
  id: string;
  title: string;
  content: string;
  link?: string;
  icon?: React.ReactNode;
  urgent?: boolean;
  category?: string;
  color?: string;
  // Image support for Apple-style badges
  imageUrl?: string;
  imageAlt?: string;
  badgeStyle?: 'text' | 'image' | 'mixed'; // Layout type
}

interface RightToLeftBannerProps {
  items: BannerItem[];
  autoScroll?: boolean;
  scrollSpeed?: number; // pixels per second
  height?: number; // banner height in pixels
  className?: string;
  variant?: 'text' | 'badges' | 'mixed'; // Banner type
  badgeSize?: 'small' | 'medium' | 'large'; // For image badges
}

export const RightToLeftBanner: React.FC<RightToLeftBannerProps> = ({
  items,
  autoScroll = true,
  scrollSpeed = 60,
  height = 80,
  className = "",
  variant = 'text',
  badgeSize = 'medium'
}) => {
  const [isScrolling, setIsScrolling] = useState(autoScroll);
  const [translateX, setTranslateX] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const themeColors = useThemeColors('GLOBAL');
  
  // Duplicate items for infinite scroll effect
  const duplicatedItems = [...items, ...items, ...items];
  const isDarkMode = themeColors.mode === 'dark';

  // Banner item width calculation based on variant
  const getBannerItemWidth = () => {
    if (typeof window === 'undefined') {
      return variant === 'badges' ? 600 : 800; // 3x bigger
    }
    
    if (variant === 'badges') {
      // MUCH BIGGER Apple-style badge sizes (3x)
      const sizes = {
        small: { xl: 480, lg: 420, md: 360, sm: 300 },
        medium: { xl: 600, lg: 540, md: 480, sm: 420 },
        large: { xl: 720, lg: 660, md: 600, sm: 540 }
      };
      
      const currentSizes = sizes[badgeSize];
      if (window.innerWidth >= 1280) return currentSizes.xl;
      if (window.innerWidth >= 1024) return currentSizes.lg;
      if (window.innerWidth >= 768) return currentSizes.md;
      return currentSizes.sm;
    }
    
    // BIGGER text banner sizes (2-3x)
    if (window.innerWidth >= 1280) return 800; // xl
    if (window.innerWidth >= 1024) return 700; // lg
    if (window.innerWidth >= 768) return 600;  // md
    return 500; // sm
  };

  // Continuous scrolling animation (RIGHT TO LEFT)
  useEffect(() => {
    if (!isScrolling || isPaused) return;

    const animate = () => {
      setTranslateX(prev => {
        const itemWidth = getBannerItemWidth() + 32; // item width + gap
        const resetPoint = items.length * itemWidth;
        
        // Move RIGHT TO LEFT (increase translateX)
        const newValue = prev + (scrollSpeed / 60); // 60fps
        
        // Reset when we've scrolled through one full set of items
        if (newValue >= resetPoint) {
          return 0;
        }
        
        return newValue;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isScrolling, isPaused, items.length, scrollSpeed]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pause on hover
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  // Toggle auto-scroll
  const toggleAutoScroll = () => {
    setIsScrolling(!isScrolling);
  };

  const BannerItemComponent: React.FC<{ item: BannerItem; index: number }> = ({ item, index }) => {
    const itemColor = item.color || themeColors.gradientFrom;
    const isUrgent = item.urgent;
    const itemWidth = getBannerItemWidth();
    const itemStyle = item.badgeStyle || variant;
    
    // Apple-style badge content
    const BadgeContent = () => {
      if (itemStyle === 'image' && item.imageUrl) {
        return (
          <div
            className="flex-shrink-0 flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer rounded-2xl overflow-hidden"
            style={{
              width: `${itemWidth}px`,
              height: `${height - 16}px`,
              background: isDarkMode ? '#ffffff10' : '#00000008',
              border: `1px solid ${isDarkMode ? '#ffffff20' : '#00000015'}`,
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="relative w-full h-full p-2">
              <Image
                src={item.imageUrl}
                alt={item.imageAlt || item.title}
                fill
                className="object-contain"
                sizes={`${itemWidth}px`}
              />
            </div>
          </div>
        );
      }
      
      if (itemStyle === 'mixed' && item.imageUrl) {
        return (
          <div
            className="flex-shrink-0 flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer"
            style={{
              width: `${itemWidth}px`,
              height: `${height - 16}px`,
              background: isDarkMode ? '#ffffff10' : '#00000008',
              border: `1px solid ${isDarkMode ? '#ffffff20' : '#00000015'}`,
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* Image */}
            <div className="relative w-8 h-8 mb-1">
              <Image
                src={item.imageUrl}
                alt={item.imageAlt || item.title}
                fill
                className="object-contain"
                sizes="32px"
              />
            </div>
            
            {/* Text */}
            <div className="text-center">
              <h4 
                className="font-semibold text-xs truncate"
                style={{ 
                  color: isDarkMode ? "#ffffff" : "#111111"
                }}
              >
                {item.title}
              </h4>
            </div>
          </div>
        );
      }
      
      // Default text content (original)
      return (
        <div
          className="flex-shrink-0 flex items-center justify-center px-6 py-4 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer"
          style={{
            width: `${itemWidth}px`,
            height: `${height - 16}px`,
            background: isUrgent 
              ? `linear-gradient(135deg, #ef4444 0%, #dc2626 100%)`
              : `linear-gradient(135deg, ${itemColor}20 0%, ${itemColor}35 100%)`,
            border: `2px solid ${isUrgent ? '#ef4444' : itemColor}40`,
            boxShadow: isUrgent 
              ? '0 4px 20px rgba(239, 68, 68, 0.3)'
              : `0 4px 15px ${itemColor}20`
          }}
        >
          {/* Content Container */}
          <div className="flex items-center space-x-3 w-full">
            {/* Icon */}
            {item.icon && (
              <div 
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: isUrgent ? '#ffffff20' : `${itemColor}30`,
                  color: isUrgent ? '#ffffff' : itemColor
                }}
              >
                {item.icon}
              </div>
            )}
            
            {/* Text Content */}
            <div className="flex-1 min-w-0">
              <h4 
                className="font-bold text-sm truncate"
                style={{ 
                  color: isUrgent ? '#ffffff' : (isDarkMode ? "#ffffff" : itemColor)
                }}
              >
                {item.title}
              </h4>
              <p 
                className="text-xs truncate opacity-90"
                style={{ 
                  color: isUrgent ? '#ffffff' : (isDarkMode ? "#ffffff" : "#6b7280")
                }}
              >
                {item.content}
              </p>
            </div>
            
            {/* Link indicator */}
            {item.link && (
              <div className="flex-shrink-0">
                <ExternalLink 
                  className="h-4 w-4 opacity-70"
                  style={{ 
                    color: isUrgent ? '#ffffff' : (isDarkMode ? "#ffffff" : itemColor)
                  }}
                />
              </div>
            )}
          </div>
          
          {/* Urgent pulse effect */}
          {isUrgent && (
            <div 
              className="absolute inset-0 rounded-xl animate-pulse"
              style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}
            />
          )}
        </div>
      );
    };
    
    const ItemContent = <BadgeContent />;

    // Wrap with Link if link is provided
    if (item.link) {
      return (
        <Link 
          key={`${item.id}-${Math.floor(index / items.length)}`}
          href={item.link}
          className="block"
        >
          {ItemContent}
        </Link>
      );
    }

    return (
      <div key={`${item.id}-${Math.floor(index / items.length)}`}>
        {ItemContent}
      </div>
    );
  };

  if (items.length === 0) return null;

  return (
    <div className={`relative w-full ${className}`} style={{ height: `${height}px` }}>
      {/* Container with overflow hidden */}
      <div className="relative w-full h-full overflow-hidden rounded-2xl"
        style={{
          background: isDarkMode 
            ? 'linear-gradient(135deg, #1f293740 0%, #11182750 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
        }}
      >
        {/* Gradient overlays for smooth edges */}
        <div 
          className="absolute left-0 top-0 w-12 h-full z-10 pointer-events-none"
          style={{
            background: `linear-gradient(to right, ${themeColors.bg}, transparent)`
          }}
        />
        <div 
          className="absolute right-0 top-0 w-12 h-full z-10 pointer-events-none"
          style={{
            background: `linear-gradient(to left, ${themeColors.bg}, transparent)`
          }}
        />

        {/* Banners Container - RIGHT TO LEFT movement */}
        <div
          ref={bannerRef}
          className={`flex h-full items-center py-2 ${
            variant === 'badges' ? 'gap-4' : 'gap-8'
          }`}
          style={{
            transform: `translateX(-${translateX}px)`, // Negative for right-to-left
            width: 'max-content',
            paddingLeft: '100%' // Start from container right edge
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {duplicatedItems.map((item, index) => (
            <BannerItemComponent 
              key={`${item.id}-${Math.floor(index / items.length)}`}
              item={item} 
              index={index}
            />
          ))}
        </div>

        {/* Auto-scroll control */}
        <button
          onClick={toggleAutoScroll}
          className="absolute top-2 right-2 w-8 h-8 rounded-full transition-all duration-300 hover:scale-110 opacity-60 hover:opacity-100 z-20"
          style={{
            backgroundColor: `${themeColors.gradientFrom}20`,
            border: `1px solid ${themeColors.gradientFrom}30`
          }}
          title={isScrolling ? 'Automatikus görgetés szüneteltetése' : 'Automatikus görgetés indítása'}
        >
          {isScrolling ? (
            <Pause className="h-3 w-3 mx-auto" style={{ color: themeColors.gradientFrom }} />
          ) : (
            <Play className="h-3 w-3 mx-auto" style={{ color: themeColors.gradientFrom }} />
          )}
        </button>
      </div>
    </div>
  );
};

export default RightToLeftBanner;