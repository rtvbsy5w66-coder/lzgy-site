"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Vote, Plus, Edit2, Trash2, BarChart3, Eye } from "lucide-react";
import Link from "next/link";

interface PollOption {
  id: string;
  text: string;
  order: number;
  _count?: {
    votes: number;
  };
}

interface Poll {
  id: string;
  title: string;
  description: string | null;
  status: string;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  options: PollOption[];
  _count?: {
    votes: number;
  };
}

export default function PollsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchPolls();
    }
  }, [status]);

  const fetchPolls = async () => {
    try {
      const response = await fetch("/api/polls");
      const data = await response.json();

      if (!response.ok) {
        console.error("Polls fetch error:", data.error);
        return;
      }

      setPolls(data);
    } catch (error) {
      console.error("Polls fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const deletePoll = async (id: string) => {
    if (!confirm("Biztosan törölni szeretnéd ezt a szavazást?")) return;

    try {
      const response = await fetch(`/api/polls/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Hiba történt a törlés során");
        return;
      }

      setPolls(polls.filter(poll => poll.id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      alert("Hiba történt a törlés során");
    }
  };

  const toggleStatus = async (poll: Poll) => {
    const newStatus = poll.status === "ACTIVE" ? "CLOSED" : "ACTIVE";

    try {
      const response = await fetch(`/api/polls/${poll.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Hiba történt a státusz módosítása során");
        return;
      }

      setPolls(polls.map(p => p.id === poll.id ? { ...p, status: newStatus } : p));
    } catch (error) {
      console.error("Status toggle error:", error);
      alert("Hiba történt a státusz módosítása során");
    }
  };

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

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <Vote className="w-8 h-8" />
              Szavazások
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Közvélemény kutatások és szavazások kezelése
            </p>
          </div>
          <Link
            href="/admin/polls/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Új szavazás
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Összes szavazás</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{polls.length}</p>
              </div>
              <Vote className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Aktív</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {polls.filter(p => p.status === "ACTIVE").length}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-600 dark:bg-green-400 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Lezárt</p>
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400 mt-1">
                  {polls.filter(p => p.status === "CLOSED").length}
                </p>
              </div>
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-gray-600 dark:bg-gray-400 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Összes szavazat</p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                  {polls.reduce((sum, poll) => sum + (poll._count?.votes || 0), 0)}
                </p>
              </div>
              <BarChart3 className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>

        {/* Polls List */}
        {polls.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center border border-gray-200 dark:border-gray-700">
            <Vote className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">Még nincs szavazás</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
              Hozz létre új szavazást a jobb felső gombra kattintva
            </p>
            <Link
              href="/admin/polls/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Új szavazás létrehozása
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cím
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Státusz
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Szavazatok
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Opciók
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Időszak
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Műveletek
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {polls.map((poll) => (
                  <tr key={poll.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {poll.title}
                        </div>
                        {poll.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                            {poll.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleStatus(poll)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          poll.status === "ACTIVE"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50"
                            : poll.status === "CLOSED"
                            ? "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                            : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50"
                        }`}
                      >
                        {poll.status === "ACTIVE" ? "Aktív" : poll.status === "CLOSED" ? "Lezárt" : "Piszkozat"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {poll._count?.votes || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {poll.options.length} válasz
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(poll.startDate).toLocaleDateString()}
                        {poll.endDate && (
                          <> - {new Date(poll.endDate).toLocaleDateString()}</>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/polls/${poll.id}/results`}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors"
                          title="Eredmények"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/polls/${poll.id}/edit`}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                          title="Szerkesztés"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => deletePoll(poll.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                          title="Törlés"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
