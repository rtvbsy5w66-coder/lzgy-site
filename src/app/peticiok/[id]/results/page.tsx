"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Users,
  Calendar,
  Target,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  BarChart3,
  MapPin
} from "lucide-react";
import { useThemeColors } from "@/context/ThemeContext";

interface PetitionResultsPageProps {
  params: { id: string };
}

const PetitionResultsPage: React.FC<PetitionResultsPageProps> = ({ params }) => {
  const router = useRouter();
  const colors = useThemeColors();

  const [petition, setPetition] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPetitionResults();
  }, [params.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPetitionResults = async () => {
    try {
      const response = await fetch(`/api/petitions/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Ez a petíció nem található.');
        }
        throw new Error('Nem sikerült betölteni a petíciót.');
      }
      const data = await response.json();
      setPetition(data);
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
              <Button onClick={() => router.push(`/peticiok/${params.id}`)} className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                Petíció oldal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!petition) return null;

  const signatureCount = petition._count?.signatures || 0;
  const targetGoal = petition.targetGoal || 1000;
  const progressPercentage = Math.min((signatureCount / targetGoal) * 100, 100);
  const isGoalReached = signatureCount >= targetGoal;

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

        {/* Petition Info Card */}
        <Card className="mb-8" style={{ borderColor: colors.accent }}>
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${
                isGoalReached
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                  : 'bg-gradient-to-br from-blue-500 to-purple-600'
              }`}>
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{petition.title}</CardTitle>
                {petition.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{petition.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                  {petition.category && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{petition.category.name}</span>
                    </div>
                  )}
                  {petition.createdAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(petition.createdAt).toLocaleDateString('hu-HU', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Progress Card */}
        <Card className={`mb-8 ${
          isGoalReached
            ? 'border-green-500 bg-gradient-to-r from-green-50 to-transparent dark:from-green-900/20'
            : ''
        }`}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-6 w-6 text-blue-600" />
              <CardTitle className="text-xl">Aláírások száma</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Main Stats */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="text-5xl font-bold" style={{ color: isGoalReached ? '#10b981' : colors.gradientFrom }}>
                    {signatureCount.toLocaleString('hu-HU')}
                  </div>
                  {isGoalReached && (
                    <CheckCircle className="h-12 w-12 text-green-500" />
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  aláírás a(z) <span className="font-semibold">{targetGoal.toLocaleString('hu-HU')}</span> célból
                </p>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Haladás</span>
                  <span className="font-semibold">{progressPercentage.toFixed(1)}%</span>
                </div>
                <Progress
                  value={progressPercentage}
                  className={`h-6 ${isGoalReached ? 'bg-green-200' : ''}`}
                />
              </div>

              {/* Status Badge */}
              {isGoalReached ? (
                <div className="bg-green-100 dark:bg-green-900/20 border border-green-500 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold text-lg">A cél elérve!</span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-500 mt-2">
                    Gratulálunk! A petíció elérte a kitűzött célt.
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-500 rounded-lg p-4 text-center">
                  <div className="text-blue-700 dark:text-blue-400">
                    <span className="font-semibold text-lg">
                      Még {(targetGoal - signatureCount).toLocaleString('hu-HU')} aláírás szükséges
                    </span>
                    <p className="text-sm text-blue-600 dark:text-blue-500 mt-2">
                      Segíts elérni a célt! Oszd meg a petíciót másokkal.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Statistics Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <CardTitle className="text-xl">Statisztikák</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Összes aláírás</p>
                    <p className="text-2xl font-bold">{signatureCount.toLocaleString('hu-HU')}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Target className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Célszám</p>
                    <p className="text-2xl font-bold">{targetGoal.toLocaleString('hu-HU')}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            onClick={() => router.push(`/peticiok/${params.id}`)}
            style={{ background: colors.gradient }}
          >
            Petíció oldal megtekintése
          </Button>
          <Button
            onClick={() => router.push('/peticiok')}
            className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            Összes petíció
          </Button>
          <Button
            onClick={() => window.location.reload()}
            className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            Frissítés
          </Button>
        </div>

        {/* Additional Info */}
        {petition.endDate && (
          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {new Date(petition.endDate) > new Date() ? 'Lezárás:' : 'Lezárva:'}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {new Date(petition.endDate).toLocaleString('hu-HU', {
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

export default PetitionResultsPage;
