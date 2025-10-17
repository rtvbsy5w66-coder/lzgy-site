"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  FileText,
  Calendar,
  MessageSquare,
  Image,
  TrendingUp,
  LogOut,
  BarChart3,
  Newspaper,
  Mail,
  Shield,
} from "lucide-react";

interface Stats {
  posts: number;
  events: number;
  messages: number;
  slides: number;
}

interface RecentPost {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

interface RecentEvent {
  id: string;
  title: string;
  status: string;
  startDate: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    posts: 0,
    events: 0,
    messages: 0,
    slides: 0,
  });
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Auth check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  // Fetch dashboard data
  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [status]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();

      if (data.error) {
        console.error("Admin stats error:", data.error);
        return;
      }

      setStats(data.stats);
      setRecentPosts(data.recent?.posts || []);
      setRecentEvents(data.recent?.events || []);
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/admin/login" });
  };

  // Loading state
  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Betöltés...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!session) {
    return null;
  }

  // Not admin
  if (session.user.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md border border-gray-200 dark:border-gray-700">
          <Shield className="w-16 h-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Hozzáférés Megtagadva
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Nincs jogosultságod az admin felület megtekintéséhez.
          </p>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600"
          >
            Kijelentkezés
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Bejegyzések",
      value: stats.posts,
      description: "Összes bejegyzés",
      icon: FileText,
      color: "bg-blue-500",
      link: "/admin/posts",
    },
    {
      title: "Események",
      value: stats.events,
      description: "Összes esemény",
      icon: Calendar,
      color: "bg-purple-500",
      link: "/admin/events",
    },
    {
      title: "Üzenetek",
      value: stats.messages,
      description: "Új üzenet",
      icon: MessageSquare,
      color: "bg-green-500",
      link: "/admin/messages",
    },
    {
      title: "Slide-ok",
      value: stats.slides,
      description: "Főoldal slide-ok",
      icon: Image,
      color: "bg-orange-500",
      link: "/admin/slides",
    },
  ];

  const quickLinks = [
    {
      title: "Bejegyzések",
      description: "Hírek és blogbejegyzések kezelése",
      icon: Newspaper,
      link: "/admin/posts",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Események",
      description: "Események szervezése",
      icon: Calendar,
      link: "/admin/events",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Hírlevél",
      description: "Newsletter kampányok kezelése",
      icon: Mail,
      link: "/admin/newsletter",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Üzenetek",
      description: "Kapcsolatfelvételi üzenetek",
      icon: MessageSquare,
      link: "/admin/messages",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Analitika",
      description: "Statisztikák és jelentések",
      icon: BarChart3,
      link: "/admin/analytics",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  return (
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Üdvözlünk, {session.user.name || session.user.email}!
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Kijelentkezés</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <Link
              href={stat.link}
              key={stat.title}
              className="block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.description}</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Gyors Hivatkozások
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.title}
                href={link.link}
                className={`${link.bgColor} dark:bg-gray-800 p-6 rounded-xl hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700`}
              >
                <div className="flex items-start gap-4">
                  <div className={`${link.color} dark:${link.color}`}>
                    <link.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {link.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {link.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Posts */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Legutóbbi Bejegyzések
              </h2>
              {recentPosts.length > 0 ? (
                <div className="space-y-3">
                  {recentPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/admin/posts/${post.id}/edit`}
                      className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">
                            {post.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(post.createdAt).toLocaleDateString(
                              "hu-HU"
                            )}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 text-xs rounded-full ${
                            post.status === "PUBLISHED"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                              : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                          }`}
                        >
                          {post.status === "PUBLISHED" ? "Publikált" : "Vázlat"}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm italic py-4">
                  Még nincsenek bejegyzések
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Activity Feed */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Aktivitás
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      Sikeres bejelentkezés
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">épp most</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      Dashboard megnyitva
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">épp most</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Közelgő Események
              </h2>
              {recentEvents.length > 0 ? (
                <div className="space-y-3">
                  {recentEvents.map((event) => (
                    <Link
                      key={event.id}
                      href={`/admin/events/${event.id}/edit`}
                      className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                        {event.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(event.startDate).toLocaleDateString("hu-HU")}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm italic py-4">
                  Még nincsenek események
                </p>
              )}
            </div>

            {/* System Info */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Rendszer Állapot
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="opacity-90">Auth:</span>
                  <span className="font-semibold">✓ Aktív</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-90">Adatbázis:</span>
                  <span className="font-semibold">✓ Kapcsolódva</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-90">NextAuth:</span>
                  <span className="font-semibold">v4.24.5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
