"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn } from 'next-auth/react';
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Target, 
  Calendar, 
  PenTool,
  CheckCircle,
  Share2,
  ArrowLeft,
  FileText,
  Mail,
  User,
  MapPin,
  AlertCircle,
  Clock
} from "lucide-react";
import { useThemeColors } from "@/context/ThemeContext";
import { Petition, CreateSignatureRequest } from "@/types/petition";
import InteractiveParticipationFlow from "@/components/InteractiveParticipationFlow";

const PetitionDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const petitionId = params.id as string;
  const { data: session } = useSession();
  
  const [petition, setPetition] = useState<Petition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInteractiveFlow, setShowInteractiveFlow] = useState(false);
  const [signatureSubmitted, setSignatureSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const colors = useThemeColors();

  useEffect(() => {
    if (petitionId) {
      fetchPetition();
    }
  }, [petitionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPetition = async () => {
    try {
      const response = await fetch(`/api/petitions/${petitionId}`);
      if (!response.ok) throw new Error('Failed to fetch petition');
      const data = await response.json();
      setPetition(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignSuccess = (result: any) => {
    setSignatureSubmitted(true);
    setShowInteractiveFlow(false);
    
    // Refresh petition data to get updated signature count
    fetchPetition();
  };

  const handleSignError = (error: string) => {
    console.error('Signature error:', error);
    alert(error);
  };

  const handleDirectSign = async () => {
    if (!session?.user) {
      setShowInteractiveFlow(true);
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/petitions/${petitionId}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: (session.user as any)?.displayName?.split(' ')[0] || session.user?.name?.split(' ')[0] || '',
          lastName: (session.user as any)?.displayName?.split(' ').slice(1).join(' ') || session.user?.name?.split(' ').slice(1).join(' ') || '',
          email: session.user?.email || '',
          showName: true, // Default to showing name for logged in users
          allowContact: true, // Default to allowing contact
          subscribeNewsletter: true // Auto-subscribe logged in users
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to sign petition');
      
      handleSignSuccess(result);
    } catch (error) {
      handleSignError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProgressPercentage = (signatures: number, target: number) => {
    return Math.min((signatures / target) * 100, 100);
  };

  const formatSignatureCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const sharepetition = async () => {
    if (navigator.share && petition) {
      try {
        await navigator.share({
          title: petition.title,
          text: petition.description,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(window.location.href);
        alert('Link másolva a vágólapra!');
      }
    } else {
      // Fallback for browsers without Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link másolva a vágólapra!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.bg, color: colors.text }}>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-32 bg-gray-200 rounded mb-8"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !petition) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.bg, color: colors.text }}>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
              <p className="text-red-600 mb-4">
                {error || 'A petíció nem található'}
              </p>
              <Button onClick={() => router.push('/peticiok')}>
                Vissza a petíciókhoz
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const signatureCount = petition._count?.signatures || 0;
  const progressPercentage = getProgressPercentage(signatureCount, petition.targetGoal);
  const isActive = petition.status === 'ACTIVE';

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bg, color: colors.text }}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Back Button */}
        <Button

          onClick={() => router.push('/peticiok')}
          className="mb-6 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Vissza a petíciókhoz
        </Button>

        {/* Success Message */}
        {signatureSubmitted && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">Köszönjük az aláírását!</h3>
                  <p className="text-green-700">
                    Email megerősítést küldtünk a megadott címre. Kérjük, erősítse meg aláírását.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Petition Header */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {petition.status === 'ACTIVE' ? (
              <Badge className="bg-green-100 text-green-800">
                <PenTool className="h-3 w-3 mr-1" />
                Aktív
              </Badge>
            ) : petition.status === 'CLOSED' ? (
              <Badge className="bg-red-100 text-red-800">
                <Clock className="h-3 w-3 mr-1" />
                Lezárt
              </Badge>
            ) : (
              <Badge className="bg-gray-100 text-gray-800">
                {petition.status}
              </Badge>
            )}
            
            {petition.category && (
              <Badge 
                
                style={{ borderColor: petition.category.color }}
              >
                <FileText className="h-3 w-3 mr-1" />
                {petition.category.name}
              </Badge>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {petition.title}
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            {petition.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <FileText className="h-5 w-5" />
                  Részletek
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm md:prose-base max-w-none
                  prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-headings:font-bold prose-headings:mb-3
                  prose-h2:text-2xl prose-h3:text-xl
                  prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:my-3 prose-p:leading-relaxed
                  prose-ul:my-3 prose-ul:text-gray-700 dark:prose-ul:text-gray-300
                  prose-ol:my-3 prose-ol:text-gray-700 dark:prose-ol:text-gray-300
                  prose-li:my-1 prose-li:text-base
                  prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-strong:font-semibold">
                  {petition.fullText ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: petition.fullText }}
                    />
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {petition.description}
                    </p>
                  )}
                </div>

                {petition.endDate && (
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>
                        <strong>Határidő:</strong> {new Date(petition.endDate).toLocaleDateString('hu-HU', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Status Info */}
            {session?.user && (
              <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 text-center">
                      <h3 className="text-yellow-600 dark:text-yellow-400 font-semibold">
                        Bejelentkezve mint: {(session.user as any)?.displayName || session.user?.name || session.user?.email}
                      </h3>
                      <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                        Adatai automatikusan ki lesznek töltve
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Progress Card */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Target className="h-5 w-5" />
                  Aláírások
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold" style={{ color: colors.accent }}>
                      {formatSignatureCount(signatureCount)}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">
                      {formatSignatureCount(petition.targetGoal)} célból
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <div
                      className="h-4 rounded-full transition-all duration-300"
                      style={{
                        width: `${progressPercentage}%`,
                        background: colors.gradient
                      }}
                    ></div>
                  </div>

                  <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                    {progressPercentage.toFixed(1)}% teljesítve
                  </div>

                  {/* Sign Button */}
                  {isActive && !signatureSubmitted && (
                    <Button
                      onClick={handleDirectSign}
                      disabled={isSubmitting}
                      className="w-full text-white"
                      style={{ background: isSubmitting ? '#6b7280' : colors.gradient }}
                    >
                      <PenTool className="h-4 w-4 mr-2" />
                      {isSubmitting ? (
                        'Aláírás...'
                      ) : session?.user ? (
                        'Aláírás (Regisztrálva)'
                      ) : (
                        'Aláírás'
                      )}
                    </Button>
                  )}

                  {signatureSubmitted && (
                    <Button
                      disabled
                      className="w-full"

                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aláírva
                    </Button>
                  )}

                  {!isActive && (
                    <Button
                      disabled
                      className="w-full"

                    >
                      <Clock className="h-4 w-4 mr-2" />
                      {petition.status === 'CLOSED' ? 'Lezárt' : petition.status}
                    </Button>
                  )}

                  {/* Share Button */}
                  <Button
                    onClick={sharepetition}

                    className="w-full"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Megosztás
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

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
                type="petition"
                id={petitionId}
                title={petition?.title || ''}
                description={petition?.description || ''}
                session={session}
                onLogin={() => signIn('google')}
                onSuccess={handleSignSuccess}
                onError={handleSignError}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PetitionDetailPage;