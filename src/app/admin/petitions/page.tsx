"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FileSignature, Plus, Edit2, Trash2, Users, TrendingUp, Eye } from "lucide-react";
import Link from "next/link";

interface Petition {
  id: string;
  title: string;
  description: string;
  targetGoal: number;
  status: string;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  _count?: {
    signatures: number;
  };
  category?: {
    name: string;
  } | null;
}

export default function PetitionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchPetitions();
    }
  }, [status]);

  const fetchPetitions = async () => {
    try {
      const response = await fetch("/api/petitions");
      const data = await response.json();

      if (!response.ok) {
        console.error("Petitions fetch error:", data.error);
        return;
      }

      setPetitions(data);
    } catch (error) {
      console.error("Petitions fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const deletePetition = async (id: string) => {
    if (!confirm("Biztosan törölni szeretnéd ezt a petíciót?")) return;

    try {
      const response = await fetch(`/api/petitions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Hiba történt a törlés során");
        return;
      }

      setPetitions(petitions.filter(p => p.id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      alert("Hiba történt a törlés során");
    }
  };

  const toggleStatus = async (petition: Petition) => {
    const newStatus = petition.status === "ACTIVE" ? "CLOSED" : "ACTIVE";

    try {
      const response = await fetch(`/api/petitions/${petition.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Hiba történt a státusz módosítása során");
        return;
      }

      setPetitions(petitions.map(p => p.id === petition.id ? { ...p, status: newStatus } : p));
    } catch (error) {
      console.error("Status toggle error:", error);
      alert("Hiba történt a státusz módosítása során");
    }
  };

  const getProgress = (petition: Petition) => {
    const signatures = petition._count?.signatures || 0;
    const target = petition.targetGoal;
    return Math.min((signatures / target) * 100, 100);
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

  const totalSignatures = petitions.reduce((sum, p) => sum + (p._count?.signatures || 0), 0);
  const activePetitions = petitions.filter(p => p.status === "ACTIVE");
  const successfulPetitions = petitions.filter(p =>
    (p._count?.signatures || 0) >= p.targetGoal
  );

  return (
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <FileSignature className="w-8 h-8" />
              Petíciók
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Online petíciók indítása és kezelése
            </p>
          </div>
          <Link
            href="/admin/petitions/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Új petíció
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Összes petíció</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{petitions.length}</p>
              </div>
              <FileSignature className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Aktív</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {activePetitions.length}
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Sikeres</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {successfulPetitions.length}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Összes aláírás</p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                  {totalSignatures}
                </p>
              </div>
              <Users className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>

        {/* Petitions List */}
        {petitions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center border border-gray-200 dark:border-gray-700">
            <FileSignature className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">Még nincs petíció</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
              Hozz létre új petíciót a jobb felső gombra kattintva
            </p>
            <Link
              href="/admin/petitions/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Új petíció létrehozása
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {petitions.map((petition) => {
              const signatures = petition._count?.signatures || 0;
              const progress = getProgress(petition);
              const isSuccessful = signatures >= petition.targetGoal;

              return (
                <div key={petition.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{petition.title}</h3>
                        <button
                          onClick={() => toggleStatus(petition)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            petition.status === "ACTIVE"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50"
                              : petition.status === "CLOSED"
                              ? "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                              : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50"
                          }`}
                        >
                          {petition.status === "ACTIVE" ? "Aktív" : petition.status === "CLOSED" ? "Lezárt" : "Piszkozat"}
                        </button>
                        {isSuccessful && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Sikeres
                          </span>
                        )}
                      </div>
                      {petition.category && (
                        <span className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded mb-2">
                          {petition.category.name}
                        </span>
                      )}
                      <p className="text-gray-600 dark:text-gray-400 line-clamp-2">{petition.description}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Link
                        href={`/admin/petitions/${petition.id}/signatures`}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors"
                        title="Aláírások"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      <Link
                        href={`/admin/petitions/${petition.id}/edit`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                        title="Szerkesztés"
                      >
                        <Edit2 className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => deletePetition(petition.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                        title="Törlés"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {signatures.toLocaleString()} / {petition.targetGoal.toLocaleString()} aláírás
                      </span>
                      <span className={`font-medium ${isSuccessful ? 'text-purple-600 dark:text-purple-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          isSuccessful ? 'bg-purple-600 dark:bg-purple-500' : 'bg-indigo-600 dark:bg-indigo-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="mt-4 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>
                      Kezdés: {new Date(petition.startDate).toLocaleDateString()}
                    </span>
                    {petition.endDate && (
                      <span>
                        Lejárat: {new Date(petition.endDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
