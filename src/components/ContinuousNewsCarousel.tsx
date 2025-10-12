"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, Calendar, Pause, Play, Gauge } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useThemeColors } from "@/context/ThemeContext";

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  category?: string;
  subcategory?: string;
  imageUrl?: string;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
  updatedAt: string;
  newsCategory?: {
    id: string;
    name: string;
    color: string;
  };
}

interface ContinuousNewsCarouselProps {
  posts: Post[];
  truncateContent: (content: string, maxLength?: number) => string;
  autoScroll?: boolean;
  scrollSpeed?: number; // pixels per second
}

export const ContinuousNewsCarousel: React.FC<ContinuousNewsCarouselProps> = ({
  posts,
  truncateContent,
  autoScroll = true,
  scrollSpeed = 50
}) => {
  const [isScrolling, setIsScrolling] = useState(autoScroll);
  const [translateX, setTranslateX] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(scrollSpeed);
  const [showSpeedControl, setShowSpeedControl] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const themeColors = useThemeColors('NEWS');
  
  // Duplicate posts for infinite scroll effect - reduced from 3x to 2x to save memory
  const duplicatedPosts = [...posts, ...posts];
  const isDarkMode = themeColors.mode === 'dark';

  // Responsive card width calculation
  const getCardWidth = () => {
    if (typeof window === 'undefined') return 320;
    
    if (window.innerWidth >= 1280) return 320; // xl: 4 cards
    if (window.innerWidth >= 1024) return 340; // lg: 3 cards  
    if (window.innerWidth >= 768) return 380;  // md: 2 cards
    return 300; // sm: 1 card with margins
  };

  const getVisibleCards = () => {
    if (typeof window === 'undefined') return 4;
    
    if (window.innerWidth >= 1280) return 4; // xl: 4 cards
    if (window.innerWidth >= 1024) return 3; // lg: 3 cards
    if (window.innerWidth >= 768) return 2;  // md: 2 cards
    return 1; // sm: 1 card
  };

  // Continuous scrolling animation
  useEffect(() => {
    if (!isScrolling || isPaused) return;

    const animate = () => {
      setTranslateX(prev => {
        const cardWidth = getCardWidth() + 24; // card width + gap
        const resetPoint = -(posts.length * cardWidth);

        const newValue = prev - (currentSpeed / 60); // 60fps
        
        // Reset when we've scrolled through one full set of posts
        if (newValue <= resetPoint) {
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
  }, [isScrolling, isPaused, posts.length, currentSpeed]);

  // Pause on hover
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  // Close speed control when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSpeedControl && !(event.target as Element).closest('.speed-control-container')) {
        setShowSpeedControl(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSpeedControl]);

  // Toggle auto-scroll
  const toggleAutoScroll = () => {
    setIsScrolling(!isScrolling);
  };

  // Speed presets
  const speedPresets = [
    { label: 'Lassú', value: 25, icon: '🐌' },
    { label: 'Normál', value: 50, icon: '🚶' },
    { label: 'Gyors', value: 75, icon: '🏃' },
    { label: 'Nagyon gyors', value: 100, icon: '🚀' }
  ];

  const handleSpeedChange = (speed: number) => {
    setCurrentSpeed(speed);
    setShowSpeedControl(false);
  };

  const NewsCard: React.FC<{ post: Post; index: number }> = ({ post, index }) => {
    // Subcategory-based color mapping for series
    const getCardColor = () => {
      // If there's a subcategory, use custom colors for series
      if (post.subcategory) {
        if (post.subcategory.includes('MZP')) return '#f97316'; // Orange for MZP
        if (post.subcategory.includes('korrupció')) return '#991b1b'; // Dark red for Korrupció
      }
      // Otherwise use category color
      return post.newsCategory?.color || "#6b7280";
    };

    const categoryColor = getCardColor();

    return (
      <div
        className="flex-shrink-0 w-80 h-96 group"
        style={{ width: `${getCardWidth()}px` }}
      >
        <Link
          href={`/hirek/${post.id}`}
          className="block h-full rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 cursor-pointer"
          style={{
            background: post.newsCategory 
              ? (isDarkMode 
                  ? `linear-gradient(135deg, ${categoryColor}15 0%, ${categoryColor}25 100%)`
                  : `linear-gradient(135deg, ${categoryColor}08 0%, ${categoryColor}15 100%)`)
              : (isDarkMode ? '#1f2937' : '#ffffff'),
            borderTopColor: categoryColor,
            boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 10px 15px -3px ${categoryColor}20`
          }}
        >
          {/* Image Section or Category Background */}
          {post.imageUrl ? (
            <div className="relative h-48 overflow-hidden">
              <Image
                src={post.imageUrl}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                priority={index < 4}
                loading={index >= 4 ? "lazy" : undefined}
                quality={75}
              />

              {/* Category Badge - Top Left */}
              {post.newsCategory && (
                <div className="absolute top-3 left-3 z-20">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold text-white backdrop-blur-sm"
                    style={{
                      backgroundColor: `${categoryColor}e6`,
                      border: `1px solid ${categoryColor}`
                    }}
                  >
                    {post.newsCategory.name}
                  </span>
                </div>
              )}

              {/* Subcategory Badge - Top Right */}
              {post.subcategory && (
                <div className="absolute top-3 right-3 z-20">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold text-white backdrop-blur-sm"
                    style={{
                      backgroundColor: `${categoryColor}cc`,
                      border: `1px solid ${categoryColor}`,
                      color: '#ffffff'
                    }}
                  >
                    {post.subcategory}
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* Gradient Background with Title for Image-less Cards */
            <div
              className="relative h-48 overflow-hidden flex items-center justify-center p-6"
              style={{
                background: `linear-gradient(135deg, ${categoryColor}dd 0%, ${categoryColor}ee 50%, ${categoryColor}ff 100%)`,
              }}
            >
              {/* Decorative Pattern */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `radial-gradient(circle at 20% 20%, white 2px, transparent 2px),
                                   radial-gradient(circle at 80% 80%, white 1px, transparent 1px)`,
                  backgroundSize: '30px 30px, 20px 20px'
                }}
              />

              {/* Category Badge - Top Left */}
              {post.newsCategory && (
                <div className="absolute top-3 left-3 z-20">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold text-white backdrop-blur-sm"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      border: '1px solid rgba(255, 255, 255, 0.4)'
                    }}
                  >
                    {post.newsCategory.name}
                  </span>
                </div>
              )}

              {/* Subcategory Badge - Top Right */}
              {post.subcategory && (
                <div className="absolute top-3 right-3 z-20">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold text-white backdrop-blur-sm"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    {post.subcategory}
                  </span>
                </div>
              )}

              {/* Title Display - Large and Readable */}
              <div className="relative z-10 text-center w-full">
                <h2
                  className="text-2xl md:text-3xl font-bold leading-tight text-white drop-shadow-lg px-4"
                  style={{
                    textShadow: `0 2px 10px ${categoryColor}80, 0 0 20px rgba(0,0,0,0.3)`
                  }}
                >
                  {post.title}
                </h2>
              </div>

              {/* Subtle overlay for depth */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  background: `linear-gradient(45deg, transparent 30%, white 50%, transparent 70%)`
                }}
              />
            </div>
          )}

          {/* Content Section */}
          <div className="p-5 flex flex-col h-48 justify-between">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between text-xs mb-3 flex-wrap gap-2">
                <div
                  className="flex items-center"
                  style={{ color: categoryColor }}
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  <time dateTime={post.createdAt}>
                    {new Date(post.createdAt).toLocaleDateString("hu-HU", {
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                </div>

                {/* Subcategory badge (for cards without images) */}
                {!post.imageUrl && post.subcategory && (
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: `${categoryColor}30`,
                      color: categoryColor,
                      border: `1px solid ${categoryColor}50`
                    }}
                  >
                    {post.subcategory}
                  </span>
                )}
              </div>

              {/* Title - Only show if card has image (title is in gradient for image-less cards) */}
              {post.imageUrl && (
                <h3
                  className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-opacity-80 transition-colors"
                  style={{
                    color: isDarkMode ? "#ffffff" : "#111111"
                  }}
                >
                  {post.title}
                </h3>
              )}

              {/* Excerpt */}
              <p
                className={`text-sm leading-relaxed mb-3 ${post.imageUrl ? 'line-clamp-3' : 'line-clamp-6'}`}
                style={{
                  color: isDarkMode ? "#ffffff" : "#6b7280",
                  opacity: isDarkMode ? 0.9 : 1
                }}
              >
                {post.excerpt || truncateContent(post.content, post.imageUrl ? 120 : 200)}
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div
                className="inline-flex items-center text-sm font-medium transition-all duration-200 group/link hover:gap-2"
                style={{ color: categoryColor }}
              >
                <span>Tovább</span>
                <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-200 group-hover/link:translate-x-1" />
              </div>
              
              {/* Accent dot */}
              <div 
                className="w-2 h-2 rounded-full opacity-60"
                style={{ backgroundColor: categoryColor }}
              />
            </div>
          </div>
        </Link>
      </div>
    );
  };

  if (posts.length === 0) return null;

  return (
    <div className="relative w-full">
      {/* Header with controls - centered with max-w */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="flex items-center justify-between">
          <h2
            className="text-3xl font-bold"
            style={{ color: isDarkMode ? "#ffffff" : "#111111" }}
          >
            Legfrissebb Hírek
          </h2>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Play/Pause toggle */}
            <button
              onClick={toggleAutoScroll}
              className="flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-300 hover:scale-105 opacity-60 hover:opacity-100"
              style={{
                backgroundColor: `${themeColors.gradientFrom}10`,
                border: `1px solid ${themeColors.gradientFrom}20`
              }}
              title={isScrolling ? 'Szüneteltetés' : 'Indítás'}
            >
              {isScrolling ? (
                <Pause className="h-4 w-4" style={{ color: themeColors.gradientFrom }} />
              ) : (
                <Play className="h-4 w-4" style={{ color: themeColors.gradientFrom }} />
              )}
            </button>

            {/* Speed control */}
            <div className="relative speed-control-container">
              <button
                onClick={() => setShowSpeedControl(!showSpeedControl)}
                className="flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-300 hover:scale-105 opacity-60 hover:opacity-100"
                style={{
                  backgroundColor: `${themeColors.gradientFrom}10`,
                  border: `1px solid ${themeColors.gradientFrom}20`
                }}
                title="Sebesség beállítása"
              >
                <Gauge className="h-4 w-4" style={{ color: themeColors.gradientFrom }} />
              </button>

              {/* Speed dropdown */}
              {showSpeedControl && (
                <div
                  className="absolute right-0 top-full mt-2 w-48 rounded-lg shadow-xl border z-50"
                  style={{
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    borderColor: isDarkMode ? '#374151' : '#e5e7eb'
                  }}
                >
                  <div className="p-2 space-y-1">
                    {speedPresets.map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => handleSpeedChange(preset.value)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors"
                        style={{
                          backgroundColor: currentSpeed === preset.value
                            ? `${themeColors.gradientFrom}20`
                            : 'transparent',
                          color: isDarkMode ? '#ffffff' : '#111111'
                        }}
                        onMouseEnter={(e) => {
                          if (currentSpeed !== preset.value) {
                            e.currentTarget.style.backgroundColor = `${themeColors.gradientFrom}10`;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (currentSpeed !== preset.value) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <span className="text-sm font-medium">{preset.label}</span>
                        <span className="text-lg">{preset.icon}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Carousel Container - full width edge-to-edge */}
      <div className="relative overflow-hidden w-full">
        {/* Gradient overlays for smooth edges */}
        <div 
          className="absolute left-0 top-0 w-8 h-full z-10 pointer-events-none"
          style={{
            background: `linear-gradient(to right, ${themeColors.bg}, transparent)`
          }}
        />
        <div 
          className="absolute right-0 top-0 w-8 h-full z-10 pointer-events-none"
          style={{
            background: `linear-gradient(to left, ${themeColors.bg}, transparent)`
          }}
        />

        {/* Cards Container */}
        <div
          ref={carouselRef}
          className="flex gap-6 py-4"
          style={{
            transform: `translateX(${translateX}px)`,
            width: 'max-content'
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {duplicatedPosts.map((post, index) => (
            <NewsCard 
              key={`${post.id}-${Math.floor(index / posts.length)}`} 
              post={post} 
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Bottom info - centered with max-w */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex items-center justify-center">
          <Link
            href="/hirek"
            className="inline-flex items-center px-6 py-3 text-sm font-medium rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style={{ 
              background: themeColors.gradient,
              color: themeColors.accent,
              border: `1px solid ${themeColors.gradientFrom}40`
            }}
          >
            Minden hír megtekintése
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ContinuousNewsCarousel;