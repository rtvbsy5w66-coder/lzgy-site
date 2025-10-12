"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Clock, Calendar } from "lucide-react";

interface QuizResultCardProps {
  result: {
    id: string;
    score: number;
    totalPoints: number;
    timeSpent?: number;
    completedAt: string;
    quiz: {
      title: string;
      category?: string;
    };
  };
  detailed?: boolean;
}

export function QuizResultCard({ result, detailed = false }: QuizResultCardProps) {
  const percentage = Math.round((result.score / result.totalPoints) * 100);
  
  const getPerformanceBadge = (percentage: number) => {
    if (percentage >= 90) return { variant: "default" as const, text: "Kiváló", color: "bg-green-500" };
    if (percentage >= 75) return { variant: "secondary" as const, text: "Jó", color: "bg-blue-500" };
    if (percentage >= 60) return { variant: "outline" as const, text: "Elfogadható", color: "bg-yellow-500" };
    return { variant: "destructive" as const, text: "Fejlesztendő", color: "bg-red-500" };
  };

  const performance = getPerformanceBadge(percentage);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "—";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="p-4 hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500">
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg mb-1">
            {result.quiz.title}
          </h3>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(result.completedAt)}</span>
            </div>
            {detailed && result.timeSpent && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(result.timeSpent)}</span>
              </div>
            )}
            {result.quiz.category && (
              <Badge className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs">
                {result.quiz.category}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant={performance.variant} className="flex items-center gap-1">
            <Trophy className="h-3 w-3" />
            {performance.text}
          </Badge>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {percentage}%
            </div>
            <div className="text-xs text-gray-500">
              {result.score}/{result.totalPoints} pont
            </div>
          </div>
        </div>
      </div>

      {detailed && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 w-16">Eredmény:</span>
            <Progress 
              value={percentage} 
              className="flex-1 h-2" 
            />
            <span className="text-sm font-medium text-gray-900 w-12">
              {percentage}%
            </span>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <span className="font-medium">Elért pontok:</span>
              <span>{result.score}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">Összpontszám:</span>
              <span>{result.totalPoints}</span>
            </div>
            {result.timeSpent && (
              <div className="flex items-center gap-1">
                <span className="font-medium">Idő:</span>
                <span>{formatDuration(result.timeSpent)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}