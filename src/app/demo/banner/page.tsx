"use client";

import React from "react";
import { RightToLeftBanner } from "@/components/RightToLeftBanner";
import { AppleStyleBadgeBanner } from "@/components/AppleStyleBadgeBanner";
import { Bell, AlertTriangle, Info, Star, Megaphone } from "lucide-react";

const BannerDemoPage = () => {
  // Demo text banner data
  const bannerItems = [
    {
      id: "1",
      title: "Fontos közlemény",
      content: "Az önkormányzati ülés időpontja megváltozott",
      link: "/hirek",
      icon: <Bell className="h-4 w-4" />,
      urgent: true
    },
    {
      id: "2", 
      title: "Új program",
      content: "Közösségi rendezvény a főtéren szombaton",
      link: "/esemenyek",
      icon: <Star className="h-4 w-4" />,
      color: "#10b981"
    },
    {
      id: "3",
      title: "Információ",
      content: "Útfelújítások a belvárosban ezen a héten",
      icon: <Info className="h-4 w-4" />,
      color: "#3b82f6"
    },
    {
      id: "4",
      title: "Figyelem!",
      content: "Parkolási korlátozások a piactér környékén",
      icon: <AlertTriangle className="h-4 w-4" />,
      urgent: true
    },
    {
      id: "5",
      title: "Kampány hírek",
      content: "Találkozzon velünk a következő lakossági fórumon",
      link: "/program",
      icon: <Megaphone className="h-4 w-4" />,
      color: "#8b5cf6"
    }
  ];

  // Demo image badge data (Apple-style)
  const badgeItems = [
    {
      id: "badge-1",
      title: "GitHub",
      imageUrl: "https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png",
      imageAlt: "GitHub logo",
      link: "https://github.com",
      priority: true
    },
    {
      id: "badge-2", 
      title: "React",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
      imageAlt: "React logo",
      link: "https://react.dev"
    },
    {
      id: "badge-3",
      title: "Next.js",
      imageUrl: "https://nextjs.org/static/favicon/favicon-32x32.png",
      imageAlt: "Next.js logo",
      link: "https://nextjs.org"
    },
    {
      id: "badge-4",
      title: "TypeScript",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg",
      imageAlt: "TypeScript logo",
      link: "https://typescriptlang.org"
    },
    {
      id: "badge-5",
      title: "Tailwind",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg",
      imageAlt: "Tailwind CSS logo",
      link: "https://tailwindcss.com"
    },
    {
      id: "badge-6",
      title: "Vercel",
      imageUrl: "https://assets.vercel.com/image/upload/front/favicon/vercel/32x32.png",
      imageAlt: "Vercel logo",
      link: "https://vercel.com"
    }
  ];

  // Mixed content for updated RightToLeftBanner
  const mixedBannerItems = [
    {
      id: "mixed-1",
      title: "Új szolgáltatás",
      content: "Próbálja ki most",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Visual_Studio_Code_1.35_icon.svg",
      imageAlt: "Service icon",
      badgeStyle: "mixed" as const,
      link: "/services",
      color: "#007AFF"
    },
    {
      id: "mixed-2",
      title: "Hírek",
      content: "Legfrissebb információk",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/58/NewYorkTimes.svg",
      imageAlt: "News icon",
      badgeStyle: "mixed" as const,
      link: "/hirek",
      color: "#FF3B30"
    },
    {
      id: "mixed-3",
      title: "Események",
      content: "Közelgő programok",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Google_Calendar_icon_%282020%29.svg",
      imageAlt: "Calendar icon",
      badgeStyle: "mixed" as const,
      link: "/esemenyek",
      color: "#FF9500"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🎯 Banner Komponens Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
            Jobbról balra mozgó bannerek - ellentétes irányú a hírkártyákkal
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Szöveges bannerek, Apple-stílusú badge-ek és vegyes tartalom
          </p>
        </div>

        <div className="space-y-12">
          {/* Apple-Style Badge Banner */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              🍎 Apple-stílusú Badge Banner (Képek)
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Tiszta képes megjelenítés, Apple-stílusú design
            </p>
            <AppleStyleBadgeBanner 
              badges={badgeItems}
              scrollSpeed={40}
              height={100}
              badgeSize="medium"
              gap={20}
            />
          </div>

          {/* Small Badge Banner */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Kompakt Badge Banner (70px)
            </h2>
            <AppleStyleBadgeBanner 
              badges={badgeItems.slice(0, 4)}
              scrollSpeed={30}
              height={70}
              badgeSize="small"
              gap={12}
              showControls={false}
            />
          </div>

          {/* Mixed Content Banner */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Vegyes Tartalom Banner (kép + szöveg)
            </h2>
            <RightToLeftBanner 
              items={mixedBannerItems}
              variant="mixed"
              scrollSpeed={50}
              height={90}
            />
          </div>

          {/* Standard Text Banner */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Standard Szöveges Banner (80px magasság)
            </h2>
            <RightToLeftBanner 
              items={bannerItems}
              variant="text"
              scrollSpeed={60}
              height={80}
            />
          </div>

          {/* Large Apple Banner */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Nagy Badge Banner (120px)
            </h2>
            <AppleStyleBadgeBanner 
              badges={badgeItems}
              scrollSpeed={60}
              height={120}
              badgeSize="large"
              gap={24}
            />
          </div>

          {/* Static Banner */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Statikus Badge Banner (automatikus görgetés kikapcsolva)
            </h2>
            <AppleStyleBadgeBanner 
              badges={badgeItems.slice(0, 3)}
              autoScroll={false}
              height={90}
              badgeSize="medium"
              gap={16}
            />
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Banner Komponens Típusok
          </h2>
          
          <div className="grid lg:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                🍎 Apple-stílusú Badge Banner
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                <li>• Tiszta képes megjelenítés</li>
                <li>• Minimális design</li>
                <li>• Hover tooltip-ek</li>
                <li>• 3 méret: small/medium/large</li>
                <li>• Apple-stílusú árnyékok</li>
                <li>• Optimalizált képbetöltés</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                📝 Szöveges Banner
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                <li>• Címek és leírások</li>
                <li>• Színes kategóriák</li>
                <li>• Sürgős üzenetek kiemelése</li>
                <li>• Ikonok támogatása</li>
                <li>• Témarendszer integráció</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                🔄 Vegyes Tartalom
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                <li>• Kép + szöveg kombinált</li>
                <li>• Kompakt elrendezés</li>
                <li>• Kategória ikonok</li>
                <li>• Linkelhető elemek</li>
                <li>• Reszponzív méretezés</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                ✅ Mozgási Irány
              </h4>
              <p className="text-green-700 dark:text-green-300 text-sm">
                <strong>Jobbról balra</strong> mozgás - ellentétes a hírkártyák 
                balról jobbra mozgásával, vizuális egyensúlyt teremtve.
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                🎮 Vezérlés
              </h4>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                Hover-re megáll, Play/Pause gombok, állítható sebesség,
                végtelen scroll effekt minden típusnál.
              </p>
            </div>
          </div>

          {/* Usage Examples */}
          <div className="mt-8 bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              💻 Használati Példák
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Apple-stílusú Badge Banner:
                </h4>
                <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto">
{`<AppleStyleBadgeBanner 
  badges={badgeItems}
  scrollSpeed={40}
  height={100}
  badgeSize="medium"
  gap={20}
/>`}
                </pre>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vegyes Tartalom Banner:
                </h4>
                <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto">
{`<RightToLeftBanner 
  items={mixedItems}
  variant="mixed"
  scrollSpeed={50}
  height={90}
/>`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerDemoPage;