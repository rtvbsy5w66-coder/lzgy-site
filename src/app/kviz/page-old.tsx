"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Award, Play, Calendar, BookOpen, CheckCircle } from "lucide-react";
import { useThemeColors } from "@/context/ThemeContext";
import { Quiz } from "@/types/quiz";

// Difficulty color mapping
const getDifficultyConfig = (difficulty?: string) => {
  switch (difficulty) {
    case 'EASY':
      return { color: '#22c55e', label: 'Könnyű', icon: '⭐' };
    case 'MEDIUM':
      return { color: '#f59e0b', label: 'Közepes', icon: '⭐⭐' };
    case 'HARD':
      return { color: '#ef4444', label: 'Nehéz', icon: '⭐⭐⭐' };
    case 'EXPERT':
      return { color: '#8b5cf6', label: 'Haladó', icon: '⭐⭐⭐⭐' };
    default:
      return { color: '#f59e0b', label: 'Közepes', icon: '⭐⭐' };
  }
};

const QuizListPage = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const colors = useThemeColors();
  const { data: session} = useSession();

  // Detect if we're in dark mode
  const isDarkMode = colors.bg === '#0f172a' || colors.bg === '#1e293b' || colors.cardBg.includes('#1e293b') || colors.cardBg.includes('#0f172a');

  useEffect(() => {
    fetchPublicQuizzes();
  }, []);

  const fetchPublicQuizzes = async () => {
    try {
      const response = await fetch('/api/quizzes?status=PUBLISHED');
      if (!response.ok) throw new Error('Failed to fetch quizzes');
      const data = await response.json();
      setQuizzes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "Időlimit nélkül";
    if (minutes < 60) return `${minutes} perc`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}ó ${mins > 0 ? `${mins}p` : ''}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.bg, color: colors.text }}>
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="h-12 bg-gray-200 rounded w-1/3 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Card key={item} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: colors.bg, color: colors.text }}>
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-6">
            <div
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6"
              style={{
                background: `linear-gradient(135deg, ${colors.gradientFrom}20, ${colors.gradientTo}20)`,
                boxShadow: `0 10px 40px ${colors.gradientFrom}15`
              }}
            >
              <Award
                className="w-10 h-10"
                style={{ color: colors.gradientFrom }}
              />
            </div>
          </div>
          <h1
            className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent"
            style={{
              backgroundImage: colors.gradient,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text'
            }}
          >
            Interaktív Kvízek
          </h1>
          <p
            className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
            style={{ color: isDarkMode ? '#cbd5e1' : '#64748b' }}
          >
            Tesztelje tudását különböző témákban! Vegyen részt interaktív kvízeinkben és mérje fel politikai, társadalmi ismereteit.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <Card className="max-w-md mx-auto mb-8 border-red-200 bg-red-50">
            <CardContent className="pt-6 text-center">
              <p className="text-red-600 mb-4">Hiba történt: {error}</p>
              <Button onClick={fetchPublicQuizzes}>
                Újratöltés
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!error && quizzes.length === 0 && (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <Award className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Még nincsenek elérhető kvízek</h3>
              <p className="text-gray-600">Hamarosan új kvízekkel bővítjük a kínálatunkat!</p>
            </CardContent>
          </Card>
        )}

        {/* Quiz Grid */}
        {!error && quizzes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {quizzes.map((quiz, index) => {
              const hasCompleted = (quiz as any).hasCompleted;
              const difficultyConfig = getDifficultyConfig((quiz as any).difficulty);

              return (
                <div
                  key={quiz.id}
                  className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group relative"
                  style={{
                    backgroundColor: colors.cardBg,
                    border: `2px solid ${colors.border}`,
                    boxShadow: `0 10px 30px ${colors.gradientFrom}10`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 20px 50px ${difficultyConfig.color}30`;
                    e.currentTarget.style.borderColor = `${difficultyConfig.color}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 10px 30px ${colors.gradientFrom}10`;
                    e.currentTarget.style.borderColor = colors.border;
                  }}
                >
                  <div className="p-6">
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {/* Kategória Badge */}
                      {quiz.category && (
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide"
                          style={{
                            backgroundColor: `${colors.gradientFrom}20`,
                            color: colors.gradientFrom
                          }}
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          {quiz.category}
                        </span>
                      )}

                      {/* Nehézségi szint Badge */}
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: `${difficultyConfig.color}20`,
                          color: difficultyConfig.color,
                          border: `1.5px solid ${difficultyConfig.color}`
                        }}
                      >
                        <span>{difficultyConfig.icon}</span>
                        {difficultyConfig.label}
                      </span>

                      {/* Kitöltve Badge */}
                      {hasCompleted && session?.user && (
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ml-auto"
                          style={{
                            backgroundColor: '#d1fae5',
                            color: '#065f46'
                          }}
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Kitöltve
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3
                      className="text-2xl font-bold mb-3 leading-tight"
                      style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b' }}
                    >
                      {quiz.title}
                    </h3>

                    {/* Description */}
                    {quiz.description && (
                      <p
                        className="text-sm leading-relaxed mb-4 line-clamp-2"
                        style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}
                      >
                        {quiz.description}
                      </p>
                    )}

                    {/* Compact Stats */}
                    <div className="flex items-center gap-4 mb-4 text-sm" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                      <div className="flex items-center gap-1.5">
                        <Award className="h-4 w-4" style={{ color: difficultyConfig.color }} />
                        <span className="font-semibold">{quiz.questions?.length || 0} kérdés</span>
                      </div>
                      {quiz.timeLimit && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" style={{ color: '#f97316' }} />
                          <span className="font-semibold">{formatDuration(quiz.timeLimit)}</span>
                        </div>
                      )}
                    </div>

                    {/* User's result info - kompakt */}
                    {hasCompleted && (quiz as any).userResult && (
                      <div
                        className="rounded-xl p-3 mb-4 border-l-4"
                        style={{
                          backgroundColor: isDarkMode ? '#05966910' : '#d1fae515',
                          borderColor: '#059669'
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" style={{ color: '#059669' }} />
                            <span className="text-sm font-semibold" style={{ color: '#059669' }}>
                              Eredményed: {(quiz as any).userResult.percentage}%
                            </span>
                          </div>
                          <span className="text-xs" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                            {(quiz as any).userResult.score} pont
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div
                      className="pt-4 border-t space-y-3"
                      style={{ borderColor: colors.border }}
                    >
                      {hasCompleted ? (
                        // User has completed - show both options with clear hierarchy
                        <>
                          <Link href={`/kviz/${quiz.id}/results`} className="block">
                            <button
                              className="w-full py-3.5 px-6 rounded-xl font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
                              style={{
                                background: colors.gradient,
                                color: colors.accent,
                                boxShadow: `0 4px 12px ${colors.gradientFrom}25`
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = `0 8px 20px ${colors.gradientFrom}35`;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = `0 4px 12px ${colors.gradientFrom}25`;
                              }}
                            >
                              <CheckCircle className="h-5 w-5" />
                              Eredmények megtekintése
                            </button>
                          </Link>

                          <Link href={session ? `/kviz/${quiz.id}?retake=true` : `/login?callbackUrl=${encodeURIComponent(`/kviz/${quiz.id}`)}`} className="block">
                            <button
                              className="w-full py-3.5 px-6 rounded-xl font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
                              style={{
                                backgroundColor: isDarkMode ? `${colors.gradientFrom}20` : `${colors.gradientFrom}10`,
                                color: colors.gradientFrom,
                                border: `2px solid ${colors.gradientFrom}30`
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = isDarkMode ? `${colors.gradientFrom}30` : `${colors.gradientFrom}15`;
                                e.currentTarget.style.borderColor = `${colors.gradientFrom}50`;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = isDarkMode ? `${colors.gradientFrom}20` : `${colors.gradientFrom}10`;
                                e.currentTarget.style.borderColor = `${colors.gradientFrom}30`;
                              }}
                            >
                              <Play className="h-5 w-5" />
                              Kitöltöm újra
                            </button>
                          </Link>
                        </>
                      ) : (
                        <Link href={session ? `/kviz/${quiz.id}` : `/login?callbackUrl=${encodeURIComponent(`/kviz/${quiz.id}`)}`} className="block">
                          <button
                            className="w-full py-3.5 px-6 rounded-xl font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
                            style={{
                              background: colors.gradient,
                              color: colors.accent,
                              boxShadow: `0 4px 12px ${colors.gradientFrom}25`
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.boxShadow = `0 8px 20px ${colors.gradientFrom}35`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.boxShadow = `0 4px 12px ${colors.gradientFrom}25`;
                            }}
                          >
                            <Play className="h-5 w-5" />
                            {session ? 'Kvíz indítása' : 'Bejelentkezés szükséges'}
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Call to Action */}
        {!error && quizzes.length > 0 && (
          <div className="mt-16 text-center">
            <Card className="max-w-2xl mx-auto" style={{ borderColor: colors.accent }}>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">Több kvíz következik!</h3>
                <p className="text-gray-600 mb-4">
                  Rendszeresen bővítjük kvíz kínálatunkat új témákkal és izgalmas kérdésekkel.
                </p>
                <p className="text-sm text-gray-500">
                  Kövesse oldalmunkat a legfrissebb kvízekért!
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizListPage;