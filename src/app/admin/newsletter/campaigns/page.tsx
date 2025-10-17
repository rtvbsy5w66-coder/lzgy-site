"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Mail,
  Plus,
  Calendar,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  ArrowLeft,
  Loader2,
  Filter,
} from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: string;
  scheduledAt: string | null;
  sentAt: string | null;
  sentCount: number | null;
  recipientType: string;
  isRecurring: boolean;
  recurringType: string | null;
  nextSendDate: string | null;
  createdAt: string;
  createdBy: string;
}

export default function CampaignsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchCampaigns();
    }
  }, [status, session]);

  useEffect(() => {
    applyFilters();
  }, [campaigns, filterStatus]);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch("/api/admin/newsletter/campaigns");
      const data = await response.json();

      if (data.success) {
        setCampaigns(data.data);
        setFilteredCampaigns(data.data);
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...campaigns];

    if (filterStatus !== "all") {
      filtered = filtered.filter((camp) => camp.status === filterStatus);
    }

    setFilteredCampaigns(filtered);
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm("Biztosan törölni szeretnéd ezt a kampányt?")) return;

    try {
      const response = await fetch(`/api/admin/newsletter/campaigns/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("✅ Kampány törölve");
        fetchCampaigns();
      } else {
        alert("❌ Hiba a törlés során");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("❌ Hiba történt");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      SENT: { label: "Elküldve", class: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", icon: CheckCircle },
      SCHEDULED: { label: "Ütemezett", class: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300", icon: Clock },
      SENDING: { label: "Küldés alatt", class: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", icon: Send },
      DRAFT: { label: "Vázlat", class: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300", icon: Mail },
      FAILED: { label: "Sikertelen", class: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full ${config.class}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
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

  const statuses = ["all", "SENT", "SCHEDULED", "SENDING", "DRAFT", "FAILED"];
  const statusLabels = {
    all: "Összes",
    SENT: "Elküldve",
    SCHEDULED: "Ütemezett",
    SENDING: "Küldés alatt",
    DRAFT: "Vázlat",
    FAILED: "Sikertelen",
  };

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <Mail className="w-8 h-8" />
                Kampányok
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {filteredCampaigns.length} kampány
              </p>
            </div>
            <Link
              href="/admin/newsletter/campaigns/new"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Új Kampány
            </Link>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <div className="flex gap-2 flex-wrap">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === s
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {statusLabels[s as keyof typeof statusLabels]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Campaigns Grid */}
        <div className="grid gap-6">
          {filteredCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {campaign.name || campaign.subject}
                    </h3>
                    {getStatusBadge(campaign.status)}
                    {campaign.isRecurring && (
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                        Ismétlődő ({campaign.recurringType})
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    Tárgy: {campaign.subject}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {campaign.scheduledAt && !campaign.sentAt && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">Ütemezve</div>
                          <div className="text-xs">{new Date(campaign.scheduledAt).toLocaleString("hu-HU")}</div>
                        </div>
                      </div>
                    )}

                    {campaign.sentAt && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <CheckCircle className="w-4 h-4" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">Elküldve</div>
                          <div className="text-xs">{new Date(campaign.sentAt).toLocaleString("hu-HU")}</div>
                        </div>
                      </div>
                    )}

                    {campaign.sentCount !== null && campaign.sentCount > 0 && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Send className="w-4 h-4" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">Címzettek</div>
                          <div className="text-xs">{campaign.sentCount} fő</div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">Létrehozva</div>
                        <div className="text-xs">{new Date(campaign.createdAt).toLocaleDateString("hu-HU")}</div>
                      </div>
                    </div>

                    {campaign.nextSendDate && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">Következő</div>
                          <div className="text-xs">{new Date(campaign.nextSendDate).toLocaleString("hu-HU")}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Link
                    href={`/admin/newsletter/campaigns/${campaign.id}`}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Megtekintés"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => deleteCampaign(campaign.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Törlés"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCampaigns.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center border border-gray-200 dark:border-gray-700">
            <Mail className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {filterStatus !== "all"
                ? `Nincs ${statusLabels[filterStatus as keyof typeof statusLabels].toLowerCase()} kampány`
                : "Még nincsenek kampányok"}
            </p>
            <Link
              href="/admin/newsletter/campaigns/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Első kampány létrehozása
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
