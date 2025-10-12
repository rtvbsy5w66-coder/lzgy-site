"use client";

import React, { useState, useEffect } from "react";
import { AppleStyleBadgeBanner } from "@/components/AppleStyleBadgeBanner";

interface BadgeItem {
  id: string;
  title: string;
  imageUrl: string;
  imageAlt?: string;
  link?: string;
  priority?: boolean;
  category?: string;
  width?: number;
  height?: number;
}

const PartnersSection = () => {
  const [partners, setPartners] = useState<BadgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPartners = async () => {
    try {
      const response = await fetch("/api/partners");
      if (!response.ok) {
        throw new Error("Hiba a partnerek betöltésekor");
      }
      const data = await response.json();
      setPartners(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching partners:", err);
      setError(err instanceof Error ? err.message : "Hiba a partnerek betöltésekor");
      // Fallback to default partners on error
      setPartners([
        {
          id: "github",
          title: "GitHub",
          imageUrl: "https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png",
          imageAlt: "GitHub",
          link: "https://github.com",
          priority: true,
          width: 200,
          height: 80
        },
        {
          id: "react",
          title: "React",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
          imageAlt: "React",
          link: "https://react.dev",
          width: 200,
          height: 80
        },
        {
          id: "nextjs",
          title: "Next.js",
          imageUrl: "https://nextjs.org/static/favicon/favicon-32x32.png",
          imageAlt: "Next.js",
          link: "https://nextjs.org",
          width: 200,
          height: 80
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  // Don't render if no partners and loading is complete
  if (!loading && partners.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="partners-heading" className="w-full py-16">
      {/* Header - centered with max-w */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="text-center">
          <h2 id="partners-heading" className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            🍎 Partnereink
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {loading 
              ? "Partnerek betöltése..."
              : error
                ? "A partnerek betöltése során hiba történt"
                : "Megbízható partnereink és támogatóink"
            }
          </p>
        </div>
      </div>
      
      {/* Banner - full width edge-to-edge */}
      {!loading && partners.length > 0 && (
        <AppleStyleBadgeBanner 
          badges={partners}
          scrollSpeed={80}
          height={240}
          badgeSize="medium"
          gap={40}
          showControls={false}
          className="w-full max-w-full"
        />
      )}

      {loading && (
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PartnersSection;