"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

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

export default function EditSlidePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [slide, setSlide] = useState<Slide | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && id) {
      fetchSlide();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, id]);

  const fetchSlide = async () => {
    try {
      const response = await fetch(`/api/slides/${id}`);
      if (!response.ok) {
        throw new Error("Slide nem található");
      }
      const data = await response.json();
      setSlide(data);
      setFormData({
        title: data.title,
        subtitle: data.subtitle || "",
        isActive: data.isActive,
      });
    } catch (err: any) {
      setError(err.message || "Hiba történt a betöltés során");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError("A cím megadása kötelező!");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/slides/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          subtitle: formData.subtitle || null,
          isActive: formData.isActive,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Hiba történt a mentés során");
      }

      router.push("/admin/slides");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Hiba történt a mentés során");
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Betöltés...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  if (error && !slide) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
          <Link
            href="/admin/slides"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft className="w-5 h-5" />
            Vissza a slide-okhoz
          </Link>
        </div>
      </div>
    );
  }

  if (!slide) return null;

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/slides"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Vissza a slide-okhoz
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Slide szerkesztése</h1>
          <p className="text-gray-600 mt-2">
            {slide.type === "VIDEO" ? "Videó" : "Kép"} slide módosítása
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Preview */}
        <div className="mb-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Jelenlegi média</h2>
          <div className="bg-gray-100 rounded-lg overflow-hidden">
            {slide.type === "VIDEO" && slide.videoUrl ? (
              <video src={slide.videoUrl} className="w-full h-auto max-h-96" controls />
            ) : slide.type === "IMAGE" && slide.imageUrl ? (
              <img src={slide.imageUrl} alt={slide.title} className="w-full h-auto max-h-96 object-contain" />
            ) : (
              <div className="p-8 text-center text-gray-500">Nincs elérhető média</div>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            A fájl cseréjéhez törölheté ezt a slide-ot és hozz létre egy újat.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8">
          {/* Title */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Cím *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Pl: Üdvözlünk a főoldalon"
              required
            />
          </div>

          {/* Subtitle */}
          <div className="mb-6">
            <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-2">
              Alcím
            </label>
            <input
              type="text"
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Opcionális alcím"
            />
          </div>

          {/* Active Status */}
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Aktív slide (megjelenik a főoldalon)
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-6 border-t">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Save className="w-5 h-5" />
              {saving ? "Mentés..." : "Változtatások mentése"}
            </button>
            <Link
              href="/admin/slides"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Mégse
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
