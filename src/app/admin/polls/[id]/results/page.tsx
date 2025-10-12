"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
  CheckCircle,
  Download,
  Eye,
  Shield
} from "lucide-react";

interface AdminPollResultsPageProps {
  params: { id: string };
}

const AdminPollResultsPage: React.FC<AdminPollResultsPageProps> = ({ params }) => {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [poll, setPoll] = useState<any>(null);
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
      fetchPollResults();
    }
  }, [params.id, status]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPollResults = async () => {
    try {
      const response = await fetch(`/api/polls/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Ez a szavazás nem található.');
        } else if (response.status === 403) {
          throw new Error('Nincs jogosultság az oldal megtekintéséhez.');
        }
        throw new Error('Nem sikerült betölteni a szavazást.');
      }
      const data = await response.json();

      // Admin always sees results
      if (!data.results) {
        throw new Error('Az eredmények nem elérhetők.');
      }

      setPoll(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ismeretlen hiba történt');
    } finally {
      setIsLoading(false);
    }
  };

  const exportResults = () => {
    if (!poll || !poll.results) return;

    const csvContent = [
      ['Opció', 'Szavazatok', 'Százalék'],
      ...poll.results.map((r: any) => [
        r.option.optionText,
        r.voteCount,
        `${r.percentage.toFixed(2)}%`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `poll_${params.id}_results.csv`;
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
              <Button onClick={() => router.push('/admin/polls')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Vissza a szavazásokhoz
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

  if (!poll) return null;

  const totalVotes = poll.results?.reduce((sum: number, r: any) => sum + r.voteCount, 0) || 0;
  const sortedResults = poll.results
    ? [...poll.results].sort((a: any, b: any) => b.voteCount - a.voteCount)
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button onClick={() => router.push('/admin/polls')} className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Vissza
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Szavazás Eredmények</h1>
              <p className="text-sm text-gray-600">Admin Nézet</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportResults} className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              CSV Export
            </Button>
            <Button onClick={() => router.push(`/szavazasok/${params.id}`)} className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
              <Eye className="h-4 w-4 mr-2" />
              Publikus Nézet
            </Button>
          </div>
        </div>

        {/* Poll Info Card */}
        <Card className="mb-8 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{poll.title}</CardTitle>
                {poll.description && (
                  <p className="text-gray-700 mb-4">{poll.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="font-semibold">{totalVotes} szavazat</span>
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
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Results */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                  <CardTitle className="text-xl">Részletes Eredmények</CardTitle>
                </div>
                <p className="text-gray-600 text-sm">
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
                            ? 'border-l-green-500 bg-gradient-to-r from-green-50 to-transparent'
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
                                <p className="text-sm text-gray-600">
                                  {resultItem.option.description}
                                </p>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-2xl font-bold text-gray-900">
                                {resultItem.percentage.toFixed(1)}%
                              </div>
                              <div className="text-sm text-gray-600">
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
          </div>

          {/* Sidebar Stats */}
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
                  <p className="text-blue-100 text-sm">Összes Szavazat</p>
                  <p className="text-3xl font-bold">{totalVotes}</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Opciók Száma</p>
                  <p className="text-3xl font-bold">{poll.options?.length || 0}</p>
                </div>
                {poll.maxVotesPerUser && (
                  <div>
                    <p className="text-blue-100 text-sm">Max Szavazat/Fő</p>
                    <p className="text-3xl font-bold">{poll.maxVotesPerUser}</p>
                  </div>
                )}
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
                  <span className="font-semibold">{poll.isPublic ? 'Igen' : 'Nem'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Anonim szavazás:</span>
                  <span className="font-semibold">{poll.allowAnonymous ? 'Igen' : 'Nem'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Eredmények láthatósága:</span>
                  <span className="font-semibold text-xs">
                    {poll.showResults === 'LIVE' ? 'Élő' :
                     poll.showResults === 'AFTER_VOTING' ? 'Szavazás után' :
                     poll.showResults === 'AFTER_END' ? 'Lezárás után' : 'Soha'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Élő számláló:</span>
                  <span className="font-semibold">{poll.showLiveCount ? 'Igen' : 'Nem'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            {(poll.startDate || poll.endDate) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Időzítés
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {poll.startDate && (
                    <div>
                      <p className="text-gray-600 mb-1">Kezdés:</p>
                      <p className="font-semibold">
                        {new Date(poll.startDate).toLocaleString('hu-HU', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                  {poll.endDate && (
                    <div>
                      <p className="text-gray-600 mb-1">Lezárás:</p>
                      <p className="font-semibold">
                        {new Date(poll.endDate).toLocaleString('hu-HU', {
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

export default AdminPollResultsPage;
