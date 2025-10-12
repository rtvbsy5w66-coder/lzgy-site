"use client";

import { useEffect, useState } from "react";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trophy, Vote, FileText, Mail, User as UserIcon, CalendarDays, Settings, RefreshCw, Clock, MessageSquare } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { QuizResultCard } from "./QuizResultCard";
import { PollVoteCard } from "./PollVoteCard";
import { PetitionSignatureCard } from "./PetitionSignatureCard";
import { EventRegistrationCard } from "./EventRegistrationCard";
import { ReportCard } from "./ReportCard";
import { ProfileEditForm } from "./ProfileEditForm";
import { useThemeColors } from "@/context/ThemeContext";
import { NewsletterSubscriptionManager } from "@/components/NewsletterSubscriptionManager";
import { NewsletterCategory } from "@/types/newsletter";

const NewsletterSettings = ({ user, activity, onSubscriptionChange }: { 
  user: User; 
  activity: UserActivity | null; 
  onSubscriptionChange: () => void;
}) => {
  // Get current newsletter categories from activity
  const currentSubscriptions = activity?.newsletterSubscription?.categories || [];
  
  return (
    <NewsletterSubscriptionManager
      userEmail={user.email || undefined}
      userName={user.name || undefined}
      currentSubscriptions={currentSubscriptions as NewsletterCategory[]}
      onSubscriptionChange={onSubscriptionChange}
      showHeader={true}
    />
  );
};

interface UserProfileClientProps {
  user: User;
}

interface UserActivity {
  quizResults: any[];
  pollVotes: any[];
  signatures: any[];
  eventRegistrations: any[];
  reports: any[];
  newsletterSubscription: {
    isSubscribed: boolean;
    subscribedAt?: string;
    categories?: string[];
    isModern?: boolean;
  } | null;
  stats: {
    totalQuizzes: number;
    totalPolls: number;
    totalPetitions: number;
    totalEvents: number;
    totalReports: number;
    avgQuizScore: number;
  };
}

