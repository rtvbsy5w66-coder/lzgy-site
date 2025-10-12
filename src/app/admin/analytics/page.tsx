"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Users,
  FileText,
  Calendar,
  AlertCircle,
  FileSignature,
  Vote,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react";

type AnalyticsData = {
  overview: {
    totalUsers: number;
    newUsers: number;
    totalPosts: number;
    publishedPosts: number;
    totalEvents: number;
    upcomingEvents: number;
    totalReports: number;
    pendingReports: number;
    totalPetitions: number;
    activePetitions: number;
    totalPolls: number;
    activePolls: number;
    petitionSignatures: number;
    pollVotes: number;
  };
  growth: {
    users: string;
    posts: number;
    events: number;
    reports: number;
  };
  engagement: {
    petitionSignaturesAvg: number;
    pollVotesAvg: number;
    reportsPerUser: string;
  };
  recentActivity: Array<{
    date: string;
    users: number;
    posts: number;
    events: number;
    reports: number;
  }>;
};

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user.role === "ADMIN") {
      fetchAnalytics();
    }
  }, [session, period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/stats/overview?days=${period}`);
      const result = await response.json();

      if (response.ok) {
        setData(result);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  if (!data) {
    return (
      <div className="p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center border border-gray-200 dark:border-gray-700">
            <BarChart3 className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Hiba történt az adatok betöltésekor</p>
          </div>
        </div>
      </div>
    );
  }

  const StatCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    trend,
    trendValue,
    color = "indigo",
  }: {
    icon: any;
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: "up" | "down";
    trendValue?: string;
    color?: string;
  }) => {
    const colorClasses = {
      indigo: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
      green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
      blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
      orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
      purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
      pink: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400",
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div
            className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}
          >
            <Icon className="w-6 h-6" />
          </div>
          {trend && trendValue && (
            <div
              className={`flex items-center text-sm font-medium ${
                trend === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              }`}
            >
              {trend === "up" ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              {trendValue}
            </div>
          )}
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{title}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Analitika</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Látogatottsági statisztikák és elemzések
            </p>
          </div>

          {/* Period Selector */}
          <select
            value={period}
            onChange={(e) => setPeriod(parseInt(e.target.value))}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
          >
            <option value={7}>Utolsó 7 nap</option>
            <option value={30}>Utolsó 30 nap</option>
            <option value={90}>Utolsó 90 nap</option>
          </select>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            title="Összesen felhasználók"
            value={data.overview.totalUsers}
            subtitle={`${data.overview.newUsers} új felhasználó`}
            trend="up"
            trendValue={`${data.growth.users}%`}
            color="indigo"
          />

          <StatCard
            icon={FileText}
            title="Bejegyzések"
            value={data.overview.publishedPosts}
            subtitle={`${data.overview.totalPosts} összesen`}
            color="green"
          />

          <StatCard
            icon={Calendar}
            title="Események"
            value={data.overview.upcomingEvents}
            subtitle={`${data.overview.totalEvents} összesen`}
            color="blue"
          />

          <StatCard
            icon={AlertCircle}
            title="Bejelentések"
            value={data.overview.pendingReports}
            subtitle={`${data.overview.totalReports} összesen`}
            color="orange"
          />
        </div>

        {/* Engagement Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={FileSignature}
            title="Aktív petíciók"
            value={data.overview.activePetitions}
            subtitle={`${data.overview.petitionSignatures} aláírás összesen`}
            color="purple"
          />

          <StatCard
            icon={Vote}
            title="Aktív szavazások"
            value={data.overview.activePolls}
            subtitle={`${data.overview.pollVotes} szavazat összesen`}
            color="pink"
          />

          <StatCard
            icon={Activity}
            title="Bejelentések/Felhasználó"
            value={data.engagement.reportsPerUser}
            subtitle="Átlagos részvétel"
            color="indigo"
          />
        </div>

        {/* Detailed Engagement Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Petition Engagement */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <FileSignature className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Petíció részvétel
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Összes aláírás
                </span>
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {data.overview.petitionSignatures}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Átlag aláírás/petíció
                </span>
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {data.engagement.petitionSignaturesAvg}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Aktív petíciók</span>
                <span className="text-xl font-bold text-green-600 dark:text-green-400">
                  {data.overview.activePetitions}
                </span>
              </div>
            </div>
          </div>

          {/* Poll Engagement */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Vote className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Szavazás részvétel
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Összes szavazat
                </span>
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {data.overview.pollVotes}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Átlag szavazat/poll
                </span>
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {data.engagement.pollVotesAvg}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Aktív szavazások</span>
                <span className="text-xl font-bold text-green-600 dark:text-green-400">
                  {data.overview.activePolls}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Utóbbi 7 nap aktivitása
            </h3>
          </div>

          {data.recentActivity.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              Nincs aktivitási adat az elmúlt 7 napból
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Dátum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Új felhasználók
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Új bejegyzések
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Új események
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Új bejelentések
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {data.recentActivity.map((day, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {new Date(day.date).toLocaleDateString("hu-HU")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {day.users}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {day.posts}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {day.events}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {day.reports}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
