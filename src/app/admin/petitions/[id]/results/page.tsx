"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
  MapPin,
  Download,
  Eye,
  Shield,
  FileText
} from "lucide-react";

interface AdminPetitionResultsPageProps {
  params: { id: string };
}

const AdminPetitionResultsPage: React.FC<AdminPetitionResultsPageProps> = ({ params }) => {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [petition, setPetition] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchPetitionResults();
    }
  }, [params.id, status]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const exportResults = () => {
    if (!petition) return;

    const signatureCount = petition._count?.signatures || 0;
    const targetGoal = petition.targetGoal || 1000;
    const progressPercentage = Math.min((signatureCount / targetGoal) * 100, 100);

    const csvContent = [
      ['Petíció', petition.title],
      ['Kategória', petition.category?.name || 'N/A'],
      ['Aláírások', signatureCount],
      ['Cél', targetGoal],
      ['Haladás', `${progressPercentage.toFixed(2)}%`],
      ['Státusz', petition.status],
      ['Létrehozva', new Date(petition.createdAt).toLocaleDateString('hu-HU')],
      ['', ''],
      ['Aláírások részletei', ''],
      ['Ellenőrzött aláírások', signatureCount],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `petition_${params.id}_results.csv`;
    link.click();
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Eredmények betöltése...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (session.user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Hozzáférés Megtagadva</h3>
            <p className="text-red-600 mb-4">Nincs jogosultságod az admin felület megtekintéséhez.</p>
            <Button onClick={() => router.push('/')}>
              Vissza a főoldalra
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Hiba történt</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => router.push('/admin/petitions')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Vissza a petíciókhoz
              </Button>
              <Button onClick={() => window.location.reload()} className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                Újrapróbálás
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button onClick={() => router.push('/admin/petitions')} className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Vissza
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Petíció Eredmények</h1>
              <p className="text-sm text-gray-600">Admin Nézet</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportResults} className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              CSV Export
            </Button>
            <Button onClick={() => router.push(`/peticiok/${params.id}`)} className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
              <Eye className="h-4 w-4 mr-2" />
              Publikus Nézet
            </Button>
          </div>
        </div>

        {/* Petition Info Card */}
        <Card className="mb-8 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
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
                  <p className="text-gray-700 mb-4">{petition.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                  {petition.category && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="font-semibold">{petition.category.name}</span>
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
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      petition.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : petition.status === 'CLOSED'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {petition.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Progress Card */}
          <div className="lg:col-span-2">
            <Card className={`${
              isGoalReached
                ? 'border-green-500 bg-gradient-to-r from-green-50 to-transparent'
                : ''
            }`}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target className="h-6 w-6 text-blue-600" />
                  <CardTitle className="text-xl">Aláírások Haladása</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Main Stats */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <div className="text-6xl font-bold" style={{ color: isGoalReached ? '#10b981' : '#3b82f6' }}>
                        {signatureCount.toLocaleString('hu-HU')}
                      </div>
                      {isGoalReached && (
                        <CheckCircle className="h-16 w-16 text-green-500" />
                      )}
                    </div>
                    <p className="text-gray-600 text-lg">
                      aláírás a(z) <span className="font-semibold">{targetGoal.toLocaleString('hu-HU')}</span> célból
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
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
                    <div className="bg-green-100 border border-green-500 rounded-lg p-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-green-700">
                        <CheckCircle className="h-6 w-6" />
                        <span className="font-semibold text-xl">A cél elérve!</span>
                      </div>
                      <p className="text-sm text-green-600 mt-2">
                        Gratulálunk! A petíció elérte a kitűzött célt.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-blue-50 border border-blue-500 rounded-lg p-4 text-center">
                      <div className="text-blue-700">
                        <span className="font-semibold text-xl">
                          Még {(targetGoal - signatureCount).toLocaleString('hu-HU')} aláírás szükséges
                        </span>
                        <p className="text-sm text-blue-600 mt-2">
                          {progressPercentage.toFixed(1)}% teljesítve
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Statisztikák
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-blue-100 text-sm">Összes Aláírás</p>
                  <p className="text-4xl font-bold">{signatureCount}</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Célszám</p>
                  <p className="text-4xl font-bold">{targetGoal}</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Haladás</p>
                  <p className="text-4xl font-bold">{progressPercentage.toFixed(0)}%</p>
                </div>
              </CardContent>
            </Card>

            {/* Settings Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Beállítások</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Publikus:</span>
                  <span className="font-semibold">{petition.isPublic ? 'Igen' : 'Nem'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Aktív:</span>
                  <span className="font-semibold">{petition.isActive ? 'Igen' : 'Nem'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Státusz:</span>
                  <span className="font-semibold">{petition.status}</span>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            {(petition.startDate || petition.endDate) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Időzítés
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {petition.startDate && (
                    <div>
                      <p className="text-gray-600 mb-1">Kezdés:</p>
                      <p className="font-semibold">
                        {new Date(petition.startDate).toLocaleString('hu-HU', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                  {petition.endDate && (
                    <div>
                      <p className="text-gray-600 mb-1">Lezárás:</p>
                      <p className="font-semibold">
                        {new Date(petition.endDate).toLocaleString('hu-HU', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPetitionResultsPage;
