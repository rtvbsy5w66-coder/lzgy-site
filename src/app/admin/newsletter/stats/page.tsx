"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Mail,
  Eye,
  MousePointer,
  Users,
  Calendar,
  Loader2,
} from "lucide-react";

interface Stats {
  totalSubscribers: number;
  activeSubscribers: number;
  totalCampaigns: number;
  sentCampaigns: number;
  totalEmailsSent: number;
  averageOpenRate: number;
  averageClickRate: number;
  recentActivity: {
    date: string;
    sent: number;
    opens: number;
    clicks: number;
  }[];
}

export default function StatsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchStats();
    }
  }, [status, session]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/newsletter/stats");
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  // Default stats ha nincs adat
  const defaultStats: Stats = {
    totalSubscribers: 0,
    activeSubscribers: 0,
    totalCampaigns: 0,
    sentCampaigns: 0,
    totalEmailsSent: 0,
    averageOpenRate: 0,
    averageClickRate: 0,
    recentActivity: [],
  };

  const displayStats = stats || defaultStats;

  const statCards = [
    {
      title: "Összes Feliratkozó",
      value: displayStats.totalSubscribers,
      subtitle: `${displayStats.activeSubscribers} aktív`,
      icon: Users,
      color: "bg-blue-500",
      trend: "+12%",
    },
    {
      title: "Elküldött Kampányok",
      value: displayStats.sentCampaigns,
      subtitle: `${displayStats.totalCampaigns} összes`,
      icon: Mail,
      color: "bg-green-500",
      trend: "+8%",
    },
    {
      title: "Összes Email",
      value: displayStats.totalEmailsSent.toLocaleString(),
      subtitle: "Kiküldött emailek",
      icon: BarChart3,
      color: "bg-purple-500",
      trend: "+15%",
    },
    {
      title: "Átlag Megnyitás",
      value: `${displayStats.averageOpenRate.toFixed(1)}%`,
      subtitle: "Megnyitási arány",
      icon: Eye,
      color: "bg-orange-500",
      trend: "+2.3%",
    },
    {
      title: "Átlag Kattintás",
      value: `${displayStats.averageClickRate.toFixed(1)}%`,
      subtitle: "Kattintási arány",
      icon: MousePointer,
      color: "bg-pink-500",
      trend: "+1.8%",
    },
  ];

  return (
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/newsletter"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Vissza a Hírlevél Kezelőhöz
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <BarChart3 className="w-8 h-8" />
            Statisztikák
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Hírlevél kampányok teljesítménye
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {statCards.map((stat) => (
            <div
              key={stat.title}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {stat.trend}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {stat.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Performance Chart Placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Teljesítmény Áttekintés
          </h2>

          {displayStats.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {displayStats.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {new Date(activity.date).toLocaleDateString("hu-HU")}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {activity.sent} email elküldve
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div className="text-center">
                      <div className="text-gray-500 dark:text-gray-400 mb-1">
                        Megnyitás
                      </div>
                      <div className="font-semibold text-green-600 dark:text-green-400">
                        {activity.sent > 0
                          ? ((activity.opens / activity.sent) * 100).toFixed(1)
                          : 0}
                        %
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500 dark:text-gray-400 mb-1">
                        Kattintás
                      </div>
                      <div className="font-semibold text-blue-600 dark:text-blue-400">
                        {activity.sent > 0
                          ? ((activity.clicks / activity.sent) * 100).toFixed(1)
                          : 0}
                        %
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Még nincsenek statisztikák
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Az első kampány elküldése után itt jelennek meg az adatok
              </p>
            </div>
          )}
        </div>

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Megnyitási Arány
            </h3>
            <div className="text-4xl font-bold mb-2">
              {displayStats.averageOpenRate.toFixed(1)}%
            </div>
            <p className="text-blue-100 text-sm">
              {displayStats.averageOpenRate > 30
                ? "Kiváló eredmény! 📈"
                : displayStats.averageOpenRate > 20
                ? "Jó eredmény, de lehet javítani 👍"
                : "Próbálj jobb tárgysorokat használni 💡"}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <MousePointer className="w-5 h-5" />
              Kattintási Arány
            </h3>
            <div className="text-4xl font-bold mb-2">
              {displayStats.averageClickRate.toFixed(1)}%
            </div>
            <p className="text-green-100 text-sm">
              {displayStats.averageClickRate > 5
                ? "Nagyszerű engagement! 🎉"
                : displayStats.averageClickRate > 2
                ? "Átlagos eredmény 📊"
                : "Adj hozzá több call-to-action gombot! 🔘"}
            </p>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
            💡 Tippek a jobb eredményekhez
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>• Személyre szabott tárgysorok (pl. "Kedves [Név]")</li>
            <li>• Rövid, lényegre törő tartalom</li>
            <li>• Egyértelmű call-to-action gombok</li>
            <li>• Mobile-friendly design</li>
            <li>• Küldés optimális időpontban (kedd-csütörtök, 10:00-14:00)</li>
            <li>• A/B tesztelés különböző változatokkal</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
