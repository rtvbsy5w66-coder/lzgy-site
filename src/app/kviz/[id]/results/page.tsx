"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Medal, 
  Award, 
  Clock, 
  Target, 
  Users, 
  ArrowLeft,
  Play,
  Star
} from "lucide-react";
import { useThemeColors } from "@/context/ThemeContext";

interface QuizResult {
  id: string;
  score: number;
  totalPoints: number;
  percentage: number;
  timeSpent: number;
  completedAt: string;
  user?: {
    name: string;
    email: string;
  };
  participantName?: string;
  participantEmail?: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  questions: { id: string }[];
}

const QuizResultsPage = () => {
  const params = useParams();
  const quizId = params.id as string;
  const colors = useThemeColors();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuizAndResults();
  }, [quizId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchQuizAndResults = async () => {
    try {
      // Fetch quiz details
      const quizResponse = await fetch(`/api/quizzes/${quizId}`);
      if (!quizResponse.ok) throw new Error('Quiz not found');
      const quizData = await quizResponse.json();
      setQuiz(quizData);

      // Fetch quiz results
      const resultsResponse = await fetch(`/api/quizzes/${quizId}/results`);
      if (!resultsResponse.ok) throw new Error('Failed to fetch results');
      const resultsData = await resultsResponse.json();
      setResults(resultsData.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Award className="h-6 w-6 text-orange-500" />;
      default: return <Star className="h-6 w-6 text-gray-300" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-yellow-600';
      case 2: return 'from-gray-300 to-gray-500';
      case 3: return 'from-orange-400 to-orange-600';
      default: return 'from-gray-100 to-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.bg, color: colors.text }}>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.bg, color: colors.text }}>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto border-red-200 bg-red-50">
            <CardContent className="pt-6 text-center">
              <p className="text-red-600 mb-4">Hiba: {error || 'Kvíz nem található'}</p>
              <Link href="/kviz">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Vissza a kvízekhez
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Sort results by score (descending) then by time (ascending)
  const sortedResults = [...results].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.timeSpent - b.timeSpent;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bg, color: colors.text }}>
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/kviz" className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Vissza a kvízekhez
          </Link>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: colors.text }}>
                {quiz.title}
              </h1>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span>{quiz.questions.length} kérdés</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{results.length} résztvevő</span>
                </div>
                {quiz.category && (
                  <Badge style={{ borderColor: colors.accent }}>
                    {quiz.category}
                  </Badge>
                )}
              </div>
            </div>
            
            <Link href={`/kviz/${quizId}`}>
              <Button
                style={{ 
                  background: colors.gradient,
                  color: colors.accent
                }}
                className="shadow-lg"
              >
                <Play className="h-4 w-4 mr-2" />
                Kvíz kitöltése
              </Button>
            </Link>
          </div>
        </div>

        {/* Results Section */}
        {results.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">Még nincsenek eredmények</h3>
              <p className="text-gray-600 mb-6">
                Légy az első, aki kitölti ezt a kvízt!
              </p>
              <Link href={`/kviz/${quizId}`}>
                <Button
                  style={{ 
                    background: colors.gradient,
                    color: colors.accent
                  }}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Kvíz kitöltése
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Top 3 Podium */}
            {sortedResults.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[1, 0, 2].map((index, position) => {
                  const result = sortedResults[index];
                  if (!result) return null;
                  
                  const rank = index + 1;
                  const heights = ['h-24', 'h-32', 'h-20'];
                  
                  return (
                    <div key={result.id} className={`flex flex-col items-center ${position === 1 ? 'order-1' : ''}`}>
                      <div 
                        className={`w-full ${heights[position]} rounded-t-lg bg-gradient-to-t ${getRankColor(rank)} flex items-end justify-center pb-4`}
                      >
                        <div className="text-center text-white">
                          {getRankIcon(rank)}
                          <div className="text-2xl font-bold">{rank}</div>
                        </div>
                      </div>
                      <div className="w-full p-4 rounded-b-lg shadow-lg text-center" style={{ backgroundColor: colors.cardBg }}>
                        <div className="font-semibold" style={{ color: colors.text }}>
                          {result.user?.name || result.participantName || 'Anonim'}
                        </div>
                        <div className="text-2xl font-bold" style={{ color: colors.text }}>
                          {result.percentage}%
                        </div>
                        <div className="text-sm" style={{ color: colors.text }}>
                          {formatTime(result.timeSpent)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" style={{ color: colors.accent }} />
                  Ranglista
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sortedResults.map((result, index) => {
                    const rank = index + 1;
                    return (
                      <div
                        key={result.id}
                        className={`flex items-center gap-4 p-4 rounded-lg border ${
                          rank <= 3
                            ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800'
                            : ''
                        }`}
                        style={rank > 3 ? {
                          backgroundColor: colors.cardBg,
                          borderColor: colors.border
                        } : undefined}
                      >
                        {/* Rank */}
                        <div className="flex items-center justify-center w-12 h-12">
                          {rank <= 3 ? (
                            getRankIcon(rank)
                          ) : (
                            <div className="text-xl font-bold" style={{ color: colors.text }}>
                              {rank}
                            </div>
                          )}
                        </div>

                        {/* Name */}
                        <div className="flex-1">
                          <div className="font-semibold" style={{ color: colors.text }}>
                            {result.user?.name || result.participantName || 'Anonim résztvevő'}
                          </div>
                          <div className="text-sm" style={{ color: colors.text }}>
                            {new Date(result.completedAt).toLocaleDateString('hu-HU', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>

                        {/* Score */}
                        <div className="text-center">
                          <div className="text-2xl font-bold" style={{ color: colors.text }}>
                            {result.percentage}%
                          </div>
                          <div className="text-sm" style={{ color: colors.text }}>
                            {result.score}/{result.totalPoints} pont
                          </div>
                        </div>

                        {/* Time */}
                        <div className="text-center min-w-[80px]">
                          <div className="flex items-center gap-1" style={{ color: colors.text }}>
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(result.timeSpent)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizResultsPage;