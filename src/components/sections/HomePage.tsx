"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import HeroSlider from "@/components/slider/HeroSlider";

const HomePage = () => {
  const [hoveredCard, setHoveredCard] = React.useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Slider */}
      <HeroSlider slides={[]} />

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Programom",
              description:
                "Ismerje meg részletes politikai programomat és terveimet az ország fejlesztésére.",
              color: "from-blue-500 to-blue-600",
              link: "/program",
            },
            {
              title: "Események",
              description:
                "Csatlakozzon hozzánk a következő rendezvényeken és mondja el véleményét személyesen.",
              color: "from-purple-500 to-purple-600",
              link: "/esemenyek",
            },
            {
              title: "Kapcsolat",
              description:
                "Vegye fel velem a kapcsolatot kérdéseivel, javaslataival. Minden vélemény számít!",
              color: "from-indigo-500 to-indigo-600",
              link: "/kapcsolat",
            },
            {
              title: "Kvízek",
              description:
                "Tesztelje tudását és ismerje meg álláspontomat fontos kérdésekben interaktív kvízeken keresztül.",
              color: "from-green-500 to-green-600",
              link: "/kviz",
            },
            {
              title: "Petíciók",
              description:
                "Támogassa közös ügyeinket! Írja alá petícióinkat és vegye ki részét a változásból.",
              color: "from-red-500 to-red-600",
              link: "/peticiok",
            },
            {
              title: "Szavazások",
              description:
                "Mondja el véleményét fontos társadalmi kérdésekben. Az Ön szava számít a döntéshozatalban!",
              color: "from-orange-500 to-orange-600",
              link: "/szavazasok",
            },
          ].map((item, index) => (
            <Link
              href={item.link}
              key={index}
              className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-2xl"
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${
                  item.color
                } opacity-${
                  hoveredCard === index ? "100" : "90"
                } transition-opacity duration-300`}
              />
              <div className="relative p-8">
                <h3 className="text-2xl font-bold text-white mb-4">
                  {item.title}
                </h3>
                <p className="text-white/90">{item.description}</p>
                <ChevronRight className="h-6 w-6 text-white absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Latest News Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
          Legfrissebb Hírek
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="h-48 bg-gray-200 dark:bg-gray-700" />
              <div className="p-6">
                <p className="text-blue-600 dark:text-blue-400 text-sm mb-2">
                  2024. március {item}.
                </p>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">
                  Közösségi fejlesztések {item}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Új kezdeményezések a helyi közösségek támogatására...
                </p>
                <Link
                  href="/hirek"
                  className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-300"
                >
                  Tovább olvasom →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
