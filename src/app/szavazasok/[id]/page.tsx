"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft, 
  Send,
  Award,
  Target,
  Timer,
  Users,
  TrendingUp,
  PlayCircle,
  PauseCircle
} from "lucide-react";
import { useThemeColors } from "@/context/ThemeContext";
import crypto from "crypto";
import { Poll, PollOption, VoteSubmissionData } from "@/types/poll";
import InteractiveParticipationFlow from "@/components/InteractiveParticipationFlow";

interface PollVotingPageProps {
  params: { id: string };
}

const PollVotingPage: React.FC<PollVotingPageProps> = ({ params }) => {
  const router = useRouter();
  const colors = useThemeColors();
  const { data: session } = useSession();
  
  const [poll, setPoll] = useState<any>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timeUntilStart, setTimeUntilStart] = useState<number | null>(null);
  const [startTime] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showInteractiveFlow, setShowInteractiveFlow] = useState(false);
  const [participationType, setParticipationType] = useState<'ANONYMOUS' | 'REGISTERED' | null>(null);
  const [hasChosen, setHasChosen] = useState(false);

  // Fetch poll data
  useEffect(() => {
    fetchPoll();
  }, [params.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Timer setup for poll end time
  useEffect(() => {
    if (poll && !result) {
      let timer: NodeJS.Timeout;
      
      const updateTimer = () => {
        const now = new Date();
        
        // Check if poll hasn't started yet
        if (poll.startDate && new Date(poll.startDate) > now) {
          const timeUntil = Math.floor((new Date(poll.startDate).getTime() - now.getTime()) / 1000);
          setTimeUntilStart(timeUntil > 0 ? timeUntil : 0);
          setTimeLeft(null);
        } else {
          setTimeUntilStart(null);
          
          // Check if poll has ended
          if (poll.endDate) {
            const timeRemaining = Math.floor((new Date(poll.endDate).getTime() - now.getTime()) / 1000);
            setTimeLeft(timeRemaining > 0 ? timeRemaining : 0);
          } else {
            setTimeLeft(null);
          }
        }
      };

      updateTimer(); // Initial update
      timer = setInterval(updateTimer, 1000);

      return () => clearInterval(timer);
    }
  }, [poll, result]);

  const fetchPoll = async () => {
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
      setPoll(data);
      
      // If user has already voted and results are available, show them
      if (data.hasVoted && data.results) {
        setResult({
          results: data.results,
          userVote: data.userVote,
          poll: data
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ismeretlen hiba történt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!poll || !selectedOptionId) {
      alert('Kérjük, válasszon egy lehetőséget!');
      return;
    }
    
    // If user is logged in, directly proceed with registered submission
    if (session?.user) {
      await handleDirectRegisteredSubmit();
      return;
    }
    
    // If user is not logged in and hasn't chosen participation type yet, show the flow
    if (!hasChosen) {
      setShowInteractiveFlow(true);
      return;
    }
    
    // If user has chosen, proceed with direct submission
    if (participationType === 'ANONYMOUS') {
      await handleDirectAnonymousSubmit();
    } else {
      await handleDirectRegisteredSubmit();
    }
  };

  const handleDirectAnonymousSubmit = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/polls/${params.id}/vote-anonymous`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          optionId: selectedOptionId,
          sessionId: crypto.randomUUID(),
          timeSpent: Math.floor((Date.now() - startTime) / 1000),
          allowAnalytics: false
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to vote');
      handleVoteSuccess(result);
    } catch (error) {
      handleVoteError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectRegisteredSubmit = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/polls/${params.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          optionId: selectedOptionId,
          email: session?.user?.email || '',
          name: (session?.user as any)?.displayName || session?.user?.name || '',
          timeSpent: Math.floor((Date.now() - startTime) / 1000),
          subscribeUpdates: true // Auto-subscribe logged in users for updates
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to vote');
      handleVoteSuccess(result);
    } catch (error) {
      handleVoteError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleParticipationChoice = (type: 'ANONYMOUS' | 'REGISTERED') => {
    setParticipationType(type);
    setHasChosen(true);
    setShowInteractiveFlow(false);
    
    // After choice is made, proceed with submission
    if (type === 'ANONYMOUS') {
      handleDirectAnonymousSubmit();
    } else {
      handleDirectRegisteredSubmit();
    }
  };

  const handleVoteSuccess = (result: any) => {
    setResult(result);
    setShowInteractiveFlow(false);
    
    // Refresh poll data to get updated counts
    fetchPoll();
  };

  const handleVoteError = (error: string) => {
    console.error('Vote error:', error);
    alert(error);
  };

  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const mins = Math.floor((seconds % (60 * 60)) / 60);
    const secs = seconds % 60;
    
    if (days > 0) return `${days}n ${hours}ó ${mins}p`;
    if (hours > 0) return `${hours}ó ${mins}p ${secs}s`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCountdownColor = (seconds: number) => {
    if (seconds < 300) return 'text-red-600'; // Less than 5 minutes - red
    if (seconds < 3600) return 'text-orange-600'; // Less than 1 hour - orange
    return 'text-blue-600'; // More than 1 hour - blue
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Szavazás betöltése...</p>
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
            <Button onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Vissza
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!poll) return null;

  // NOTE: Participation choice is now shown ONLY when user clicks submit
  // This ensures users can see and complete poll questions first

  // Results page
  if (result) {
    const totalVotes = result.results?.reduce((sum: number, r: any) => sum + r.voteCount, 0) || 0;
    
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.bg, color: colors.text }}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="mb-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700" style={{ borderColor: colors.accent }}>
            <CardHeader className="text-center">
              <div className="mb-4">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl mb-2 text-gray-900 dark:text-gray-100">Szavazat leadva!</CardTitle>
              <h2 className="text-xl text-gray-600 dark:text-gray-400">{poll.title}</h2>
            </CardHeader>
            <CardContent>
              {/* Results Display */}
              {result.results && (
                <div className="space-y-4 mb-8">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <TrendingUp className="h-5 w-5" />
                    Eredmények: ({totalVotes} szavazat)
                  </h3>
                  {result.results.map((resultItem: any, index: number) => (
                    <Card key={index} className={`border-l-4 ${
                      result.userVote?.optionId === resultItem.option.id
                        ? 'border-l-green-500 bg-green-50 dark:bg-green-900/20 dark:border-l-green-400'
                        : 'border-l-gray-300 dark:border-l-gray-600 bg-white dark:bg-gray-800'
                    }`}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className={`font-medium flex-1 ${
                            result.userVote?.optionId === resultItem.option.id
                              ? 'text-gray-900 dark:text-gray-100'
                              : 'text-gray-900 dark:text-gray-100'
                          }`}>{resultItem.option.optionText}</h4>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${
                              result.userVote?.optionId === resultItem.option.id
                                ? 'text-gray-900 dark:text-gray-100'
                                : 'text-gray-900 dark:text-gray-100'
                            }`}>
                              {resultItem.voteCount} ({resultItem.percentage.toFixed(1)}%)
                            </span>
                            {result.userVote?.optionId === resultItem.option.id && (
                              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            )}
                          </div>
                        </div>
                        <Progress value={resultItem.percentage} className="h-3 mb-2" />
                        {resultItem.option.description && (
                          <p className={`text-sm mt-2 ${
                            result.userVote?.optionId === resultItem.option.id
                              ? 'text-gray-700 dark:text-gray-300'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {resultItem.option.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <div className="flex justify-center gap-4">
                <Button onClick={() => router.push('/szavazasok')}>
                  Más szavazások
                </Button>
                <Button onClick={() => window.location.reload()}>
                  Oldal frissítése
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Check if poll hasn't started yet
  if (timeUntilStart !== null && timeUntilStart > 0) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.bg, color: colors.text }}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <PlayCircle className="h-16 w-16 mx-auto mb-4 text-blue-500" />
              <h2 className="text-2xl font-semibold mb-4">{poll.title}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Ez a szavazás még nem kezdődött el.</p>
              
              <div className="mb-6">
                <div className={`text-3xl font-bold ${getCountdownColor(timeUntilStart)} mb-2`}>
                  <Timer className="h-8 w-8 inline mr-2" />
                  {formatTime(timeUntilStart)}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">a kezdésig</p>
              </div>

              <Button onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Vissza a szavazásokhoz
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Check if poll has ended
  if (timeLeft !== null && timeLeft <= 0) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.bg, color: colors.text }}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <PauseCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
              <h2 className="text-2xl font-semibold mb-4">{poll.title}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Ez a szavazás már lezárult.</p>
              
              {poll.results && (
                <div className="text-left max-w-2xl mx-auto mb-6">
                  <h3 className="text-lg font-semibold mb-4 text-center">Végeredmények:</h3>
                  {poll.results.map((result: any, index: number) => (
                    <Card key={index} className="mb-3">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span>{result.option.optionText}</span>
                          <span className="font-semibold">
                            {result.voteCount} ({result.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={result.percentage} className="h-2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <Button onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Vissza a szavazásokhoz
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Check if user can vote
  if (!poll.canVote) {
    const reason = poll.hasVoted ? "Már szavazott ebben a szavazásban" : "Nem jogosult szavazni";
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.bg, color: colors.text }}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="text-center border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-orange-500" />
              <h2 className="text-2xl font-semibold mb-4">{poll.title}</h2>
              <p className="text-orange-700 dark:text-orange-300 mb-6">{reason}</p>
              
              <Button onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Vissza a szavazásokhoz
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bg, color: colors.text }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Vissza
          </Button>
          <h1 className="text-xl font-semibold text-center flex-1 mx-4">
            {poll.title}
          </h1>
          {timeLeft !== null && (
            <div className={`flex items-center gap-2 ${getCountdownColor(timeLeft)}`}>
              <Timer className="h-4 w-4" />
              <span className="font-mono text-lg">
                {timeLeft > 0 ? formatTime(timeLeft) : "Lejárt"}
              </span>
            </div>
          )}
        </div>

        {/* Poll Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">{poll.title}</CardTitle>
            {poll.description && (
              <p className="text-gray-600 dark:text-gray-400">{poll.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{poll._count?.votes || 0} szavazat leadva</span>
              </div>
              {poll.maxVotesPerUser && (
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  <span>Max {poll.maxVotesPerUser} szavazat/fő</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedOptionId}
              onValueChange={setSelectedOptionId}
            >
              <div className="space-y-4">
                {poll.options.map((option: PollOption) => (
                  <div key={option.id} className="flex items-start space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                    <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor={option.id} className="text-base cursor-pointer font-medium text-gray-900 dark:text-gray-100 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                        {option.optionText}
                      </Label>
                      {option.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 mt-1">{option.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* User Status Info */}
        {session?.user && (
          <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center gap-3 text-center">
              <div className="flex-1">
                <h3 className="text-yellow-600 dark:text-yellow-400 font-semibold">
                  Bejelentkezve mint: {(session.user as any)?.displayName || session.user?.name || session.user?.email}
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                  Adatai automatikusan ki lesznek töltve
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button 
            onClick={handleSubmit}
            disabled={!selectedOptionId || isSubmitting}
            className="px-8"
            style={{ 
              background: selectedOptionId && !isSubmitting ? colors.gradient : '#6b7280',
              color: 'white'
            }}
          >
            <Send className="h-5 w-5 mr-2" />
            {isSubmitting ? (
              'Szavazás leadása...'
            ) : session?.user ? (
              'Szavazás leadása (Regisztrálva)'
            ) : (
              'Szavazás leadása'
            )}
          </Button>
        </div>

        {/* Live Count Display */}
        {poll.showLiveCount && (
          <Card className="mt-8">
            <CardContent className="pt-6 text-center">
              <h3 className="text-lg font-semibold mb-4">Élő szavazatszám</h3>
              <div className="text-3xl font-bold" style={{ color: colors.gradientFrom }}>
                {poll._count?.votes || 0}
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">leadott szavazat</p>
            </CardContent>
          </Card>
        )}

        {/* Interactive Participation Flow */}
        {showInteractiveFlow && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-auto">
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-auto">
              <Button
                onClick={() => setShowInteractiveFlow(false)}
                className="absolute top-4 right-4 z-10 bg-gray-600 hover:bg-gray-700 text-white"
              >
                Bezárás
              </Button>
              <InteractiveParticipationFlow
                type="poll"
                id={params.id}
                title={poll?.title || ''}
                description={poll?.description || ''}
                options={poll?.options?.map((opt: any) => ({
                  id: opt.id,
                  text: opt.optionText,
                  description: opt.description
                })) || []}
                session={session}
                onLogin={() => signIn('google')}
                onSuccess={handleVoteSuccess}
                onError={handleVoteError}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PollVotingPage;