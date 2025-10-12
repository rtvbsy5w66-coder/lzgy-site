import React from "react";
import { ArrowRight, Calendar } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  category?: string;
  imageUrl?: string;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
  updatedAt: string;
  newsCategory?: {
    id: string;
    name: string;
    color: string;
  };
}

interface NewsCardProps {
  post: Post;
  index: number;
  truncateContent: (content: string, maxLength?: number) => string;
}

// Helper function to determine if a color is light or dark for contrast
const isLightColor = (hexColor: string): boolean => {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
};

// Helper function to create subtle variants of the category color
const createColorVariants = (baseColor: string) => {
  return {
    primary: baseColor,
    light: `${baseColor}10`, // Very subtle background
    medium: `${baseColor}20`, // Subtle accent
    border: `${baseColor}30`, // Subtle border
    hover: `${baseColor}15`, // Hover state
  };
};

export const ImprovedNewsCard: React.FC<NewsCardProps> = ({ 
  post, 
  index, 
  truncateContent 
}) => {
  // Use category color if available, fallback to neutral
  const categoryColor = post.newsCategory?.color || "#6b7280";
  const colors = createColorVariants(categoryColor);
  const isLight = isLightColor(categoryColor);
  
  return (
    <article className="group">
      {/* Main Card Container with Category Background */}
      <div 
        className="rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-t-4"
        style={{
          background: post.newsCategory 
            ? `linear-gradient(135deg, ${categoryColor}08 0%, ${categoryColor}15 100%)`
            : '#ffffff',
          borderTopColor: categoryColor,
          boxShadow: `0 1px 3px rgba(0,0,0,0.1), 0 4px 6px ${categoryColor}20`
        }}
      >
        {/* Image Section with Category Overlay */}
        {post.imageUrl && (
          <div className="relative w-full aspect-[16/9] md:aspect-[4/3] lg:aspect-[16/9] overflow-hidden">
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              priority={index === 0}
            />
            
            {/* Category Badge Overlay */}
            {post.newsCategory && (
              <div className="absolute top-3 right-3">
                <span 
                  className="px-3 py-1 rounded-full text-xs font-semibold text-white backdrop-blur-sm"
                  style={{
                    backgroundColor: `${categoryColor}e6`, // Semi-transparent
                    border: `1px solid ${categoryColor}`
                  }}
                >
                  {post.newsCategory.name}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Content Section */}
        <div className="p-6">
          {/* Header with Date and Category (if no image) */}
          <div className="flex items-center justify-between text-sm mb-4">
            <div className="flex items-center text-gray-500">
              <Calendar className="h-4 w-4 mr-2" />
              <time dateTime={post.createdAt}>
                {new Date(post.createdAt).toLocaleDateString("hu-HU", {
                  year: "numeric",
                  month: "long", 
                  day: "numeric",
                })}
              </time>
            </div>
            
            {/* Category badge for posts without images */}
            {!post.imageUrl && post.newsCategory && (
              <span 
                className="px-3 py-1 rounded-full text-xs font-medium text-white"
                style={{
                  backgroundColor: categoryColor,
                  border: `1px solid ${categoryColor}`
                }}
              >
                {post.newsCategory.name}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold mb-3 text-gray-900 line-clamp-2 group-hover:text-gray-700 transition-colors">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3 text-sm">
            {post.excerpt || truncateContent(post.content)}
          </p>

          {/* Read More Button with Category Accent */}
          <div className="flex items-center justify-between">
            <Link
              href={`/hirek/${post.id}`}
              className="inline-flex items-center text-sm font-medium transition-all duration-200 group/link"
              style={{ 
                color: categoryColor,
              }}
            >
              <span className="group-hover/link:mr-3 transition-all duration-200 mr-2">
                Teljes cikk
              </span>
              <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform duration-200" />
            </Link>
            
            {/* Subtle accent line */}
            <div 
              className="h-0.5 w-8 rounded-full opacity-30"
              style={{ backgroundColor: categoryColor }}
            />
          </div>
        </div>
      </div>
    </article>
  );
};

export default ImprovedNewsCard;