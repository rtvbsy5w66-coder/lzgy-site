"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ClipboardList,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Filter,
  Search
} from "lucide-react";
import Link from "next/link";

interface ProgramPoint {
  id: string;
  title: string;
  category: string;
  description: string;
  details: string;
  priority: number;
  status: string;
  imageUrl?: string;
  customColor?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = [
  "Összes",
  "Szociálpolitika",
  "Oktatáspolitika",
  "Egészségügy",
  "Közlekedés",
  "Turizmus és vendéglátás",
  "Honvédelem",
  "Rendvédelem",
  "Nyugdíjasok támogatása",
  "Integritás és elszámoltatás"
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PLANNED: { label: "Tervezett", color: "bg-blue-100 text-blue-800" },
  IN_PROGRESS: { label: "Folyamatban", color: "bg-yellow-100 text-yellow-800" },
  COMPLETED: { label: "Megvalósult", color: "bg-green-100 text-green-800" },
  ON_HOLD: { label: "Felfüggesztve", color: "bg-gray-100 text-gray-800" },
  CANCELLED: { label: "Megszakítva", color: "bg-red-100 text-red-800" }
};

export default function ProgramPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [programPoints, setProgramPoints] = useState<ProgramPoint[]>([]);
  const [filteredPoints, setFilteredPoints] = useState<ProgramPoint[]>([]);
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Összes");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "Szociálpolitika",
    description: "",
    details: "",
    priority: 2,
    status: "PLANNED",
    imageUrl: "",
    customColor: "",
    sortOrder: 0
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProgramPoints();
      fetchCategoryColors();
    }
  }, [status]);

  const fetchCategoryColors = async () => {
    try {
      const response = await fetch("/api/category-colors");
      const data = await response.json();
      const colorsMap = data.reduce((acc: Record<string, string>, cat: any) => {
        acc[cat.name] = cat.color;
        return acc;
      }, {});
      setCategoryColors(colorsMap);
    } catch (error) {
      console.error("Failed to fetch category colors:", error);
    }
  };

  useEffect(() => {
    filterPoints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, searchTerm, programPoints]);

  // Automatikusan frissíti a színt amikor kategóriát választasz
  useEffect(() => {
    if (formData.category && categoryColors[formData.category]) {
      setFormData(prev => ({
        ...prev,
        customColor: categoryColors[prev.category]
      }));
    }
  }, [formData.category, categoryColors]);

  const fetchProgramPoints = async () => {
    try {
      const response = await fetch("/api/program");
      const data = await response.json();

      if (!response.ok) {
        console.error("Program fetch error:", data.error);
        return;
      }

      setProgramPoints(data);
    } catch (error) {
      console.error("Program fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterPoints = () => {
    let filtered = programPoints;

    if (selectedCategory !== "Összes") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPoints(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingId ? `/api/program/${editingId}` : "/api/program";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Hiba történt a mentés során");
        return;
      }

      // Reset form
      setFormData({
        title: "",
        category: "Szociálpolitika",
        description: "",
        details: "",
        priority: 2,
        status: "PLANNED",
        imageUrl: "",
        customColor: "",
        sortOrder: 0
      });
      setShowNewForm(false);
      setEditingId(null);

      // Refresh list
      fetchProgramPoints();
    } catch (error) {
      console.error("Submit error:", error);
      alert("Hiba történt a mentés során");
    }
  };

  const handleEdit = (point: ProgramPoint) => {
    setFormData({
      title: point.title,
      category: point.category,
      description: point.description,
      details: point.details,
      priority: point.priority,
      status: point.status,
      imageUrl: point.imageUrl || "",
      customColor: point.customColor || "",
      sortOrder: point.sortOrder
    });
    setEditingId(point.id);
    setShowNewForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Biztosan törölni szeretnéd ezt a programpontot?")) return;

    try {
      const response = await fetch(`/api/program/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Hiba történt a törlés során");
        return;
      }

      fetchProgramPoints();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Hiba történt a törlés során");
    }
  };

  const toggleActive = async (point: ProgramPoint) => {
    try {
      const response = await fetch(`/api/program/${point.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...point,
          isActive: !point.isActive
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Hiba történt");
        return;
      }

      fetchProgramPoints();
    } catch (error) {
      console.error("Toggle error:", error);
      alert("Hiba történt");
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

  return (
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Program Kezelő</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Politikai program pontok kezelése</p>
          </div>
          <button
            onClick={() => {
              setShowNewForm(!showNewForm);
              setEditingId(null);
              setFormData({
                title: "",
                category: "Szociálpolitika",
                description: "",
                details: "",
                priority: 2,
                status: "PLANNED",
                imageUrl: "",
                customColor: "",
                sortOrder: 0
              });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Új Programpont
          </button>
        </div>

        {/* New/Edit Form */}
        {showNewForm && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {editingId ? "Programpont Szerkesztése" : "Új Programpont"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cím *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Kategória *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  >
                    {CATEGORIES.filter(c => c !== "Összes").map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Prioritás *
                  </label>
                  <select
                    required
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  >
                    <option value={1}>1 - Magas</option>
                    <option value={2}>2 - Közepes</option>
                    <option value={3}>3 - Alacsony</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Státusz *
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  >
                    {Object.entries(STATUS_MAP).map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Kép URL
                  </label>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Egyedi Szín (opcionális)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.customColor || "#f59e0b"}
                      onChange={(e) => setFormData({ ...formData, customColor: e.target.value })}
                      className="h-10 w-20 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.customColor}
                      onChange={(e) => setFormData({ ...formData, customColor: e.target.value })}
                      placeholder="#f59e0b"
                      className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    />
                    {formData.customColor && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, customColor: "" })}
                        className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Alapértelmezett
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Ha üresen hagyod, a kategória alapértelmezett színe lesz használva
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sorrend
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rövid leírás *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Részletes leírás *
                </label>
                <textarea
                  required
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewForm(false);
                    setEditingId(null);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Mégse
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600"
                >
                  {editingId ? "Mentés" : "Létrehozás"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Keresés..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
              </div>
            </div>
            <div className="w-full md:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">Összes</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{programPoints.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">Aktív</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {programPoints.filter(p => p.isActive).length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">Magas prioritás</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {programPoints.filter(p => p.priority === 1).length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">Szűrt</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{filteredPoints.length}</p>
          </div>
        </div>

        {/* Program List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cím
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Kategória
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Prioritás
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Státusz
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Láthatóság
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Műveletek
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPoints.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      <ClipboardList className="w-12 h-12 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                      <p>Nincs megjeleníthető programpont</p>
                    </td>
                  </tr>
                ) : (
                  filteredPoints.map((point) => (
                    <tr key={point.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{point.title}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{point.description.substring(0, 60)}...</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900 dark:text-gray-100">{point.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          point.priority === 1 ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                          point.priority === 2 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                          'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        }`}>
                          {point.priority === 1 ? 'Magas' : point.priority === 2 ? 'Közepes' : 'Alacsony'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          STATUS_MAP[point.status]?.color || 'bg-gray-100 text-gray-800'
                        }`}>
                          {STATUS_MAP[point.status]?.label || point.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleActive(point)}
                          className={`p-1 rounded ${
                            point.isActive ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {point.isActive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(point)}
                            className="p-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded"
                            title="Szerkesztés"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(point.id)}
                            className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                            title="Törlés"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
