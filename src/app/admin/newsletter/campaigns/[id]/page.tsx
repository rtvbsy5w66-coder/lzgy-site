"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Users,
  Eye,
  MousePointer,
  CheckCircle,
  Clock,
  Send,
  Loader2,
  XCircle,
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
  _count?: {
    analytics: number;
  };
}

export default function CampaignDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN" && params.id) {
      fetchCampaign();
    }
  }, [status, session, params.id]);

  const fetchCampaign = async () => {
    try {
      const response = await fetch("/api/admin/newsletter/campaigns");
      const data = await response.json();

      if (data.success) {
        const foundCampaign = data.data.find((c: Campaign) => c.id === params.id);
        if (foundCampaign) {
          setCampaign(foundCampaign);
        } else {
          alert("Kampány nem található");
          router.push("/admin/newsletter/campaigns");
        }
      }
    } catch (error) {
      console.error("Error fetching campaign:", error);
    } finally {
      setLoading(false);
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
      <span className={`inline-flex items-center gap-2 px-4 py-2 text-sm rounded-full ${config.class}`}>
        <Icon className="w-4 h-4" />
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

  if (!session || session.user.role !== "ADMIN" || !campaign) {
    return null;
  }

  return (
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/newsletter/campaigns"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Vissza a kampányokhoz
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {campaign.name || campaign.subject}
                </h1>
                {getStatusBadge(campaign.status)}
              </div>
              {campaign.isRecurring && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    Ismétlődő kampány ({campaign.recurringType})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Campaign Info */}
        <div className="grid gap-6 mb-6">
          {/* Basic Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Kampány Információk
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Email Tárgy
                </label>
                <p className="text-gray-900 dark:text-gray-100 font-medium">
                  {campaign.subject}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Címzettek Típusa
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {campaign.recipientType === "ALL"
                    ? "Összes feliratkozó"
                    : campaign.recipientType === "SELECTED"
                    ? "Kiválasztott feliratkozók"
                    : "Teszt"}
                </p>
              </div>

              {campaign.scheduledAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Ütemezett Időpont
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {new Date(campaign.scheduledAt).toLocaleString("hu-HU")}
                  </p>
                </div>
              )}

              {campaign.sentAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Elküldve
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {new Date(campaign.sentAt).toLocaleString("hu-HU")}
                  </p>
                </div>
              )}

              {campaign.sentCount !== null && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Címzettek Száma
                  </label>
                  <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg">
                    {campaign.sentCount} fő
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Létrehozva
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {new Date(campaign.createdAt).toLocaleString("hu-HU")}
                </p>
              </div>

              {campaign.nextSendDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Következő Küldés
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {new Date(campaign.nextSendDate).toLocaleString("hu-HU")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Stats (if sent) */}
          {campaign.status === "SENT" && campaign._count && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Teljesítmény Statisztikák
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Eye className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {campaign._count.analytics || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Megnyitások
                  </div>
                </div>

                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <MousePointer className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    0
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Kattintások
                  </div>
                </div>

                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {campaign.sentCount
                      ? (
                          ((campaign._count?.analytics || 0) / campaign.sentCount) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Megnyitási arány
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Email Content */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Email Tartalom
              </h2>
              <button
                onClick={() => setShowContent(!showContent)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                {showContent ? "Elrejtés" : "Megtekintés"}
              </button>
            </div>

            {showContent && (
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 bg-gray-50 dark:bg-gray-900">
                <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Tárgy:</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {campaign.subject}
                  </div>
                </div>
                <div
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: campaign.content }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
