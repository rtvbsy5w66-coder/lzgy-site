"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Mail,
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  Archive,
  Eye,
  Paperclip,
  MapPin,
  User,
  Calendar,
} from "lucide-react";

type Report = {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  status: string;
  urgency: string;
  addressText: string;
  representativeName: string;
  districtArea?: string;
  createdAt: string;
  author: {
    name: string;
    email: string;
  };
  _count: {
    attachments: number;
  };
};

type ReportsResponse = {
  reports: Report[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user.role === "ADMIN") {
      fetchReports();
    }
  }, [session, statusFilter, urgencyFilter, categoryFilter, pagination.page]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (statusFilter) params.append("status", statusFilter);
      if (urgencyFilter) params.append("urgency", urgencyFilter);
      if (categoryFilter) params.append("category", categoryFilter);

      const response = await fetch(`/api/admin/reports?${params}`);
      const data: ReportsResponse = await response.json();

      if (response.ok) {
        setReports(data.reports);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      submitted: {
        icon: Clock,
        label: "Beküldve",
        className: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
      },
      in_progress: {
        icon: Clock,
        label: "Folyamatban",
        className: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
      },
      resolved: {
        icon: CheckCircle,
        label: "Megoldva",
        className: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
      },
      archived: {
        icon: Archive,
        label: "Archiválva",
        className: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300",
      },
    };

    const badge = badges[status as keyof typeof badges] || badges.submitted;
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {badge.label}
      </span>
    );
  };

  const getUrgencyBadge = (urgency: string) => {
    const badges = {
      low: { label: "Alacsony", className: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300" },
      medium: { label: "Közepes", className: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300" },
      high: { label: "Magas", className: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300" },
      emergency: { label: "Sürgős", className: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300" },
    };

    const badge = badges[urgency as keyof typeof badges] || badges.medium;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}
      >
        {badge.label}
      </span>
    );
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      infrastructure: "Infrastruktúra",
      cleanliness: "Tisztaság",
      safety: "Biztonság",
      environment: "Környezetvédelem",
      other: "Egyéb",
    };
    return labels[category] || category;
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

  return (
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Bejelentések</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Közérdekű bejelentések kezelése - Összesen: {pagination.total}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Szűrők</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Státusz
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              >
                <option value="">Összes</option>
                <option value="submitted">Beküldve</option>
                <option value="in_progress">Folyamatban</option>
                <option value="resolved">Megoldva</option>
                <option value="archived">Archiválva</option>
              </select>
            </div>

            {/* Urgency Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sürgősség
              </label>
              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              >
                <option value="">Összes</option>
                <option value="low">Alacsony</option>
                <option value="medium">Közepes</option>
                <option value="high">Magas</option>
                <option value="emergency">Sürgős</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kategória
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              >
                <option value="">Összes</option>
                <option value="infrastructure">Infrastruktúra</option>
                <option value="cleanliness">Tisztaság</option>
                <option value="safety">Biztonság</option>
                <option value="environment">Környezetvédelem</option>
                <option value="other">Egyéb</option>
              </select>
            </div>
          </div>

          {(statusFilter || urgencyFilter || categoryFilter) && (
            <button
              onClick={() => {
                setStatusFilter("");
                setUrgencyFilter("");
                setCategoryFilter("");
              }}
              className="mt-4 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
            >
              Szűrők törlése
            </button>
          )}
        </div>

        {/* Reports Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
          {reports.length === 0 ? (
            <div className="p-12 text-center">
              <Mail className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">Nincs megjeleníthető bejelentés</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Módosítsd a szűrőket, vagy várj új bejelentésekre
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Bejelentés
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Kategória
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Helyszín
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Státusz
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Sürgősség
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Dátum
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Műveletek
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {reports.map((report) => (
                    <tr
                      key={report.id}
                      onClick={() => router.push(`/admin/reports/${report.id}`)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-start">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {report.title}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">
                              {report.description}
                            </p>
                            <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                              <User className="w-3 h-3 mr-1" />
                              {report.representativeName}
                              {report.districtArea && ` • ${report.districtArea}`}
                            </div>
                            {report._count.attachments > 0 && (
                              <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                                <Paperclip className="w-3 h-3 mr-1" />
                                {report._count.attachments} melléklet
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {getCategoryLabel(report.category)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {report.subcategory}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start text-sm text-gray-900 dark:text-gray-100">
                          <MapPin className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
                          <span className="truncate max-w-xs">
                            {report.addressText}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(report.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getUrgencyBadge(report.urgency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(report.createdAt).toLocaleDateString("hu-HU")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => router.push(`/admin/reports/${report.id}`)}
                          className="inline-flex items-center px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Megtekint
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Előző
                </button>
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={pagination.page === pagination.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Következő
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>
                    {" - "}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>
                    {" / "}
                    <span className="font-medium">{pagination.total}</span> bejelentés
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() =>
                        setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                      }
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Előző
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                      }
                      disabled={pagination.page === pagination.totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Következő
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
