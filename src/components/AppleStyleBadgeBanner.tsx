"use client";

import React, { useState, useEffect, useRef } from "react";
import { Pause, Play } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useThemeColors } from "@/context/ThemeContext";

interface BadgeItem {
  id: string;
  title: string;
  imageUrl: string;
  imageAlt?: string;
  link?: string;
  priority?: boolean; // For loading priority
  category?: string;
  width?: number; // Custom width
  height?: number; // Custom height
}

interface AppleStyleBadgeBannerProps {
  badges: BadgeItem[];
  autoScroll?: boolean;
  scrollSpeed?: number; // pixels per second
  height?: number; // banner height in pixels
  badgeSize?: 'small' | 'medium' | 'large';
  gap?: number; // gap between badges
  className?: string;
  showControls?: boolean;
}

export const AppleStyleBadgeBanner: React.FC<AppleStyleBadgeBannerProps> = ({
  badges,
  autoScroll = true,
  scrollSpeed = 50,
  height = 80,
  badgeSize = 'medium',
  gap = 16,
  className = "",
  showControls = true
}) => {
  const [isScrolling, setIsScrolling] = useState(autoScroll);
  const [translateX, setTranslateX] = useState(0); // Start from 0
  const [isPaused, setIsPaused] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const themeColors = useThemeColors('GLOBAL');
  
  // Multiple badges for seamless infinite scroll effect - много копий для непрерывного потока
  const duplicatedBadges = [...badges, ...badges, ...badges, ...badges, ...badges, ...badges];
  const isDarkMode = themeColors.mode === 'dark';

  // Badge size configuration with optimal sizes for banner content
  const getBadgeWidth = (customWidth?: number) => {
    if (customWidth) return customWidth;
    
    if (typeof window === 'undefined') {
      const sizes = { small: 450, medium: 600, large: 750 };
      return sizes[badgeSize];
    }
    
    // Perfect 16:9 aspect ratio widths for 1920x1080 content
    const sizes = {
      small: { 
        xl: 320, lg: 284, md: 256, sm: 213 
      },
      medium: { 
        xl: 427, lg: 384, md: 341, sm: 284 
      },
      large: { 
        xl: 533, lg: 480, md: 427, sm: 356 
      }
    };
    
    const currentSizes = sizes[badgeSize];
    if (window.innerWidth >= 1280) return currentSizes.xl;
    if (window.innerWidth >= 1024) return currentSizes.lg;
    if (window.innerWidth >= 768) return currentSizes.md;
    return currentSizes.sm;
  };

  const getBadgeHeight = (customHeight?: number) => {
    if (customHeight) return customHeight;
    
    // Perfect 16:9 aspect ratio for banner content (1920x1080)
    const badgeWidth = getBadgeWidth();
    const aspectRatio = 16/9; // 16:9 ratio for 1920x1080 banners
    const calculatedHeight = badgeWidth / aspectRatio;
    
    // Ensure banner height accommodates the calculated height
    const minBannerHeight = calculatedHeight + 20; // padding
    
    return calculatedHeight;
  };

  // Continuous scrolling animation - RIGHT TO LEFT movement for partners
  useEffect(() => {
    if (!isScrolling || isPaused) return;

    const animate = () => {
      setTranslateX(prev => {
        // Calculate single set width (original badges only)
        const cardWidth = getBadgeWidth() + gap;
        const singleSetWidth = badges.length * cardWidth;
        
        // Move LEFT (negative direction) 
        const newValue = prev - (scrollSpeed / 60); // 60fps
        
        // Reset when we've moved one complete set to the left
        // This creates seamless infinite scrolling
        if (newValue <= -singleSetWidth) {
          return 0; // Reset to start position
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
  }, [isScrolling, isPaused, badges.length, scrollSpeed, gap]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pause on hover
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  // Toggle auto-scroll
  const toggleAutoScroll = () => {
    setIsScrolling(!isScrolling);
  };

  const BadgeComponent: React.FC<{ badge: BadgeItem; index: number }> = ({ badge, index }) => {
    const badgeWidth = getBadgeWidth(badge.width);
    const badgeHeight = getBadgeHeight(badge.height);
    
    const BadgeContent = (
      <div
        className="flex-shrink-0 transition-all duration-300 hover:scale-110 cursor-pointer group"
        style={{
          width: `${badgeWidth}px`,
          height: `${badgeHeight}px`,
        }}
      >
        {/* Apple-style badge container */}
        <div 
          className="relative w-full h-full rounded-2xl overflow-hidden"
          style={{
            background: isDarkMode 
              ? 'linear-gradient(135deg, #ffffff08 0%, #ffffff12 100%)'
              : 'linear-gradient(135deg, #00000005 0%, #00000010 100%)',
            border: `1px solid ${isDarkMode ? '#ffffff15' : '#00000010'}`,
            boxShadow: isDarkMode 
              ? '0 2px 10px rgba(255, 255, 255, 0.05), 0 1px 3px rgba(255, 255, 255, 0.1)'
              : '0 2px 10px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.12)'
          }}
        >
          {/* Image container - full banner coverage */}
          <div className="relative w-full h-full">
            <Image
              src={badge.imageUrl}
              alt={badge.imageAlt || badge.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes={`${badgeWidth}px`}
              priority={badge.priority || index < 8} // Load first 8 badges with priority
            />
          </div>
          
          {/* Subtle hover overlay */}
          <div 
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background: isDarkMode 
                ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(0, 0, 0, 0.03) 0%, rgba(0, 0, 0, 0.06) 100%)'
            }}
          />
          
          {/* Optional title tooltip - shows on hover */}
          {badge.title && (
            <div 
              className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-20"
              style={{
                background: isDarkMode ? '#000000e6' : '#ffffffd9',
                color: isDarkMode ? '#ffffff' : '#000000',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${isDarkMode ? '#ffffff20' : '#00000020'}`
              }}
            >
              {badge.title}
            </div>
          )}
        </div>
      </div>
    );

    // Wrap with Link if link is provided
    if (badge.link) {
      return (
        <Link 
          key={`${badge.id}-${Math.floor(index / badges.length)}`}
          href={badge.link}
          className="block"
          title={badge.title}
        >
          {BadgeContent}
        </Link>
      );
    }

    return (
      <div key={`${badge.id}-${Math.floor(index / badges.length)}`}>
        {BadgeContent}
      </div>
    );
  };

  if (badges.length === 0) return null;

  return (
    <div className={`relative w-full ${className}`} style={{ height: `${height}px` }}>
      {/* Apple-style clean container */}
      <div 
        className="relative w-full h-full overflow-hidden"
        style={{
          background: isDarkMode 
            ? 'linear-gradient(135deg, #00000020 0%, #00000040 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderRadius: height > 100 ? '24px' : '16px'
        }}
      >
        {/* Subtle gradient edges for infinite feel - removed for edge-to-edge */}

        {/* Badges Container - RIGHT TO LEFT continuous scrolling */}
        <div
          ref={bannerRef}
          className="flex items-center h-full py-2"
          style={{
            transform: `translateX(${translateX}px)`, // Continuous right-to-left movement
            width: 'max-content',
            gap: `${gap}px`
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {duplicatedBadges.map((badge, index) => (
            <BadgeComponent 
              key={`${badge.id}-${Math.floor(index / badges.length)}`}
              badge={badge} 
              index={index}
            />
          ))}
        </div>

        {/* Auto-scroll control - Apple-style minimal */}
        {showControls && (
          <button
            onClick={toggleAutoScroll}
            className="absolute top-3 right-3 w-7 h-7 rounded-full transition-all duration-300 hover:scale-110 opacity-40 hover:opacity-80 z-20"
            style={{
              background: isDarkMode 
                ? 'linear-gradient(135deg, #ffffff15 0%, #ffffff25 100%)'
                : 'linear-gradient(135deg, #00000010 0%, #00000020 100%)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${isDarkMode ? '#ffffff20' : '#00000015'}`
            }}
            title={isScrolling ? 'Pause scrolling' : 'Resume scrolling'}
          >
            {isScrolling ? (
              <Pause 
                className="h-3 w-3 mx-auto" 
                style={{ color: isDarkMode ? '#ffffff' : '#000000' }} 
              />
            ) : (
              <Play 
                className="h-3 w-3 mx-auto ml-0.5" 
                style={{ color: isDarkMode ? '#ffffff' : '#000000' }} 
              />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default AppleStyleBadgeBanner;