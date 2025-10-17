"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Download,
  Filter,
  Mail,
  Calendar,
  Tag,
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  district: string | null;
  phone: string | null;
  subscribedAt: string;
  isActive: boolean;
  source: string;
  categories: string[];
}

export default function SubscribersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchSubscribers();
    }
  }, [status, session]);

  useEffect(() => {
    applyFilters();
  }, [subscribers, searchTerm, filterActive, filterCategory]);

  const fetchSubscribers = async () => {
    try {
      const response = await fetch("/api/admin/newsletter/subscribers");
      const data = await response.json();

      if (data.success) {
        setSubscribers(data.data);
        setFilteredSubscribers(data.data);
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...subscribers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (sub) =>
          sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Active/Inactive filter
    if (filterActive !== "all") {
      filtered = filtered.filter((sub) =>
        filterActive === "active" ? sub.isActive : !sub.isActive
      );
    }

    // Category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter((sub) =>
        sub.categories.includes(filterCategory)
      );
    }

    setFilteredSubscribers(filtered);
  };

  const exportToCSV = () => {
    const headers = ["Email", "Név", "Kerület", "Telefon", "Feliratkozás", "Aktív", "Kategóriák"];
    const csvData = filteredSubscribers.map((sub) => [
      sub.email,
      sub.name || "",
      sub.district || "",
      sub.phone || "",
      new Date(sub.subscribedAt).toLocaleDateString("hu-HU"),
      sub.isActive ? "Igen" : "Nem",
      sub.categories.join(", "),
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `feliratkozok_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const toggleSubscriberStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/newsletter/subscribers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        fetchSubscribers();
      }
    } catch (error) {
      console.error("Error updating subscriber:", error);
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

  // Newsletter categories with readable labels
  const categoryLabels: Record<string, string> = {
    SZAKPOLITIKA: "Szakpolitika",
    V_KERULET: "V. Kerület",
    POLITIKAI_EDUGAMIFIKACIO: "Politikai Edugamifikáció",
    EU: "Európai Unió",
  };

  // Get unique categories from subscribers
  const allCategories = Array.from(
    new Set(subscribers.flatMap((sub) => sub.categories))
  );

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
                <Users className="w-8 h-8" />
                Feliratkozók
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {filteredSubscribers.length} feliratkozó
                {filterActive !== "all" && ` (${filterActive === "active" ? "aktív" : "inaktív"})`}
              </p>
            </div>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              CSV Exportálás
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Search className="w-4 h-4 inline mr-2" />
                Keresés
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Email vagy név..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            {/* Active Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Filter className="w-4 h-4 inline mr-2" />
                Státusz
              </label>
              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="all">Összes</option>
                <option value="active">Aktív</option>
                <option value="inactive">Inaktív</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Tag className="w-4 h-4 inline mr-2" />
                Kategória
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="all">Összes kategória</option>
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {categoryLabels[cat] || cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Subscribers Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Feliratkozó
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Kategóriák
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Feliratkozás
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Forrás
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Státusz
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Műveletek
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSubscribers.map((subscriber) => (
                  <tr
                    key={subscriber.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {subscriber.name || "Név nélkül"}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {subscriber.email}
                        </div>
                        {subscriber.district && (
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {subscriber.district}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {subscriber.categories.map((cat) => (
                          <span
                            key={cat}
                            className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                          >
                            {categoryLabels[cat] || cat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(subscriber.subscribedAt).toLocaleDateString(
                          "hu-HU"
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {subscriber.source}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {subscriber.isActive ? (
                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Aktív
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600 dark:text-red-400 text-sm">
                          <XCircle className="w-4 h-4" />
                          Inaktív
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          toggleSubscriberStatus(subscriber.id, subscriber.isActive)
                        }
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {subscriber.isActive ? "Letiltás" : "Aktiválás"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSubscribers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || filterActive !== "all" || filterCategory !== "all"
                  ? "Nincs találat a szűrési feltételeknek megfelelően"
                  : "Még nincsenek feliratkozók"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
