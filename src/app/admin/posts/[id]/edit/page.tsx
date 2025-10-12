"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Save, Upload } from "lucide-react";
import Link from "next/link";
import RichTextEditor from "@/components/RichTextEditor";

interface NewsCategory {
  id: string;
  name: string;
  color: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  status: string;
  imageUrl: string | null;
  newsCategoryId: string | null;
}

export default function EditPostPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [post, setPost] = useState<Post | null>(null);
  const [showCustomSubcategory, setShowCustomSubcategory] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    status: "DRAFT",
    imageUrl: "",
    newsCategoryId: "",
    subcategory: "",
    publishDate: new Date().toISOString().split('T')[0],
  });

  // Előre definiált alkategóriák/sorozatok
  const PREDEFINED_SUBCATEGORIES = [
    "A korrupció öl",
    "MZP, tévedsz!",
    "Közpénz nyomon követése",
    "Helyi fejlesztések",
  ];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && postId) {
      fetchPost();
      fetchCategories();
    }
  }, [status, postId]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`);
      if (response.ok) {
        const data = await response.json();
        const postData = data.data || data;
        setPost(postData);

        const subcategoryValue = postData.subcategory || "";

        // Check if it's a predefined subcategory or custom
        setShowCustomSubcategory(
          subcategoryValue !== "" && !PREDEFINED_SUBCATEGORIES.includes(subcategoryValue)
        );

        setFormData({
          title: postData.title,
          content: postData.content,
          excerpt: postData.excerpt || "",
          status: postData.status,
          imageUrl: postData.imageUrl || "",
          newsCategoryId: postData.newsCategoryId || "",
          subcategory: subcategoryValue,
          publishDate: postData.createdAt ? new Date(postData.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        });
      } else {
        alert("Bejegyzés nem található");
        router.push("/admin/posts");
      }
    } catch (error) {
      console.error("Failed to fetch post:", error);
      alert("Hiba történt a bejegyzés betöltése során");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/news-categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || undefined,
        status: formData.status,
        imageUrl: formData.imageUrl || undefined,
        newsCategoryId: formData.newsCategoryId || undefined,
        subcategory: formData.subcategory || undefined,
        createdAt: formData.publishDate ? new Date(formData.publishDate).toISOString() : undefined,
      };

      const response = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push("/admin/posts");
      } else {
        const error = await response.json();
        alert(`Hiba: ${error.error || "Ismeretlen hiba"}`);
      }
    } catch (error) {
      console.error("Failed to update post:", error);
      alert("Hiba történt a bejegyzés mentése során");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Csak képfájlokat lehet feltölteni!');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('A kép mérete maximum 5MB lehet!');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Feltöltés sikertelen');
      }

      const data = await response.json();
      setFormData((prev) => ({ ...prev, imageUrl: data.url }));
      alert('Kép sikeresen feltöltve!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Hiba történt a kép feltöltése során');
    } finally {
      setUploading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  if (!post) {
    return null;
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/posts"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Vissza a bejegyzésekhez
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Bejegyzés szerkesztése</h1>
          <p className="text-gray-600 mt-2">Módosítsd a bejegyzés adatait</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Cím *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="A bejegyzés címe..."
            />
          </div>

          {/* Excerpt */}
          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
              Kivonat (opcionális)
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Rövid összefoglaló a bejegyzésről..."
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Tartalom *
            </label>
            <RichTextEditor
              value={formData.content}
              onChange={(value) => setFormData((prev) => ({ ...prev, content: value }))}
              placeholder="Írd ide a bejegyzés tartalmát..."
            />
          </div>

          {/* Category, Status & Publish Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Category */}
            <div>
              <label htmlFor="newsCategoryId" className="block text-sm font-medium text-gray-700 mb-2">
                Kategória
              </label>
              <select
                id="newsCategoryId"
                name="newsCategoryId"
                value={formData.newsCategoryId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">-- Válassz kategóriát --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Állapot
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="DRAFT">Vázlat</option>
                <option value="PUBLISHED">Publikált</option>
                <option value="ARCHIVED">Archivált</option>
              </select>
            </div>

            {/* Publish Date */}
            <div>
              <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700 mb-2">
                📅 Publikálás dátuma
              </label>
              <input
                type="date"
                id="publishDate"
                name="publishDate"
                value={formData.publishDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Régi cikkeknél állítsd be az eredeti dátumot
              </p>
            </div>
          </div>

          {/* Subcategory / Series Name */}
          <div>
            <label htmlFor="subcategorySelect" className="block text-sm font-medium text-gray-700 mb-2">
              Alkategória / Sorozat neve (opcionális)
            </label>
            <select
              id="subcategorySelect"
              value={showCustomSubcategory ? "CUSTOM" : formData.subcategory}
              onChange={(e) => {
                if (e.target.value === "CUSTOM") {
                  setShowCustomSubcategory(true);
                  setFormData((prev) => ({ ...prev, subcategory: "" }));
                } else {
                  setShowCustomSubcategory(false);
                  setFormData((prev) => ({ ...prev, subcategory: e.target.value }));
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">-- Nincs alkategória --</option>
              {PREDEFINED_SUBCATEGORIES.map((subcat) => (
                <option key={subcat} value={subcat}>
                  {subcat}
                </option>
              ))}
              <option value="CUSTOM">✏️ Egyéni alkategória...</option>
            </select>

            {/* Custom subcategory input */}
            {showCustomSubcategory && (
              <div className="mt-3">
                <input
                  type="text"
                  id="subcategory"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                  placeholder="Írd be az egyéni alkategóriát..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            )}

            <p className="text-xs text-gray-500 mt-1">
              Sorozatos bejegyzésekhez válassz vagy adj meg sorozat nevet
            </p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kép feltöltése (opcionális)
            </label>

            {/* File Upload Button */}
            <div className="flex items-center gap-4 mb-4">
              <label
                htmlFor="imageFile"
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition-colors disabled:opacity-50"
              >
                <Upload className="w-5 h-5" />
                {uploading ? "Feltöltés..." : "Kép választása"}
              </label>
              <input
                type="file"
                id="imageFile"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
              <span className="text-sm text-gray-500">
                Max 5MB, JPG/PNG/GIF
              </span>
            </div>

            {/* OR separator */}
            <div className="flex items-center gap-4 my-4">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="text-sm text-gray-500">VAGY</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Manual URL Input */}
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Kép URL megadása
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Image Preview */}
            {formData.imageUrl && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Előnézet:</p>
                <img
                  src={formData.imageUrl}
                  alt="Előnézet"
                  className="max-w-md rounded-lg shadow-md"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-4 pt-6 border-t">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-5 h-5" />
              {saving ? "Mentés..." : "Változtatások mentése"}
            </button>
            <Link
              href="/admin/posts"
              className="px-6 py-3 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Mégse
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
