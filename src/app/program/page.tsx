"use client";

import React, { useState, useEffect } from "react";
import { useThemeColors } from "@/context/ThemeContext";
import { CATEGORY_COLORS, CategoryType, CATEGORIES } from "@/constants/categories";
import { Filter, CheckCircle, Clock, Target } from "lucide-react";

interface ProgramPoint {
  id: string;
  title: string;
  category: string;
  description: string;
  details: string;
  priority: number;
  status: string;
  customColor?: string;
}

async function getProgramPoints(): Promise<ProgramPoint[]> {
  try {
    const res = await fetch("/api/program", {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch program points");
    return await res.json();
  } catch (error) {
    console.error("Error fetching program points:", error);
    return [];
  }
}

export default function ProgramPage() {
  const [programPoints, setProgramPoints] = useState<ProgramPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("Összes");
  const [filteredPoints, setFilteredPoints] = useState<ProgramPoint[]>([]);
  
  // Use theme colors from context
  const themeColors = useThemeColors('PROGRAM');
  
  // Function to get category-specific colors (with custom color override)
  const getCategoryColors = (category: string, customColor?: string) => {
    if (customColor) {
      return { primary: customColor, secondary: `${customColor}20` };
    }
    const categoryColors = CATEGORY_COLORS[category as CategoryType];
    return categoryColors || { primary: themeColors.gradientFrom, secondary: `${themeColors.gradientFrom}20` };
  };

  useEffect(() => {
    const loadProgramPoints = async () => {
      try {
        const points = await getProgramPoints();
        setProgramPoints(points);
        setFilteredPoints(points);
      } catch (error) {
        console.error("Error loading program points:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProgramPoints();
  }, []);

  // Filter effect
  useEffect(() => {
    if (selectedCategory === "Összes") {
      setFilteredPoints(programPoints);
    } else {
      setFilteredPoints(programPoints.filter(point => point.category === selectedCategory));
    }
  }, [selectedCategory, programPoints]);

  // Get unique categories from the data
  const availableCategories = ["Összes", ...Array.from(new Set(programPoints.map(point => point.category)))];

  // Get category stats
  const getCategoryStats = (category: string) => {
    const points = category === "Összes" ? programPoints : programPoints.filter(p => p.category === category);
    const priority1 = points.filter(p => p.priority === 1).length;
    const total = points.length;
    return { priority1, total };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: themeColors.gradientFrom }}></div>
      </div>
    );
  }

  // Group programs by category
  const groupedPrograms = programPoints.reduce(
    (acc: Record<string, ProgramPoint[]>, point: ProgramPoint) => {
      if (!acc[point.category]) {
        acc[point.category] = [];
      }
      acc[point.category].push(point);
      return acc;
    },
    {}
  );

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: themeColors.bg }}>
      {/* Hero Section */}
      <div 
        className="relative pt-20 pb-16"
        style={{ background: themeColors.gradient }}
      >
        <div className="absolute inset-0 bg-grid-white/[0.1] bg-[size:20px_20px]" />
        <div className="max-w-6xl mx-auto px-4 relative">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{ color: themeColors.accent }}>
              Politikai Programom
            </h1>
            <p className="text-xl md:text-2xl max-w-4xl mx-auto" style={{ color: themeColors.accent }}>
              Konkrét tervek egy jobb jövőért
            </p>
          </div>
        </div>
      </div>

      {/* Category Selector */}
      <div className="max-w-7xl mx-auto px-4 pt-12 pb-8">
        <div className="relative">
          {/* Header with Filter Icon */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-3">
              <div 
                className="p-3 rounded-full"
                style={{ backgroundColor: `${themeColors.gradientFrom}20` }}
              >
                <Filter className="h-6 w-6" style={{ color: themeColors.gradientFrom }} />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: themeColors.text }}>
                Programpontok Kategóriák Szerint
              </h2>
            </div>
          </div>

          {/* Modern Category Pills with Stats */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {availableCategories.map((category) => {
              const isSelected = selectedCategory === category;
              const categoryColors = category === "Összes" ?
                { primary: themeColors.gradientFrom, secondary: `${themeColors.gradientFrom}20` } :
                getCategoryColors(category, undefined);
              const stats = getCategoryStats(category);
              
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`group relative px-6 py-4 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                    isSelected ? 'shadow-lg scale-105' : 'hover:shadow-md'
                  }`}
                  style={{
                    backgroundColor: isSelected ? categoryColors.primary : themeColors.cardBg,
                    color: isSelected ? '#ffffff' : themeColors.text,
                    border: `2px solid ${isSelected ? categoryColors.primary : `${categoryColors.primary}40`}`,
                    boxShadow: isSelected ? `0 8px 25px -8px ${categoryColors.primary}60` : `0 2px 8px -4px ${categoryColors.primary}30`,
                  }}
                >
                  {/* Category Name */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold">
                      {category}
                    </span>
                    
                    {/* Stats Badge */}
                    <div className="flex items-center space-x-1">
                      {stats.priority1 > 0 && (
                        <div 
                          className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs"
                          style={{
                            backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : `${categoryColors.primary}15`,
                            color: isSelected ? '#ffffff' : categoryColors.primary
                          }}
                        >
                          <Target className="h-3 w-3" />
                          <span>{stats.priority1}</span>
                        </div>
                      )}
                      
                      <div 
                        className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs"
                        style={{
                          backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : `${categoryColors.primary}15`,
                          color: isSelected ? '#ffffff' : categoryColors.primary
                        }}
                      >
                        <CheckCircle className="h-3 w-3" />
                        <span>{stats.total}</span>
                      </div>
                    </div>
                  </div>

                  {/* Hover Effect Border */}
                  <div 
                    className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${
                      isSelected ? 'opacity-20' : 'opacity-0 group-hover:opacity-10'
                    }`}
                    style={{
                      background: `linear-gradient(45deg, ${categoryColors.primary}, transparent, ${categoryColors.primary})`
                    }}
                  />
                </button>
              );
            })}
          </div>

          {/* Results Summary */}
          <div className="text-center mb-8">
            <p className="text-sm opacity-75" style={{ color: themeColors.text }}>
              <span className="font-semibold">{filteredPoints.length}</span> programpont
              {selectedCategory !== "Összes" && (
                <span> a <strong>{selectedCategory}</strong> kategóriában</span>
              )}
              {' '} • {filteredPoints.filter(p => p.priority === 1).length} kiemelt
            </p>
          </div>
        </div>
      </div>

      {/* Program Points - Filtered Results */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        {selectedCategory === "Összes" ? (
          // Show grouped by category when "Összes" is selected
          Object.entries(filteredPoints.reduce((acc: Record<string, ProgramPoint[]>, point) => {
            if (!acc[point.category]) acc[point.category] = [];
            acc[point.category].push(point);
            return acc;
          }, {})).map(([category, points]) => {
            const categoryColors = getCategoryColors(category, undefined);
            
            return (
            <div key={category} className="mb-16">
              <div className="mb-8">
                <h2 
                  className="text-3xl font-bold mb-4"
                  style={{ color: categoryColors.primary }}
                >
                  {category}
                </h2>
                <div 
                  className="w-24 h-1 rounded"
                  style={{ backgroundColor: categoryColors.primary }}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {points.map((point) => (
                  <ProgramCard key={point.id} point={point} themeColors={themeColors} getCategoryColors={getCategoryColors} />
                ))}
              </div>
            </div>
            );
          })
        ) : (
          // Show single category results
          <div className="mb-16">
            <div className="mb-8">
              <h2
                className="text-3xl font-bold mb-4"
                style={{ color: getCategoryColors(selectedCategory, undefined).primary }}
              >
                {selectedCategory}
              </h2>
              <div
                className="w-24 h-1 rounded"
                style={{ backgroundColor: getCategoryColors(selectedCategory, undefined).primary }}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {filteredPoints.map((point) => (
                <ProgramCard key={point.id} point={point} themeColors={themeColors} getCategoryColors={getCategoryColors} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Separate ProgramCard component for reusability
function ProgramCard({
  point,
  themeColors,
  getCategoryColors
}: {
  point: ProgramPoint;
  themeColors: any;
  getCategoryColors: (category: string, customColor?: string) => { primary: string; secondary: string }
}) {
  const pointCategoryColors = getCategoryColors(point.category, point.customColor);

  // Function to translate status to Hungarian
  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      'PLANNED': 'Tervezett',
      'IN_PROGRESS': 'Folyamatban',
      'COMPLETED': 'Megvalósult',
      'ON_HOLD': 'Felfüggesztve',
      'CANCELLED': 'Megszakítva',
      'planned': 'Tervezett',
      'in_progress': 'Folyamatban',
      'completed': 'Megvalósult',
      'on_hold': 'Felfüggesztve',
      'cancelled': 'Megszakítva',
    };
    return statusMap[status] || status;
  };

  // Function to get status color
  const getStatusColor = (status: string): string => {
    const upperStatus = status.toUpperCase();
    switch (upperStatus) {
      case 'PLANNED':
        return pointCategoryColors.primary;
      case 'IN_PROGRESS':
        return '#2563eb'; // blue-600
      case 'COMPLETED':
        return '#16a34a'; // green-600
      case 'ON_HOLD':
        return '#f59e0b'; // amber-500
      case 'CANCELLED':
        return '#dc2626'; // red-600
      default:
        return pointCategoryColors.primary;
    }
  };

  const statusColor = getStatusColor(point.status);

  return (
    <div
      className="rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
      style={{
        backgroundColor: themeColors.cardBg,
        border: `2px solid ${pointCategoryColors.primary}40`,
        boxShadow: `0 8px 25px -8px ${pointCategoryColors.primary}30`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 20px 40px -12px ${pointCategoryColors.primary}40`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 8px 25px -8px ${pointCategoryColors.primary}30`;
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <h3
          className="text-xl font-bold flex-1"
          style={{ color: pointCategoryColors.primary }}
        >
          {point.title}
        </h3>
        {/* Only show Priority Badge for priority items */}
        {point.priority === 1 && (
          <div className="ml-4">
            <span
              className="px-3 py-1 rounded-full text-sm font-medium transition-colors duration-300"
              style={{
                backgroundColor: `${pointCategoryColors.primary}25`,
                color: pointCategoryColors.primary,
                border: `1px solid ${pointCategoryColors.primary}40`,
              }}
            >
              Kiemelt
            </span>
          </div>
        )}
      </div>

      <p 
        className="mb-4 leading-relaxed"
        style={{ color: themeColors.text }}
      >
        {point.description}
      </p>

      <div 
        className="text-sm opacity-80 p-3 rounded-lg mb-4"
        style={{ 
          color: themeColors.text,
          backgroundColor: `${pointCategoryColors.primary}08`,
          border: `1px solid ${pointCategoryColors.primary}20`
        }}
      >
        {point.details}
      </div>

      <div className="flex items-center justify-between">
        <span
          className="text-sm font-medium px-2 py-1 rounded transition-colors duration-300"
          style={{
            color: statusColor,
            backgroundColor: `${statusColor}10`
          }}
        >
          Státusz: {getStatusText(point.status)}
        </span>
        
        {/* Priority Indicator */}
        {point.priority === 1 && (
          <div className="flex items-center space-x-1">
            <Target className="h-4 w-4" style={{ color: pointCategoryColors.primary }} />
            <span className="text-xs font-medium" style={{ color: pointCategoryColors.primary }}>
              Prioritás
            </span>
          </div>
        )}
      </div>
    </div>
  );
}