"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Award, Play, Calendar, BookOpen, PlayCircle, PauseCircle, CheckCircle } from "lucide-react";
import { useThemeColors } from "@/context/ThemeContext";
import { Poll } from "@/types/poll";

const PollsListPage = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const colors = useThemeColors();
  const { data: session } = useSession();

  useEffect(() => {
    fetchPublicPolls();
  }, []);

  const fetchPublicPolls = async () => {
    try {
      const response = await fetch('/api/polls');
      if (!response.ok) throw new Error('Failed to fetch polls');
      const data = await response.json();
      setPolls(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeRemaining = (endDate: string | null) => {
    if (!endDate) return null;
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return { text: 'Lejárt', isUrgent: true };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    let text = '';
    let isUrgent = false;
    
    if (days > 0) {
      text = `${days}n ${hours}ó`;
    } else if (hours > 0) {
      text = `${hours}ó ${minutes}p`;
      isUrgent = hours < 2; // Urgent if less than 2 hours
    } else {
      text = `${minutes}p`;
      isUrgent = true;
    }
    
    return { text, isUrgent };
  };

  const getPollStatus = (poll: any) => {
    const now = new Date();
    
    if (poll.startDate && new Date(poll.startDate) > now) {
      return {
        text: 'Hamarosan indul',
        color: 'bg-blue-100 text-blue-800',
        icon: <Calendar className="h-3 w-3" />
      };
    }
    
    if (poll.endDate && new Date(poll.endDate) <= now) {
      return {
        text: 'Lezárt',
        color: 'bg-red-100 text-red-800',
        icon: <PauseCircle className="h-3 w-3" />
      };
    }
    
    return {
      text: 'Aktív',
      color: 'bg-green-100 text-green-800',
      icon: <PlayCircle className="h-3 w-3" />
    };
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleString('hu-HU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
    <div className="min-h-screen" style={{ backgroundColor: colors.bg, color: colors.text }}>
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Szavazások
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Vegyen részt közösségi szavazásainkban! Mondja el véleményét fontos kérdésekben és lássa az eredményeket.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <Card className="max-w-md mx-auto mb-8 border-red-200 bg-red-50">
            <CardContent className="pt-6 text-center">
              <p className="text-red-600 mb-4">Hiba történt: {error}</p>
              <Button onClick={fetchPublicPolls}>
                Újratöltés
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!error && polls.length === 0 && (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <PlayCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Még nincsenek elérhető szavazások</h3>
              <p className="text-gray-600 dark:text-gray-400">Hamarosan új szavazásokkal bővítjük a kínálatunkat!</p>
            </CardContent>
          </Card>
        )}

        {/* Polls Grid */}
        {!error && polls.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {polls.map((poll) => {
              const status = getPollStatus(poll);
              const timeRemaining = getTimeRemaining(poll.endDate || null);
              const isActive = status.text === 'Aktív';
              const hasVoted = (poll as any).hasVoted;
              
              return (
                <Card key={poll.id} className="hover:shadow-xl transition-all duration-300 group">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 group-hover:text-blue-600 transition-colors">
                          {poll.title}
                        </CardTitle>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge 
                            className={`${status.color} flex items-center gap-1`}
                          >
                            {status.icon}
                            {status.text}
                          </Badge>
                          
                          {(poll as any).hasVoted && session?.user && (
                            <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Szavazott
                            </Badge>
                          )}
                          
                          {poll.category && (
                            <Badge 
                              
                              className="mb-2"
                              style={{ borderColor: colors.accent }}
                            >
                              <BookOpen className="h-3 w-3 mr-1" />
                              {poll.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {poll.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 leading-relaxed">
                        {poll.description}
                      </p>
                    )}
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* Poll Stats */}
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          <span>{poll.options?.length || 0} opció</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{poll._count?.votes || 0} szavazat</span>
                        </div>
                      </div>

                      {/* User's vote info */}
                      {hasVoted && (poll as any).userVote && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Az Ön választása:</span>
                          </div>
                          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                            &ldquo;{(poll as any).userVote.selectedOption}&rdquo;
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Szavazva: {new Date((poll as any).userVote.votedAt).toLocaleDateString('hu-HU')}
                          </p>
                        </div>
                      )}

                      {/* Time Information */}
                      <div className="space-y-2 text-sm">
                        {poll.startDate && formatDate(poll.startDate) && (
                          <div className="flex items-center gap-2 text-blue-600">
                            <PlayCircle className="h-4 w-4" />
                            <span>Indul: {formatDate(poll.startDate)}</span>
                          </div>
                        )}
                        
                        {poll.endDate && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>Vége: {formatDate(poll.endDate)}</span>
                          </div>
                        )}

                        {timeRemaining && (
                          <div className={`flex items-center gap-2 ${timeRemaining.isUrgent ? 'text-red-600' : 'text-orange-600'}`}>
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">
                              {timeRemaining.isUrgent ? '⚡ ' : ''}
                              {timeRemaining.text} van hátra
                            </span>
                          </div>
                        )}

                        {poll.timeLimit && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            ⏱️ Kitöltési idő: {poll.timeLimit} perc
                          </div>
                        )}

                        {poll.maxVotesPerUser && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            👥 Maximum {poll.maxVotesPerUser} szavazat/fő
                          </div>
                        )}
                      </div>

                      {/* Vote Button */}
                      <div className="pt-4 border-t">
                        <Link href={session ? `/szavazasok/${poll.id}` : `/login?callbackUrl=${encodeURIComponent(`/szavazasok/${poll.id}`)}`}>
                          <Button 
                            className={`w-full group-hover:scale-105 transition-transform ${
                              !isActive && !hasVoted ? 'opacity-60' : ''
                            }`}
                            style={{ 
                              background: hasVoted ? '#10b981' : isActive ? colors.gradient : '#6b7280',
                              color: 'white'
                            }}
                            disabled={!isActive && !hasVoted}
                          >
                            {hasVoted ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Eredmények megtekintése
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                {!session ? 'Bejelentkezés szükséges' : isActive ? 'Szavazás' : status.text === 'Lezárt' ? 'Eredmények megtekintése' : 'Hamarosan'}
                              </>
                            )}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Call to Action */}
        {!error && polls.length > 0 && (
          <div className="mt-16 text-center">
            <Card className="max-w-2xl mx-auto" style={{ borderColor: colors.accent }}>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">Több szavazás következik!</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Rendszeresen szervezünk közösségi szavazásokat aktuális témákban.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Kövesse oldalmunkat a legfrissebb szavazásokért!
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default PollsListPage;