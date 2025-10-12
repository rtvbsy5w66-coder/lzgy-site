"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, Calendar, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useThemeColors } from "@/context/ThemeContext";

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  category?: string;
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

interface ModernNewsSliderProps {
  posts: Post[];
  truncateContent: (content: string, maxLength?: number) => string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export const ModernNewsSlider: React.FC<ModernNewsSliderProps> = ({
  posts,
  truncateContent,
  autoPlay = true,
  autoPlayInterval = 5000
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout>();
  const themeColors = useThemeColors('NEWS');

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && posts.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % posts.length);
      }, autoPlayInterval);
    }
    
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, posts.length, autoPlayInterval]);

  // Navigation functions
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev === 0 ? posts.length - 1 : prev - 1));
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % posts.length);
    setIsAutoPlaying(false);
  };

  // Touch/Mouse drag handlers
  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setDragStart(clientX);
    setIsAutoPlaying(false);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    const offset = clientX - dragStart;
    setDragOffset(offset);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    
    const threshold = 50;
    if (dragOffset > threshold) {
      goToPrevious();
    } else if (dragOffset < -threshold) {
      goToNext();
    }
    
    setIsDragging(false);
    setDragOffset(0);
  };

  // Helper function to get category color
  const getCategoryColor = (post: Post) => post.newsCategory?.color || "#6b7280";

  // Helper function to determine text color based on theme
  const getTextColor = (isDark: boolean) => isDark ? "#ffffff" : "#111111";
  const getCardBackground = (isDark: boolean) => isDark ? "#1f2937" : "#ffffff";

  if (posts.length === 0) return null;

  const currentPost = posts[currentSlide];
  const categoryColor = getCategoryColor(currentPost);
  const isDarkMode = themeColors.bg === "#111111";

  return (
    <div className="relative w-full max-w-7xl mx-auto">
      {/* Main Slider Container */}
      <div 
        ref={sliderRef}
        className="relative overflow-hidden rounded-3xl shadow-2xl"
        style={{
          background: isDarkMode 
            ? `linear-gradient(135deg, ${categoryColor}12 0%, ${categoryColor}20 100%)`
            : `linear-gradient(135deg, ${categoryColor}08 0%, ${categoryColor}15 100%)`,
          minHeight: "500px"
        }}
        onMouseDown={(e) => handleDragStart(e.clientX)}
        onMouseMove={(e) => handleDragMove(e.clientX)}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
        onTouchEnd={handleDragEnd}
      >
        {/* Slides Container */}
        <div 
          className="flex transition-transform duration-500 ease-out h-full"
          style={{
            transform: `translateX(${(-currentSlide * 100) + (dragOffset / (sliderRef.current?.offsetWidth || 1) * 100)}%)`,
          }}
        >
          {posts.map((post, index) => {
            const postCategoryColor = getCategoryColor(post);
            
            return (
              <div
                key={post.id}
                className="w-full flex-shrink-0 relative"
                style={{ minHeight: "500px" }}
              >
                {/* Background Image with Overlay */}
                {post.imageUrl && (
                  <div className="absolute inset-0">
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(135deg, ${postCategoryColor}60 0%, ${postCategoryColor}30 50%, transparent 100%)`,
                      }}
                    />
                  </div>
                )}

                {/* Content Overlay */}
                <div className="relative z-10 h-full flex items-center">
                  <div className="container mx-auto px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                      {/* Text Content */}
                      <div className="space-y-6">
                        {/* Category Badge */}
                        {post.newsCategory && (
                          <div className="inline-flex items-center">
                            <span
                              className="px-4 py-2 rounded-full text-sm font-semibold text-white backdrop-blur-sm"
                              style={{
                                backgroundColor: `${postCategoryColor}d9`,
                                border: `1px solid ${postCategoryColor}`
                              }}
                            >
                              {post.newsCategory.name}
                            </span>
                          </div>
                        )}

                        {/* Title */}
                        <h2 
                          className="text-3xl lg:text-5xl font-bold leading-tight"
                          style={{ 
                            color: post.imageUrl ? "#ffffff" : (isDarkMode ? "#ffffff" : "#111111"),
                            textShadow: post.imageUrl ? "0 2px 4px rgba(0,0,0,0.3)" : "none"
                          }}
                        >
                          {post.title}
                        </h2>

                        {/* Excerpt */}
                        <p 
                          className="text-lg lg:text-xl leading-relaxed"
                          style={{ 
                            color: post.imageUrl ? "#f3f4f6" : (isDarkMode ? "#d1d5db" : "#6b7280"),
                            textShadow: post.imageUrl ? "0 1px 2px rgba(0,0,0,0.3)" : "none"
                          }}
                        >
                          {post.excerpt || truncateContent(post.content, 200)}
                        </p>

                        {/* Date and Read More */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm">
                            <Calendar className="h-4 w-4 mr-2" style={{ color: postCategoryColor }} />
                            <time 
                              dateTime={post.createdAt}
                              style={{ 
                                color: post.imageUrl ? "#e5e7eb" : (isDarkMode ? "#9ca3af" : "#6b7280")
                              }}
                            >
                              {new Date(post.createdAt).toLocaleDateString("hu-HU", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </time>
                          </div>

                          <Link
                            href={`/hirek/${post.id}`}
                            className="inline-flex items-center px-6 py-3 rounded-full font-medium transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                            style={{
                              backgroundColor: postCategoryColor,
                              color: "#ffffff"
                            }}
                          >
                            Teljes cikk
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </div>
                      </div>

                      {/* Featured Image for non-background display */}
                      {!post.imageUrl && (
                        <div className="hidden lg:block">
                          <div 
                            className="aspect-[4/3] rounded-2xl"
                            style={{
                              background: `linear-gradient(135deg, ${postCategoryColor}20 0%, ${postCategoryColor}40 100%)`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        {posts.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-white/20"
              style={{ backgroundColor: `${categoryColor}20` }}
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-white/20"
              style={{ backgroundColor: `${categoryColor}20` }}
            >
              <ChevronRight className="h-6 w-6 text-white" />
            </button>
          </>
        )}

        {/* Auto-play Control */}
        {posts.length > 1 && (
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-white/20"
            style={{ backgroundColor: `${categoryColor}20` }}
          >
            {isAutoPlaying ? (
              <Pause className="h-4 w-4 text-white" />
            ) : (
              <Play className="h-4 w-4 text-white ml-0.5" />
            )}
          </button>
        )}
      </div>

      {/* Slide Indicators */}
      {posts.length > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {posts.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="w-3 h-3 rounded-full transition-all duration-300"
              style={{
                backgroundColor: index === currentSlide ? categoryColor : `${categoryColor}30`,
                transform: index === currentSlide ? "scale(1.2)" : "scale(1)"
              }}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {isAutoPlaying && posts.length > 1 && (
        <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
          <div
            className="h-1 rounded-full transition-all duration-100"
            style={{
              backgroundColor: categoryColor,
              width: `${((currentSlide + 1) / posts.length) * 100}%`
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ModernNewsSlider;