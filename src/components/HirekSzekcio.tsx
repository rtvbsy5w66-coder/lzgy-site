"use client";

import React, { useEffect, useState, useMemo } from "react";
import { ArrowRight, Calendar, Loader2, FileText, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useThemeColors } from "@/context/ThemeContext";
import { postsApi, ApiClientError } from "@/lib/api-client";
import { ContinuousNewsCarousel } from "./ContinuousNewsCarousel";
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

interface NewsCategory {
  id: string;
  name: string;
  description: string | null;
  colors?: {
    primary: string;
    secondary: string;
  };
  color?: string;
  isActive?: boolean;
}

interface ProgramPoint {
  id: string;
  title: string;
  category: string;
  description: string;
  details: string;
  priority: number;
  status: string;
}

const HirekSzekcio = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [programPoints, setProgramPoints] = useState<ProgramPoint[]>([]);
  const [randomProgramPoints, setRandomProgramPoints] = useState<ProgramPoint[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [showProgramPoints, setShowProgramPoints] = useState(true);
  
  // Use NEWS theme colors (falls back to global if no NEWS theme is active)
  const themeColors = useThemeColors('NEWS');
  const isDarkMode = themeColors.mode === 'dark';

  // Memoize random program points to prevent re-shuffling on every render
  const memoizedRandomProgramPoints = useMemo(() => {
    if (programPoints.length === 0) return [];
    const shuffled = [...programPoints].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [programPoints]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/news-categories");
      const result = await response.json();
      if (response.ok && result.success) {
        // Convert API format to component format
        const formattedCategories = result.data.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          color: cat.colors?.primary || '#3b82f6',
          isActive: true // All categories from public API are active
        }));
        setCategories(formattedCategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProgramPoints = async () => {
    try {
      const response = await fetch("/api/program");
      const data = await response.json();
      if (response.ok) {
        setProgramPoints(data);
      }
    } catch (error) {
      console.error("Error fetching program points:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProgramPoints();
    
    // Check if mobile on initial load
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        console.log("[HIREK] Fetching posts with selectedCategory:", selectedCategory);

        // Use the new API client with built-in error handling and retries
        const response = await postsApi.getAll({
          status: 'PUBLISHED',
          ...(selectedCategory && { newsCategoryId: selectedCategory })
          // No limit parameter - fetch ALL posts, let user see everything
        });

        console.log("[HIREK] API Response:", response);

        // console.log("HirekSzekcio: API client response:", response);

        // API client returns standardized format, no need for backward compatibility
        const sortedPosts = response.data
          .sort((a: Post, b: Post) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

        // console.log("HirekSzekcio: Processed posts:", sortedPosts);
        setPosts(sortedPosts);
        setError(null);
      } catch (error) {
        console.error("HirekSzekcio: Error fetching posts:", error);

        if (error instanceof ApiClientError) {
          setError(`API hiba (${error.statusCode}): ${error.message}`);
        } else {
          setError("Hiba a hírek betöltése közben");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [selectedCategory]);

  // Content truncation function
  const truncateContent = (
    content: string,
    maxLength: number = 150
  ): string => {
    // Remove HTML tags with simple regex
    const textOnly = content.replace(/<[^>]*>/g, "");

    if (textOnly.length <= maxLength) return textOnly;

    return textOnly.substring(0, maxLength).trim() + "...";
  };

  if (loading) {
    return (
      <div 
        className="py-16 transition-colors duration-300"
        style={{ backgroundColor: themeColors.cardBg }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <Loader2 
              className="w-8 h-8 animate-spin" 
              style={{ color: themeColors.gradientFrom }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="py-16 transition-colors duration-300"
        style={{ backgroundColor: themeColors.cardBg }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className="text-center p-4 rounded-lg"
            style={{ 
              backgroundColor: `${themeColors.gradientTo}20`,
              color: themeColors.gradientTo,
              border: `1px solid ${themeColors.gradientTo}40`
            }}
          >
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="py-16 transition-colors duration-300 w-full"
      style={{ backgroundColor: themeColors.cardBg }}
    >
      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="flex justify-center">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedCategory("")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === "" 
                  ? "shadow-md" 
                  : "hover:shadow-sm"
              }`}
              style={{
                backgroundColor: selectedCategory === "" ? themeColors.gradientFrom : `${themeColors.gradientFrom}15`,
                color: selectedCategory === "" ? themeColors.accent : themeColors.text,
                border: `1px solid ${selectedCategory === "" ? themeColors.gradientFrom : `${themeColors.gradientFrom}40`}`
              }}
            >
              Összes
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  console.log('[HIREK] Category clicked:', category.name, category.id);
                  setSelectedCategory(category.id);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? "shadow-md"
                    : "hover:shadow-sm"
                }`}
                style={{
                  backgroundColor: selectedCategory === category.id ? category.color : `${category.color}15`,
                  color: selectedCategory === category.id ? '#ffffff' : themeColors.text,
                  border: `1px solid ${selectedCategory === category.id ? category.color : `${category.color}40`}`
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* News Content - full width */}
      {posts.length === 0 ? (
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${themeColors.gradientFrom}20` }}
              >
                <FileText 
                  className="w-8 h-8"
                  style={{ color: themeColors.gradientFrom }}
                />
              </div>
            </div>
            <p 
              className="text-lg mb-2"
              style={{ color: isDarkMode ? "#ffffff" : "#111111" }}
            >
              Jelenleg nincsenek publikált hírek.
            </p>
            <p 
              className="opacity-70"
              style={{ color: isDarkMode ? "#ffffff" : "#111111" }}
            >
              Hamarosan friss tartalommal jelentkezünk!
            </p>
          </div>
        </div>
      ) : (
        <>
          <ContinuousNewsCarousel 
            posts={posts}
            truncateContent={truncateContent}
            autoScroll={true}
            scrollSpeed={50}
          />
          
          {/* Program Points Section */}
          <div className="max-w-7xl mx-auto px-4 mt-16">
            {isMobile ? (
              /* Mobile: Accordion */
              <div className="border rounded-lg overflow-hidden"
                style={{ 
                  borderColor: `${themeColors.gradientFrom}30`,
                  backgroundColor: isDarkMode ? `${themeColors.gradientFrom}05` : `${themeColors.gradientFrom}10`
                }}
              >
                <button
                  onClick={() => setShowProgramPoints(!showProgramPoints)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left transition-colors duration-200"
                  style={{ 
                    backgroundColor: isDarkMode ? `${themeColors.gradientFrom}10` : `${themeColors.gradientFrom}15`
                  }}
                >
                  <h3
                    className="text-xl font-bold"
                    style={{ color: isDarkMode ? "#ffffff" : "#111111" }}
                  >
                    Kiemelt Programpontok ({memoizedRandomProgramPoints.length})
                  </h3>
                  {showProgramPoints ? (
                    <ChevronUp className="w-5 h-5" style={{ color: themeColors.gradientFrom }} />
                  ) : (
                    <ChevronDown className="w-5 h-5" style={{ color: themeColors.gradientFrom }} />
                  )}
                </button>
                
                {showProgramPoints && (
                  <div className="p-6">
                    <div className="space-y-4">
                      {memoizedRandomProgramPoints.map((point) => {
                        const categoryColors = {
                          "Környezetvédelem": { primary: "#22c55e", secondary: "#dcfce7" },
                          "Oktatás": { primary: "#3b82f6", secondary: "#dbeafe" },
                          "Egészségügy": { primary: "#ef4444", secondary: "#fee2e2" },
                          "Szociális ügyek": { primary: "#f59e0b", secondary: "#fef3c7" },
                          "Közlekedés": { primary: "#8b5cf6", secondary: "#ede9fe" }
                        }[point.category] || { primary: themeColors.gradientFrom, secondary: `${themeColors.gradientFrom}20` };
                        
                        return (
                          <div
                            key={point.id}
                            className="rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 group"
                            style={{
                              background: isDarkMode 
                                ? `linear-gradient(135deg, ${categoryColors.primary}15 0%, ${categoryColors.primary}25 100%)`
                                : `linear-gradient(135deg, ${categoryColors.primary}08 0%, ${categoryColors.primary}15 100%)`,
                              borderTopColor: categoryColors.primary,
                              boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 10px 15px -3px ${categoryColors.primary}20`
                            }}
                          >
                            {/* Category Header with Icon */}
                            <div 
                              className="relative h-32 flex items-center justify-center"
                              style={{
                                background: `linear-gradient(135deg, ${categoryColors.primary}30 0%, ${categoryColors.primary}50 50%, ${categoryColors.primary}70 100%)`,
                              }}
                            >
                              {/* Decorative Pattern */}
                              <div 
                                className="absolute inset-0 opacity-10"
                                style={{
                                  backgroundImage: `radial-gradient(circle at 20% 20%, ${categoryColors.primary} 2px, transparent 2px), 
                                                   radial-gradient(circle at 80% 80%, ${categoryColors.primary} 1px, transparent 1px)`,
                                  backgroundSize: '25px 25px, 15px 15px'
                                }}
                              />
                              
                              {/* Category Display */}
                              <div className="relative z-10 text-center">
                                <div 
                                  className="w-12 h-12 rounded-full mb-2 mx-auto flex items-center justify-center text-white font-bold text-lg shadow-lg"
                                  style={{ backgroundColor: categoryColors.primary }}
                                >
                                  {point.category.charAt(0)}
                                </div>
                                <h4 
                                  className="text-sm font-bold"
                                  style={{ color: categoryColors.primary }}
                                >
                                  {point.category}
                                </h4>
                              </div>
                              
                              {/* Status Badge */}
                              <div className="absolute top-3 right-3">
                                <span 
                                  className="px-2 py-1 rounded-full text-xs font-semibold text-white backdrop-blur-sm"
                                  style={{
                                    backgroundColor: point.status === "folyamatban" ? "#22c55ee6" : "#f59e0be6",
                                    border: `1px solid ${point.status === "folyamatban" ? "#22c55e" : "#f59e0b"}`
                                  }}
                                >
                                  {point.status === "folyamatban" ? "Folyamatban" : "Tervezett"}
                                </span>
                              </div>
                            </div>
                            
                            {/* Content Section */}
                            <div className="p-5">
                              <h4 
                                className="text-lg font-bold mb-3 group-hover:text-opacity-80 transition-colors"
                                style={{ color: isDarkMode ? "#ffffff" : "#111111" }}
                              >
                                {point.title}
                              </h4>
                              
                              <p 
                                className="text-sm mb-3 leading-relaxed opacity-80"
                                style={{ color: isDarkMode ? "#ffffff" : "#111111" }}
                              >
                                {point.description}
                              </p>
                              
                              <p 
                                className="text-xs leading-relaxed opacity-60"
                                style={{ color: isDarkMode ? "#ffffff" : "#111111" }}
                              >
                                {point.details}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Desktop: Regular Grid */
              <>
                <h3 
                  className="text-2xl font-bold text-center mb-8"
                  style={{ color: isDarkMode ? "#ffffff" : "#111111" }}
                >
                  Kiemelt Programpontok
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {memoizedRandomProgramPoints.map((point) => {
                const categoryColors = {
                  "Környezetvédelem": { primary: "#22c55e", secondary: "#dcfce7" },
                  "Oktatás": { primary: "#3b82f6", secondary: "#dbeafe" },
                  "Egészségügy": { primary: "#ef4444", secondary: "#fee2e2" },
                  "Szociális ügyek": { primary: "#f59e0b", secondary: "#fef3c7" },
                  "Közlekedés": { primary: "#8b5cf6", secondary: "#ede9fe" }
                }[point.category] || { primary: themeColors.gradientFrom, secondary: `${themeColors.gradientFrom}20` };
                
                return (
                  <div
                    key={point.id}
                    className="rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 group cursor-pointer"
                    style={{
                      background: isDarkMode 
                        ? `linear-gradient(135deg, ${categoryColors.primary}15 0%, ${categoryColors.primary}25 100%)`
                        : `linear-gradient(135deg, ${categoryColors.primary}08 0%, ${categoryColors.primary}15 100%)`,
                      borderTopColor: categoryColors.primary,
                      boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 10px 15px -3px ${categoryColors.primary}20`
                    }}
                  >
                    {/* Category Header with Visual Appeal */}
                    <div 
                      className="relative h-40 flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${categoryColors.primary}25 0%, ${categoryColors.primary}45 50%, ${categoryColors.primary}65 100%)`,
                      }}
                    >
                      {/* Decorative Pattern */}
                      <div 
                        className="absolute inset-0 opacity-10"
                        style={{
                          backgroundImage: `radial-gradient(circle at 25% 25%, ${categoryColors.primary} 2px, transparent 2px), 
                                           radial-gradient(circle at 75% 75%, ${categoryColors.primary} 1px, transparent 1px)`,
                          backgroundSize: '30px 30px, 20px 20px'
                        }}
                      />
                      
                      {/* Category Icon and Name */}
                      <div className="relative z-10 text-center">
                        <div 
                          className="w-16 h-16 rounded-full mb-3 mx-auto flex items-center justify-center text-white font-bold text-xl shadow-xl"
                          style={{ backgroundColor: categoryColors.primary }}
                        >
                          {point.category.charAt(0)}
                        </div>
                        <h4 
                          className="text-sm font-bold"
                          style={{ color: categoryColors.primary }}
                        >
                          {point.category}
                        </h4>
                        <p 
                          className="text-xs opacity-80 mt-1"
                          style={{ color: categoryColors.primary }}
                        >
                          Prioritás: {point.priority}
                        </p>
                      </div>
                      
                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                        <span 
                          className="px-3 py-1 rounded-full text-xs font-semibold text-white backdrop-blur-sm shadow-md"
                          style={{
                            backgroundColor: point.status === "folyamatban" ? "#22c55ee6" : "#f59e0be6",
                            border: `1px solid ${point.status === "folyamatban" ? "#22c55e" : "#f59e0b"}`
                          }}
                        >
                          {point.status === "folyamatban" ? "Folyamatban" : "Tervezett"}
                        </span>
                      </div>
                      
                      {/* Subtle overlay for depth */}
                      <div 
                        className="absolute inset-0 opacity-5"
                        style={{
                          background: `linear-gradient(45deg, transparent 30%, ${categoryColors.primary} 50%, transparent 70%)`
                        }}
                      />
                    </div>
                    
                    {/* Content Section */}
                    <div className="p-6">
                      <h4 
                        className="text-xl font-bold mb-3 group-hover:text-opacity-80 transition-colors line-clamp-2"
                        style={{ color: isDarkMode ? "#ffffff" : "#111111" }}
                      >
                        {point.title}
                      </h4>
                      
                      <p 
                        className="text-sm mb-4 leading-relaxed opacity-85 line-clamp-2"
                        style={{ color: isDarkMode ? "#ffffff" : "#111111" }}
                      >
                        {point.description}
                      </p>
                      
                      <p 
                        className="text-xs leading-relaxed opacity-70 line-clamp-3"
                        style={{ color: isDarkMode ? "#ffffff" : "#111111" }}
                      >
                        {point.details}
                      </p>
                      
                      {/* Read More Indicator */}
                      <div className="mt-4 pt-3 border-t border-opacity-20" style={{ borderColor: categoryColors.primary }}>
                        <div 
                          className="flex items-center text-xs font-medium group-hover:translate-x-1 transition-transform"
                          style={{ color: categoryColors.primary }}
                        >
                          <span>Részletek</span>
                          <ArrowRight className="ml-1 w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
                </div>
                
                <div className="text-center mt-8">
                  <Link
                    href="/program"
                    className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:shadow-md"
                    style={{
                      backgroundColor: themeColors.gradientFrom,
                      color: themeColors.accent,
                      border: `1px solid ${themeColors.gradientFrom}`
                    }}
                  >
                    Összes programpont megtekintése
                    <ArrowRight className="ml-2 w-3 h-3" />
                  </Link>
                </div>
              </>
            )}
            
            {/* Mobile: See All Button */}
            {isMobile && (
              <div className="text-center mt-6">
                <Link
                  href="/program"
                  className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:shadow-md"
                  style={{
                    backgroundColor: themeColors.gradientFrom,
                    color: themeColors.accent,
                    border: `1px solid ${themeColors.gradientFrom}`
                  }}
                >
                  Összes programpont megtekintése
                  <ArrowRight className="ml-2 w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default HirekSzekcio;
