"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useThemeColors } from "@/context/ThemeContext";

interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
}

export default function PostPage() {
  const params = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Theme integration
  const themeColors = useThemeColors();
  const isDarkMode = themeColors.mode === 'dark';

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${params.id}`);
        if (!response.ok) {
          throw new Error("Bejegyzés nem található");
        }
        const data = await response.json();
        setPost(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Hiba történt");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.id]);

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center transition-colors duration-300"
        style={{ backgroundColor: themeColors.bg }}
      >
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2 transition-colors duration-300"
          style={{ borderColor: themeColors.gradientFrom }}
        ></div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center transition-colors duration-300"
        style={{ backgroundColor: themeColors.bg }}
      >
        <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
        <Link
          href="/hirek"
          className="hover:underline transition-colors duration-300"
          style={{ color: themeColors.gradientFrom }}
        >
          Vissza a hírekhez
        </Link>
      </div>
    );
  }

  if (!post) return null;

  const formatContent = (content: string) => {
    // Ha a szöveg tartalmaz HTML tageket, tisztítsuk meg
    const cleanContent = content
      .replace(/<\/?p>/g, "\n")
      .replace(/<\/?[^>]+(>|$)/g, "");

    return cleanContent
      .split("\n")
      .map((line, index) => {
        // Üres sorok kihagyása
        if (!line.trim()) return null;

        // Hashtag-ek kezelése
        if (line.includes("#")) {
          const words = line.split(" ");
          return (
            <div key={index} className="mt-4">
              {words.map((word, wordIndex) =>
                word.startsWith("#") ? (
                  <span
                    key={wordIndex}
                    className="mr-2 transition-colors duration-300"
                    style={{ color: themeColors.gradientFrom }}
                  >
                    {word}
                  </span>
                ) : (
                  <span key={wordIndex} className="mr-2">
                    {word}
                  </span>
                )
              )}
            </div>
          );
        }

        // Normál szöveg
        return (
          <p 
            key={index} 
            className="mb-4 transition-colors duration-300"
            style={{ color: themeColors.text }}
          >
            {line.trim()}
          </p>
        );
      })
      .filter(Boolean); // null értékek kiszűrése
  };

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href="/hirek"
          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
        >
          <span className="mr-2">←</span> Vissza a hírekhez
        </Link>
      </div>

      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        {post.title}
        {post.title.includes("🇭🇺") ? "" : " 🇭🇺"}
      </h1>

      <div className="text-gray-600 dark:text-gray-400 mb-6">
        {new Date(post.createdAt).toLocaleDateString("hu-HU", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div>

      {post.imageUrl && (
        <div className="mb-8">
          <Image
            src={post.imageUrl}
            alt={post.title}
            width={800}
            height={400}
            className="w-full h-auto rounded-lg"
            priority={false}
          />
        </div>
      )}

      <div className="prose dark:prose-invert max-w-none">
        {formatContent(post.content)}
      </div>
    </article>
  );
}
