"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Check, AlertCircle } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageChange: (imageUrl: string) => void;
  onError?: (error: string) => void;
  className?: string;
  acceptedTypes?: string[];
  maxSizeMB?: number;
  recommendedSize?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImageUrl,
  onImageChange,
  onError,
  className = "",
  acceptedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"],
  maxSizeMB = 5,
  recommendedSize = "250×100px"
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      const error = `Csak a következő fájltípusok engedélyezettek: ${acceptedTypes.join(", ")}`;
      onError?.(error);
      setUploadStatus("error");
      return;
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      const error = `A fájl mérete maximum ${maxSizeMB}MB lehet`;
      onError?.(error);
      setUploadStatus("error");
      return;
    }

    setUploading(true);
    setUploadStatus("idle");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/banner", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Hiba történt a feltöltés során");
      }

      const result = await response.json();
      onImageChange(result.imageUrl);
      setUploadStatus("success");
      
      // Reset success status after 3 seconds
      setTimeout(() => setUploadStatus("idle"), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ismeretlen hiba";
      onError?.(errorMessage);
      setUploadStatus("error");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    onImageChange("");
    setUploadStatus("idle");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Image Preview */}
      {currentImageUrl && (
        <div className="relative">
          <div className="relative border-2 border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Jelenlegi kép:
              </span>
              <button
                type="button"
                onClick={clearImage}
                className="text-red-500 hover:text-red-700 transition-colors"
                title="Kép eltávolítása"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="relative w-full h-24 bg-gray-50 dark:bg-gray-600 rounded overflow-hidden">
              {/* Render Image for both absolute URLs and relative paths */}
              {(() => {
                // Check if it's a valid absolute URL or a relative path starting with /
                const isValidUrl = (() => {
                  try {
                    new URL(currentImageUrl);
                    return true; // Valid absolute URL
                  } catch {
                    return currentImageUrl.startsWith('/'); // Valid relative path
                  }
                })();

                if (isValidUrl) {
                  return (
                    <Image
                      src={currentImageUrl}
                      alt="Banner preview"
                      fill
                      className="object-cover"
                      sizes="300px"
                    />
                  );
                } else {
                  return (
                    <div className="w-full h-full flex items-center justify-center text-red-500">
                      <div className="text-center">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-xs">Érvénytelen URL: {currentImageUrl}</p>
                        <p className="text-xs mt-1">Adj meg egy érvényes URL-t (http:// vagy https://)</p>
                      </div>
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${
          dragOver
            ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
            : uploading
            ? "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
            : "border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={!uploading ? handleClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(",")}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={uploading}
        />

        <div className="space-y-3">
          {uploading ? (
            <>
              <div className="mx-auto h-12 w-12 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <p className="text-gray-600 dark:text-gray-400">Feltöltés...</p>
            </>
          ) : uploadStatus === "success" ? (
            <>
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-green-600 dark:text-green-400 font-medium">Sikeresen feltöltve!</p>
            </>
          ) : uploadStatus === "error" ? (
            <>
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-red-600 dark:text-red-400 font-medium">Hiba történt a feltöltés során</p>
              <button
                type="button"
                onClick={() => setUploadStatus("idle")}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Újrapróbálás
              </button>
            </>
          ) : (
            <>
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                <Upload className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  Kattints ide vagy húzd ide a képet
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Vagy válassz fájlt a számítógépedről
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Upload Instructions */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>
          <strong>Ajánlott méret:</strong> 1920×1080px (16:9 arány bannerekhez)
        </p>
        <p>
          <strong>Támogatott formátumok:</strong> JPEG, PNG, WebP, SVG
        </p>
        <p>
          <strong>Maximális méret:</strong> {maxSizeMB}MB
        </p>
        <p>
          <strong>Tipp:</strong> Használj magas minőségű képeket tiszta háttérrel a legjobb eredményért
        </p>
      </div>
    </div>
  );
};

export default ImageUpload;