"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Mail,
  Users,
  Send,
  Calendar,
  BarChart3,
  Plus,
  Eye,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

interface NewsletterStats {
  totalSubscribers: number;
  activeSubscribers: number;
  totalCampaigns: number;
  sentCampaigns: number;
  scheduledCampaigns: number;
}

interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: string;
  scheduledAt: string | null;
  sentAt: string | null;
  sentCount: number | null;
  createdAt: string;
}

export default function NewsletterAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<NewsletterStats>({
    totalSubscribers: 0,
    activeSubscribers: 0,
    totalCampaigns: 0,
    sentCampaigns: 0,
    scheduledCampaigns: 0,
  });
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuickSend, setShowQuickSend] = useState(false);
  const [quickSendData, setQuickSendData] = useState({
    subject: "",
    content: "",
    testEmail: "",
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchData();
    }
  }, [status, session]);

  const fetchData = async () => {
    try {
      // Fetch subscribers
      const subsRes = await fetch("/api/admin/newsletter/subscribers");
      const subsData = await subsRes.json();

      // Fetch campaigns
      const campsRes = await fetch("/api/admin/newsletter/campaigns");
      const campsData = await campsRes.json();

      // Fetch stats
      const statsRes = await fetch("/api/admin/newsletter/stats");
      const statsData = await statsRes.json();

      if (subsData.success) {
        const active = subsData.data.filter((s: any) => s.isActive).length;
        setStats((prev) => ({
          ...prev,
          totalSubscribers: subsData.count || 0,
          activeSubscribers: active,
        }));
      }

      if (campsData.success) {
        setCampaigns(campsData.data.slice(0, 5)); // Latest 5
        const sent = campsData.data.filter((c: Campaign) => c.status === "SENT")
          .length;
        const scheduled = campsData.data.filter(
          (c: Campaign) => c.status === "SCHEDULED"
        ).length;
        setStats((prev) => ({
          ...prev,
          totalCampaigns: campsData.data.length,
          sentCampaigns: sent,
          scheduledCampaigns: scheduled,
        }));
      }
    } catch (error) {
      console.error("Error fetching newsletter data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSend = async () => {
    if (!quickSendData.subject || !quickSendData.content || !quickSendData.testEmail) {
      alert("Kérlek töltsd ki az összes mezőt!");
      return;
    }

    setSending(true);
    try {
      const response = await fetch("/api/admin/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: quickSendData.subject,
          content: quickSendData.content,
          recipients: "test",
          testEmail: quickSendData.testEmail,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Teszt email sikeresen elküldve: ${quickSendData.testEmail}`);
        setQuickSendData({ subject: "", content: "", testEmail: "" });
        setShowQuickSend(false);
        fetchData(); // Refresh data
      } else {
        alert(`❌ Hiba: ${data.error}`);
      }
    } catch (error) {
      console.error("Quick send error:", error);
      alert("❌ Hiba történt az email küldése közben");
    } finally {
      setSending(false);
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm("Biztosan törölni szeretnéd ezt a kampányt?")) return;

    try {
      const response = await fetch(`/api/admin/newsletter/campaigns/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("✅ Kampány törölve");
        fetchData();
      } else {
        alert("❌ Hiba a törlés során");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("❌ Hiba történt");
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Hozzáférés megtagadva</h1>
          <p className="text-gray-600 mt-2">Admin jogosultság szükséges</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Feliratkozók",
      value: stats.activeSubscribers,
      total: stats.totalSubscribers,
      icon: Users,
      color: "bg-blue-500",
      link: "/admin/newsletter/subscribers",
    },
    {
      title: "Kampányok",
      value: stats.totalCampaigns,
      subtitle: `${stats.sentCampaigns} elküldve`,
      icon: Mail,
      color: "bg-green-500",
      link: "/admin/newsletter/campaigns",
    },
    {
      title: "Ütemezett",
      value: stats.scheduledCampaigns,
      subtitle: "Várakozó kampány",
      icon: Clock,
      color: "bg-orange-500",
      link: "/admin/newsletter/campaigns",
    },
    {
      title: "Statisztikák",
      value: "Megtekintés",
      icon: BarChart3,
      color: "bg-purple-500",
      link: "/admin/newsletter/stats",
    },
  ];

  return (
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <Mail className="w-8 h-8" />
              Hírlevél Kezelő
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Newsletter kampányok és feliratkozók kezelése
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowQuickSend(!showQuickSend)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Gyors Küldés
            </button>
            <Link
              href="/admin/newsletter/campaigns/new"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Új Kampány
            </Link>
          </div>
        </div>

        {/* Quick Send Form */}
        {showQuickSend && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Gyors Teszt Email Küldés
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tárgy
                </label>
                <input
                  type="text"
                  value={quickSendData.subject}
                  onChange={(e) =>
                    setQuickSendData({ ...quickSendData, subject: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Email tárgy..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Teszt Email Cím
                </label>
                <input
                  type="email"
                  value={quickSendData.testEmail}
                  onChange={(e) =>
                    setQuickSendData({ ...quickSendData, testEmail: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="teszt@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tartalom (HTML)
                </label>
                <textarea
                  value={quickSendData.content}
                  onChange={(e) =>
                    setQuickSendData({ ...quickSendData, content: e.target.value })
                  }
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 font-mono text-sm"
                  placeholder="<h2>Üdvözlöm!</h2><p>Ez egy teszt email...</p>"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleQuickSend}
                  disabled={sending}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Küldés...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Teszt Küldés
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowQuickSend(false)}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Mégse
                </button>
              </div>
            </div>
          </div>
        )}

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
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </p>
                  {stat.total && (
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      / {stat.total} összes
                    </p>
                  )}
                  {stat.subtitle && (
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {stat.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Campaigns */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Legutóbbi Kampányok
            </h2>
            <Link
              href="/admin/newsletter/campaigns"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Összes megtekintése →
            </Link>
          </div>

          {campaigns.length > 0 ? (
            <div className="space-y-3">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {campaign.name || campaign.subject}
                    </h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          campaign.status === "SENT"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : campaign.status === "SCHEDULED"
                            ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                            : campaign.status === "SENDING"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {campaign.status === "SENT"
                          ? "Elküldve"
                          : campaign.status === "SCHEDULED"
                          ? "Ütemezett"
                          : campaign.status === "SENDING"
                          ? "Küldés alatt"
                          : campaign.status}
                      </span>
                      {campaign.sentAt && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(campaign.sentAt).toLocaleString("hu-HU")}
                        </span>
                      )}
                      {campaign.scheduledAt && !campaign.sentAt && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(campaign.scheduledAt).toLocaleString("hu-HU")}
                        </span>
                      )}
                      {campaign.sentCount !== null && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {campaign.sentCount} címzett
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/newsletter/campaigns/${campaign.id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Megtekintés"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => deleteCampaign(campaign.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Törlés"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Mail className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Még nincsenek kampányok
              </p>
              <Link
                href="/admin/newsletter/campaigns/new"
                className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Első kampány létrehozása
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
