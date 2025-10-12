"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Video, Image as ImageIcon, Upload } from "lucide-react";
import Link from "next/link";

export default function NewSlidePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    type: "VIDEO" as "VIDEO" | "IMAGE",
    videoUrl: "",
    imageUrl: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  // Update preview when file is selected
  useEffect(() => {
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (formData.type === "VIDEO" && formData.videoUrl) {
      setPreviewUrl(formData.videoUrl);
    } else if (formData.type === "IMAGE" && formData.imageUrl) {
      setPreviewUrl(formData.imageUrl);
    } else {
      setPreviewUrl("");
    }
  }, [selectedFile, formData.type, formData.videoUrl, formData.imageUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Fájltípus ellenőrzés
    const isVideo = formData.type === "VIDEO";
    const validTypes = isVideo
      ? ["video/mp4", "video/webm"]
      : ["image/jpeg", "image/png", "image/gif", "image/webp"];

    if (!validTypes.includes(file.type)) {
      setError(
        `Nem megfelelő fájltípus! Használj ${isVideo ? "MP4 vagy WebM" : "JPEG, PNG, GIF vagy WebP"} formátumot.`
      );
      return;
    }

    // Fájlméret ellenőrzés (100MB)
    if (file.size > 100 * 1024 * 1024) {
      setError("A fájl mérete nem lehet nagyobb 100MB-nál!");
      return;
    }

    setSelectedFile(file);
    setError("");
  };

  const uploadFile = async () => {
    if (!selectedFile) return null;

    setUploading(true);
    setError("");

    try {
      // Client-side upload to Vercel Blob
      const { upload } = await import('@vercel/blob/client');

      const blob = await upload(selectedFile.name, selectedFile, {
        access: 'public',
        handleUploadUrl: '/api/upload/token',
      });

      return blob.url;
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || "Hiba történt a feltöltés során");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError("A cím megadása kötelező!");
      return;
    }

    if (!selectedFile) {
      setError(`A ${formData.type === "VIDEO" ? "videó" : "kép"} fájl feltöltése kötelező!`);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // Először feltöltjük a fájlt
      const uploadedUrl = await uploadFile();
      if (!uploadedUrl) {
        setSubmitting(false);
        return;
      }

      // Videó típus meghatározása a fájl kiterjesztéséből
      const fileExtension = selectedFile?.name.split('.').pop()?.toLowerCase();
      const videoType = fileExtension === 'webm' ? 'webm' : 'mp4';

      // Majd létrehozzuk a slide-ot a feltöltött URL-lel
      const slidePayload: any = {
        title: formData.title,
        subtitle: formData.subtitle || null,
        type: formData.type,
        mediaUrl: uploadedUrl,
      };

      // Videó-specifikus beállítások
      if (formData.type === "VIDEO") {
        slidePayload.videoType = videoType;
        slidePayload.autoPlay = true;
        slidePayload.isLoop = true;
        slidePayload.isMuted = true;
      }

      const response = await fetch("/api/slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slidePayload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Slide creation error:", data);
        throw new Error(data.error || "Hiba történt a létrehozás során");
      }

      router.push("/admin/slides");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Hiba történt a létrehozás során");
      setSubmitting(false);
    }
  };

  if (status === "loading") {
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
          <h1 className="text-3xl font-bold text-gray-900">Új slide létrehozása</h1>
          <p className="text-gray-600 mt-2">
            Tölts fel egy videót vagy képet a főoldali slideshow-hoz
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8">
          {/* Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Típus
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, type: "VIDEO" });
                  setSelectedFile(null);
                  setPreviewUrl("");
                }}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  formData.type === "VIDEO"
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Video className="w-8 h-8 mx-auto mb-2 text-indigo-600" />
                <span className="block font-medium">Videó</span>
                <span className="text-sm text-gray-500">MP4 vagy WebM fájl</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, type: "IMAGE" });
                  setSelectedFile(null);
                  setPreviewUrl("");
                }}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  formData.type === "IMAGE"
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <ImageIcon className="w-8 h-8 mx-auto mb-2 text-indigo-600" />
                <span className="block font-medium">Kép</span>
                <span className="text-sm text-gray-500">JPG, PNG, GIF, WebP</span>
              </button>
            </div>
          </div>

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

          {/* File Upload */}
          <div className="mb-6">
            <label htmlFor="fileUpload" className="block text-sm font-medium text-gray-700 mb-2">
              {formData.type === "VIDEO" ? "Videó fájl" : "Kép fájl"} *
            </label>
            <div className="flex items-center gap-4">
              <label
                htmlFor="fileUpload"
                className="flex-1 flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer"
              >
                <Upload className="w-6 h-6 text-gray-400" />
                <span className="text-gray-600">
                  {selectedFile ? selectedFile.name : "Kattints a fájl kiválasztásához"}
                </span>
              </label>
              <input
                type="file"
                id="fileUpload"
                onChange={handleFileSelect}
                accept={formData.type === "VIDEO" ? "video/mp4,video/webm" : "image/jpeg,image/jpg,image/png,image/gif,image/webp"}
                className="hidden"
                required
              />
              {selectedFile && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl("");
                  }}
                  className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Törlés
                </button>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {formData.type === "VIDEO"
                ? "Támogatott formátumok: MP4, WebM (max. 100MB)"
                : "Támogatott formátumok: JPEG, PNG, GIF, WebP (max. 100MB)"
              }
            </p>
          </div>

          {/* Preview */}
          {previewUrl && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Előnézet
              </label>
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                {formData.type === "VIDEO" ? (
                  <video
                    src={previewUrl}
                    className="w-full h-auto max-h-96"
                    controls
                    onError={() => setError("Nem sikerült betölteni a videót. Ellenőrizd az URL-t!")}
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-auto max-h-96 object-contain"
                    onError={() => setError("Nem sikerült betölteni a képet. Ellenőrizd az URL-t!")}
                  />
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 pt-6 border-t">
            <button
              type="submit"
              disabled={submitting || uploading}
              className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {uploading
                ? "Feltöltés..."
                : submitting
                ? "Létrehozás..."
                : "Feltöltés és létrehozás"}
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
