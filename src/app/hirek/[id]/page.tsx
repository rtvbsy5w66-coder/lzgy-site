"use client";
import { useState, useEffect } from "react";
import { Loader2, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import DOMPurify from 'isomorphic-dompurify';
import { useThemeColors } from "@/context/ThemeContext";

interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  newsCategory?: {
    id: string;
    name: string;
    color: string;
  };
}

export default function HirReszletek({ params }: { params: Promise<{ id: string }> }) {
  const [hir, setHir] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState<string | null>(null);
  
  // Use NEWS theme colors (falls back to global if no NEWS theme is active)
  const themeColors = useThemeColors('NEWS');
  const isDarkMode = themeColors.mode === 'dark';
  
  // Get category color if available, fallback to theme gradient
  const categoryColor = hir?.newsCategory?.color || themeColors.gradientFrom;
  const accentColor = hir?.newsCategory?.color || themeColors.accent;

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!id) return;
    
    const hirBetoltese = async () => {
      const res = await fetch(`/api/posts/${id}`);
      const data = await res.json();
      setHir(data);
      setLoading(false);
    };
    hirBetoltese();
  }, [id]);
  

  if (loading)
    return (
      <div 
        className="flex justify-center items-center min-h-screen transition-colors duration-300"
        style={{ backgroundColor: themeColors.bg }}
      >
        <Loader2 
          className="h-8 w-8 animate-spin" 
          style={{ color: themeColors.gradientFrom }}
        />
      </div>
    );

  return (
    <main 
      className="flex min-h-screen flex-col transition-colors duration-300"
      style={{ 
        background: hir?.newsCategory 
          ? `linear-gradient(135deg, ${categoryColor}60 0%, ${categoryColor}40 50%, ${categoryColor}20 100%)`
          : themeColors.gradient
      }}
    >
      <div className="relative pt-20">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <article 
          className="relative max-w-4xl mx-auto px-4 py-16 rounded-lg shadow-xl transition-all duration-300"
          style={{ 
            backgroundColor: hir?.newsCategory 
              ? (isDarkMode ? `${categoryColor}15` : `${categoryColor}05`)
              : (isDarkMode ? `${themeColors.cardBg}f0` : `${themeColors.bg}f0`),
            backdropFilter: 'blur(12px)',
            border: `2px solid ${categoryColor}60`,
            boxShadow: `0 20px 25px -5px ${categoryColor}30, 0 10px 10px -5px ${categoryColor}20`
          }}
        >
          {/* Navigation Bar - Global Theme */}
          <nav className="mb-8 p-4 rounded-lg -mx-4 -mt-16" style={{ backgroundColor: themeColors.cardBg }}>
            <Link
              href="/hirek"
              className="inline-flex items-center text-sm font-medium transition-colors duration-200 hover:opacity-80"
              style={{ color: themeColors.gradientFrom }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Vissza a hírekhez
            </Link>
          </nav>

          {/* Category Header - Category Dominant */}
          {hir?.newsCategory && (
            <div className="mb-8 text-center">
              <div 
                className="inline-block px-8 py-4 rounded-full text-lg font-bold text-white shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${categoryColor} 0%, ${categoryColor}cc 100%)`,
                  boxShadow: `0 8px 16px ${categoryColor}40`
                }}
              >
                {hir.newsCategory.name}
              </div>
            </div>
          )}

          {hir?.imageUrl && (
            <div className="relative mb-8">
              <Image
                src={hir.imageUrl}
                alt={hir.title}
                width={800}
                height={400}
                className="w-full h-[400px] object-cover rounded-lg shadow-lg"
                priority={false}
              />
              {/* Strong category color overlay */}
              <div 
                className="absolute inset-0 rounded-lg"
                style={{ 
                  background: `linear-gradient(45deg, ${categoryColor}20 0%, transparent 40%, ${categoryColor}30 100%)`
                }}
              />
              {/* Category badge on image */}
              <div className="absolute top-4 right-4">
                <div 
                  className="px-3 py-1 rounded-full text-xs font-bold text-white backdrop-blur-sm"
                  style={{ backgroundColor: `${categoryColor}e6` }}
                >
                  {hir.newsCategory?.name}
                </div>
              </div>
            </div>
          )}

          {/* Date with category emphasis */}
          <div 
            className="flex items-center justify-center text-sm mb-6 p-3 rounded-lg"
            style={{ 
              backgroundColor: `${categoryColor}10`, 
              color: categoryColor,
              border: `1px solid ${categoryColor}30`
            }}
          >
            <Calendar className="h-4 w-4 mr-2" />
            {hir?.createdAt && new Date(hir.createdAt).toLocaleDateString("hu-HU", {
              year: "numeric",
              month: "long", 
              day: "numeric"
            })}
          </div>

          <h1 
            className="text-4xl font-bold mb-8 text-center"
            style={{ color: categoryColor }}
          >
            {hir?.title}
          </h1>

          {hir?.content && (
            <div className="transition-colors duration-300">
              <style jsx>{`
                .content-area {
                  color: ${isDarkMode ? themeColors.text : themeColors.text};
                  line-height: 1.8;
                  background: ${isDarkMode ? `${categoryColor}05` : `${categoryColor}03`};
                  padding: 2rem;
                  border-radius: 12px;
                  border: 1px solid ${categoryColor}20;
                }
                .content-area h1, .content-area h2, .content-area h3, .content-area h4, .content-area h5, .content-area h6 {
                  color: ${categoryColor};
                  margin-top: 1.5em;
                  margin-bottom: 0.5em;
                  font-weight: 700;
                  padding-bottom: 0.3em;
                  border-bottom: 2px solid ${categoryColor}30;
                }
                .content-area p {
                  margin-bottom: 1.2em;
                  text-align: justify;
                }
                .content-area a {
                  color: ${categoryColor};
                  text-decoration: underline;
                  font-weight: 600;
                  background: ${categoryColor}10;
                  padding: 0.1em 0.3em;
                  border-radius: 4px;
                }
                .content-area a:hover {
                  background: ${categoryColor}20;
                  transform: translateY(-1px);
                }
                .content-area blockquote {
                  border-left: 4px solid ${categoryColor};
                  background: ${categoryColor}08;
                  padding: 1rem 1.5rem;
                  margin: 1.5rem 0;
                  font-style: italic;
                  color: ${categoryColor};
                  border-radius: 8px;
                  box-shadow: 0 2px 8px ${categoryColor}20;
                }
                .content-area ul, .content-area ol {
                  margin: 1rem 0;
                  padding-left: 1.5rem;
                  background: ${categoryColor}05;
                  padding: 1rem 1rem 1rem 2.5rem;
                  border-radius: 8px;
                  border-left: 3px solid ${categoryColor}40;
                }
                .content-area li {
                  margin-bottom: 0.5rem;
                }
                .content-area li::marker {
                  color: ${categoryColor};
                }
                .content-area strong {
                  color: ${categoryColor};
                  font-weight: 700;
                }
                .content-area em {
                  color: ${categoryColor}cc;
                  font-style: italic;
                }
              `}</style>
              <div
                className="content-area max-w-none"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(hir.content) }}
              />
            </div>
          )}
        </article>
      </div>
    </main>
  );
}
