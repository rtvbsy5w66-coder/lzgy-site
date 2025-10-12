"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Calendar,
  Clock,
  AlertCircle,
  BarChart3,
  CheckCircle
} from "lucide-react";
import { useThemeColors } from "@/context/ThemeContext";

interface PollResultsPageProps {
  params: { id: string };
}

const PollResultsPage: React.FC<PollResultsPageProps> = ({ params }) => {
  const router = useRouter();
  const colors = useThemeColors();

  const [poll, setPoll] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPollResults();
  }, [params.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPollResults = async () => {
    try {
      const response = await fetch(`/api/polls/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Ez a szavazás nem található.');
        } else if (response.status === 403) {
          throw new Error('Ez a szavazás nem érhető el.');
        }
        throw new Error('Nem sikerült betölteni a szavazást.');
      }
      const data = await response.json();

      // Check if results are available
      if (!data.results) {
        throw new Error('Az eredmények még nem elérhetők. Lehet, hogy a szavazás még folyamatban van, vagy még nem szavaztál.');
      }

      setPoll(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ismeretlen hiba történt');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Eredmények betöltése...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Hiba történt</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Vissza
              </Button>
              <Button onClick={() => router.push(`/szavazasok/${params.id}`)} className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                Szavazás oldal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!poll) return null;

  const totalVotes = poll.results?.reduce((sum: number, r: any) => sum + r.voteCount, 0) || 0;
  const sortedResults = poll.results
    ? [...poll.results].sort((a: any, b: any) => b.voteCount - a.voteCount)
    : [];

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bg, color: colors.text }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={() => router.back()} className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Vissza
          </Button>
        </div>

        {/* Poll Info Card */}
        <Card className="mb-8" style={{ borderColor: colors.accent }}>
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{poll.title}</CardTitle>
                {poll.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{poll.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{totalVotes} szavazat</span>
                  </div>
                  {poll.category && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="capitalize">{poll.category.toLowerCase()}</span>
                    </div>
                  )}
                  {poll.currentStatus && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        poll.currentStatus === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : poll.currentStatus === 'CLOSED'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {poll.currentStatus === 'ACTIVE' ? 'Aktív' :
                         poll.currentStatus === 'CLOSED' ? 'Lezárva' :
                         poll.currentStatus === 'SCHEDULED' ? 'Ütemezett' : 'Vázlat'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Results Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <CardTitle className="text-xl">Eredmények</CardTitle>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Összesen {totalVotes} leadott szavazat
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedResults.map((resultItem: any, index: number) => {
                const isWinner = index === 0 && totalVotes > 0;
                return (
                  <Card
                    key={resultItem.option.id}
                    className={`border-l-4 ${
                      isWinner
                        ? 'border-l-green-500 bg-gradient-to-r from-green-50 to-transparent dark:from-green-900/20'
                        : 'border-l-gray-300'
                    }`}
                  >
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-lg">{resultItem.option.optionText}</h4>
                            {isWinner && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                          </div>
                          {resultItem.option.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {resultItem.option.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {resultItem.percentage.toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {resultItem.voteCount} szavazat
                          </div>
                        </div>
                      </div>
                      <Progress
                        value={resultItem.percentage}
                        className={`h-4 ${isWinner ? 'bg-green-200' : ''}`}
                      />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            onClick={() => router.push(`/szavazasok/${params.id}`)}
            style={{ background: colors.gradient }}
          >
            Szavazás oldal megtekintése
          </Button>
          <Button
            onClick={() => router.push('/szavazasok')}
            className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            Összes szavazás
          </Button>
          <Button
            onClick={() => window.location.reload()}
            className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            Frissítés
          </Button>
        </div>

        {/* Additional Info */}
        {poll.endDate && (
          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {poll.currentStatus === 'CLOSED' ? 'Lezárva:' : 'Lezárás:'}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {new Date(poll.endDate).toLocaleString('hu-HU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PollResultsPage;
