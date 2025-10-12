"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Image as ImageIcon, ArrowUp, ArrowDown } from "lucide-react";

interface Slide {
  id: string;
  title: string;
  subtitle: string | null;
  type: string;
  imageUrl: string | null;
  videoUrl: string | null;
  order: number;
  isActive: boolean;
}

export default function SlidesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchSlides();
    }
  }, [status]);

  const fetchSlides = async () => {
    try {
      const response = await fetch("/api/slides");
      const data = await response.json();
      // API returns array directly
      setSlides(Array.isArray(data) ? data : (data.data || data.slides || []));
    } catch (error) {
      console.error("Failed to fetch slides:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Biztosan törölni szeretnéd ezt a slide-ot?")) {
      return;
    }

    try {
      const response = await fetch(`/api/slides/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSlides(slides.filter((slide) => slide.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete slide:", error);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/slides/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        setSlides(
          slides.map((slide) =>
            slide.id === id ? { ...slide, isActive: !currentStatus } : slide
          )
        );
      }
    } catch (error) {
      console.error("Failed to toggle slide:", error);
    }
  };

  const moveSlide = async (id: string, direction: "up" | "down") => {
    const index = slides.findIndex((s) => s.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === slides.length - 1)
    ) {
      return;
    }

    const newSlides = [...slides];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newSlides[index], newSlides[targetIndex]] = [
      newSlides[targetIndex],
      newSlides[index],
    ];

    // Update order in database
    try {
      await Promise.all(
        newSlides.map((slide, idx) =>
          fetch(`/api/slides/${slide.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: idx }),
          })
        )
      );
      setSlides(newSlides);
    } catch (error) {
      console.error("Failed to reorder slides:", error);
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Főoldal Slide-ok</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Főoldal hero szekció slide-jainak kezelése
            </p>
          </div>
          <Link
            href="/admin/slides/new"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Új slide
          </Link>
        </div>

        {/* Slides List */}
        {slides.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center border border-gray-200 dark:border-gray-700">
            <ImageIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">Még nincsenek slide-ok</p>
            <Link
              href="/admin/slides/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600"
            >
              <Plus className="w-5 h-5" />
              Első slide létrehozása
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sorrend
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cím
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Típus
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Állapot
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Műveletek
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {slides.map((slide, index) => (
                  <tr key={slide.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {index + 1}
                        </span>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => moveSlide(slide.id, "up")}
                            disabled={index === 0}
                            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => moveSlide(slide.id, "down")}
                            disabled={index === slides.length - 1}
                            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {slide.title}
                      </div>
                      {slide.subtitle && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {slide.subtitle}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {slide.type === "VIDEO" ? "Videó" : "Kép"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleActive(slide.id, slide.isActive)}
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          slide.isActive
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {slide.isActive ? "Aktív" : "Inaktív"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/slides/${slide.id}/edit`}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                          title="Szerkesztés"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(slide.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          title="Törlés"
                        >
                          <Trash2 className="w-5 h-5" />
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