export function UserProfileClient({ user }: UserProfileClientProps) {
  const { data: session } = useSession();
  const colors = useThemeColors();
  const [activity, setActivity] = useState<UserActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'quizzes' | 'polls' | 'petitions' | 'events' | 'reports' | 'newsletter' | 'edit'>('overview');
  const [currentUser, setCurrentUser] = useState(user);

  // Update currentUser when session changes (after profile update)
  useEffect(() => {
    if (session?.user) {
      setCurrentUser(session.user as User);
    }
  }, [session]);

  const fetchUserActivity = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/activity');
      if (response.ok) {
        const data = await response.json();
        setActivity(data);
      }
    } catch (error) {
      console.error('Failed to fetch user activity:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserActivity();
  }, [session]); // Re-fetch when session changes

  // Add function to refresh data
  const refreshActivity = () => {
    fetchUserActivity();
  };

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleProfileUpdate = (updatedData: any) => {
    setCurrentUser(updatedData);
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.bg, color: colors.text }}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: colors.gradientFrom }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bg, color: colors.text }}>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Profile Header */}
        <Card className="p-8 shadow-lg" style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar className="h-24 w-24 border-4 shadow-lg" style={{ borderColor: colors.border }}>
            <SafeImage
              src={currentUser.image}
              alt={currentUser.name || 'User'}
              width={96}
              height={96}
              className="rounded-full object-cover"
              fallback={
                <AvatarFallback className="text-xl font-bold" style={{ background: colors.gradient, color: colors.accent }}>
                  {getInitials(currentUser.name)}
                </AvatarFallback>
              }
            />
          </Avatar>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text }}>
              {(currentUser as any).displayName || currentUser.name || 'Felhasználó'}
            </h1>
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4" style={{ color: colors.text, opacity: 0.7 }}>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{currentUser.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                <Badge variant={currentUser.role === 'ADMIN' ? 'destructive' : 'secondary'}>
                  {currentUser.role === 'ADMIN' ? 'Adminisztrátor' : 'Felhasználó'}
                </Badge>
              </div>
              
              {/* Newsletter Subscription Status */}
              {activity?.newsletterSubscription && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <Badge 
                    variant={activity.newsletterSubscription.isSubscribed ? 'default' : 'secondary'}
                    style={activity.newsletterSubscription.isSubscribed ? { 
                      background: colors.gradient, 
                      color: colors.accent,
                      border: 'none'
                    } : {}}
                  >
                    {activity.newsletterSubscription.isSubscribed ? '📧 Hírlevél feliratkozó' : 'Nincs hírlevél feliratkozás'}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Overview */}
      {activity && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8" />
              <div>
                <p className="text-sm opacity-90">Kvízek</p>
                <p className="text-2xl font-bold">{activity.stats.totalQuizzes}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center gap-3">
              <Vote className="h-8 w-8" />
              <div>
                <p className="text-sm opacity-90">Szavazások</p>
                <p className="text-2xl font-bold">{activity.stats.totalPolls}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8" />
              <div>
                <p className="text-sm opacity-90">Petíciók</p>
                <p className="text-2xl font-bold">{activity.stats.totalPetitions}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-8 w-8" />
              <div>
                <p className="text-sm opacity-90">Események</p>
                <p className="text-2xl font-bold">{activity.stats.totalEvents}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8" />
              <div>
                <p className="text-sm opacity-90">Átlag eredmény</p>
                <p className="text-2xl font-bold">
                  {activity.stats.avgQuizScore > 0 ? `${activity.stats.avgQuizScore}%` : '—'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-red-500 to-red-600 text-white">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8" />
              <div>
                <p className="text-sm opacity-90">Bejelentések</p>
                <p className="text-2xl font-bold">{activity.stats.totalReports}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 p-4 rounded-lg" style={{ borderBottom: `1px solid ${colors.border}`, backgroundColor: colors.cardBg }}>
        <button
          onClick={() => setActiveTab('overview')}
          className="px-4 py-2 rounded-lg font-medium transition-colors"
          style={
            activeTab === 'overview'
              ? { background: colors.gradient, color: colors.accent }
              : { backgroundColor: colors.cardBg, color: colors.text, border: `1px solid ${colors.border}` }
          }
        >
          Áttekintés
        </button>
        <button
          onClick={() => setActiveTab('quizzes')}
          className="px-4 py-2 rounded-lg font-medium transition-colors"
          style={
            activeTab === 'quizzes'
              ? { background: colors.gradient, color: colors.accent }
              : { backgroundColor: colors.cardBg, color: colors.text, border: `1px solid ${colors.border}` }
          }
        >
          Kvíz eredmények
        </button>
        <button
          onClick={() => setActiveTab('polls')}
          className="px-4 py-2 rounded-lg font-medium transition-colors"
          style={
            activeTab === 'polls'
              ? { background: colors.gradient, color: colors.accent }
              : { backgroundColor: colors.cardBg, color: colors.text, border: `1px solid ${colors.border}` }
          }
        >
          Szavazások
        </button>
        <button
          onClick={() => setActiveTab('petitions')}
          className="px-4 py-2 rounded-lg font-medium transition-colors"
          style={
            activeTab === 'petitions'
              ? { background: colors.gradient, color: colors.accent }
              : { backgroundColor: colors.cardBg, color: colors.text, border: `1px solid ${colors.border}` }
          }
        >
          Petíciók
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className="px-4 py-2 rounded-lg font-medium transition-colors"
          style={
            activeTab === 'events'
              ? { background: colors.gradient, color: colors.accent }
              : { backgroundColor: colors.cardBg, color: colors.text, border: `1px solid ${colors.border}` }
          }
        >
          Események
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className="px-4 py-2 rounded-lg font-medium transition-colors"
          style={
            activeTab === 'reports'
              ? { background: colors.gradient, color: colors.accent }
              : { backgroundColor: colors.cardBg, color: colors.text, border: `1px solid ${colors.border}` }
          }
        >
          <MessageSquare className="h-4 w-4 mr-1 inline" />
          Bejelentések
        </button>
        <button
          onClick={() => setActiveTab('newsletter')}
          className="px-4 py-2 rounded-lg font-medium transition-colors"
          style={
            activeTab === 'newsletter'
              ? { background: colors.gradient, color: colors.accent }
              : { backgroundColor: colors.cardBg, color: colors.text, border: `1px solid ${colors.border}` }
          }
        >
          <Mail className="h-4 w-4 mr-1 inline" />
          Hírlevél
        </button>
        <button
          onClick={() => setActiveTab('edit')}
          className="px-4 py-2 rounded-lg font-medium transition-colors"
          style={
            activeTab === 'edit'
              ? { background: colors.gradient, color: colors.accent }
              : { backgroundColor: colors.cardBg, color: colors.text, border: `1px solid ${colors.border}` }
          }
        >
          <Settings className="h-4 w-4 mr-1 inline" />
          Profil szerkesztése
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && activity && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold" style={{ color: colors.text }}>Aktivitás áttekintése</h2>
            
            {/* Recent Quiz Results */}
            {activity.quizResults.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
                  <Trophy className="h-5 w-5" />
                  Legutóbbi kvíz eredmények
                </h3>
                <div className="space-y-3">
                  {activity.quizResults.slice(0, 3).map((result) => (
                    <QuizResultCard key={result.id} result={result} />
                  ))}
                </div>
              </div>
            )}

            {/* Recent Poll Votes */}
            {activity.pollVotes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
                  <Vote className="h-5 w-5" />
                  Legutóbbi szavazások
                </h3>
                <div className="space-y-3">
                  {activity.pollVotes.slice(0, 3).map((vote) => (
                    <PollVoteCard key={vote.id} vote={vote} />
                  ))}
                </div>
              </div>
            )}

            {/* Recent Petition Signatures */}
            {activity.signatures.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
                  <FileText className="h-5 w-5" />
                  Legutóbbi petíció aláírások
                </h3>
                <div className="space-y-3">
                  {activity.signatures.slice(0, 3).map((signature) => (
                    <PetitionSignatureCard key={signature.id} signature={signature} />
                  ))}
                </div>
              </div>
            )}

            {/* Recent Event Registrations */}
            {activity.eventRegistrations.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
                  <CalendarDays className="h-5 w-5" />
                  Legutóbbi esemény jelentkezések
                </h3>
                <div className="space-y-3">
                  {activity.eventRegistrations.slice(0, 3).map((registration) => (
                    <EventRegistrationCard
                      key={registration.id}
                      registration={registration}
                      onStatusChange={refreshActivity}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Recent Reports */}
            {activity.reports.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
                  <MessageSquare className="h-5 w-5" />
                  Legutóbbi bejelentések
                </h3>
                <div className="space-y-3">
                  {activity.reports.slice(0, 3).map((report) => (
                    <ReportCard key={report.id} report={report} />
                  ))}
                </div>
              </div>
            )}

            {/* Newsletter Subscription Section */}
            {activity.newsletterSubscription && (
              <Card className="p-6" style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
                  <Mail className="h-5 w-5" />
                  Hírlevél feliratkozás
                </h3>
                
                {activity.newsletterSubscription.isSubscribed ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium" style={{ color: colors.text }}>Aktív feliratkozás</span>
                      </div>
                      {activity.newsletterSubscription.subscribedAt && (
                        <p className="text-sm" style={{ color: colors.text, opacity: 0.7 }}>
                          Feliratkozva: {new Date(activity.newsletterSubscription.subscribedAt).toLocaleDateString('hu-HU')}
                        </p>
                      )}
                      <p className="text-sm mt-2" style={{ color: colors.text, opacity: 0.7 }}>
                        Rendszeresen kap értesítést újdonságokról és eseményekről.
                      </p>
                    </div>
                    <div className="text-4xl">📧</div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <span className="font-medium" style={{ color: colors.text }}>Nincs feliratkozás</span>
                      </div>
                      <p className="text-sm" style={{ color: colors.text, opacity: 0.7 }}>
                        Jelenleg nem kap hírlevelet. A kapcsolat oldalon tud feliratkozni.
                      </p>
                      <a 
                        href="/kapcsolat" 
                        className="inline-flex items-center gap-1 text-sm mt-2 hover:underline"
                        style={{ color: colors.gradientFrom }}
                      >
                        Feliratkozás a hírlevélre →
                      </a>
                    </div>
                    <div className="text-4xl opacity-50">📭</div>
                  </div>
                )}
              </Card>
            )}

            {activity.quizResults.length === 0 &&
             activity.pollVotes.length === 0 &&
             activity.signatures.length === 0 &&
             activity.eventRegistrations.length === 0 &&
             activity.reports.length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-lg" style={{ color: colors.text, opacity: 0.7 }}>
                  Még nincs aktivitása. Kezdje el kvízek kitöltésével, szavazásokkal, petíciók aláírásával vagy bejelentések leadásával!
                </p>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'quizzes' && activity && (
          <div>
            <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text }}>Kvíz eredmények</h2>
            {activity.quizResults.length > 0 ? (
              <div className="space-y-3">
                {activity.quizResults.map((result) => (
                  <QuizResultCard key={result.id} result={result} detailed />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Trophy className="h-16 w-16 mx-auto mb-4" style={{ color: colors.text, opacity: 0.3 }} />
                <p className="text-lg" style={{ color: colors.text, opacity: 0.7 }}>
                  Még nem töltött ki kvízeket. 
                  <a href="/kviz" className="hover:underline ml-1" style={{ color: colors.gradientFrom }}>
                    Próbálja ki az első kvízt!
                  </a>
                </p>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'polls' && activity && (
          <div>
            <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text }}>Szavazások</h2>
            {activity.pollVotes.length > 0 ? (
              <div className="space-y-3">
                {activity.pollVotes.map((vote) => (
                  <PollVoteCard key={vote.id} vote={vote} detailed />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Vote className="h-16 w-16 mx-auto mb-4" style={{ color: colors.text, opacity: 0.3 }} />
                <p className="text-lg" style={{ color: colors.text, opacity: 0.7 }}>
                  Még nem szavazott. 
                  <a href="/szavazasok" className="hover:underline ml-1" style={{ color: colors.gradientFrom }}>
                    Tekintse meg az aktív szavazásokat!
                  </a>
                </p>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'petitions' && activity && (
          <div>
            <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text }}>Petíció aláírások</h2>
            {activity.signatures.length > 0 ? (
              <div className="space-y-3">
                {activity.signatures.map((signature) => (
                  <PetitionSignatureCard key={signature.id} signature={signature} detailed />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <FileText className="h-16 w-16 mx-auto mb-4" style={{ color: colors.text, opacity: 0.3 }} />
                <p className="text-lg" style={{ color: colors.text, opacity: 0.7 }}>
                  Még nem írt alá petíciókat. 
                  <a href="/peticiok" className="hover:underline ml-1" style={{ color: colors.gradientFrom }}>
                    Tekintse meg az aktív petíciókat!
                  </a>
                </p>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'events' && activity && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: colors.text }}>Esemény jelentkezések</h2>
              <button
                onClick={refreshActivity}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
                style={{ 
                  color: colors.text, 
                  backgroundColor: colors.cardBg, 
                  border: `1px solid ${colors.border}` 
                }}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Frissítés
              </button>
            </div>
            {activity.eventRegistrations.length > 0 ? (
              <div className="space-y-8">
                {(() => {
                  const now = new Date();
                  const upcomingRegistrations = activity.eventRegistrations.filter(
                    (reg) => new Date(reg.event.startDate) > now
                  );
                  const pastRegistrations = activity.eventRegistrations.filter(
                    (reg) => new Date(reg.event.startDate) <= now
                  );

                  return (
                    <>
                      {/* Közelgő események */}
                      {upcomingRegistrations.length > 0 && (
                        <div>
                          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
                            <Calendar className="h-5 w-5" style={{ color: colors.gradientFrom }} />
                            Közelgő események ({upcomingRegistrations.length})
                          </h3>
                          <div className="space-y-3">
                            {upcomingRegistrations.map((registration) => (
                              <EventRegistrationCard 
                                key={registration.id} 
                                registration={registration} 
                                detailed 
                                onStatusChange={refreshActivity}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Elmúlt események */}
                      {pastRegistrations.length > 0 && (
                        <div>
                          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
                            <Clock className="h-5 w-5" style={{ color: colors.text, opacity: 0.7 }} />
                            Elmúlt események ({pastRegistrations.length})
                          </h3>
                          <div className="space-y-3">
                            {pastRegistrations.map((registration) => (
                              <EventRegistrationCard 
                                key={registration.id} 
                                registration={registration} 
                                detailed 
                                onStatusChange={refreshActivity}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Ha mind a két lista üres (nem kellene előfordulnia) */}
                      {upcomingRegistrations.length === 0 && pastRegistrations.length === 0 && (
                        <Card className="p-8 text-center">
                          <CalendarDays className="h-16 w-16 mx-auto mb-4" style={{ color: colors.text, opacity: 0.3 }} />
                          <p className="text-lg" style={{ color: colors.text, opacity: 0.7 }}>Nem található esemény regisztráció.</p>
                        </Card>
                      )}
                    </>
                  );
                })()}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <CalendarDays className="h-16 w-16 mx-auto mb-4" style={{ color: colors.text, opacity: 0.3 }} />
                <p className="text-lg" style={{ color: colors.text, opacity: 0.7 }}>
                  Még nem jelentkezett eseményekre. 
                  <a href="/esemenyek" className="hover:underline ml-1" style={{ color: colors.gradientFrom }}>
                    Tekintse meg az aktív eseményeket!
                  </a>
                </p>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'reports' && activity && (
          <div>
            <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text }}>Bejelentések</h2>
            {activity.reports.length > 0 ? (
              <div className="space-y-3">
                {activity.reports.map((report) => (
                  <ReportCard key={report.id} report={report} detailed />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4" style={{ color: colors.text, opacity: 0.3 }} />
                <p className="text-lg" style={{ color: colors.text, opacity: 0.7 }}>
                  Még nem adott le bejelentést.
                  <a href="/bejelentes" className="hover:underline ml-1" style={{ color: colors.gradientFrom }}>
                    Adjon le egy bejelentést!
                  </a>
                </p>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'newsletter' && (
          <NewsletterSettings 
            user={currentUser}
            activity={activity}
            onSubscriptionChange={refreshActivity}
          />
        )}

        {activeTab === 'edit' && (
          <div>
            <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text }}>Profil szerkesztése</h2>
            <ProfileEditForm 
              user={currentUser} 
              onProfileUpdate={handleProfileUpdate}
            />
          </div>
        )}
      </div>
      </div>
    </div>
  );
}