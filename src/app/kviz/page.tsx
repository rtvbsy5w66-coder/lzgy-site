"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useThemeColors } from "@/context/ThemeContext";
import { Quiz } from "@/types/quiz";
import { Clock, Award, Play, CheckCircle, BookOpen, TrendingUp, Filter, X } from "lucide-react";

// Difficulty configuration
const getDifficultyConfig = (difficulty?: string) => {
  switch (difficulty) {
    case 'EASY':
      return { color: '#22c55e', label: 'Könnyű', icon: '⭐', bg: '#22c55e15' };
    case 'MEDIUM':
      return { color: '#f59e0b', label: 'Közepes', icon: '⭐⭐', bg: '#f59e0b15' };
    case 'HARD':
      return { color: '#ef4444', label: 'Nehéz', icon: '⭐⭐⭐', bg: '#ef444415' };
    case 'EXPERT':
      return { color: '#8b5cf6', label: 'Haladó', icon: '⭐⭐⭐⭐', bg: '#8b5cf615' };
    default:
      return { color: '#f59e0b', label: 'Közepes', icon: '⭐⭐', bg: '#f59e0b15' };
  }
};

const QuizListPageNew = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const colors = useThemeColors();
  const { data: session } = useSession();

  const isDarkMode = colors.bg === '#0f172a' || colors.bg === '#1e293b' || colors.cardBg.includes('#1e293b') || colors.cardBg.includes('#0f172a');

  useEffect(() => {
    fetchPublicQuizzes();
  }, []);

  useEffect(() => {
    filterQuizzes();
  }, [quizzes, selectedCategory, selectedDifficulty]);

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

  const filterQuizzes = () => {
    let filtered = [...quizzes];

    if (selectedCategory) {
      filtered = filtered.filter(q => q.category === selectedCategory);
    }

    if (selectedDifficulty) {
      filtered = filtered.filter(q => (q as any).difficulty === selectedDifficulty);
    }

    setFilteredQuizzes(filtered);
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "Időlimit nélkül";
    if (minutes < 60) return `${minutes} perc`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}ó ${mins > 0 ? `${mins}p` : ''}`;
  };

  // Get unique categories and difficulties
  const categories = Array.from(new Set(quizzes.map(q => q.category).filter(Boolean)));
  const difficulties = ['EASY', 'MEDIUM', 'HARD', 'EXPERT'];

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.bg }}>
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-transparent" style={{ borderColor: `${colors.gradientFrom}30`, borderTopColor: colors.gradientFrom }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: colors.bg }}>
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <div
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6"
              style={{
                background: `linear-gradient(135deg, ${colors.gradientFrom}20, ${colors.gradientTo}20)`,
                boxShadow: `0 10px 40px ${colors.gradientFrom}15`
              }}
            >
              <TrendingUp className="w-10 h-10" style={{ color: colors.gradientFrom }} />
            </div>
          </div>
          <h1
            className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent"
            style={{
              backgroundImage: colors.gradient,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text'
            }}
          >
            Interaktív Kvízek
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: isDarkMode ? '#cbd5e1' : '#64748b' }}>
            Tesztelje tudását különböző témákban! Válasszon nehézségi szintet és mérje össze eredményét másokkal.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 mb-4"
            style={{
              backgroundColor: isDarkMode ? `${colors.gradientFrom}20` : `${colors.gradientFrom}10`,
              color: colors.gradientFrom
            }}
          >
            <Filter className="h-4 w-4" />
            Szűrők {(selectedCategory || selectedDifficulty) && `(${[selectedCategory, selectedDifficulty].filter(Boolean).length})`}
          </button>

          {showFilters && (
            <div className="p-6 rounded-2xl mb-6" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-semibold mb-3" style={{ color: colors.text }}>
                    Kategória
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory("")}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                      style={{
                        backgroundColor: !selectedCategory ? colors.gradientFrom : `${colors.gradientFrom}10`,
                        color: !selectedCategory ? colors.accent : colors.text,
                        border: `1px solid ${!selectedCategory ? colors.gradientFrom : colors.border}`
                      }}
                    >
                      Összes
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category!)}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                        style={{
                          backgroundColor: selectedCategory === category ? colors.gradientFrom : `${colors.gradientFrom}10`,
                          color: selectedCategory === category ? colors.accent : colors.text,
                          border: `1px solid ${selectedCategory === category ? colors.gradientFrom : colors.border}`
                        }}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <label className="block text-sm font-semibold mb-3" style={{ color: colors.text }}>
                    Nehézség
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedDifficulty("")}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                      style={{
                        backgroundColor: !selectedDifficulty ? colors.gradientFrom : `${colors.gradientFrom}10`,
                        color: !selectedDifficulty ? colors.accent : colors.text,
                        border: `1px solid ${!selectedDifficulty ? colors.gradientFrom : colors.border}`
                      }}
                    >
                      Összes
                    </button>
                    {difficulties.map((diff) => {
                      const config = getDifficultyConfig(diff);
                      return (
                        <button
                          key={diff}
                          onClick={() => setSelectedDifficulty(diff)}
                          className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                          style={{
                            backgroundColor: selectedDifficulty === diff ? config.color : config.bg,
                            color: selectedDifficulty === diff ? '#ffffff' : config.color,
                            border: `1px solid ${config.color}`
                          }}
                        >
                          {config.icon} {config.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              {(selectedCategory || selectedDifficulty) && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: colors.border }}>
                  <button
                    onClick={() => {
                      setSelectedCategory("");
                      setSelectedDifficulty("");
                    }}
                    className="flex items-center gap-2 text-sm font-medium"
                    style={{ color: colors.gradientFrom }}
                  >
                    <X className="h-4 w-4" />
                    Szűrők törlése
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="max-w-md mx-auto mb-8 p-6 rounded-2xl border-2 border-red-200 bg-red-50 text-center">
            <p className="text-red-600 mb-4">Hiba történt: {error}</p>
            <button
              onClick={fetchPublicQuizzes}
              className="px-6 py-2 rounded-xl font-medium transition-all"
              style={{ background: colors.gradient, color: colors.accent }}
            >
              Újratöltés
            </button>
          </div>
        )}

        {/* Empty State */}
        {!error && filteredQuizzes.length === 0 && (
          <div className="max-w-md mx-auto p-8 rounded-2xl text-center" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
            <Award className="h-16 w-16 mx-auto mb-4" style={{ color: isDarkMode ? '#64748b' : '#94a3b8' }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text }}>
              {quizzes.length === 0 ? 'Még nincsenek elérhető kvízek' : 'Nincs találat'}
            </h3>
            <p style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
              {quizzes.length === 0
                ? 'Hamarosan új kvízekkel bővítjük a kínálatunkat!'
                : 'Próbáljon más szűrési feltételekkel.'}
            </p>
          </div>
        )}

        {/* Quiz Grid */}
        {!error && filteredQuizzes.length > 0 && (
          <>
            <div className="text-sm mb-6" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
              {filteredQuizzes.length} kvíz találat
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredQuizzes.map((quiz) => {
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
                      e.currentTarget.style.borderColor = difficultyConfig.color;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = `0 10px 30px ${colors.gradientFrom}10`;
                      e.currentTarget.style.borderColor = colors.border;
                    }}
                  >
                    <div className="p-6">
                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-4">
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

                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                          style={{
                            backgroundColor: difficultyConfig.bg,
                            color: difficultyConfig.color,
                            border: `1.5px solid ${difficultyConfig.color}`
                          }}
                        >
                          <span>{difficultyConfig.icon}</span>
                          {difficultyConfig.label}
                        </span>

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

                      {/* User Result */}
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
                      <div className="pt-4 border-t space-y-3" style={{ borderColor: colors.border }}>
                        {hasCompleted ? (
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
          </>
        )}

        {/* CTA Section */}
        {!error && filteredQuizzes.length > 0 && (
          <div className="mt-16 text-center p-8 rounded-2xl" style={{ backgroundColor: colors.cardBg, border: `2px solid ${colors.gradientFrom}30` }}>
            <h3 className="text-2xl font-bold mb-3" style={{ color: colors.text }}>
              Több kvíz következik!
            </h3>
            <p className="mb-2" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
              Rendszeresen bővítjük kvíz kínálatunkat új témákkal és izgalmas kérdésekkel.
            </p>
            <p className="text-sm" style={{ color: isDarkMode ? '#64748b' : '#94a3b8' }}>
              Kövesse oldalmunkat a legfrissebb kvízekért!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizListPageNew;
